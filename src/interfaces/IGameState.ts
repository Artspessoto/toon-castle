import type { GameSide, GamePhase } from "../types/GameTypes";

export interface IGameState {
  readonly activePlayer: GameSide;
  readonly currentPhase: GamePhase;
  readonly currentTurn: number;
  readonly isDragging: boolean;

  getHP(side: GameSide): number;
  getMana(side: GameSide): number;

  // modify
  modifyHP(side: GameSide, amount: number): void;
  modifyMana(side: GameSide, amount: number): void;
  setPhase(phase: GamePhase): void;
  nextTurn(): void;
  advanceTurnCount(): void;
  setDragging(value: boolean): void;
}
