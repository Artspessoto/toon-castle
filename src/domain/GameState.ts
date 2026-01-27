import type { GamePhase, GameSide } from "../types/GameTypes";

export class GameState {
  private _currentPhase: GamePhase = "DRAW";
  private _isDragging: boolean = false;
  private _activePlayer: GameSide = "PLAYER";

  public playerHP: number = 6000;
  public enemyHP: number = 6000;

  constructor() {}

  get activePlayer(): GameSide {
    return this._activePlayer;
  }

  get currentPhase(): GamePhase {
    return this._currentPhase;
  }

  public setPhase(phase: GamePhase) {
    this._currentPhase = phase;
  }

  public nextTurn() {
    this._activePlayer =
      this._activePlayer === "PLAYER" ? "OPPONENT" : "PLAYER";
    this._currentPhase = "DRAW"; //reset to initial phase in next turn
  }

  get isDragging(): boolean {
    return this._isDragging;
  }

  public setDragging(value: boolean) {
    this._isDragging = value;
  }
}
