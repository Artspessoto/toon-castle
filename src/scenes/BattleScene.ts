import { CARD_DATABASE } from "../constants/CardDatabase";
import { TRANSLATIONS } from "../constants/Translations";
import { Card } from "../objects/Card";
import { ToonButton } from "../objects/ToonButton";
import { LanguageManager } from "../utils/LanguageManager";

export type GamePhase = "DRAW" | "MAIN" | "BATTLE" | "ENEMY_TURN";
type Languages = keyof typeof TRANSLATIONS;
type TranslationStructure = (typeof TRANSLATIONS)[Languages];
export type BattleTranslations = TranslationStructure["battle_scene"];

export class BattleScene extends Phaser.Scene {
  private hand: Card[] = [];
  private readonly maxHandSize = 7;
  private readonly deckPosition: { x: number; y: number } = { x: 1122, y: 542 };
  // private readonly handConfig = {
  //   y: 710,
  //   hoverY: 550,
  //   scale: 0.45,
  //   hoverScale: 0.7,
  // };

  private phaseText!: Phaser.GameObjects.Text;
  private phaseTextBg!: Phaser.GameObjects.Rectangle;
  private currentPhase: GamePhase = "DRAW";
  private isDragging: boolean = false;
  private phaseButton!: ToonButton;
  private translationText!: BattleTranslations;

  constructor() {
    super("BattleScene");
  }

  preload() {
    this.load.image(
      "battle-scene-background",
      "assets/frameCards/battle_scene_2d.png",
    );
    this.load.image("card_back", "assets/frameCards/card_back2.png");
    this.load.image(
      "card_template_monster",
      "assets/frameCards/monster_card.png",
    );
    this.load.image(
      "card_template_effect",
      "assets/frameCards/effect_monster_card.png",
    );
    this.load.image("card_template_spell", "assets/frameCards/spell_card.png");
    this.load.image("card_template_trap", "assets/frameCards/trap_card.png");
  }

  create() {
    const lang = LanguageManager.getInstance().currentLanguage;
    this.translationText = TRANSLATIONS[lang].battle_scene;
    const bg = this.add.image(640, 360, "battle-scene-background");
    bg.setDisplaySize(1280, 720);
    bg.setDepth(-100);

    this.createDeckVisual();

    this.setupFieldZones();

    this.input.on("pointerdown", (pointer: { x: number; y: number }) => {
      console.log(
        `Slot em: X: ${Math.round(pointer.x)}, Y: ${Math.round(pointer.y)}`,
      );
    });

    this.phaseTextBg = this.add.rectangle(640, 360, 500, 40, 0x000000, 0.8);
    this.phaseText = this.add
      .text(640, 360, this.translationText.draw_phase, {
        fontSize: "18px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.phaseButton = new ToonButton(this, {
      x: 1120,
      y: 420,
      text: "Pular Fase",
      fontSize: "18px",
      textColor: "#fff",
      color: 0x000000,
      hoverColor: 0x242424,
      width: 200,
      height: 60,
    });
    this.phaseButton.setVisible(false).setDepth(5000);

    this.phaseButton.on("pointerdown", () => {
      this.handleNextPhase();
    });

    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.currentPhase == "DRAW") {
        this.setPhase("MAIN");
      }
    });

    let delay = 0;
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(delay, () => {
        this.drawCard();
      });
      delay += 200;
    }

    this.time.delayedCall(delay, () => this.setPhase("DRAW"));
  }

  private createDeckVisual() {
    for (let i = 3; i >= 0; i--) {
      // const heightOffset = i * 3;
      const xOffset = i * 2;
      const yOffset = 0;
      const deckCard = this.add.plane(
        this.deckPosition.x - xOffset,
        this.deckPosition.y - yOffset,
        "card_back",
      );

      deckCard.setViewHeight(400);

      // deckCard.setScale(0.35);
      deckCard.scaleX = 0.36;
      deckCard.scaleY = 0.4;

      // deckCard.modelRotation.x = -1.02; // deep card
      // deckCard.modelRotation.y = 0.29;
      // deckCard.modelRotation.z = Phaser.Math.DegToRad(0.12);

      deckCard.setDepth(10 - i);

      if (i > 0) {
        deckCard.setTint(0x999999);
      }
    }
  }

  private drawCard() {
    if (this.hand.length >= this.maxHandSize) return;

    const cardData = this.getRandomCardData();

    const newCard = new Card(
      this,
      this.deckPosition.x,
      this.deckPosition.y,
      cardData,
    );
    // newCard.setAngle(-22);

    this.setupCardInteractions(newCard);

    this.hand.push(newCard);
    this.animateCardEntry(newCard);
    this.reorganizeHand();
  }

  private getRandomCardData() {
    const keys = Object.keys(CARD_DATABASE);
    const randomKey = keys[Phaser.Math.Between(0, keys.length - 1)];
    return CARD_DATABASE[randomKey];
  }

  private setupCardInteractions(card: Card) {
    card.setInteractive({ draggable: true });
    this.input.setDraggable(card);

    // hover effect (Zoom)
    card.on("pointerover", () => this.handleCardHover(card));
    card.on("pointerout", () => this.handleCardOut(card));

    this.setupDragEvents(card);
  }

  private handleCardHover(card: Card) {
    if (this.isDragging) return;

    this.tweens.add({
      targets: card.visualElements,
      y: -280,
      scale: 1.5,
      duration: 200,
      ease: "Back.easeOut",
    });
    card.setDepth(200);
  }

  private handleCardOut(card: Card) {
    if (this.isDragging) return;

    this.tweens.add({
      targets: card.visualElements,
      y: 0,
      scale: 1,
      duration: 200,
      ease: "Power2",
    });

    this.reorganizeHand();
  }

  private setupDragEvents(card: Card) {
    card.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      if (this.currentPhase !== "MAIN") {
        this.input.setDragState(pointer, 0);
        return;
      }

      this.isDragging = true;
      this.tweens.killTweensOf(card);
      this.tweens.killTweensOf(card.visualElements);

      this.tweens.add({
        targets: card,
        scale: 0.25,
        duration: 150,
        ease: "Power2",
      });
      card.setDepth(2000);
    });

    card.on("drag", (_pointer: any, dragX: number, dragY: number) => {
      card.visualElements.setY(0);
      card.visualElements.setScale(1);
      card.setPosition(dragX, dragY);
    });

    card.on("dragend", (_pointer: any, dropped: boolean) => {
      this.isDragging = false;
      if (!dropped) this.reorganizeHand();
      this.tweens.add({
        targets: card,
        scale: 0.35,
        duration: 200,
        ease: "Back.easeOut",
      });
    });

    card.on("drop", (_pointer: any, targetZone: Phaser.GameObjects.Zone) => {
      const zoneType = targetZone.getData("type");
      const cardType = card.getType();
      const monsterCardValidation =
        cardType.includes("MONSTER") && zoneType === "MONSTER";
      const spellOrTrapCardValidation =
        (cardType === "SPELL" || cardType === "TRAP") && zoneType === "SPELL";

      const canPlay =
        (monsterCardValidation || spellOrTrapCardValidation) &&
        this.currentPhase == "MAIN";

      if (canPlay) {
        this.playCardOnFieldZone(card, targetZone);
      } else {
        this.reorganizeHand();
      }
    });
  }

  private animateCardEntry(card: Card) {
    card.setAngle(-22);
    card.setAlpha(0);
    this.tweens.add({ targets: card, alpha: 1, duration: 100 });
  }

  private reorganizeHand() {
    // position config
    const cardWidth = 180 * 0.58; // card large (base x scale)
    const spacing = cardWidth + 10; // cards gap between
    const startY = 710;
    const centerX = 640;

    const totalHandWidth = (this.hand.length - 1) * spacing;
    const startX = centerX - totalHandWidth / 2;

    this.hand.forEach((card, index) => {
      const targetX = startX + index * spacing;

      card.setDepth(100 + index);

      this.tweens.add({
        targets: card,
        x: targetX,
        y: startY,
        angle: 0,
        scale: 0.45,
        duration: 500, // 0.5s
        // ease: "Power2",
        ease: "Back.easeOut",
      });
    });
  }

  private setupFieldZones() {
    const monsterCoords = [
      { x: 505, y: 450 },
      { x: 645, y: 450 },
      { x: 787, y: 450 },
    ];
    const spellCoords = [
      { x: 505, y: 600 },
      { x: 645, y: 600 },
      { x: 787, y: 600 },
    ];

    // spell/trap zone enemy: x 505, y: 120, x: 645, y: 120, x: 787, y: 120
    // monster zone enemy: x: 505, y: 270, x: 645, y: 270, x: 787, y: 270

    monsterCoords.forEach((pos) => {
      this.add
        .zone(pos.x, pos.y, 110, 150)
        .setRectangleDropZone(110, 150)
        .setData("type", "MONSTER");
    });

    spellCoords.forEach((pos) => {
      this.add
        .zone(pos.x, pos.y, 110, 150)
        .setRectangleDropZone(110, 150)
        .setData("type", "SPELL");
    });
  }

  private playCardOnFieldZone(card: Card, zone: Phaser.GameObjects.Zone) {
    this.isDragging = false;
    this.hand = this.hand.filter((handCard) => handCard !== card);
    this.reorganizeHand();

    const isTrapOrSpellCard =
      card.getType() == "TRAP" || card.getType() == "SPELL";

    card.disableInteractive();

    this.tweens.killTweensOf(card.visualElements);
    card.visualElements.setY(0);
    card.visualElements.setScale(1);

    card.setFieldVisuals();

    if (isTrapOrSpellCard) {
      card.setFaceDown();
    }

    this.tweens.add({
      targets: card,
      x: zone.x,
      y: zone.y,
      angle: 0,
      scale: 0.32,
      duration: 250,
      ease: "Back.easeOut",
      onComplete: () => {
        this.cameras.main.shake(100, 0.002);
        card.setDepth(10);
      },
    });
  }

  private setPhase(newPhase: GamePhase) {
    this.currentPhase = newPhase;

    this.tweens.killTweensOf([this.phaseText, this.phaseTextBg]);
    this.phaseText.setVisible(true).setAlpha(1);
    this.phaseTextBg.setVisible(true).setAlpha(0.8);

    switch (newPhase) {
      case "DRAW":
        this.phaseButton.setVisible(false);
        this.drawCard();
        break;

      case "MAIN":
        this.phaseText.setText(this.translationText.main_phase);
        this.phaseButton.setVisible(false);

        this.time.delayedCall(500, () => {
          if (this.currentPhase == "MAIN") {
            this.phaseButton.setVisible(true);
            this.phaseButton.setText(
              this.translationText.battle_buttons.to_battle,
            );

            this.phaseButton.setAlpha(0);
            this.tweens.add({
              targets: this.phaseButton,
              alpha: 1,
              duration: 300,
            });
          }
        });
        break;

      case "BATTLE":
        this.phaseText.setText(this.translationText.battle_phase);
        this.phaseButton.setVisible(true);
        this.phaseButton.setText(this.translationText.battle_buttons.end_turn);
        break;

      case "ENEMY_TURN":
        this.phaseButton.setVisible(false);
        this.phaseText.setText(this.translationText.turn_change);

        this.time.delayedCall(1200, () => {
          if (this.currentPhase !== "ENEMY_TURN") return;

          this.phaseText.setText(this.translationText.opponent_turn);
          this.tweens.add({
            targets: this.phaseText,
            scale: 1.1,
            duration: 100,
            yoyo: true,
          });

          this.time.delayedCall(1500, () => this.hidePhaseText());
        });

        return;
    }

    this.time.delayedCall(1500, () => this.hidePhaseText());
  }

  private handleNextPhase() {
    if (this.currentPhase === "MAIN") {
      this.setPhase("BATTLE");
    } else if (this.currentPhase === "BATTLE") {
      this.setPhase("ENEMY_TURN");
    }
  }

  private hidePhaseText() {
    this.tweens.add({
      targets: [this.phaseText, this.phaseTextBg],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.phaseText.setVisible(false);
        this.phaseTextBg.setVisible(false);
      },
    });
  }
}
