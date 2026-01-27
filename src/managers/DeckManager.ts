import { BattleScene } from "../scenes/BattleScene";
import type { GameSide } from "../types/GameTypes";

export class DeckManager {
  private scene: BattleScene;
  private side: GameSide;
  private deckPosition: { x: number; y: number };

  constructor(scene: BattleScene, side: GameSide) {
    this.scene = scene;
    this.side = side;

    this.deckPosition =
      this.side == "PLAYER" ? { x: 1122, y: 542 } : { x: 1122, y: 110 };
  }

  public get position() {
    return this.deckPosition;
  }

  public createDeckVisual() {
    for (let i = 8; i >= 0; i--) {
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
