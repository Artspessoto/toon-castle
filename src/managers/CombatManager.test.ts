import { beforeEach, describe, expect, it, vi } from "vitest";
import { CombatManager } from "./CombatManager";
import type { BattleScene } from "../scenes/BattleScene";
import type { Card } from "../objects/Card";

describe("CombatManager", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockScene: any;
  let combatManager: CombatManager;

  const createMockCard = (side: "PLAYER" | "OPPONENT", atk = 10, def = 10) =>
    ({
      owner: side,
      getCardData: () => ({ atk, def }),
      getType: () => "MONSTER",
      setAlpha: vi.fn(),
      setScale: vi.fn(),
      setFaceUp: vi.fn(),
      disableInteractive: vi.fn(),
      removeAllListeners: vi.fn(),
      visualElements: { iterate: vi.fn() },
      isFaceDown: false,
      hasAttacked: false,
      angle: 0,
      x: 0,
      y: 0,
    }) as unknown as Card;

  beforeEach(() => {
    mockScene = {
      translationText: {
        combat_notices: {
          select_target: "SELECT THE ATTACK TARGET",
          invalid_own_card: "YOU CANNOT ATTACK YOUR OWN CARDS!",
        },
      },
      currentPhase: "BATTLE",
      playerUI: {
        showNotice: vi.fn(),
        updateLP: vi.fn(),
      },
      opponentUI: {
        updateLP: vi.fn(),
      },
      fieldManager: {
        releaseSlot: vi.fn(),
        moveToGraveyard: vi.fn(),
        monsterSlots: {
          PLAYER: [],
          OPPONENT: [],
        },
        spellSlots: {
          PLAYER: [],
          OPPONENT: [],
        },
      },
      tweens: {
        add: vi.fn((config) => {
          if (config.onStart) config.onStart();
          if (config.onYoyo) config.onYoyo();
          if (config.onComplete) config.onComplete();
        }),
        killTweensOf: vi.fn(),
      },
      cameras: {
        main: { shake: vi.fn() },
      },
      time: { delayedCall: vi.fn((_time, callback) => callback()) },
    };
    combatManager = new CombatManager(mockScene as unknown as BattleScene);
  });

  describe("Targeting Management", () => {
    it("should enter selection mode when preparing target", () => {
      const attacker = createMockCard("PLAYER");
      combatManager.prepareTargeting(attacker);

      expect(combatManager.isSelectingTarget).toBe(true);
      expect(attacker.setAlpha).toHaveBeenCalledWith(0.7);
      expect(mockScene.playerUI.showNotice).toHaveBeenCalledWith(
        "SELECT THE ATTACK TARGET",
        "NEUTRAL",
      );
    });

    it("should cancel targeting correctly", () => {
      const attacker = createMockCard("PLAYER");
      combatManager.prepareTargeting(attacker);
      combatManager.cancelTarget();

      expect(combatManager.isSelectingTarget).toBe(false);
      expect(combatManager.currentAttacker).toBeNull();
      expect(attacker.setAlpha).toHaveBeenCalledWith(1);
    });
  });

  describe("Battle Validations", () => {
    it("should not allow attacking own cards", () => {
      const attacker = createMockCard("PLAYER");
      const target = createMockCard("PLAYER");

      combatManager.prepareTargeting(attacker);
      combatManager.handleCardSelection(target);

      expect(mockScene.playerUI.showNotice).toHaveBeenCalledWith(
        mockScene.translationText.combat_notices.invalid_own_card,
        "WARNING",
      );
      expect(mockScene.tweens.add).not.toHaveBeenCalled();
    });

    it("should cancel targeting if phase is not BATTLE", () => {
      const attacker = createMockCard("PLAYER");
      const target = createMockCard("OPPONENT");
      mockScene.currentPhase = "MAIN";

      combatManager.prepareTargeting(attacker);
      combatManager.handleCardSelection(target);

      expect(combatManager.isSelectingTarget).toBe(false);
      expect(mockScene.tweens.add).not.toHaveBeenCalled();
    });
  });

  describe("Combat Resolution", () => {
    it("should reduce opponent LP and destroy card when attacker is stronger (Atk vs Atk)", () => {
      const attacker = createMockCard("PLAYER", 500);
      const target = createMockCard("OPPONENT", 200);

      mockScene.fieldManager.monsterSlots.OPPONENT = [target];

      combatManager.prepareTargeting(attacker);
      combatManager.handleCardSelection(target);

      // 500 - 200 = 300 dmg
      expect(mockScene.opponentUI.updateLP).toHaveBeenCalledWith(
        "OPPONENT",
        -300,
      );
      expect(mockScene.fieldManager.releaseSlot).toHaveBeenCalledWith(
        target,
        "OPPONENT",
      );
    });

    it("should destroy both cards on tie", () => {
      const attacker = createMockCard("PLAYER", 300);
      const target = createMockCard("OPPONENT", 300);

      mockScene.fieldManager.monsterSlots.PLAYER = [attacker];
      mockScene.fieldManager.monsterSlots.OPPONENT = [target];

      combatManager.prepareTargeting(attacker);
      combatManager.handleCardSelection(target);

      expect(mockScene.fieldManager.releaseSlot).toHaveBeenCalledWith(
        attacker,
        "PLAYER",
      );
      expect(mockScene.fieldManager.releaseSlot).toHaveBeenCalledWith(
        target,
        "OPPONENT",
      );
    });
  });

  describe("Bug Prevention (Double Trigger)", () => {
    it("should not call releaseSlot twice if destroyCard is triggered multiple times for the same card", () => {
      const attacker = createMockCard("PLAYER", 300);
      const target = createMockCard("OPPONENT", 100);

      mockScene.fieldManager.monsterSlots.OPPONENT = [target];

      combatManager.prepareTargeting(attacker);
      combatManager.handleCardSelection(target);

      mockScene.fieldManager.monsterSlots.OPPONENT = [];

      combatManager.handleCardSelection(target);

      expect(mockScene.fieldManager.releaseSlot).toHaveBeenCalledTimes(1);
    });
  });
});
