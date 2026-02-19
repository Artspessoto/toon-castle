import type { ToonButton } from "../objects/ToonButton";
import { BattleScene } from "../scenes/BattleScene";
import type { BattleTranslations, GamePhase } from "../types/GameTypes";

export class PhaseManager {
  private scene: BattleScene;
  private phaseTimer?: Phaser.Time.TimerEvent;
  private turn!: string;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public updateUI(phase: GamePhase, translations: BattleTranslations) {
    if (this.phaseTimer) {
      this.phaseTimer.remove();
      this.phaseTimer = undefined;
    }

    const { phaseButton, currentUI } = this.scene;
    const isPlayerTurn = this.scene.gameState.activePlayer == "PLAYER";
    const currentTurn = this.scene.gameState.currentTurn;

    this.turn = `${this.scene.translationText.turn_label} ${currentTurn}`;

    phaseButton.setVisible(true);

    switch (phase) {
      case "DRAW":
        if (isPlayerTurn) {
          currentUI.showNotice(translations.draw_phase, "PHASE");
          phaseButton.updatePhase(this.turn, "DRAW");
          phaseButton.disableInteractive();
        } else {
          currentUI.showNotice(translations.opponent_draw, "PHASE");
          this.setOpponentState(phaseButton);
        }
        break;
      case "MAIN":
        currentUI.showNotice(translations.main_phase, "PHASE");

        if (isPlayerTurn) {
          const buttonText =
            currentTurn == 1
              ? translations.battle_buttons.end_turn
              : translations.battle_buttons.to_battle;

          phaseButton.setInteractive();
          phaseButton.updatePhase(this.turn, buttonText);
          // this.handleButtonTransition(buttonText);
        } else {
          this.setOpponentState(phaseButton);
        }
        break;
      case "BATTLE":
        currentUI.showNotice(translations.battle_phase, "PHASE");

        if (isPlayerTurn) {
          phaseButton
            .setInteractive()
            .updatePhase(this.turn, translations.battle_buttons.end_turn);
        } else {
          this.setOpponentState(phaseButton);
        }
        break;
      case "CHANGE_TURN":
        this.scene.tweens.killTweensOf(phaseButton);
        phaseButton.setAlpha(1).disableInteractive();

        currentUI.showNotice(translations.turn_ended, "NEUTRAL");

        this.scene.fieldManager.resetAttackFlags();

        this.scene.time.delayedCall(1500, () => {
          this.scene.finalizeTurnTransition();
        });

        return;
    }
  }

  private setOpponentState(button: ToonButton) {
    button
      .disableInteractive()
      .setAlpha(0.7)
      .updatePhase(this.turn, this.scene.translationText.opponent, 0x333333);
  }
}
