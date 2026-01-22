import { BattleScene } from "../scenes/BattleScene";
import type { BattleTranslations, GamePhase } from "../types/GameTypes";

export class PhaseManager {
  private scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  public updateUI(phase: GamePhase, translations: BattleTranslations) {
    const { phaseText, phaseTextBg, phaseButton } = this.scene;

    this.scene.tweens.killTweensOf([phaseText, phaseTextBg]);
    phaseText.setVisible(true).setAlpha(1);
    phaseTextBg.setVisible(true).setAlpha(0.8);

    switch (phase) {
      case "DRAW":
        phaseButton.setVisible(false);
        phaseText.setText(translations.draw_phase);
        break;
      case "MAIN":
        phaseText.setText(translations.main_phase);
        this.handleButtonTransition(translations.battle_buttons.to_battle);
        break;
      case "BATTLE":
        phaseText.setText(translations.battle_phase);
        phaseButton.setVisible(true);
        phaseButton.setText(translations.battle_buttons.end_turn);
        break;
      case "ENEMY_TURN":
        phaseButton.setVisible(false);
        phaseText.setText(translations.turn_change);

        this.scene.time.delayedCall(1200, () => {
          if (this.scene.currentPhase !== "ENEMY_TURN") return;

          phaseText.setText(translations.opponent_turn);
          this.scene.tweens.add({
            targets: phaseText,
            scale: 1.1,
            duration: 100,
            yoyo: true,
          });

          this.scene.time.delayedCall(1500, () => this.hidePhaseText());
        });

        return;
    }
    this.scene.time.delayedCall(1500, () => this.hidePhaseText());
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

  private hidePhaseText() {
    this.scene.tweens.add({
      targets: [this.scene.phaseText, this.scene.phaseTextBg],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.phaseText.setVisible(false);
        this.scene.phaseTextBg.setVisible(false);
      },
    });
  }
}
