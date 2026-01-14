import Phaser from "phaser";

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.add
      .text(640, 360, "Toon Castle: Setup OK!", { fontSize: "32px" })
      .setOrigin(0.5);
    this.add
      .text(640, 400, "Pronto para começar o Menu", { fontSize: "18px" })
      .setOrigin(0.5);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#2d2d2d",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene],
};

new Phaser.Game(config);
