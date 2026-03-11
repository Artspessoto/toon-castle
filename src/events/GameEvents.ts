import type { Card } from "../objects/Card";
import type { GamePhase, GameSide, PlacementMode } from "../types/GameTypes";

export enum GameEvent {
  PHASE_CHANGED = "PHASE_CHANGED",
  CARD_PLAYED = "CARD_PLAYED",
  CARD_SENT_TO_GRAVEYARD = "CARD_SENT_TO_GRAVEYARD",
  CARD_LEFT_FIELD = "CARD_LEFT_FIELD",
  FIELD_STATS_RESET = "FIELD_STATS_RESET",
  CARD_REMOVED_FROM_GRAVEYARD = "CARD_REMOVED_FROM_GRAVEYARD",
}

export type PhaseChangedPayload = {
  newPhase: GamePhase;
  activePlayer: GameSide;
};
export type CardPlayedPayload = {
  card: Card;
  side: GameSide;
  mode: PlacementMode;
};
export type CardSentToGYPayload = { card: Card; side: GameSide };
export type CardLeftFieldPayload = { card: Card; side: GameSide };
export type CardRemovedFromGYPayload = { card: Card; side: GameSide };
export type FieldStatsResetPayload = { sides: GameSide[] };

export interface GameEventMap {
  [GameEvent.PHASE_CHANGED]: PhaseChangedPayload;
  [GameEvent.CARD_PLAYED]: CardPlayedPayload;
  [GameEvent.CARD_SENT_TO_GRAVEYARD]: CardSentToGYPayload;
  [GameEvent.CARD_LEFT_FIELD]: CardLeftFieldPayload;
  [GameEvent.FIELD_STATS_RESET]: FieldStatsResetPayload;
  [GameEvent.CARD_REMOVED_FROM_GRAVEYARD]: CardRemovedFromGYPayload;
}
