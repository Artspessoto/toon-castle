export type CardType = "MONSTER" | "EFFECT_MONSTER" | "SPELL" | "TRAP";

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
