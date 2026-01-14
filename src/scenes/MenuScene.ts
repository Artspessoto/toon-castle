import Phaser from "phaser";

export type Difficulty = "Fácil" | "Médio" | "Difícil";

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty: Difficulty = "Médio";
  private diffButtons: Map<Difficulty, Phaser.GameObjects.Text> = new Map();
  private diffBgs: Map<Difficulty, Phaser.GameObjects.Graphics> = new Map();

  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("background", "assets/menu_background.jpg");
  }

  create() {
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
      .text(640, 260, "Selecione a Dificuldade:", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const diffs: { label: Difficulty; color: string }[] = [
      { label: "Fácil", color: "#00ff00" },
      { label: "Médio", color: "#ffff00" },
      { label: "Difícil", color: "#ff0000" },
    ];

    const spacing = 180;
    const totalWidth = (diffs.length - 1) * spacing;
    const startX = 640 - totalWidth / 2;

    diffs.forEach((diff, index) => {
      const xPos = startX + index * spacing;
      const yPos = 360;

      const bgGraphics = this.add.graphics();
      this.diffBgs.set(diff.label, bgGraphics);

      const btn = this.add
        .text(xPos, yPos, diff.label, {
          fontSize: "26px",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () =>
        this.updateDifficulty(diff.label, diff.color)
      );

      this.diffButtons.set(diff.label, btn);
    });

    this.updateDifficulty("Médio", "#ffff00");

    const startX_pos = 640;
    const startY_pos = 580;
    const colorNormal = 0xffcc00;
    const colorHover = 0xffe066;

    const startBg = this.add.graphics();

    this.add
      .text(startX_pos, startY_pos, "INICIAR JOGO", {
        fontSize: "32px",
        color: "#000",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(1);

    const hitArea = new Phaser.Geom.Rectangle(
      startX_pos - 150,
      startY_pos - 35,
      300,
      70
    );
    startBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    startBg.input!.cursor = "pointer";

    const drawStartBtn = (color: number) => {
      startBg.clear();
      startBg.fillStyle(color, 1);
      startBg.fillRoundedRect(startX_pos - 150, startY_pos - 35, 300, 70, 10);
    };

    drawStartBtn(colorNormal);

    startBg.on("pointerover", () => drawStartBtn(colorHover));
    startBg.on("pointerout", () => drawStartBtn(colorNormal));

    startBg.on("pointerdown", () => {
      console.log(`Iniciando: ${this.selectedDifficulty}`);
      // TODO: battle scene transition
    });
  }

  private updateDifficulty(difficulty: Difficulty, activeColor: string) {
    this.selectedDifficulty = difficulty;

    this.diffButtons.forEach((btn, label) => {
      const graphics = this.diffBgs.get(label)!;
      const isSelected = label === difficulty;

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
