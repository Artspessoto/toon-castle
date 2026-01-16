import Phaser from "phaser";
import { ToonButton } from "../objects/ToonButton";
import { LanguageManager } from "../utils/LanguageManager";
import { TRANSLATIONS } from "../constants/Translations";

export class GuideScene extends Phaser.Scene {
  constructor() {
    super("GuideScene");
  }

  create() {
    const lang = LanguageManager.getInstance().currentLang;
    const text = TRANSLATIONS[lang].guide;
    const Pos_x = 640;
    const height = 550;
    const width = 800;
    const x = (1280 - width) / 2;
    const y = (720 - height) / 2;
    const content = `${text.lore}\n\n${text.rules}\n\n${text.footer}`;

    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

    const panel = this.add.graphics();
    // panel.fillStyle(0x222222, 1);
    // panel.lineStyle(4, 0xffcc00, 1);
    // panel.fillRoundedRect(340, 110, 600, 500, 20);
    // panel.strokeRoundedRect(340, 110, 600, 500, 20);
    panel.fillStyle(0x0a0a0a, 1);
    panel.lineStyle(4, 0x996600, 1);
  
    //box
    panel.fillRoundedRect(x, y, width, height, 20);
    panel.strokeRoundedRect(x, y, width, height, 20);

    this.add
      .text(Pos_x, 160, text.title, {
        fontSize: "32px",
        color: "#ffcc00",
        fontStyle: "bold",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(Pos_x, 360, content, {
        fontSize: "1.4rem",
        color: "#fff",
        align: "center",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);

    const closeBtn = new ToonButton(this, {
      x: Pos_x,
      y: 580,
      text: text.close,
      width: 150,
      height: 70,
      color: 0x1a1a1a,
      hoverColor: 0x2a2a2a,
      textColor: "#fff",
    });

    closeBtn.on("pointerdown", () => {
      this.scene.resume("MenuScene");
      this.scene.stop();
    });
  }
}
