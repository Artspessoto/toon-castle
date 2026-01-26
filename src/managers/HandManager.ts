import { BattleScene } from "../scenes/BattleScene";
import { Card } from "../objects/Card";
import { CARD_DATABASE } from "../constants/CardDatabase";

export class HandManager {
  private scene: BattleScene;
  private hand: Card[] = [];
  private currentHandY: number = 710; //hand position

  private readonly maxHandSize: number = 7;
  private readonly hiddenY: number = 850; //hidden hand cards
  private readonly normalY: number = 710;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public get cards(): Card[] {
    return this.hand;
  }

  public hideHand() {
    this.currentHandY = this.hiddenY;
    this.reorganizeHand();
  }

  public showHand() {
    this.currentHandY = this.normalY;
    this.scene.time.delayedCall(500, () => {
      this.reorganizeHand();
    });
  }

  public drawCard(deckPosition: { x: number; y: number }) {
    if (this.hand.length >= this.maxHandSize) return;

    const cardData = this.getRandomCardData();

    const newCard = new Card(
      this.scene,
      deckPosition.x,
      deckPosition.y,
      cardData,
    );

    this.scene.inputManager.setupCardInteractions(newCard);

    this.hand.push(newCard);
    this.animateCardEntry(newCard);
    this.reorganizeHand();
  }

  private getRandomCardData() {
    const keys = Object.keys(CARD_DATABASE);
    const randomKey = keys[Phaser.Math.Between(0, keys.length - 1)];
    return CARD_DATABASE[randomKey];
  }

  public animateCardEntry(card: Card) {
    card.setAngle(-22);
    card.setAlpha(0);
    this.scene.tweens.add({ targets: card, alpha: 1, duration: 100 });
  }

  public reorganizeHand() {
    // position config
    const cardWidth = 180 * 0.58; // card large (base x scale)
    const spacing = cardWidth + 10; // cards gap between
    const centerX = 640;

    const totalHandWidth = (this.hand.length - 1) * spacing;
    const startX = centerX - totalHandWidth / 2;

    this.hand.forEach((card, index) => {
      const targetX = startX + index * spacing;
      card.setDepth(100 + index);

      this.scene.tweens.add({
        targets: card,
        x: targetX,
        y: this.currentHandY,
        angle: 0,
        scale: 0.45,
        duration: 500, // 0.5s
        // ease: "Power2",
        ease: "Back.easeOut",
      });
    });
  }

  public removeCard(card: Card) {
    this.hand = this.hand.filter((handCard) => handCard !== card);
    this.reorganizeHand();
  }

  public addCardBack(card: Card){
    this.hand.push(card);
    this.showHand();
    this.reorganizeHand();
  }
}
