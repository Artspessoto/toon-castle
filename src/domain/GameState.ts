import type { GamePhase } from "../types/GameTypes";

export class GameState {
  private _currentPhase: GamePhase = "DRAW";
  private _isDragging: boolean = false;
  public playerHP: number = 6000;
  public enemyHP: number = 6000;

  constructor() {}

  get currentPhase(): GamePhase {
    return this._currentPhase;
  }

  public setPhase(phase: GamePhase) {
    this._currentPhase = phase;
    console.log(`[Domain] Fase alterada para: ${phase}`);
  }

  get isDragging(): boolean {
    return this._isDragging;
  }

  public setDragging(value: boolean) {
    this._isDragging = value;
  }
}
