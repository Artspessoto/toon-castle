import { CARD_DATABASE } from "../constants/CardDatabase";
import { TRANSLATIONS } from "../constants/Translations";
import { Card } from "../objects/Card";
import { LanguageManager } from "../utils/LanguageManager";

export class BattleScene extends Phaser.Scene {
  private hand: Card[] = [];
  private drawText!: Phaser.GameObjects.Text;
  private drawTextBg!: Phaser.GameObjects.Rectangle;
  private canDrawCard: boolean = true;
  private deckX: number = 1122;
  private deckY: number = 542;

  constructor() {
    super("BattleScene");
  }

  preload() {
    this.load.image(
      "battle-scene-background",
      "assets/frameCards/battle_scene.png",
    );
    this.load.image("card_back", "assets/frameCards/card_back.png");
    this.load.image(
      "card_template_monster",
      "assets/frameCards/monster_card.png",
    );
    this.load.image(
      "card_template_effect",
      "assets/frameCards/effect_monster_card.png",
    );
    this.load.image("card_template_spell", "assets/frameCards/spell_card.png");
    this.load.image("card_template_trap", "assets/frameCards/trap_card.png");
  }

  create() {
    const lang = LanguageManager.getInstance().currentLanguage;
    const strings = TRANSLATIONS[lang].battle_scene;
    const bg = this.add.image(640, 360, "battle-scene-background");
    bg.setDisplaySize(1280, 720);
    bg.setDepth(-100);

    this.createDeckVisual();

    this.input.on("pointerdown", (pointer: { x: number; y: number }) => {
      console.log(`X: ${Math.round(pointer.x)}, Y: ${Math.round(pointer.y)}`);
    });

    this.drawTextBg = this.add.rectangle(640, 40, 500, 40, 0x000000, 0.6);
    this.drawText = this.add
      .text(640, 40, strings.draw_phase, {
        fontSize: "18px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.input.keyboard?.on("keydown-SPACE", () => {
      if (this.canDrawCard) {
        this.drawCard();
        this.endDrawPhase();
      }
    });

    let delay = 0;
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(delay, () => {
        this.drawCard();
      });
      delay += 200;
    }
  }

  private endDrawPhase() {
    this.canDrawCard = false;
    this.drawText.setVisible(false);
    this.drawTextBg.setVisible(false);
  }

  private createDeckVisual() {
    for (let i = 3; i >= 0; i--) {
      // const heightOffset = i * 3;
      const xOffset = i * 4;
      const yOffset = 0;
      const deckCard = this.add.plane(
        this.deckX - xOffset,
        this.deckY - yOffset,
        "card_back",
      );

      deckCard.setViewHeight(600);

      // deckCard.setScale(0.35);
      deckCard.scaleX = 0.36;
      deckCard.scaleY = 0.55;

      deckCard.modelRotation.x = -1.02; // deep card
      deckCard.modelRotation.y = 0.29;
      deckCard.modelRotation.z = Phaser.Math.DegToRad(0.12);

      deckCard.setDepth(10 - i);

      if (i > 0) {
        deckCard.setTint(0x999999);
      }
    }
  }

  private drawCard() {
    if (this.hand.length >= 7) return;

    const keys = Object.keys(CARD_DATABASE);
    const randomKey = keys[Phaser.Math.Between(0, keys.length - 1)];
    const cardData = CARD_DATABASE[randomKey];

    const newCard = new Card(this, this.deckX, this.deckY, cardData);
    // newCard.setScale(0.58);
    newCard.setAngle(-22);
    // newCard.setScale(0.58, 0.4);
    newCard.setInteractive();

    newCard.on("pointerover", () => {
      this.tweens.add({
        targets: newCard,
        y: 550,
        scale: 0.7,
        duration: 300,
        ease: "Power2",
      });
      newCard.setDepth(200);
    });

    newCard.on("pointerout", () => {
      this.reorganizeHand();
    });

    newCard.setAlpha(0);
    this.tweens.add({ targets: newCard, alpha: 1, duration: 100 });
    this.hand.push(newCard);
    this.reorganizeHand();
  }

  private reorganizeHand() {
    // position config
    const cardWidth = 180 * 0.58; // card large (base x scale)
    const spacing = cardWidth + 10; // cards gap between
    const startY = 710;
    const centerX = 640;

    const totalHandWidth = (this.hand.length - 1) * spacing;
    const startX = centerX - totalHandWidth / 2;

    this.hand.forEach((card, index) => {
      const targetX = startX + index * spacing;

      card.setDepth(100 + index);

      this.tweens.add({
        targets: card,
        x: targetX,
        y: startY,
        angle: 0,
        scale: 0.45,
        duration: 500, // 0.5s
        // ease: "Power2",
        ease: "Back.easeOut",
      });
    });
  }
}
