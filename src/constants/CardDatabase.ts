import type { CardData } from "../types/CardData";

export const CARD_DATABASE: Record<string, CardData> = {
  "SENTINEL_01": {
    id: "SENTINEL_01",
    type: "MONSTER",
    nameKey: "Sentinela de Ferro",
    descriptionKey: "Um guardião ancestral que nunca dorme.",
    manaCost: 3,
    atk: 15,
    def: 20,
    imageKey: "monster_sentinel",
  },
  "FIRE_BALL": {
    id: "FIRE_BALL",
    type: "SPELL",
    nameKey: "Bola de Fogo",
    descriptionKey: "Causa 10 de dano a todos os inimigos.",
    manaCost: 2,
    imageKey: "spell_fireball",
  },
  "DARK_TRAP": {
    id: "DARK_TRAP",
    type: "TRAP",
    nameKey: "Armadilha Sombria",
    descriptionKey: "Imobiliza o próximo monstro atacante.",
    manaCost: 1,
    imageKey: "trap_darkness",
  }
};