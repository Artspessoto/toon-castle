import type { Card } from "../objects/Card";
import type { BattleScene } from "../scenes/BattleScene";

export class CombatManager {
  private scene: BattleScene;
  public isSelectingTarget: boolean = false;
  public currentAttacker: Card | null = null;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public prepareTargeting(attacker: Card) {
    this.currentAttacker = attacker;
    this.isSelectingTarget = true;

    this.scene.playerUI.showNotice("Selecione o alvo do ataque", "NEUTRAL");
    attacker.setAlpha(0.7);
  }

  public handleCardSelection(target: Card) {
    if (!this.isSelectingTarget || !this.currentAttacker) return;

    if (target.owner !== this.currentAttacker.owner) {
      this.executeAttack(this.currentAttacker, target);
    }

    this.cancelTarget();
  }

  public cancelTarget() {
    if (this.currentAttacker) this.currentAttacker.setAlpha(1);
    this.isSelectingTarget = false;
    this.currentAttacker = null;
  }

  private executeAttack(attacker: Card, target: Card) {
    const atkData = attacker.getCardData();
    const targetData = target.getCardData();

    console.log(atkData.nameKey, targetData.nameKey);

    attacker.hasAttacked = true;
  }
}
