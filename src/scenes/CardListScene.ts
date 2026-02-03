import { Card } from "../objects/Card";
import { ToonButton } from "../objects/ToonButton";
import type { CardData } from "../types/GameTypes";

export class CardListScene extends Phaser.Scene {
  public border: number = 0xffd966;
  private cardList: Card[] = [];
  private cardDetailView!: Card;
  private detailNameText!: Phaser.GameObjects.Text;
  private detailTypeText!: Phaser.GameObjects.Text;
  private detailDescText!: Phaser.GameObjects.Text;
  private selectionHighlight!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "CardListScene" });
  }

  init(cards: Card[]) {
    this.cardList = cards;
  }

  create() {
    const panelWidth = 800;
    const panelHeight = 600;
    const gridZoneWidth = 500; //card list
    const detailZoneWidth = 300; //card detail

    const startX = (1280 - panelWidth) / 2; //240 margin left and right
    const startY = (720 - panelHeight) / 2; //60 margin top and bottom

    const panel = this.add.graphics();

    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.3).setInteractive();
    panel.fillStyle(0x1a1a20, 0.95);

    //box
    panel.lineStyle(4, this.border, 1);
    panel.fillRoundedRect(startX, startY, panelWidth, panelHeight, 20);
    panel.strokeRoundedRect(startX, startY, panelWidth, panelHeight, 20);

    //vertical line divisor between the zones
    const dividerX = startX + gridZoneWidth;
    panel.lineBetween(
      dividerX,
      startY + 20,
      dividerX,
      startY + panelHeight - 20,
    );

    const cols = 4; // card columns qtd
    const cellWidth = gridZoneWidth / cols; //125px (4 cols into 500px width)
    const cellHeight = 135; // 5 lines x 135 height (card scale -> card height 450h x 0.30 = 135px)

    this.selectionHighlight = this.add.graphics();
    this.selectionHighlight.setDepth(10);

    //util var to mark the first card of list. cardList[0] set the graphics border into battle scene
    let firstCardItem: Card | undefined;

    this.cardList.forEach((card, i) => {
      //decides which column the card's set. Ex: i = 0 --> 0 / 4 = 0. remainder = 0 (column 0)
      const column = i % cols;

      //decides which row the card's set. Ex: i = 2 --> 2 / 4 = 0.5. Math.floor result -> 0 (row 0)
      const row = Math.floor(i / cols);

      //all cards in the same column have the same vertical align. Ex: all cards in column 0 starts on 312.5px
      const x = startX + column * cellWidth + cellWidth / 2;

      // all cards in the same row have the same horizontal alignment. Ex: all cards in row 0 will be at Y = 160px.
      const y = startY + row * cellHeight + 100; // +100 to margin top

      const cardItem = new Card(
        this,
        x,
        y,
        card.getCardData(),
        card.owner,
      ).setScale(0.3);

      if (i === 0) firstCardItem = cardItem;

      cardItem.on("pointerdown", () => {
        this.updateDetailView(cardItem.getCardData());
        this.updateHighlight(cardItem.x, cardItem.y);
      });
    });

    if (firstCardItem) {
      this.updateHighlight(firstCardItem.x, firstCardItem.y);
    }

    const defaultCardView = this.cardList[0];
    const detailCenterX = startX + gridZoneWidth + detailZoneWidth / 2;

    const textPaddingY = startY + 380;
    const { nameKey, descriptionKey, type } = defaultCardView.getCardData();
    const initialColor = this.getTypeColor(type);

    this.cardDetailView = new Card(
      this,
      detailCenterX,
      startY + 200,
      defaultCardView.getCardData(),
      defaultCardView.owner,
    ).setScale(0.75);

    this.detailNameText = this.add
      .text(detailCenterX, textPaddingY, nameKey.toUpperCase(), {
        fontSize: "20px",
        fontFamily: "Arial Black",
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 4,
        wordWrap: { width: detailZoneWidth - 40 },
      })
      .setOrigin(0.5);

    this.detailTypeText = this.add
      .text(detailCenterX, textPaddingY + 30, `[ ${type} ]`, {
        fontSize: "16px",
        color: initialColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);

    this.detailDescText = this.add
      .text(detailCenterX, textPaddingY + 60, descriptionKey, {
        fontSize: "14px",
        color: "#CCCCCC",
        wordWrap: { width: detailZoneWidth - 40 },
        align: "center",
      })
      .setOrigin(0.5, 0);

    new ToonButton(this, {
      x: startX + panelWidth - 30,
      y: startY + 30,
      text: "X",
      width: 50,
      height: 50,
      textColor: `#${this.border.toString(16)}`,
      alpha: 0,
      fontSize: "20px",
    }).on("pointerdown", () => this.closeModal());
  }

  private closeModal() {
    this.scene.stop();
  }

  private updateDetailView(data: CardData) {
    this.cardDetailView.updateData(data);

    this.detailNameText.setText(data.nameKey.toUpperCase());
    this.detailDescText.setText(data.descriptionKey);

    this.detailTypeText.setText(`[ ${data.type} ]`);
    this.detailTypeText.setColor(this.getTypeColor(data.type));
  }

  private updateHighlight(x: number, y: number) {
    this.selectionHighlight.clear();

    this.selectionHighlight.lineStyle(4, this.border, 1);

    const w = 320 * 0.3; //w = 96px
    const h = 450 * 0.3; //h * card scale = 135px
    const offsetY = 5;

    this.selectionHighlight.strokeRoundedRect(
      x - w / 2,
      y - h / 2 + offsetY,
      w,
      h,
      10,
    );
    this.selectionHighlight.fillStyle(this.border, 0.2);
    this.selectionHighlight.fillRoundedRect(
      x - w / 2,
      y - h / 2 + offsetY,
      w,
      h,
      10,
    );
  }

  private getTypeColor(type: string): string {
    switch (type) {
      case "SPELL":
        return "#55aaff";
      case "MONSTER":
        return "#ddaa55";
      case "TRAP":
        return "#bc55ff";
      default:
        return "#ffd966";
    }
  }
}
