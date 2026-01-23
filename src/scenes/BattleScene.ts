import { TRANSLATIONS } from "../constants/Translations";
import { GameState } from "../domain/GameState";
import { HandManager } from "../managers/HandManager";
import { PhaseManager } from "../managers/PhaseManager";
import { Card } from "../objects/Card";
import { ToonButton } from "../objects/ToonButton";
import type { BattleTranslations, GamePhase } from "../types/GameTypes";
import { LanguageManager } from "../managers/LanguageManager";
import { FieldManager } from "../managers/FieldManager";
import { InputManager } from "../managers/InputManager";
import { DeckManager } from "../managers/DeckManager";

export class BattleScene extends Phaser.Scene {
  public gameState: GameState;
  public phaseManager: PhaseManager;
  public handManager: HandManager;
  public fieldManager: FieldManager;
  public inputManager: InputManager;
  public deckManager: DeckManager;

  public phaseText!: Phaser.GameObjects.Text;
  public phaseTextBg!: Phaser.GameObjects.Rectangle;
  public phaseButton!: ToonButton;
  public warningText!: Phaser.GameObjects.Text;
  public warningTextBg!: Phaser.GameObjects.Rectangle;

  private translationText!: BattleTranslations;

  constructor() {
    super("BattleScene");

    this.gameState = new GameState();
    this.phaseManager = new PhaseManager(this);
    this.handManager = new HandManager(this);
    this.fieldManager = new FieldManager(this);
    this.inputManager = new InputManager(this);
    this.deckManager = new DeckManager(this);
  }

  public get currentPhase(): GamePhase {
    return this.gameState.currentPhase;
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
    bg.setDisplaySize(1280, 720).setDepth(-100);

    this.deckManager.createDeckVisual();
    this.fieldManager.setupFieldZones();

    this.input.on("pointerdown", (pointer: { x: number; y: number }) => {
      console.log(
        `Slot em: X: ${Math.round(pointer.x)}, Y: ${Math.round(pointer.y)}`,
      );
    });

    // this.phaseTextBg = this.add.rectangle(640, 360, 500, 40, 0x000000, 0.8);
    this.phaseTextBg = this.add
      .rectangle(640, 360, 1280, 80, 0x000000, 0.85)
      .setStrokeStyle(4, 0xffcc00)
      .setVisible(false)
      .setDepth(10000);
    this.phaseText = this.add
      .text(640, 360, this.translationText.draw_phase, {
        fontSize: "28px",
        color: "#FFFFFF",
        fontStyle: "bold italic",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          blur: 5,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(10001);

    this.warningTextBg = this.add
      .rectangle(640, 360, 1280, 80, 0x000000, 0.85)
      .setStrokeStyle(4, 0xcc0000)
      .setVisible(false)
      .setDepth(10000);
    this.warningText = this.add
      .text(640, 360, "", {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold italic",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#ff0000",
          blur: 5,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(10001);

    this.phaseButton = new ToonButton(this, {
      x: 1120,
      y: 420,
      text: "",
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
        this.handManager.drawCard(this.deckManager.position);
      }
    });

    let delay = 0;
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(delay, () => {
        this.handManager.drawCard(this.deckManager.position);
      });
      delay += 200;
    }

    this.time.delayedCall(delay, () => this.setPhase("DRAW"));
  }

  public playCardOnFieldZone(card: Card, x: number, y: number) {
    this.handManager.reorganizeHand();
    this.fieldManager.playCardToZone(card, x, y);
  }

  private setPhase(newPhase: GamePhase) {
    this.gameState.setPhase(newPhase);
    this.phaseManager.updateUI(newPhase, this.translationText);

    if (newPhase === "DRAW") {
      this.handManager.drawCard(this.deckManager.position);
    }
  }

  private handleNextPhase() {
    if (this.currentPhase === "MAIN") {
      this.setPhase("BATTLE");
    } else if (this.currentPhase === "BATTLE") {
      this.setPhase("ENEMY_TURN");
    }
  }

  public handleCardDrop(targetZone: Phaser.GameObjects.Zone, card: Card) {
    const zoneType: "MONSTER" | "SPELL" = targetZone.getData("type");
    const cardType = card.getType();

    const monsterValid = cardType.includes("MONSTER") && zoneType === "MONSTER";
    const suportValid =
      (cardType === "SPELL" || cardType === "TRAP") && zoneType === "SPELL";
    const canPlay =
      (monsterValid || suportValid) && this.currentPhase == "MAIN";

    if (canPlay) {
      const availableSlot = this.fieldManager.getFirstAvailableSlot(zoneType);

      if (availableSlot) {
        this.gameState.setDragging(false);
        this.handManager.removeCard(card);

        this.fieldManager.occupySlot(zoneType, availableSlot.index, card);
        this.playCardOnFieldZone(card, availableSlot.x, availableSlot.y);
      } else {
        this.messageUI("ÁREA OCUPADA", this.warningText, this.warningTextBg);
        this.handManager.reorganizeHand();
      }
    } else {
      this.handManager.reorganizeHand();
    }
  }

  public messageUI(
    message: string,
    textObj: Phaser.GameObjects.Text,
    textBg: Phaser.GameObjects.Rectangle,
  ) {
    textObj
      .setText(message.toUpperCase())
      .setAlpha(1)
      .setVisible(true)
      .setScale(0.5);
    textBg.setAlpha(1).setVisible(true).setScale(1, 0);

    this.tweens.add({
      targets: textBg,
      scaleY: 1,
      duration: 150,
      ease: "Quad.easeOut",
    });

    // pop animation
    this.tweens.add({
      targets: textObj,
      scale: 1,
      duration: 200,
      ease: "Back.easeOut",
      onComplete: () => {
        //shake effect
        this.tweens.add({
          targets: [textObj, textBg],
          x: "+=3",
          yoyo: true,
          duration: 40,
          repeat: 3,
        });
      },
    });

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: [textObj, textBg],
        alpha: 0,
        y: "-=20",
        duration: 400,
        onComplete: () => {
          textObj.setVisible(false).setY(360);
          textBg.setVisible(false).setY(360);
        },
      });
    });
  }
}
