import { LAYOUT_CONFIG } from "../constants/LayoutConfig";
import type { IBattleContext } from "../interfaces/IBattleContext";
import type { IUIManager } from "../interfaces/IUIManager";
import type { Card } from "../objects/Card";
import { ToonButton } from "../objects/ToonButton";
import type {
  GameSide,
  Notice,
  PlacementMode,
  TranslationStructure,
} from "../types/GameTypes";

export class UIManager implements IUIManager {
  private context: IBattleContext;
  private side: GameSide;
  private translations!: TranslationStructure;
  private bannerText!: Phaser.GameObjects.Text;
  private bannerBg!: Phaser.GameObjects.Rectangle;
  private manaText!: Phaser.GameObjects.Text;
  private manaIcon!: Phaser.GameObjects.Image;
  private manaAura!: Phaser.GameObjects.Image;
  private manaPosition: { x: number; y: number };
  private hpText!: Phaser.GameObjects.Text;

  private selectionButtons: ToonButton[] = [];

  constructor(context: IBattleContext, side: GameSide) {
    this.context = context;
    this.side = side;

    this.manaPosition = LAYOUT_CONFIG.UI.MANA[this.side];
  }

  public setTranslations(translations: TranslationStructure) {
    this.translations = translations;
  }

  public setupUI() {
    const { SCREEN } = LAYOUT_CONFIG;
    const initialMana = this.context.gameState.getMana(this.side);

    this.manaAura = this.context.add
      .image(this.manaPosition.x, this.manaPosition.y, "mana_icon")
      .setScale(0.5)
      .setAlpha(0)
      .setTint(0xffffff)
      .setDepth(99);

    this.manaIcon = this.context.add
      .image(this.manaPosition.x, this.manaPosition.y, "mana_icon")
      .setScale(0.4)
      .setDepth(100);

    this.manaText = this.context.add
      .text(this.manaIcon.x, this.manaIcon.y, `${initialMana}`, {
        fontSize: "32px",
        fontFamily: "Arial Black",
        color: "#FFD966",
        stroke: "#4D2600",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(101);

    this.bannerBg = this.context.add
      .rectangle(
        SCREEN.CENTER_X,
        SCREEN.CENTER_Y,
        SCREEN.WIDTH,
        80,
        0x000000,
        0.85,
      )
      .setVisible(false)
      .setDepth(10000);

    this.bannerText = this.context.add
      .text(SCREEN.CENTER_X, SCREEN.CENTER_Y, "", {
        fontSize: "25px",
        color: "#FFFFFF",
        fontStyle: "bold italic",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(10001);
  }

  public setupLifePoints() {
    const { UI } = LAYOUT_CONFIG;
    const currentHP = this.context.gameState.getHP(this.side);
    const yPos =
      this.side == "PLAYER" ? UI.LP_BAR.Y_PLAYER : UI.LP_BAR.Y_OPPONENT;

    this.createLPBar(UI.LP_BAR.X, yPos, currentHP);
  }

  public updateLP(side: GameSide, amount: number) {
    const startLP = this.context.gameState.getHP(side);

    this.context.gameState.modifyHP(side, amount);

    this.animateLPImpact(amount);

    const targetLP = this.context.gameState.getHP(side);
    const lpCounter = { value: startLP };

    this.context.tweens.add({
      targets: lpCounter,
      value: targetLP,
      duration: 1200,
      ease: "Power2",
      onUpdate: () => {
        this.hpText.setText(Math.floor(lpCounter.value).toString());
      },
    });
  }

  public updateMana(amount: number) {
    this.context.gameState.modifyMana(this.side, amount);

    const newMana = this.context.gameState.getMana(this.side);
    this.manaText.setText(`${newMana}`);

    this.context.tweens.add({
      targets: this.manaAura,
      alpha: { from: 0.8, to: 0 },
      scale: { from: 0.5, to: 0.8 }, //shock wave effect
      duration: 300,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.manaAura.setScale(0.5).setAlpha(0);
      },
    });
  }

  public showNotice(message: string, type: Notice) {
    if (!this.bannerBg || !this.bannerText) return;

    let color: number;

    switch (type) {
      case "PHASE":
        color = 0xffcc00;
        break;
      case "WARNING":
        color = 0xcc0000;
        break;
      case "TURN":
        color = 0x0077ff;
        break;
      case "NEUTRAL":
        color = 0xbdc3c7;
        break;
      default:
        color = 0xffcc00;
        break;
    }

    this.bannerBg.setStrokeStyle(4, color);

    this.animateBanner(message, type);
  }

  private animateBanner(message: string, type: Notice) {
    const { SCREEN } = LAYOUT_CONFIG;
    this.context.tweens.killTweensOf([this.bannerText, this.bannerBg]);

    this.bannerText
      .setText(message.toUpperCase())
      .setAlpha(1)
      .setVisible(true)
      .setScale(0.5);
    this.bannerBg.setAlpha(1).setVisible(true).setScale(1, 0);

    // start animation
    this.context.tweens.add({
      targets: this.bannerBg,
      scaleY: 1,
      alpha: 1,
      duration: 100,
      ease: "Quad.easeOut",
    });

    // pop animation
    this.context.tweens.add({
      targets: this.bannerText,
      scale: 1,
      duration: 150,
      ease: "Back.easeOut",
      onComplete: () => {
        //shake effect
        if (type === "WARNING") {
          this.context.tweens.add({
            targets: [this.bannerText, this.bannerBg],
            x: "+=3",
            yoyo: true,
            duration: 40,
            repeat: 3,
          });
        }
      },
    });

    this.context.time.delayedCall(600, () => {
      this.context.tweens.add({
        targets: [this.bannerText, this.bannerBg],
        alpha: 0,
        y: "-=30",
        duration: 200,
        ease: "Power2.easeIn",
        onComplete: () => {
          this.bannerText.setVisible(false).setY(SCREEN.CENTER_Y);
          this.bannerBg.setVisible(false).setY(SCREEN.CENTER_Y);

          this.bannerText.setX(SCREEN.CENTER_X);
          this.bannerBg.setX(SCREEN.CENTER_X);
        },
      });
    });
  }

  private createLPBar(x: number, y: number, initialHP: number) {
    const { HEIGHT, RADIUS, WIDTH } = LAYOUT_CONFIG.UI.LP_BAR;

    const stoneDark = 0x262626; // background
    const metalGold = 0xcfb35d; // border
    const magicGlow = "#FFD966"; // color text

    const container = this.context.add.container(x, y);
    const bg = this.context.add.graphics();

    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(4, 4, WIDTH, HEIGHT, RADIUS);

    bg.fillStyle(stoneDark, 1);
    bg.fillRoundedRect(0, 0, WIDTH, HEIGHT, RADIUS);

    bg.lineStyle(4, metalGold, 1);
    bg.strokeRoundedRect(0, 0, WIDTH, HEIGHT, RADIUS);

    bg.lineStyle(2, 0x000000, 0.3);
    bg.strokeRoundedRect(3, 3, WIDTH - 6, HEIGHT - 6, RADIUS - 2);

    container.add(bg);

    const labelLP = this.context.add
      .text(20, 18, "LP", {
        fontFamily: "Arial Black",
        fontSize: "18px",
        color: magicGlow,
      })
      .setOrigin(0, 0.5);
    container.add(labelLP);

    const textStyle = {
      fontFamily: "Arial Black",
      fontSize: "36px",
      color: magicGlow,
    };

    this.hpText = this.context.add
      .text(60, 30, `${initialHP}`, textStyle)
      .setOrigin(0, 0.5)
      .setShadow(2, 2, "#000000", 4, true, false);

    container.add(this.hpText);

    if (this.side === "PLAYER") {
      container.setY(y - 10);
    }
  }

  public showSelectionMenu(
    x: number,
    y: number,
    card: Card,
    cb: (mode: PlacementMode) => void,
  ) {
    this.clearSelectionMenu();

    const cardType = card.getType();
    const isMonster = cardType.includes("MONSTER");
    const buttonTexts = this.translations.battle_scene.battle_buttons;

    let leftConfig = null;
    let rightConfig = null;

    if (isMonster) {
      leftConfig = { text: "", icon: "sword_icon", width: 70 };
      rightConfig = { text: "", icon: "shield_icon", width: 70 };
    } else if (cardType === "SPELL") {
      leftConfig = { text: buttonTexts.active, width: 90 };
      rightConfig = { text: buttonTexts.set, width: 110 };
    } else if (cardType === "TRAP") {
      rightConfig = { text: buttonTexts.set, width: 110 };
    }

    if (leftConfig) {
      const leftBtn = new ToonButton(this.context.engine, {
        x: x - (rightConfig ? 75 : 0),
        y: y - 100,
        height: 42,
        fontSize: "18px",
        color: 0x302b1f,
        textColor: "#FFD966",
        hoverColor: 0x302b1f,
        borderColor: 0xeee5ae,
        ...leftConfig,
      }).setDepth(10002);

      this.selectionButtons.push(leftBtn);

      leftBtn.on("pointerdown", () => {
        this.clearSelectionMenu();
        cb(isMonster ? "ATK" : "FACE_UP"); //FACE_UP trigger cardActivation method
      });
    }

    if (rightConfig) {
      const rightBtn = new ToonButton(this.context.engine, {
        x: x + 75,
        y: y - 100,
        height: 42,
        fontSize: "16px",
        color: 0x302b1f,
        textColor: "#FFD966",
        hoverColor: 0x302b1f,
        borderColor: 0xeee5ae,
        ...rightConfig,
      }).setDepth(10002);

      this.selectionButtons.push(rightBtn);

      rightBtn.on("pointerdown", () => {
        this.clearSelectionMenu();
        cb(isMonster ? "DEF" : "SET");
      });
    }
  }

  public clearSelectionMenu() {
    this.selectionButtons.forEach((btn) => btn.destroy());
    this.selectionButtons = [];
  }

  public showFieldCardMenu(x: number, y: number, card: Card) {
    this.clearSelectionMenu();

    const buttons: ToonButton[] = [];
    const buttonArgs: ButtonParams = { card, buttons, x, y };

    const isPlayerCard = card.owner === "PLAYER";
    const myTurn = this.context.gameState.activePlayer == "PLAYER";

    if (isPlayerCard && myTurn) {
      this.addPositionButtons(buttonArgs);
      this.addAttackButton(buttonArgs);
      this.addActivationButton(buttonArgs);
    }

    this.addDetailsButton(buttonArgs);

    this.selectionButtons = buttons;
  }

  public showGraveyardMenu(graveyardCards: Card[], x: number, y: number) {
    this.clearSelectionMenu();

    const battleTexts = this.translations["battle_scene"];
    const buttonTexts = battleTexts.battle_buttons;

    this.selectionButtons.push(
      this.createMenuButton(buttonTexts.details, x + 70, y - 35, () => {
        this.context.engine.scene.launch("CardListScene", graveyardCards);
      }),
    );
  }

  private addPositionButtons({ card, buttons, x, y }: ButtonParams) {
    const mainPhase = this.context.currentPhase == "MAIN";
    const currentTurn = this.context.gameState.currentTurn;
    const hasWaited = currentTurn > card.setTurn;
    const monsterCard = card.getType().includes("MONSTER");
    const battleTexts = this.translations["battle_scene"];
    const buttonTexts = battleTexts.battle_buttons;

    const canChangePos =
      mainPhase &&
      hasWaited &&
      !card.hasChangedPosition &&
      card.owner == "PLAYER" &&
      monsterCard;

    if (!canChangePos) return;

    if (card.isFaceDown) {
      buttons.push(
        this.createMenuButton("VIRAR", x + 70, y - 35, () =>
          this.handleFlipSummon(card),
        ),
      );
    } else {
      const label = buttonTexts.change_pos;
      buttons.push(
        this.createMenuButton(label, x + 70, y - 35, () =>
          this.handleChangePosition(card),
        ),
      );
    }
  }

  private addAttackButton({ card, buttons, x, y }: ButtonParams) {
    const currentPhase = this.context.currentPhase;
    const cardData = card.getCardData();
    const battleTexts = this.translations["battle_scene"];
    const buttonTexts = battleTexts.battle_buttons;

    //attack phase
    const isAttackPosition = card.angle == 0;
    const canAttack =
      cardData.atk !== undefined &&
      isAttackPosition &&
      card.owner == "PLAYER" &&
      !card.isFaceDown &&
      !card.hasAttacked;
    //atk btn
    if (currentPhase === "BATTLE" && canAttack) {
      buttons.push(
        this.createMenuButton(buttonTexts.attack, x + 70, y - 35, () => {
          this.context.onAttackDeclared(card);
        }),
      );
    }
  }

  private addActivationButton({ card, buttons, x, y }: ButtonParams) {
    const battleTexts = this.translations["battle_scene"];
    const buttonTexts = battleTexts.battle_buttons;

    const currentTurn = this.context.gameState.currentTurn;
    const hasWaited = currentTurn > card.setTurn;
    const isEffectCard =
      card.getType() === "TRAP" || card.getType() == "EFFECT_MONSTER";

    if (card.isFaceDown && card.owner == "PLAYER") {
      const canActive = isEffectCard ? hasWaited : true;

      //trap or effect monster need wait 1 turn to active
      if (canActive && card.getType() !== "MONSTER") {
        buttons.push(
          this.createMenuButton(buttonTexts.active, x - 70, y - 35, () => {
            this.context.cardActivation(card, this.side);
          }),
        );
      }
    }
  }

  private addDetailsButton({ card, buttons, x, y }: ButtonParams) {
    const battleTexts = this.translations["battle_scene"];
    const buttonTexts = battleTexts.battle_buttons;

    //details btn always visible
    if (!card.isFaceDown || card.owner === "PLAYER") {
      buttons.push(
        this.createMenuButton(buttonTexts.details, x - 70, y - 35, () => {
          this.context.getHand("PLAYER").showHand();
          this.context.engine.scene.launch("CardDetailScene", {
            cardData: card.getCardData(),
            owner: card.owner,
          });
        }),
      );
    }
  }

  private createMenuButton(
    text: string,
    x: number,
    y: number,
    callback: () => void,
  ): ToonButton {
    const btn = new ToonButton(this.context.engine, {
      text: text.toUpperCase(),
      x: x,
      y: y,
      height: 40,
      width: 120,
      fontSize: "14px",
      color: 0x302b1f,
      textColor: "#FFD966",
      hoverColor: 0x4d4533,
      borderColor: 0xeee5ae,
    }).setDepth(10002);

    btn.on("pointerdown", () => {
      this.clearSelectionMenu();
      callback();
    });

    return btn;
  }

  public handleFlipSummon(card: Card) {
    card.animateFlip(() => {
      // card impact animation effect
      this.context.cameras.main.shake(100, 0.002);
      this.context.getHand(card.owner).showHand();
    });
  }

  public handleChangePosition(card: Card) {
    card.animateChangePosition(() => {
      // card impact animation effect
      this.context.cameras.main.shake(100, 0.002);
      this.context.getHand(card.owner).showHand();
    });
  }

  private animateLPImpact(amount: number) {
    const isDamage = amount < 0; //take dmg is negative value
    const originalColor = "#FFD966"; // magicGlow
    const impactColor = isDamage ? "#ff4d4d" : "#4dff4d";

    this.hpText.setColor(impactColor);

    this.context.tweens.add({
      targets: this.hpText,
      scale: 1.4,
      duration: 150,
      yoyo: true,
      ease: "Back.easeOut",
      onComplete: () => {
        this.hpText.setColor(originalColor);
        this.hpText.setScale(1);
      },
    });

    if (isDamage) {
      this.context.cameras.main.shake(200, 0.005);
    }
  }
}

export interface ButtonParams {
  card: Card;
  x: number;
  y: number;
  buttons: ToonButton[];
}
