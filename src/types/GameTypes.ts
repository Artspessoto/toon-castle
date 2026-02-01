import { TRANSLATIONS } from "../constants/Translations";

export type GamePhase = "DRAW" | "MAIN" | "BATTLE" | "CHANGE_TURN";
export type CardType = "MONSTER" | "EFFECT_MONSTER" | "SPELL" | "TRAP";
export type PlacementMode = "ATK" | "DEF" | "FACE_UP" | "SET";

type Languages = keyof typeof TRANSLATIONS;
export type TranslationStructure = (typeof TRANSLATIONS)[Languages];
export type GameSide = "PLAYER" | "OPPONENT";
export type Lang = "pt-br" | "en";
export type Notice = "PHASE" | "WARNING"
export type BattleTranslations = TranslationStructure["battle_scene"];
export type CardLocation = "HAND" | "FIELD" | "GRAVEYARD" | "DECK";

export interface CardData {
  id: string;
  type: CardType;
  nameKey: string;
  atk?: number;
  def?: number;
  manaCost: number;
  imageKey: string;
  descriptionKey: string;
  width?: number;
  height?: number;
}