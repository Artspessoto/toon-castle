import { Card } from "../objects/Card";
import { ToonButton } from "../objects/ToonButton";
import type { CardData } from "../types/GameTypes";

export class CardDetailScene extends Phaser.Scene {
  private cardData!: CardData;

  constructor() {
    super({ key: "CardDetailScene" });
  }

  init(data: { cardData: CardData }) {
    this.cardData = data.cardData;
  }

  create() {
    const width = 800;
    const height = 500;
    const centerX = 1280 / 2;
    const centerY = 720 / 2;
    const startX = centerX - width / 2;
    const startY = centerY - height / 2;
    const panel = this.add.graphics();
    let borderColor = 0xffd966;

    if (this.cardData.type === "SPELL") {
      borderColor = 0x55aaff;
    } else if (this.cardData.type === "MONSTER") {
      borderColor = 0xddaa55; //FFD966
    } else if (this.cardData.type == "TRAP") {
      borderColor = 0xbc55ff;
    }

    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8).setInteractive();

    panel.fillStyle(0x1a1a20, 0.95);
    panel.lineStyle(4, borderColor, 1);

    //box
    panel.fillRoundedRect(startX, startY, width, height, 20);
    panel.strokeRoundedRect(startX, startY, width, height, 20);

    const displayCard = new Card(this, startX + 200, centerY, this.cardData);

    displayCard.disableInteractive();
    displayCard.input!.enabled = false;
    displayCard.setScale(1);

    const textStartX = startX + 380;
    const textWidth = 380; // text width

    // Título
    this.add.text(
      textStartX,
      startY + 60,
      this.cardData.nameKey.toUpperCase(),
      {
        fontSize: "24px",
        fontFamily: "Arial Black",
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 4,
      },
    );

    this.add.text(textStartX, startY + 110, `[ ${this.cardData.type} ]`, {
      fontSize: "18px",
      color: `#${borderColor.toString(16)}`,
      fontStyle: "bold",
    });

    this.add.text(textStartX, startY + 160, this.cardData.descriptionKey, {
      fontSize: "18px",
      color: "#DDDDDD",
      wordWrap: { width: textWidth },
      lineSpacing: 8,
    });

    this.add.text(textStartX, startY + 350, '"Só o básico..."', {
      fontSize: "18px",
      fontStyle: "italic",
      color: "#888888",
      wordWrap: { width: textWidth },
    });

    new ToonButton(this, {
      x: startX + width - 30,
      y: startY + 30,
      text: "X",
      width: 50,
      height: 50,
      textColor: `#${borderColor.toString(16)}`,
      alpha: 0,
      fontSize: "20px",
    }).on("pointerdown", () => this.closeModal());
  }

  private closeModal() {
    this.scene.stop();
  }
}
