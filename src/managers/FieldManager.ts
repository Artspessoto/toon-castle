import type { Card } from "../objects/Card";
import { BattleScene } from "../scenes/BattleScene";

export class FieldManager {
  private scene: BattleScene;
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
    this.monsterCoords.forEach((pos) => {
      this.scene.add
        .zone(pos.x, pos.y, 110, 150)
        .setRectangleDropZone(110, 150)
        .setData("type", "MONSTER");
    });

    //Spell/Trap Zones
    this.spellCoords.forEach((pos) => {
      this.scene.add
        .zone(pos.x, pos.y, 110, 150)
        .setRectangleDropZone(110, 150)
        .setData("type", "SPELL");
    });
  }

  public playCardToZone(card: Card, zone: Phaser.GameObjects.Zone) {
    const isTrapOrSpellCard =
      card.getType() === "TRAP" || card.getType() === "SPELL";

    card.disableInteractive();
    this.scene.tweens.killTweensOf(card.visualElements);

    card.visualElements.setY(0);
    card.visualElements.setScale(1);
    card.setFieldVisuals();

    if (isTrapOrSpellCard) {
      card.setFaceDown();
    }

    // Slot animation movement
    this.scene.tweens.add({
      targets: card,
      x: zone.x,
      y: zone.y,
      angle: 0,
      scale: 0.32,
      duration: 250,
      ease: "Back.easeOut",
      onComplete: () => {
        // card impact animation effect
        this.scene.cameras.main.shake(100, 0.002);
        card.setDepth(10);
      },
    });
  }
}
