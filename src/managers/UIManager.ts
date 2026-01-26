import { ToonButton } from "../objects/ToonButton";
import { BattleScene } from "../scenes/BattleScene";
import type { CardData, PlacementMode } from "../types/GameTypes";

export class UIManager {
  private scene: BattleScene;
  private bannerText!: Phaser.GameObjects.Text;
  private bannerBg!: Phaser.GameObjects.Rectangle;
  private selectionButtons: ToonButton[] = [];

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public setupUI() {
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

  public cardDetailsOption(x: number, y: number, cardInfo: CardData) {
    this.clearSelectionMenu();

    const detailsBtn = new ToonButton(this.scene, {
      text: "Detalhes",
      x: x - 70,
      y: y - 50,
      height: 42,
      width: 120,
      fontSize: "16px",
      color: 0x302b1f,
      textColor: "#FFD966",
      hoverColor: 0x302b1f,
      borderColor: 0xeee5ae,
    }).setDepth(10002);

    this.selectionButtons = [detailsBtn];

    detailsBtn.on("pointerdown", () => {
      this.clearSelectionMenu();
      this.scene.handManager.showHand();

      //TODO: Modal card info scene
      console.log(cardInfo);
    });
  }
}
