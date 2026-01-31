import type { Card } from "../objects/Card";
import { BattleScene } from "../scenes/BattleScene";
import type { GameSide, PlacementMode } from "../types/GameTypes";

export class FieldManager {
  private scene: BattleScene;

  //null = empty slot, Card = slot full
  private monsterSlots = {
    PLAYER: [null, null, null] as (Card | null)[],
    OPPONENT: [null, null, null] as (Card | null)[],
  };

  private spellSlots = {
    PLAYER: [null, null, null] as (Card | null)[],
    OPPONENT: [null, null, null] as (Card | null)[],
  };

  private readonly fieldCoords = {
    PLAYER: {
      MONSTER: [
        { x: 505, y: 450 },
        { x: 645, y: 450 },
        { x: 787, y: 450 },
      ],
      SPELL: [
        { x: 505, y: 600 },
        { x: 645, y: 600 },
        { x: 787, y: 600 },
      ],
    },
    OPPONENT: {
      MONSTER: [
        { x: 505, y: 270 },
        { x: 645, y: 270 },
        { x: 787, y: 270 },
      ],
      SPELL: [
        { x: 505, y: 120 },
        { x: 645, y: 120 },
        { x: 787, y: 120 },
      ],
    },
  };

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public setupFieldZones() {
    const sides: GameSide[] = ["PLAYER", "OPPONENT"];

    sides.forEach((side) => {
      //Monster Zones
      this.fieldCoords[side].MONSTER.forEach((pos, i) => {
        this.scene.add
          .zone(pos.x, pos.y, 110, 150)
          .setRectangleDropZone(110, 150)
          .setData("type", "MONSTER")
          .setData("side", side)
          .setData("index", i);
      });

      //Spell/Trap Zones
      this.fieldCoords[side].SPELL.forEach((pos, i) => {
        this.scene.add
          .zone(pos.x, pos.y, 110, 150)
          .setRectangleDropZone(110, 150)
          .setData("type", "SPELL")
          .setData("side", side)
          .setData("index", i);
      });
    });
  }

  public getFirstAvailableSlot(side: GameSide, type: "MONSTER" | "SPELL") {
    const slots =
      type == "MONSTER" ? this.monsterSlots[side] : this.spellSlots[side];
    const coords =
      type === "MONSTER"
        ? this.fieldCoords[side].MONSTER
        : this.fieldCoords[side].SPELL;

    for (let i = 0; i < slots.length; i++) {
      //return first slot to use
      if (slots[i] == null) {
        //response format: { x: 505, y: 450, index: i }
        return { ...coords[i], index: i };
      }
    }

    return null;
  }

  public occupySlot(
    side: GameSide,
    type: "MONSTER" | "SPELL",
    index: number,
    card: Card,
  ) {
    if (type == "MONSTER") this.monsterSlots[side][index] = card;
    else this.spellSlots[side][index] = card;
  }

  public playCardToZone(
    card: Card,
    targetX: number,
    targetY: number,
    mode: PlacementMode,
  ) {
    const { manaCost } = card.getCardData();
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
    } else {
      // mode == ATK or FACE_UP, card face up
      //opponent need this to face up card into field slot (default -> card face down into opponent hand)
      card.setFaceUp();
    }

    this.scene.currentUI.updateMana(-manaCost);

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
