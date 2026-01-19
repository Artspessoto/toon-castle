export const CARD_CONFIG = {
  WIDTH: 180,
  HEIGHT: 250,
  POSITIONS: {
    MANA: { x: 122, y: -174 },

    NAME: { x: 0, y: 70 },

    DESC: { x: 0, y: 108 },
    ATK: { x: -122, y: 160 },
    DEF: { x: 122, y: 160 },
  },
  STYLES: {
    NAME: {
      fontSize: "12px",
      fontStyle: "bold",
      color: "#4a3d28",
      fontFamily: "Arial",
    },
    DESC: {
      fontSize: "12px",
      color: "#4a3d28",
      wordWrap: { width: 200 },
      align: "left",
      fontFamily: "Arial",
    },
    STATS: {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
      fontFamily: "Arial",
    },
  },
};
