import { BattleScene } from "../scenes/BattleScene";
import type { BattleTranslations, GamePhase } from "../types/GameTypes";

export class PhaseManager {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public updateUI(phase: GamePhase, translations: BattleTranslations) {
    const { phaseButton, uiManager } = this.scene;
    const isPlayerTurn = this.scene.gameState.activePlayer == "PLAYER";

    switch (phase) {
      case "DRAW":
        phaseButton.setVisible(false);

        if (isPlayerTurn) {
          uiManager.showNotice(translations.draw_phase, "PHASE");
        } else {
          uiManager.showNotice(translations.opponent_draw, "PHASE");
        }
        break;
      case "MAIN":
        uiManager.showNotice(translations.main_phase, "PHASE");

        if (isPlayerTurn) {
          this.handleButtonTransition(translations.battle_buttons.to_battle);
        } else {
          phaseButton.setVisible(false);
        }
        break;
      case "BATTLE":
        uiManager.showNotice(translations.battle_phase, "PHASE");
        phaseButton
          .setVisible(isPlayerTurn)
          .setText(translations.battle_buttons.end_turn);
        break;
      case "ENEMY_TURN":
        this.scene.tweens.killTweensOf(phaseButton);
        phaseButton.setVisible(false).setAlpha(1);
        phaseButton.setText(translations.battle_buttons.to_battle);

        uiManager.showNotice(translations.turn_change, "PHASE");

        this.scene.time.delayedCall(1200, () => {
          uiManager.showNotice(translations.opponent_turn, "PHASE");
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
