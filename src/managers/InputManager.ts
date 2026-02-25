import type { IInputManager } from "../interfaces/IInputManager";
import type { IBattleContext } from "../interfaces/IBattleContext";
import type { Card } from "../objects/Card";

export class InputManager implements IInputManager {
  private context: IBattleContext;

  constructor(context: IBattleContext) {
    this.context = context;
  }

  public setupGlobalInputs() {
    this.context.engine.input.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        currentlyOver: Phaser.GameObjects.GameObject[],
      ) => {
        if (currentlyOver.length === 0) {
          const activeSide = this.context.gameState.activePlayer;
          this.context.getUI(activeSide).clearSelectionMenu();
          this.context.getHand(activeSide).showHand();
        }
      },
    );

    this.context.engine.input.keyboard?.on("keydown-SPACE", () => {
      this.context.handlePlayerCard();
    });

    this.context.engine.input.keyboard?.on("keydown-ESC", () => {
      if (this.context.currentPhase == "BATTLE") {
        this.context.combat.cancelTarget();
      }
      this.context.cancelPlacement();
    });

    this.context.engine.input.keyboard?.on("keydown-T", () => {
      this.context.gameState.nextTurn();
      this.context.setPhase("DRAW");
    });

    this.context.engine.input.on("pointerdown", () => {
      if (this.context.selectedCard) {
        this.context.time.delayedCall(50, () => this.context.cancelPlacement());
      }
    });

    this.context.engine.input.on(
      "pointerdown",
      (pointer: { x: number; y: number }) => {
        console.log(
          `Debug: X: ${Math.round(pointer.x)}, Y: ${Math.round(pointer.y)}`,
        );
      },
    );
  }

  public setupCardInteractions(card: Card) {
    card.setInteractive({ draggable: true });
    this.context.engine.input.setDraggable(card);

    // hover effect (Zoom)
    card.on("pointerover", () => this.handleCardHover(card));
    card.on("pointerout", () => this.handleCardOut(card));

    this.setupDragEvents(card);
  }

  //card on focus (hand)
  private handleCardHover(card: Card) {
    if (this.context.gameState.isDragging) return;

    this.context.tweens.add({
      targets: card.visualElements,
      y: -280,
      scale: 1.5,
      duration: 200,
      ease: "Back.easeOut",
    });
    card.setDepth(200);
  }

  //card stop focus (hand)
  private handleCardOut(card: Card) {
    if (this.context.gameState.isDragging) return;

    this.context.tweens.add({
      targets: card.visualElements,
      y: 0,
      scale: 1,
      duration: 200,
      ease: "Power2",
    });

    this.context.getHand(card.owner).reorganizeHand();
  }

  public setupDragEvents(card: Card) {
    card.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      if (this.context.currentPhase !== "MAIN") {
        this.context.engine.input.setDragState(pointer, 0);
        return;
      }

      this.context.gameState.setDragging(true);
      this.context.tweens.killTweensOf(card);
      this.context.tweens.killTweensOf(card.visualElements);

      this.context.tweens.add({
        targets: card,
        scale: 0.35,
        duration: 150,
        ease: "Power2",
      });
      card.setDepth(2000);
    });

    card.on(
      "drag",
      (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        //TODO option to drop card into zone (defense, attack, back card)
        card.visualElements.setY(0);
        card.visualElements.setScale(1);
        card.setPosition(dragX, dragY);
      },
    );

    card.on("dragend", (_pointer: Phaser.Input.Pointer, dropped: boolean) => {
      this.context.gameState.setDragging(false);
      const activeSide = this.context.gameState.activePlayer;
      if (!dropped) this.context.getHand(activeSide).reorganizeHand();
      this.context.tweens.add({
        targets: card,
        scale: 0.35,
        duration: 200,
        ease: "Back.easeOut",
      });
    });

    card.on(
      "drop",
      (_pointer: Phaser.Input.Pointer, targetZone: Phaser.GameObjects.Zone) => {
        this.context.handleCardDrop(targetZone, card);
      },
    );
  }
}
