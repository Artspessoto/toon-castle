import { Card } from "../objects/Card";

export interface IHandManager {
  readonly hand: Card[];
  
  drawCard(deckPosition: { x: number; y: number }): void;
  removeCard(card: Card): void;
  addCardBack(card: Card): void;
  
  hideHand(): void;
  showHand(): void;
  reorganizeHand(): void;
}