import type { Card } from "../objects/Card";
import { ToonButton } from "../objects/ToonButton";
import { BattleScene } from "../scenes/BattleScene";
import type { GameSide, PlacementMode } from "../types/GameTypes";

export class UIManager {
  private scene: BattleScene;
  private side: GameSide;
  private bannerText!: Phaser.GameObjects.Text;
  private bannerBg!: Phaser.GameObjects.Rectangle;
  private manaText!: Phaser.GameObjects.Text;
  private manaIcon!: Phaser.GameObjects.Image;
  private manaAura!: Phaser.GameObjects.Image;
  private manaPosition: { x: number; y: number };
  private hpText!: Phaser.GameObjects.Text;

  private selectionButtons: ToonButton[] = [];

  constructor(scene: BattleScene, side: GameSide) {
    this.scene = scene;
    this.side = side;

    this.manaPosition =
      this.side == "PLAYER" ? { x: 1232, y: 650 } : { x: 1232, y: 73 };
  }

  public setupUI() {
    const initialMana = this.scene.gameState.getMana(this.side);
    this.manaAura = this.scene.add
      .image(this.manaPosition.x, this.manaPosition.y, "mana_icon")
      .setScale(0.5)
      .setAlpha(0)
      .setTint(0xffffff)
      .setDepth(99);

    this.manaIcon = this.scene.add
      .image(this.manaPosition.x, this.manaPosition.y, "mana_icon")
      .setScale(0.4)
      .setDepth(100);

    this.manaText = this.scene.add
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

    this.bannerBg = this.scene.add
      .rectangle(640, 360, 1280, 80, 0x000000, 0.85)
      .setVisible(false)
      .setDepth(10000);

    this.bannerText = this.scene.add
      .text(640, 360, "", {
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
    const currentHP = this.scene.gameState.getHP(this.side);
    const yPos = this.side == "PLAYER" ? 650 : 20;

    this.createLPBar(30, yPos, currentHP);
  }

  public updateMana(amount: number) {
    this.scene.gameState.modifyMana(this.side, amount);

    const newMana = this.scene.gameState.getMana(this.side);
    this.manaText.setText(`${newMana}`);

    this.scene.tweens.add({
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

  public showNotice(message: string, type: "PHASE" | "WARNING") {
    if (!this.bannerBg || !this.bannerText) return;

    const color = type === "PHASE" ? 0xffcc00 : 0xcc0000;
    this.bannerBg.setStrokeStyle(4, color);

    this.animateBanner(message, type);
  }

  private animateBanner(message: string, type: "PHASE" | "WARNING") {
    this.bannerText
      .setText(message.toUpperCase())
      .setAlpha(1)
      .setVisible(true)
      .setScale(0.5);
    this.bannerBg.setAlpha(1).setVisible(true).setScale(1, 0);

    this.scene.tweens.killTweensOf([this.bannerText, this.bannerBg]);

    // start animation
    this.scene.tweens.add({
      targets: this.bannerBg,
      scaleY: 1,
      duration: 150,
      ease: "Quad.easeOut",
    });

    // pop animation
    this.scene.tweens.add({
      targets: this.bannerText,
      scale: 1,
      duration: 200,
      ease: "Back.easeOut",
      onComplete: () => {
        //shake effect
        if (type === "WARNING") {
          this.scene.tweens.add({
            targets: [this.bannerText, this.bannerBg],
            x: "+=3",
            yoyo: true,
            duration: 40,
            repeat: 3,
          });
        }
      },
    });

    this.scene.time.delayedCall(1500, () => {
      this.scene.tweens.add({
        targets: [this.bannerText, this.bannerBg],
        alpha: 0,
        y: "-=20",
        duration: 400,
        onComplete: () => {
          this.bannerText.setVisible(false).setY(360);
          this.bannerBg.setVisible(false).setY(360);

          this.bannerText.setX(640);
          this.bannerBg.setX(640);
        },
      });
    });
  }

  private createLPBar(x: number, y: number, initialHP: number) {
    const width = 180;
    const height = 60;
    const radius = 12;

    const stoneDark = 0x262626; // background
    const metalGold = 0xcfb35d; // border
    const magicGlow = "#FFD966"; // color text

    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();

    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(4, 4, width, height, radius);

    bg.fillStyle(stoneDark, 1);
    bg.fillRoundedRect(0, 0, width, height, radius);

    bg.lineStyle(4, metalGold, 1);
    bg.strokeRoundedRect(0, 0, width, height, radius);

    bg.lineStyle(2, 0x000000, 0.3);
    bg.strokeRoundedRect(3, 3, width - 6, height - 6, radius - 2);

    container.add(bg);

    const labelLP = this.scene.add
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

    this.hpText = this.scene.add
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
    cardType: string,
    cb: (mode: PlacementMode) => void,
  ) {
    const isMonster = cardType.includes("MONSTER");

    const leftConfig = isMonster
      ? { text: "", icon: "sword_icon", width: 70 }
      : { text: "ACTIVE", width: 90 };

    const rightConfig = isMonster
      ? { text: "", icon: "shield_icon", width: 70 }
      : { text: "FACE DOWN", width: 110 };

    const leftBtn = new ToonButton(this.scene, {
      x: x - 75,
      y: y - 100,
      height: 42,
      fontSize: "18px",
      color: 0x302b1f,
      textColor: "#FFD966",
      hoverColor: 0x302b1f,
      borderColor: 0xeee5ae,
      ...leftConfig,
    }).setDepth(10002);

    const rightBtn = new ToonButton(this.scene, {
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

    this.selectionButtons = [leftBtn, rightBtn];

    rightBtn.on("pointerdown", () => {
      this.clearSelectionMenu();
      cb(isMonster ? "DEF" : "SET");
    });

    leftBtn.on("pointerdown", () => {
      this.clearSelectionMenu();
      cb(isMonster ? "ATK" : "FACE_UP");
    });
  }

  public clearSelectionMenu() {
    this.selectionButtons.forEach((btn) => btn.destroy());
    this.selectionButtons = [];
  }

  public showFieldCardMenu(x: number, y: number, card: Card) {
    this.clearSelectionMenu();

    const buttons: ToonButton[] = [];
    const cardData = card.getCardData();

    if (card.isFaceDown) {
      const activeBtn = new ToonButton(this.scene, {
        text: "Ativar",
        x: x - 70,
        y: y - 80,
        height: 42,
        width: 120,
        fontSize: "16px",
        color: 0x302b1f,
        textColor: "#FFD966",
        hoverColor: 0x4d4533,
        borderColor: 0xeee5ae,
      }).setDepth(10002);

      activeBtn.on("pointerdown", () => {
        this.clearSelectionMenu();
        card.setFaceUp();
      });

      buttons.push(activeBtn);
    }

    const detailsBtn = new ToonButton(this.scene, {
      text: "Detalhes",
      x: x - 70,
      y: y - 35,
      height: 42,
      width: 120,
      fontSize: "16px",
      color: 0x302b1f,
      textColor: "#FFD966",
      hoverColor: 0x4d4533,
      borderColor: 0xeee5ae,
    }).setDepth(10002);

    detailsBtn.on("pointerdown", () => {
      this.clearSelectionMenu();
      this.scene.playerHand.showHand();
      this.scene.scene.launch("CardDetailScene", { cardData: cardData });
    });

    buttons.push(detailsBtn);

    this.selectionButtons = buttons;
  }
}
