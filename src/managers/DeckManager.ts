import { BattleScene } from "../scenes/BattleScene";

export class DeckManager {
  private scene: BattleScene;

  private readonly deckPosition = { x: 1122, y: 542 };

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public get position() {
    return this.deckPosition;
  }

  public createDeckVisual() {
    for (let i = 8; i >= 0; i--) {
      // const heightOffset = i * 3;
      const xOffset = i * 2;
      const yOffset = 0;
      const deckCard = this.scene.add.plane(
        this.deckPosition.x - xOffset,
        this.deckPosition.y - yOffset,
        "card_back",
      );
      // deckCard.modelRotation.x = -1.02; // deep card
      // deckCard.modelRotation.y = 0.29;
      // deckCard.modelRotation.z = Phaser.Math.DegToRad(0.12);

      deckCard.setViewHeight(400);
      deckCard.scaleX = 0.36;
      deckCard.scaleY = 0.4;
      deckCard.setDepth(10 - i);

      if (i > 0) {
        deckCard.setTint(0x999999);
      }
    }
  }
}
