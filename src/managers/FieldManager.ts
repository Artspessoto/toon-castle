import type { Card } from "../objects/Card";
import { BattleScene } from "../scenes/BattleScene";
import type { PlacementMode } from "../types/GameTypes";

export class FieldManager {
  private scene: BattleScene;

  //null = empty slot, Card = slot full
  private monsterSlots: (Card | null)[] = [null, null, null];
  private spellSlots: (Card | null)[] = [null, null, null];

  private readonly monsterCoords = [
    { x: 505, y: 450 },
    { x: 645, y: 450 },
    { x: 787, y: 450 },
  ];

  private readonly spellCoords = [
    { x: 505, y: 600 },
    { x: 645, y: 600 },
    { x: 787, y: 600 },
  ];

  // spell/trap zone enemy: x 505, y: 120, x: 645, y: 120, x: 787, y: 120
  // monster zone enemy: x: 505, y: 270, x: 645, y: 270, x: 787, y: 270

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public setupFieldZones() {
    //Monster Zones
    this.monsterCoords.forEach((pos, i) => {
      this.scene.add
        .zone(pos.x, pos.y, 110, 150)
        .setRectangleDropZone(110, 150)
        .setData("type", "MONSTER")
        .setData("index", i);
    });

    //Spell/Trap Zones
    this.spellCoords.forEach((pos, i) => {
      this.scene.add
        .zone(pos.x, pos.y, 110, 150)
        .setRectangleDropZone(110, 150)
        .setData("type", "SPELL")
        .setData("index", i);
    });
  }

  public getFirstAvailableSlot(type: "MONSTER" | "SPELL") {
    const slots = type == "MONSTER" ? this.monsterSlots : this.spellSlots;
    const coords = type === "MONSTER" ? this.monsterCoords : this.spellCoords;

    for (let i = 0; i < slots.length; i++) {
      if (slots[i] == null) {
        //response format: { x: 505, y: 450, index: i }
        return { ...coords[i], index: i };
      }
    }

    return null;
  }

  public occupySlot(type: "MONSTER" | "SPELL", index: number, card: Card) {
    if (type == "MONSTER") this.monsterSlots[index] = card;
    else this.spellSlots[index] = card;
  }

  public playCardToZone(
    card: Card,
    targetX: number,
    targetY: number,
    mode: PlacementMode,
  ) {
    card.disableInteractive();
    this.scene.tweens.killTweensOf(card.visualElements);

    card.visualElements.setY(0);
    card.visualElements.setScale(1);
    card.setFieldVisuals();

    const isDefense = mode === "DEF";
    const isSet = mode === "SET";

    const finalAngle = isDefense ? 270 : 0;
    const finalScale = isDefense ? 0.3 : 0.32;

    if (isSet) {
      card.setFaceDown();
    }

    // Slot animation movement
    this.scene.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      angle: finalAngle,
      scale: finalScale,
      duration: 250,
      ease: "Back.easeOut",
      onComplete: () => {
        // card impact animation effect
        this.scene.cameras.main.shake(100, 0.002);
        card.setDepth(10);

        this.setupFieldInteractions(card);
      },
    });
  }

  public previewPlacement(card: Card, targetX: number, targetY: number) {
    card.disableInteractive();
    this.scene.tweens.killTweensOf(card);

    card.visualElements.setY(0);
    card.visualElements.setScale(1);

    this.scene.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      scale: 0.55,
      angle: 0,
      duration: 200,
      ease: "Power2",
    });

    card.setDepth(5000);
  }

  private setupFieldInteractions(card: Card) {
    card.setInteractive({ cursor: "pointer" });
    card.removeAllListeners();

    card.on("pointerdown", () => {
      const currentX = card.x;
      const currentY = card.y;

      this.scene.playerHand.hideHand();

      this.scene.playerUI.showFieldCardMenu(currentX, currentY, card);
    });
  }
}
