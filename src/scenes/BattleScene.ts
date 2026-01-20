import { CARD_DATABASE } from "../constants/CardDatabase";
import { TRANSLATIONS } from "../constants/Translations";
import { Card } from "../objects/Card";
import { LanguageManager } from "../utils/LanguageManager";

export type GamePhase = "DRAW" | "MAIN" | "BATTLE" | "ENEMY_TURN";

export class BattleScene extends Phaser.Scene {
  private hand: Card[] = [];
  private readonly maxHandSize = 7;
  private readonly deckPosition: { x: number; y: number } = { x: 1122, y: 542 };
  private readonly handConfig = {
    y: 710,
    hoverY: 550,
    scale: 0.45,
    hoverScale: 0.7,
  };

  private drawText!: Phaser.GameObjects.Text;
  private drawTextBg!: Phaser.GameObjects.Rectangle;
  private currentPhase: GamePhase = "DRAW";
  private isDragging: boolean = false;

  constructor() {
    super("BattleScene");
  }

  preload() {
    this.load.image(
      "battle-scene-background",
      "assets/frameCards/battle_scene.png",
    );
    this.load.image("card_back", "assets/frameCards/card_back.png");
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
    const strings = TRANSLATIONS[lang].battle_scene;
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

    this.drawTextBg = this.add.rectangle(640, 40, 500, 40, 0x000000, 0.6);
    this.drawText = this.add
      .text(640, 40, strings.draw_phase, {
        fontSize: "18px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.currentPhase == "DRAW") {
        this.drawCard();
        this.endDrawPhase();
      }
    });

    let delay = 0;
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(delay, () => {
        this.drawCard();
      });
      delay += 200;
    }
  }

  private endDrawPhase() {
    this.currentPhase = "MAIN";

    this.drawText.setVisible(false);
    this.drawTextBg.setVisible(false);

    this.drawTextBg.setVisible(true);
    this.drawText.setText("Fase Principal").setVisible(true);

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: [this.drawText, this.drawTextBg],
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.drawText.setVisible(false).setAlpha(1);
          this.drawTextBg.setVisible(false).setAlpha(0.6);
        },
      });
    });
  }

  private createDeckVisual() {
    for (let i = 3; i >= 0; i--) {
      // const heightOffset = i * 3;
      const xOffset = i * 4;
      const yOffset = 0;
      const deckCard = this.add.plane(
        this.deckPosition.x - xOffset,
        this.deckPosition.y - yOffset,
        "card_back",
      );

      deckCard.setViewHeight(600);

      // deckCard.setScale(0.35);
      deckCard.scaleX = 0.36;
      deckCard.scaleY = 0.55;

      deckCard.modelRotation.x = -1.02; // deep card
      deckCard.modelRotation.y = 0.29;
      deckCard.modelRotation.z = Phaser.Math.DegToRad(0.12);

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
      targets: card,
      y: this.handConfig.hoverY,
      scale: this.handConfig.hoverScale,
      duration: 300,
      ease: "Power2",
    });
    card.setDepth(200);
  }

  private handleCardOut(_card: Card) {
    this.reorganizeHand();
  }

  private setupDragEvents(card: Card) {
    card.on("dragstart", () => {
      this.isDragging = true;
      this.tweens.killTweensOf(card);

      this.tweens.add({
        targets: card,
        scale: 0.35,
        duration: 150,
        ease: "Power2",
      });
      card.setDepth(2000);
    });

    card.on("drag", (_pointer: any, dragX: number, dragY: number) => {
      card.setPosition(dragX, dragY);
    });

    card.on("dragend", (_pointer: any, dropped: boolean) => {
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

      const canPlay = monsterCardValidation || spellOrTrapCardValidation;

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
    //monster zones: x: 490, y: 467, X: 636, Y: 441, X: 787, Y: 457
    //trap/spell zones: 474, Y: 588, X: 638, Y: 585, X: 809, Y: 585
    const monsterCoords = [
      { x: 490, y: 467 },
      { x: 636, y: 441 },
      { x: 787, y: 457 },
    ];
    const spellCoords = [
      { x: 474, y: 588 },
      { x: 638, y: 585 },
      { x: 809, y: 585 },
    ];

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
    this.hand = this.hand.filter((handCard) => handCard !== card);
    this.reorganizeHand();

    const isTrapOrSpellCard =
      card.getType() == "TRAP" || card.getType() == "SPELL";

    card.disableInteractive();
    card.setFieldVisuals();

    const targetScale = isTrapOrSpellCard ? 0.4 : 0.32;

    if (isTrapOrSpellCard) {
      card.setFaceDown();
    }

    this.tweens.add({
      targets: card,
      x: zone.x,
      y: zone.y,
      angle: 0,
      scale: targetScale,
      duration: 250,
      ease: "Back.easeOut",
      onComplete: () => {
        this.cameras.main.shake(100, 0.002);
        card.setDepth(10);
      },
    });
  }
}
