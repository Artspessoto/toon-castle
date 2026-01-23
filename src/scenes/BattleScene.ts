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
import { UIManager } from "../managers/UIManager";

export class BattleScene extends Phaser.Scene {
  public gameState: GameState;
  public phaseManager: PhaseManager;
  public handManager: HandManager;
  public fieldManager: FieldManager;
  public inputManager: InputManager;
  public deckManager: DeckManager;
  public uiManager: UIManager;

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
    this.uiManager = new UIManager(this);
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

    this.uiManager.setupUI();
    this.deckManager.createDeckVisual();
    this.fieldManager.setupFieldZones();

    // this.phaseTextBg = this.add.rectangle(640, 360, 500, 40, 0x000000, 0.8);
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

    this.setupGlobalInputs();

    this.startInitialDraw();
  }

  private setupGlobalInputs() {
    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.currentPhase == "DRAW") {
        this.setPhase("MAIN");
        this.handManager.drawCard(this.deckManager.position);
      }
    });

    this.input.on("pointerdown", (pointer: { x: number; y: number }) => {
      console.log(
        `Debug: X: ${Math.round(pointer.x)}, Y: ${Math.round(pointer.y)}`,
      );
    });
  }

  private startInitialDraw() {
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
        this.uiManager.showNotice(
          this.translationText.zone_occupied,
          "WARNING",
        );
        this.handManager.reorganizeHand();
      }
    } else {
      this.handManager.reorganizeHand();
    }
  }
}
