import { describe, expect, it } from "vitest";
import { createRound, shuffle } from "./game";
import type { Player } from "./types";

const PLAYERS: Player[] = [
  { id: "p1", name: "Alice" },
  { id: "p2", name: "Bob" },
  { id: "p3", name: "Charlie" },
  { id: "p4", name: "Diana" },
  { id: "p5", name: "Eve" },
];

const DEFAULT_INPUT = {
  players: PLAYERS,
  selectedPackIds: ["classic"],
  spyCount: 1,
};

describe("shuffle", () => {
  it("returnerer en annen rekkefølge over mange kjøringer", () => {
    const original = PLAYERS.map((p) => p.id);
    const uniqueOrders = new Set<string>();

    for (let i = 0; i < 50; i++) {
      const result = shuffle(PLAYERS).map((p) => p.id);
      uniqueOrders.add(result.join(","));
    }

    expect(uniqueOrders.size).toBeGreaterThan(1);
  });

  it("beholder alle elementene", () => {
    const result = shuffle(PLAYERS);
    expect(result).toHaveLength(PLAYERS.length);
    expect(result.map((p) => p.id).sort()).toEqual(
      PLAYERS.map((p) => p.id).sort(),
    );
  });
});

describe("createRound – spion er random", () => {
  it("velger forskjellige spioner over mange runder", () => {
    const spyIdCounts: Record<string, number> = {};

    for (let i = 0; i < 100; i++) {
      const round = createRound(DEFAULT_INPUT);
      const spyId = round.spyIds[0];
      spyIdCounts[spyId] = (spyIdCounts[spyId] ?? 0) + 1;
    }

    const uniqueSpies = Object.keys(spyIdCounts);
    expect(uniqueSpies.length).toBeGreaterThan(1);
  });

  it("alle spillere kan bli spion", () => {
    const spiesObserved = new Set<string>();

    for (let i = 0; i < 500; i++) {
      const round = createRound(DEFAULT_INPUT);
      round.spyIds.forEach((id) => spiesObserved.add(id));
      if (spiesObserved.size === PLAYERS.length) break;
    }

    expect(spiesObserved.size).toBe(PLAYERS.length);
  });

  it("ingen enkeltspiller er alltid spion", () => {
    const spyIdCounts: Record<string, number> = {};
    const ROUNDS = 100;

    for (let i = 0; i < ROUNDS; i++) {
      const round = createRound(DEFAULT_INPUT);
      const spyId = round.spyIds[0];
      spyIdCounts[spyId] = (spyIdCounts[spyId] ?? 0) + 1;
    }

    for (const count of Object.values(spyIdCounts)) {
      expect(count).toBeLessThan(ROUNDS);
    }
  });
});
