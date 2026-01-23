import type { Card } from "../objects/Card";
import type { BattleScene } from "../scenes/BattleScene";

export class InputManager {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public setupCardInteractions(card: Card) {
    card.setInteractive({ draggable: true });
    this.scene.input.setDraggable(card);

    // hover effect (Zoom)
    card.on("pointerover", () => this.handleCardHover(card));
    card.on("pointerout", () => this.handleCardOut(card));

    this.setupDragEvents(card);
  }

  private handleCardHover(card: Card) {
    if (this.scene.gameState.isDragging) return;

    this.scene.tweens.add({
      targets: card.visualElements,
      y: -280,
      scale: 1.5,
      duration: 200,
      ease: "Back.easeOut",
    });
    card.setDepth(200);
  }

  private handleCardOut(card: Card) {
    if (this.scene.gameState.isDragging) return;

    this.scene.tweens.add({
      targets: card.visualElements,
      y: 0,
      scale: 1,
      duration: 200,
      ease: "Power2",
    });

    this.scene.handManager.reorganizeHand();
  }

  public setupDragEvents(card: Card) {
    card.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      if (this.scene.currentPhase !== "MAIN") {
        this.scene.input.setDragState(pointer, 0);
        return;
      }

      this.scene.gameState.setDragging(true);
      this.scene.tweens.killTweensOf(card);
      this.scene.tweens.killTweensOf(card.visualElements);

      this.scene.tweens.add({
        targets: card,
        scale: 0.25,
        duration: 150,
        ease: "Power2",
      });
      card.setDepth(2000);
    });

    card.on("drag", (_pointer: any, dragX: number, dragY: number) => {
      card.visualElements.setY(0);
      card.visualElements.setScale(1);
      card.setPosition(dragX, dragY);
    });

    card.on("dragend", (_pointer: any, dropped: boolean) => {
      this.scene.gameState.setDragging(false);
      if (!dropped) this.scene.handManager.reorganizeHand();
      this.scene.tweens.add({
        targets: card,
        scale: 0.35,
        duration: 200,
        ease: "Back.easeOut",
      });
    });

    card.on("drop", (_pointer: any, targetZone: Phaser.GameObjects.Zone) => {
      this.scene.handleCardDrop(targetZone, card);
    });
  }
}
