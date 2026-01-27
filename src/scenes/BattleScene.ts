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
  public playerHand: HandManager;
  public oponentHand: HandManager;
  public fieldManager: FieldManager;
  public inputManager: InputManager;
  public playerDeck: DeckManager;
  public oponentDeck: DeckManager;
  public uiManager: UIManager;

  public phaseButton!: ToonButton;
  private translationText!: BattleTranslations;
  private selectedCard: Card | null = null;

  constructor() {
    super("BattleScene");

    this.gameState = new GameState();
    this.phaseManager = new PhaseManager(this);
    this.fieldManager = new FieldManager(this);
    this.inputManager = new InputManager(this);
    this.uiManager = new UIManager(this);

    this.playerHand = new HandManager(this, "PLAYER");
    this.oponentHand = new HandManager(this, "OPPONENT");

    this.playerDeck = new DeckManager(this, "PLAYER");
    this.oponentDeck = new DeckManager(this, "OPPONENT");
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
    this.load.image("sword_icon", "assets/frameCards/crossed-swords.svg");
    this.load.image("shield_icon", "assets/frameCards/round-shield.svg");
    this.load.image("mana_icon", "assets/frameCards/mana_icon.png");
  }

  create() {
    const lang = LanguageManager.getInstance().currentLanguage;
    this.translationText = TRANSLATIONS[lang].battle_scene;

    const bg = this.add.image(640, 360, "battle-scene-background");
    bg.setDisplaySize(1280, 720).setDepth(-100);

    this.uiManager.setupUI();
    this.playerDeck.createDeckVisual();
    this.oponentDeck.createDeckVisual();
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

  private getActiveManager<T>(playerManager: T, oponentMananger: T): T {
    return this.gameState.activePlayer === "PLAYER"
      ? playerManager
      : oponentMananger;
  }

  public get currentDeck(): DeckManager {
    return this.getActiveManager(this.playerDeck, this.oponentDeck);
  }

  public get currentHand(): HandManager {
    return this.getActiveManager(this.playerHand, this.oponentHand);
  }

  private setupGlobalInputs() {
    this.input.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        currentlyOver: Phaser.GameObjects.GameObject[],
      ) => {
        if (currentlyOver.length === 0) {
          this.uiManager.clearSelectionMenu();
          this.playerHand.showHand();
        }
      },
    );

    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.currentPhase == "DRAW") {
        this.setPhase("MAIN");
        this.currentHand.drawCard(this.currentDeck.position);
        this.uiManager.updateMana(2);
      }
    });

    this.input.keyboard?.on("keydown-ESC", () => {
      this.cancelPlacement();
    });

    this.input.keyboard?.on("keydown-T", () => {
      this.gameState.nextTurn();
      this.setPhase("DRAW");
    });

    this.input.on("pointerdown", () => {
      if (this.selectedCard) {
        this.time.delayedCall(50, () => this.cancelPlacement());
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
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(delay, () => {
        this.playerHand.drawCard(this.playerDeck.position);
        this.oponentHand.drawCard(this.oponentDeck.position);
      });
      delay += 200;
    }
    this.time.delayedCall(delay, () => this.setPhase("MAIN"));
  }

  private setPhase(newPhase: GamePhase) {
    this.gameState.setPhase(newPhase);
    this.phaseManager.updateUI(newPhase, this.translationText);

    if (newPhase === "DRAW") {
      if (this.gameState.activePlayer === "OPPONENT") {
        this.currentHand.drawCard(this.currentDeck.position);
        this.handleOpponentTurn();
      }
    }
  }

  public finalizeTurnTransition() {
    this.gameState.nextTurn(); // change to oponent and reset to draw phase
    this.setPhase("DRAW");
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

    if (!canPlay) {
      this.currentHand.reorganizeHand();
      return;
    }

    const availableSlot = this.fieldManager.getFirstAvailableSlot(zoneType);

    if (availableSlot) {
      this.gameState.setDragging(false);
      const hand: HandManager =
        this.gameState.activePlayer == "PLAYER"
          ? this.playerHand
          : this.oponentHand;
      hand.removeCard(card);

      this.selectedCard = card;
      hand.hideHand();

      this.fieldManager.previewPlacement(
        card,
        availableSlot.x,
        availableSlot.y,
      );
      this.uiManager.showSelectionMenu(
        availableSlot.x,
        availableSlot.y,
        cardType, // MONSTER, SPELL, etc.
        (mode) => {
          this.selectedCard = null; //apply null to drop card
          hand.showHand();
          this.fieldManager.occupySlot(zoneType, availableSlot.index, card);
          this.fieldManager.playCardToZone(
            card,
            availableSlot.x,
            availableSlot.y,
            mode,
          );
        },
      );

      this.currentHand.reorganizeHand();
    } else {
      this.uiManager.showNotice(this.translationText.zone_occupied, "WARNING");
      this.currentHand.reorganizeHand();
    }
  }

  private cancelPlacement() {
    this.uiManager.clearSelectionMenu();
    this.currentHand.showHand();

    if (!this.selectedCard) return;

    //return card to hand
    this.currentHand.addCardBack(this.selectedCard);

    this.selectedCard.setInteractive();
    this.selectedCard.setDepth(100);

    this.selectedCard = null;
  }

  //simulate changing turn
  private handleOpponentTurn() {
    // 2s to change each phase
    this.time.delayedCall(2000, () => {
      this.setPhase("MAIN");

      this.time.delayedCall(2000, () => {
        this.setPhase("BATTLE");

        this.time.delayedCall(2000, () => {
          // end turn and back to player
          this.gameState.nextTurn();
          this.setPhase("DRAW");
        });
      });
    });
  }
}
