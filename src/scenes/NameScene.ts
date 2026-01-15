import Phaser from "phaser";
import { ToonButton } from "../objects/ToonButton";

export class NameScene extends Phaser.Scene {
  private difficulty: string = "";

  constructor() {
    super("NameScene");
  }

  preload() {
    this.load.html("nameform", "assets/templates/name-input.html");
  }

  init(data: { difficulty: string }) {
    this.difficulty = data.difficulty;
  }

  create() {
    this.add
      .image(640, 360, "background")
      .setDisplaySize(1280, 900)
      .setAlpha(0.6);
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

    this.add
      .text(640, 200, "Digite seu nome", {
        fontSize: "40px",
        color: "#ffcc00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const inputElement = this.add.dom(640, 350).createFromCache("nameform");

    const confirmBtn = new ToonButton(this, {
      x: 640,
      y: 480,
      text: "Confirmar",
    });

    const backToMenuBtn = new ToonButton(this, {
        x: 640,
        y: 560,
        text: "Voltar ao Menu",
        fontSize: "1.5rem",
        textColor: "#fff",
        color: 0x1a1a1a,
        hoverColor: 0x333333
    })

    backToMenuBtn.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    confirmBtn.on("pointerdown", () => {
      const nameInput = inputElement.getChildByName(
        "nameField"
      ) as HTMLInputElement;
      const playerName = nameInput.value.trim();

      if (playerName.length > 0) {
        console.log(
          `Nome do jogador: ${playerName}, Dificuldade: ${this.difficulty}`
        );

        //Battle scene transition
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("MenuScene", {
            playerName: playerName,
            difficulty: this.difficulty,
          });
        });
      } else {
        this.tweens.add({
          targets: inputElement,
          x: inputElement.x + 10,
          duration: 50,
          yoyo: true,
          repeat: 3,
        });
      }
    });
  }
}
