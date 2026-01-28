import { BattleScene } from "../scenes/BattleScene";
import type { BattleTranslations, GamePhase } from "../types/GameTypes";

export class PhaseManager {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public updateUI(phase: GamePhase, translations: BattleTranslations) {
    const { phaseButton, currentUI } = this.scene;
    const isPlayerTurn = this.scene.gameState.activePlayer == "PLAYER";

    switch (phase) {
      case "DRAW":
        phaseButton.setVisible(false);

        if (isPlayerTurn) {
          currentUI.showNotice(translations.draw_phase, "PHASE");
        } else {
          currentUI.showNotice(translations.opponent_draw, "PHASE");
        }
        break;
      case "MAIN":
        currentUI.showNotice(translations.main_phase, "PHASE");

        if (isPlayerTurn) {
          this.handleButtonTransition(translations.battle_buttons.to_battle);
        } else {
          phaseButton.setVisible(false);
        }
        break;
      case "BATTLE":
        currentUI.showNotice(translations.battle_phase, "PHASE");
        phaseButton
          .setVisible(isPlayerTurn)
          .setText(translations.battle_buttons.end_turn);
        break;
      case "CHANGE_TURN":
        this.scene.tweens.killTweensOf(phaseButton);
        phaseButton.setVisible(false).setAlpha(1);
        phaseButton.setText(translations.battle_buttons.to_battle);

        currentUI.showNotice(translations.turn_change, "PHASE");

        this.scene.time.delayedCall(1200, () => {
          if (!isPlayerTurn) {
            currentUI.showNotice(translations.your_turn, "PHASE");
          } else {
            currentUI.showNotice(translations.opponent_turn, "PHASE");
          }

          this.scene.time.delayedCall(1000, () => {
            this.scene.finalizeTurnTransition();
          });
        });

        return;
    }
  }

  private handleButtonTransition(text: string) {
    this.scene.phaseButton.setVisible(false);
    this.scene.time.delayedCall(500, () => {
      this.scene.phaseButton.setVisible(true).setText(text);
      this.scene.phaseButton.setAlpha(0);
      this.scene.tweens.add({
        targets: this.scene.phaseButton,
        alpha: 1,
        duration: 300,
      });
    });
  }
}
