import Phaser from "phaser";

export type Difficulty = "Fácil" | "Médio" | "Difícil";

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty: Difficulty = "Médio";
  private diffButtons: Map<Difficulty, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("background", "../../public/assets/menu_background.jpg");
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
      .text(640, 250, "Selecione a Dificuldade:", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const diffs: { label: Difficulty; color: string }[] = [
      { label: "Fácil", color: "#00ff00" },
      { label: "Médio", color: "#ffff00" },
      { label: "Difícil", color: "#ff0000" },
    ];

    const spacing = 170;
    const totalWidth = (diffs.length - 1) * spacing;
    const startX = 640 - totalWidth / 2;

    diffs.forEach((diff, index) => {
      const xPos = startX + index * spacing;
      const btn = this.add
        .text(xPos, 340, diff.label, {
          fontSize: "28px",
          color: diff.label === this.selectedDifficulty ? diff.color : "#666",
          backgroundColor: "#222",
          padding: { x: 20, y: 20 },
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () =>
        this.updateDifficulty(diff.label, diff.color)
      );

      this.diffButtons.set(diff.label, btn);
    });

    const startBtn = this.add
      .text(640, 580, "INICIAR JOGO", {
        fontSize: "36px",
        backgroundColor: "#222",
        padding: { x: 40, y: 20 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on("pointerdown", () => {
      console.log(`Iniciando no modo: ${this.selectedDifficulty}`);
      //TO DO: Battle scene transition
    });

    startBtn.on("pointerover", () =>
      startBtn.setStyle({ backgroundColor: "#444" })
    );
    startBtn.on("pointerout", () =>
      startBtn.setStyle({ backgroundColor: "#222" })
    );
  }

  private updateDifficulty(difficulty: Difficulty, activeColor: string) {
    this.selectedDifficulty = difficulty;

    this.diffButtons.forEach((btn, label) => {
      if (label === difficulty) {
        btn.setStyle({ color: activeColor }).setScale(1.0);
      } else {
        btn.setStyle({ color: "#666" }).setScale(1.0);
      }
    });
  }
}
