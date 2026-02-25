import { Card } from "../objects/Card";
import type { CardEffect } from "../types/EffectTypes";

export interface IEffectManager {
  isSelectingTarget: boolean;
  applyCardEffect(card: Card): void;
  handleCardSelection(target: Card): void;
  prepareTargeting(effect: CardEffect, source: Card): void;
}
