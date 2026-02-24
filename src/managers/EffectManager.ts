import type { Card } from "../objects/Card";
import type { BattleScene } from "../scenes/BattleScene";
import type { CardEffect, EffectTypes } from "../types/EffectTypes";
import type { GameSide } from "../types/GameTypes";

export class EffectManager {
  private scene: BattleScene;
  public isSelectingTarget: boolean = false;
  private pendingEffect: CardEffect | null = null;
  private pendingSource: Card | null = null;
  private handlerEffects: Record<
    EffectTypes,
    (effect: CardEffect, side: GameSide, source: Card) => void
  >;

  constructor(scene: BattleScene) {
    this.scene = scene;

    this.handlerEffects = {
      BURN: (effect, side) =>
        this.scene.getUIManager(side).updateLP(side, -(effect.value || 0)),
      HEAL: (effect, side) =>
        this.scene.getUIManager(side).updateLP(side, effect.value || 0),
      DRAW_CARD: (effect, side) => this.handleDraw(effect, side),
      GAIN_MANA: (effect, side) =>
        this.scene.getUIManager(side).updateMana(effect.value || 0),
      BOOST_ATK: (effect, _side, source) =>
        this.prepareTargeting(effect, source),
      CHANGE_POS: (effect, _side, source) =>
        this.prepareTargeting(effect, source),
      DESTROY_MONSTER: (effect, _side, source) =>
        this.prepareTargeting(effect, source),
      DESTROY_SPELL: (effect, _side, source) =>
        this.prepareTargeting(effect, source),
      DESTROY_TRAP: (effect, _side, source) =>
        this.prepareTargeting(effect, source),
      BOUNCE: (effect, _side, source) => this.prepareTargeting(effect, source),
      NEGATE: (effect, _side, source) => this.prepareTargeting(effect, source),
      NERF_ATK: (effect, _side, source) =>
        this.prepareTargeting(effect, source),
      REVIVE: (effect, _side, source) => this.prepareTargeting(effect, source),
      PROTECT: () => console.log(""),
    };
  }

  private get notices() {
    return this.scene.translationText.effect_notices;
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
    const handler = this.handlerEffects[effect.type];

    if (handler) {
      handler(effect, side, sourceCard);
    } else {
      console.log(`${effect.type} não criado até o momento`);
    }
  }

  private handleDraw(effect: CardEffect, side: GameSide) {
    const count = effect.value || 0;
    const hand = this.scene.getHandManager(side);
    const deck = this.scene.getDeckManager(side);
    for (let i = 0; i < count; i++) {
      hand.drawCard(deck.position);
    }
  }

  private getEffectTargets(owner: GameSide, targetSide: string): GameSide[] {
    const opponent = owner == "PLAYER" ? "OPPONENT" : "PLAYER";
    if (targetSide == "OWNER") return [owner];
    if (targetSide == "OPPONENT") return [opponent];

    return ["PLAYER", "OPPONENT"];
  }

  private targetResolution: Partial<
    Record<
      EffectTypes,
      (target: Card, source: Card, effect: CardEffect) => void
    >
  > = (() => {
    const destroyResolver = (target: Card) =>
      this.scene.combatManager.destroyCard(target, target.owner);

    return {
      BOOST_ATK: (_target, _source, effect) => {
        const bonus = effect.value;
        console.log(bonus);
      },
      DESTROY_MONSTER: destroyResolver,
      DESTROY_SPELL: destroyResolver,
      DESTROY_TRAP: destroyResolver,
      CHANGE_POS: (target, source) => {
        if (target.isFaceDown) {
          this.scene.getUIManager(source.owner).handleFlipSummon(target);
        } else {
          this.scene.getUIManager(source.owner).handleChangePosition(target);
        }
      },
    };
  })();

  private targetValidations: Partial<
    Record<EffectTypes, (target: Card) => boolean>
  > = {
    BOOST_ATK: (target) => target.getType().includes("MONSTER"),
    NERF_ATK: (target) => target.getType().includes("MONSTER"),
    CHANGE_POS: (target) => target.getType().includes("MONSTER"),
    REVIVE: (target) => target.getType().includes("MONSTER"),
    DESTROY_MONSTER: (target) => target.getType().includes("MONSTER"),
    DESTROY_SPELL: (target) => target.getType() == "SPELL",
    DESTROY_TRAP: (target) => target.getType() == "TRAP",
    BOUNCE: () => true,
  };

  public handleCardSelection(target: Card) {
    if (!this.pendingEffect || !this.pendingSource) return;

    //prevents select source card to apply effect
    if (target == this.pendingSource) return;

    const validator = this.targetValidations[this.pendingEffect.type];

    //check if validator exists for pendingEffect type and apply validation
    if (validator && !validator(target)) {
      this.scene.playerUI.showNotice(this.notices.invalid_target, "WARNING");
      return;
    }

    const resolve = this.targetResolution[this.pendingEffect.type];
    if (resolve) {
      resolve(target, this.pendingSource, this.pendingEffect);
    }

    this.stopTargeting();
  }

  public prepareTargeting(effect: CardEffect, source: Card) {
    this.isSelectingTarget = true;
    this.pendingEffect = effect;
    this.pendingSource = source;
    this.scene.playerUI.showNotice(this.notices.select_target, "NEUTRAL");
  }

  private stopTargeting() {
    this.isSelectingTarget = false;
    this.pendingEffect = null;
    this.pendingSource = null;
  }
}
