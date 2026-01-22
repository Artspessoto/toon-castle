import Phaser from "phaser";
import { ToonButton } from "../objects/ToonButton";
import { LanguageManager } from "../managers/LanguageManager";
import { TRANSLATIONS } from "../constants/Translations";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty: Difficulty = "MEDIUM";
  private diffButtons: Map<Difficulty, Phaser.GameObjects.Text> = new Map();
  private diffBgs: Map<Difficulty, Phaser.GameObjects.Graphics> = new Map();

  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("background", "assets/menu_background.jpg");
  }

  create() {
    const lang = LanguageManager.getInstance().currentLanguage;
    const strings = TRANSLATIONS[lang].menu;

    const bg = this.add.image(640, 360, "background");
    bg.setDisplaySize(1280, 900);
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5);

    this.add
      .text(640, 150, "TOON CASTLE", {
        fontSize: "80px",
        color: "#ffcc00",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 8,
        shadow: { offsetX: 5, offsetY: 5, color: "#000", blur: 2, fill: true },
      })
      .setOrigin(0.5);

    this.add
      .text(640, 260, strings.select_diff, {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const diffs: { id: Difficulty; label: string; color: string }[] = [
      { id: "EASY", label: strings.easy, color: "#00ff00" },
      { id: "MEDIUM", label: strings.medium, color: "#ffff00" },
      { id: "HARD", label: strings.hard, color: "#ff0000" },
    ];

    const spacing = 180;
    const totalWidth = (diffs.length - 1) * spacing;
    const startX = 640 - totalWidth / 2;

    diffs.forEach((diff, index) => {
      const xPos = startX + index * spacing;
      const yPos = 360;

      const bgGraphics = this.add.graphics();
      this.diffBgs.set(diff.id, bgGraphics);

      const btn = this.add
        .text(xPos, yPos, diff.label, {
          fontSize: "26px",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => this.updateDifficulty(diff.id, diff.color));

      this.diffButtons.set(diff.id, btn);
    });

    this.updateDifficulty("MEDIUM", "#ffff00");

    const startX_pos = 640;
    const startY_pos = 520;

    const startBtn = new ToonButton(this, {
      x: startX_pos,
      y: startY_pos,
      text: strings.start,
    });

    startBtn.on("pointerdown", () => {
      this.scene.start("NameScene", { difficulty: this.selectedDifficulty });
    });

    const guideBtn = new ToonButton(this, {
      x: startX_pos,
      y: 590,
      text: strings.guide,
      fontSize: "1.2rem",
      textColor: "#fff",
      color: 0x333333,
      hoverColor: 0x222222,
    });

    guideBtn.on("pointerdown", () => {
      this.scene.pause();
      this.scene.launch("GuideScene");
    });

    const btnPT = this.add
      .text(1150, 50, "PT", { fontSize: "20px", color: "#fff" })
      .setInteractive({ useHandCursor: true });

    const btnEN = this.add
      .text(1210, 50, "EN", { fontSize: "20px", color: "#fff" })
      .setInteractive({ useHandCursor: true });

    btnPT.on("pointerdown", () => {
      LanguageManager.getInstance().setLanguage("pt-br");
      this.scene.restart();
    });

    btnEN.on("pointerdown", () => {
      LanguageManager.getInstance().setLanguage("en");
      this.scene.restart();
    });
  }

  private updateDifficulty(difficulty: Difficulty, activeColor: string) {
    this.selectedDifficulty = difficulty;

    this.diffButtons.forEach((btn, id) => {
      const graphics = this.diffBgs.get(id)!;
      const isSelected = id === difficulty;

      graphics.clear();

      if (isSelected) {
        graphics.lineStyle(
          3,
          Phaser.Display.Color.HexStringToColor(activeColor).color,
          1
        );
        graphics.fillStyle(0x111111, 0.9);
        btn.setStyle({ color: activeColor }).setScale(1.0);
      } else {
        graphics.lineStyle(2, 0x000000, 0.5);
        graphics.fillStyle(0x111111, 0.7);
        btn.setStyle({ color: "#666" }).setScale(1.0);
      }

      graphics.fillRoundedRect(btn.x - 75, btn.y - 35, 150, 70, 10);
      graphics.strokeRoundedRect(btn.x - 75, btn.y - 35, 150, 70, 10);
    });
  }
}
