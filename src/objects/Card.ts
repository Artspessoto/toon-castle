import Phaser, { Scene } from "phaser";
import type { CardData, CardType } from "../types/CardData";
import { CARD_CONFIG } from "../constants/Cards";

export class Card extends Phaser.GameObjects.Container {
  private frame: Phaser.GameObjects.Image;
  // private cardImage: Phaser.GameObjects.Image;
  private nameText: Phaser.GameObjects.Text;
  private manaText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;
  private atkText?: Phaser.GameObjects.Text;
  private defText?: Phaser.GameObjects.Text;

  constructor(scene: Scene, x: number, y: number, data: CardData) {
    super(scene, x, y);

    const { NAME, MANA, DESC, ATK, DEF } = CARD_CONFIG.POSITIONS;
    const width = data.width ?? CARD_CONFIG.WIDTH;
    const height = data.heigth ?? CARD_CONFIG.HEIGHT;

    //define model image by type
    const frameKey = this.getFrameKey(data.type);

    // model image
    this.frame = scene.add.image(0, 0, frameKey);
    this.frame.setDisplaySize(width, height);
    this.add(this.frame);

    //add cart art
    // this.cardImage = scene.add.image(0, -28, data.imageKey);
    // this.cardImage.setDisplaySize(CARD_CONFIG.WIDTH, CARD_CONFIG.HEIGHT);
    // this.add(this.cardImage);

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: "14px",
      color: "#FFFFFF",
      fontStyle: "bold",
    };

    const descStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: "11px",
      color: "#000000",
      wordWrap: { width: 150 },
    };

    //text position
    this.nameText = scene.add.text(
      NAME.x,
      NAME.y,
      data.nameKey.toUpperCase(),
      textStyle,
    );

    this.manaText = scene.add
      .text(MANA.x, MANA.y, data.manaCost.toString(), {
        ...textStyle,
        fontSize: "16px",
      })
      .setOrigin(0.5);

    this.descText = scene.add.text(
      DESC.x,
      DESC.y,
      data.descriptionKey || "...",
      descStyle,
    );

    this.add([this.nameText, this.manaText, this.descText]);

    if (data.type == "MONSTER" || data.type == "EFFECT_MONSTER") {
      const statStyle = { ...textStyle, fontSize: "12px" };
      const atkValue = `ATK/${data.atk?.toString() || 0}`;
      const defValue = `DEF/${data.def?.toString() || 0}`;

      this.atkText = this.scene.add
        .text(ATK.x, ATK.y, atkValue, statStyle)
        .setOrigin(0.5);

      this.defText = this.scene.add
        .text(DEF.x, DEF.y, defValue, statStyle)
        .setOrigin(0.5);

      this.add([this.atkText, this.defText]);
    }

    this.setSize(width, height);
    this.setInteractive();
    scene.add.existing(this);
  }

  private getFrameKey(type: CardType): string {
    switch (type) {
      case "EFFECT_MONSTER":
        return "card_template_effect";
      case "SPELL":
        return "card_template_spell";
      case "TRAP":
        return "card_template_trap";
      default:
        return "card_template_monster";
    }
  }
}
