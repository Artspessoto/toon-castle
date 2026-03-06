import { describe, it, expect, vi, beforeEach } from "vitest";
import { HandManager } from "./HandManager";
import type { IBattleContext } from "../interfaces/IBattleContext";
import type { GameSide } from "../types/GameTypes";
import { createMockBattleContext, createMockCard } from "../utils/mocks";

vi.mock("../objects/Card", () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Card: vi.fn().mockImplementation(function (..._args) {
      // Permite uso de new Card(...)
      return createMockCard();
    }),
  };
});

describe("HandManager", () => {
  let handManager: HandManager;
  let mockContext: IBattleContext;
  let mockSide: GameSide;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSide = "PLAYER";
    mockContext = createMockBattleContext();
    handManager = new HandManager(mockContext, mockSide);
  });

  it("deve adicionar carta à mão ao drawCard", () => {
    handManager.hand = [];
    vi.spyOn(
      handManager as unknown as { getRandomCardData: () => unknown },
      "getRandomCardData",
    ).mockReturnValue({
      id: "1",
      name: "Test",
      manaCost: 1,
    });
    const spy = vi.spyOn(handManager, "animateCardEntry");
    handManager.drawCard({ x: 0, y: 0 });
    expect(handManager.hand.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it("não deve adicionar carta se mão cheia", () => {
    (handManager as unknown as { maxHandSize: number }).maxHandSize = 1;
    handManager.hand = [createMockCard()];
    handManager.drawCard({ x: 0, y: 0 });
    expect(handManager.hand.length).toBe(1);
  });

  it("hideHand deve alterar currentHandY e reorganizar", () => {
    const spy = vi.spyOn(handManager, "reorganizeHand");
    handManager.hideHand();
    expect(
      (handManager as unknown as { currentHandY: number }).currentHandY,
    ).toBe((handManager as unknown as { hiddenY: number }).hiddenY);
    expect(spy).toHaveBeenCalled();
  });

  it("showHand deve alterar currentHandY e reorganizar", () => {
    // Spy no protótipo para pegar chamadas via delayedCall
    const spy = vi.spyOn(HandManager.prototype, "reorganizeHand");
    handManager.showHand();
    expect(
      (handManager as unknown as { currentHandY: number }).currentHandY,
    ).toBe((handManager as unknown as { normalY: number }).normalY);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("animateCardEntry deve animar entrada", () => {
    const card = createMockCard();
    handManager.animateCardEntry(card);
    expect(card.setAngle).toHaveBeenCalledWith(-22);
    expect(card.setAlpha).toHaveBeenCalledWith(0);
    expect(mockContext.tweens.add).toHaveBeenCalled();
  });

  it("reorganizeHand deve animar todas as cartas", () => {
    const card1 = createMockCard();
    const card2 = createMockCard();
    handManager.hand = [card1, card2];
    handManager.reorganizeHand();
    expect(mockContext.tweens.add).toHaveBeenCalled();
    expect(card1.setDepth).toHaveBeenCalled();
    expect(card2.setDepth).toHaveBeenCalled();
  });

  it("removeCard deve remover carta da mão", () => {
    const card1 = createMockCard();
    const card2 = createMockCard();
    handManager.hand = [card1, card2];
    handManager.removeCard(card1);
    expect(handManager.hand).not.toContain(card1);
    expect(handManager.hand).toContain(card2);
  });

  it("addCardBack deve adicionar carta de volta à mão e mostrar mão", () => {
    const card = createMockCard();
    handManager.hand = [];
    handManager.addCardBack(card);
    expect(mockContext.tweens.killTweensOf).toHaveBeenCalledWith(card);
    expect(card.setHandVisuals).toHaveBeenCalled();
    expect(card.visualElements.setScale).toHaveBeenCalledWith(1);
    expect(card.visualElements.setY).toHaveBeenCalledWith(0);
    expect(card.removeAllListeners).toHaveBeenCalled();
    expect(handManager.hand).toContain(card);
  });
});
