import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene";
import { NameScene } from "./scenes/NameScene";
import "./styles/ui.css";
import { GuideScene } from "./scenes/GuideScene";
import { BattleScene } from "./scenes/BattleScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#1a1a1a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  scene: [BattleScene, MenuScene, NameScene, GuideScene],
};

new Phaser.Game(config);
