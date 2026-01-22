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

  public playCardOnFieldZone(card: Card, zone: Phaser.GameObjects.Zone) {
    this.handManager.reorganizeHand();
    this.fieldManager.playCardToZone(card, zone);
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
}
