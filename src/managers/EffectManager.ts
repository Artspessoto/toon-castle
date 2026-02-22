import type { Card } from "../objects/Card";
import type { BattleScene } from "../scenes/BattleScene";
import type { CardEffect } from "../types/EffectTypes";
import type { GameSide } from "../types/GameTypes";

export class EffectManager {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public applyCardEffect(card: Card) {
    const effect = card.getCardData().effects;
    if (!effect) return;

    const targets = this.getEffectTargets(
      card.owner,
      effect.targetSide || "OPPONENT",
    );

    targets.forEach((side) => {
      this.executeCardEffect(effect, side, card);
    });
  }

  private executeCardEffect(
    effect: CardEffect,
    side: GameSide,
    sourceCard: Card,
  ) {
    const { type, value } = effect;
    const cardData = sourceCard.getCardData();

    switch (type) {
      case "BURN":
        this.scene.getUIManager(side).updateLP(side, -(value || 0));
        break;
      case "DRAW_CARDS":
        for (let i = 0; i < (value || 0); i++) {
          this.scene
            .getHandManager(side)
            .drawCard(this.scene.getDeckManager(side).position);
        }
        break;
      case "DESTROY_MONSTER":
        //target card to destroy
        break;
      case "DESTROY_SPELL":
        //target card to destroy
        break;
      case "DESTROY_TRAP":
        //target card to destroy
        break;
      case "NERF_ATK":
        //target card to update stats
        break;
      case "BOOST_ATK": {
        //target card to update stats
        const bonus = (cardData.atk || 0) + (effect.value || 0);
        console.log(bonus);
        break;
      }
      default:
        break;
    }
  }

  private getEffectTargets(owner: GameSide, targetSide: string): GameSide[] {
    const opponent = owner == "PLAYER" ? "OPPONENT" : "PLAYER";
    if (targetSide == "OWNER") return [owner];
    if (targetSide == "OPPONENT") return [opponent];

    return ["PLAYER", "OPPONENT"];
  }
}
