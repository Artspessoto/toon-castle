import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene";
import { NameScene } from "./scenes/NameScene";
import "./styles/ui.css";
import { GuideScene } from "./scenes/GuideScene";
import { BattleScene } from "./scenes/BattleScene";
import { CardDetailScene } from "./scenes/CardDetailScene";
import { CardListScene } from "./scenes/CardListScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#1a1a1a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 1280,
      height: 720,
    },
    max: {
      width: 2560,
      height: 1440,
    },
  },
  render: {
    antialias: true,
    roundPixels: true,
  },
  dom: {
    createContainer: true,
  },
  scene: [
    MenuScene,
    NameScene,
    GuideScene,
    BattleScene,
    CardDetailScene,
    CardListScene,
  ],
};

new Phaser.Game(config);
