import Phaser from "phaser";

export interface ButtonConfig {
  x: number;
  y: number;
  text: string;
  icon?: string;
  width?: number;
  height?: number;
  color?: number;
  fontSize?: string;
  hoverColor?: number;
  textColor?: string;
  fontFamily?: string
  borderWidth?: number;
  borderColor?: number;
}

export class ToonButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private iconImage?: Phaser.GameObjects.Image;
  private config: Required<ButtonConfig>;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    //container position
    super(scene, config.x, config.y);

    this.config = {
      width: 250,
      height: 60,
      color: 0xffcc00,
      hoverColor: 0xffe066,
      textColor: "#000000",
      fontSize: "24px",
      fontFamily: "Arial Black",
      icon: "",
      borderWidth: 3,
      borderColor: 0x000000,
      ...config,
    };

    //background
    this.bg = scene.add.graphics();
    this.drawBackground(this.config.color);

    //text
    this.label = scene.add
      .text(0, 0, this.config.text, {
        fontSize: this.config.fontSize,
        color: this.config.textColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    //add into container
    this.add([this.bg, this.label]);

    if(this.config.icon){
      this.iconImage = this.scene.add.image(0, 0, this.config.icon);

      const iconScale = (this.config.height * 0.8) / this.iconImage.height;
      this.iconImage.setScale(iconScale);
      
      this.add(this.iconImage);
      this.label.setVisible(false);
    }

    const hitArea = new Phaser.Geom.Rectangle(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    );
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.input!.cursor = "pointer";

    this.on("pointerover", () => this.drawBackground(this.config.hoverColor ?? 0xffe066));
    this.on("pointerout", () => this.drawBackground(this.config.color));

    scene.add.existing(this);
  }

  private drawBackground(color: number) {
    this.bg.clear();

    const halfW = this.config.width / 2;
    const halfH = this.config.height / 2;
    const borderWidth = this.config.borderWidth ?? 3;
    const borderColor = this.config.borderColor ?? 0x000000

    // background
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-halfW, -halfH, this.config.width, this.config.height, 12);

    // toon border
    this.bg.lineStyle(borderWidth, borderColor, 1);
    this.bg.strokeRoundedRect(-halfW, -halfH, this.config.width, this.config.height, 12);
  }

  public setText(newText: string) {
    this.label.setText(newText);
  }

  public setButtonColor(color: number) {
    this.config.color = color;
    this.drawBackground(color);
  }
}
