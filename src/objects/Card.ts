import Phaser, { Scene } from "phaser";
import type { CardData, CardType } from "../types/CardData";
import { CARD_CONFIG } from "../constants/CardConfig";

export class Card extends Phaser.GameObjects.Container {
  private frame: Phaser.GameObjects.Image;
  // private cardImage: Phaser.GameObjects.Image;
  private nameText: Phaser.GameObjects.Text;
  private manaText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;
  private atkText?: Phaser.GameObjects.Text;
  private defText?: Phaser.GameObjects.Text;
  public cardType: CardType;

  constructor(scene: Scene, x: number, y: number, data: CardData) {
    super(scene, x, y);

    const { NAME, MANA, DESC, ATK, DEF } = CARD_CONFIG.POSITIONS;
    const width = data.width ?? CARD_CONFIG.WIDTH;
    const height = data.height ?? CARD_CONFIG.HEIGHT;

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

    //text position
    this.nameText = scene.add
      .text(NAME.x, NAME.y, data.nameKey.toUpperCase(), {
        ...CARD_CONFIG.STYLES.NAME,
        align: "center",
        fixedWidth: 160,
      })
      .setOrigin(0.5);

    this.manaText = scene.add
      .text(MANA.x, MANA.y, data.manaCost.toString(), CARD_CONFIG.STYLES.STATS)
      .setOrigin(0.5);

    this.descText = scene.add
      .text(DESC.x, DESC.y, data.descriptionKey || "...", {
        ...CARD_CONFIG.STYLES.DESC,
      })
      .setOrigin(0.5);

    this.add([this.nameText, this.manaText, this.descText]);

    this.cardType = data.type;

    if (data.type == "MONSTER" || data.type == "EFFECT_MONSTER") {
      const atkValue = `${data.atk?.toString() || 0}`;
      const defValue = `${data.def?.toString() || 0}`;

      this.atkText = this.scene.add
        .text(ATK.x, ATK.y, atkValue, CARD_CONFIG.STYLES.STATS)
        .setOrigin(0.5);

      this.defText = this.scene.add
        .text(DEF.x, DEF.y, defValue, CARD_CONFIG.STYLES.STATS)
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

  public getType(): string {
    return this.cardType;
  }

  public setFieldVisuals() {
    const FIELD_W = 320;
    const FIELD_H = 360;

    this.frame.setDisplaySize(FIELD_W, FIELD_H);
    
    this.setSize(FIELD_W, FIELD_H);
}

  public setFaceDown() {
    this.frame.setTexture("card_back");

    this.nameText.setVisible(false);
    this.manaText.setVisible(false);
    this.descText.setVisible(false);

    if (this.atkText) this.atkText.setVisible(false);
    if (this.defText) this.defText.setVisible(false);
    
    this.setFieldVisuals();
  }
}
