import { describe, expect, it } from "vitest";
import { PACKS } from "./content";
import { COPY } from "./copy";
import { createRound, determineRoundWinner, getLocationKey, shuffle } from "./game";
import type { Assignment, Player } from "./types";

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
  starterPlayerIndex: 0,
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

describe("createRound – lokasjonsvalg", () => {
  it("velger en lokasjon som ikke er brukt ennå når det finnes ledige alternativer", () => {
    const classicPack = PACKS.find((pack) => pack.id === "classic");

    expect(classicPack).toBeDefined();

    const [availableLocation, ...excludedLocations] = classicPack!.locations;
    const round = createRound({
      ...DEFAULT_INPUT,
      excludedLocationKeys: excludedLocations.map(getLocationKey),
    });

    expect(getLocationKey(round.location)).toBe(getLocationKey(availableLocation));
  });

  it("tillater ny trekning når alle lokasjoner allerede er brukt", () => {
    const classicPack = PACKS.find((pack) => pack.id === "classic");

    expect(classicPack).toBeDefined();

    const round = createRound({
      ...DEFAULT_INPUT,
      excludedLocationKeys: classicPack!.locations.map(getLocationKey),
    });

    expect(classicPack!.locations.map(getLocationKey)).toContain(getLocationKey(round.location));
  });
});

describe("createRound – error cases", () => {
  it("kaster feil hvis ingen lokasjoner er valgt", () => {
    expect(() => createRound({ ...DEFAULT_INPUT, selectedPackIds: [] })).toThrow("Ingen lokasjoner er valgt.");
  });

  it("kaster feil hvis færre enn 3 spillere", () => {
    expect(() =>
      createRound({
        ...DEFAULT_INPUT,
        players: PLAYERS.slice(0, 2),
      }),
    ).toThrow("Minst 3 spillere kreves.");
  });

  it("kaster feil hvis spyCount er 0", () => {
    expect(() => createRound({ ...DEFAULT_INPUT, spyCount: 0 })).toThrow("Ugyldig antall spioner.");
  });

  it("kaster feil hvis spyCount >= players.length", () => {
    expect(() => createRound({ ...DEFAULT_INPUT, spyCount: 5 })).toThrow("Ugyldig antall spioner.");
  });

  it("kaster feil hvis starterPlayerIndex er negativ", () => {
    expect(() => createRound({ ...DEFAULT_INPUT, starterPlayerIndex: -1 })).toThrow("Ugyldig startspiller.");
  });

  it("kaster feil hvis starterPlayerIndex >= players.length", () => {
    expect(() => createRound({ ...DEFAULT_INPUT, starterPlayerIndex: 5 })).toThrow("Ugyldig startspiller.");
  });

  it("kaster feil hvis starterPlayerIndex ikke er et heltall", () => {
    expect(() => createRound({ ...DEFAULT_INPUT, starterPlayerIndex: 1.5 })).toThrow("Ugyldig startspiller.");
  });
});

describe("innhold og tekst", () => {
  it("har afterski-lokasjoner", () => {
    const afterskiPack = PACKS.find((pack) => pack.id === "afterski");

    expect(afterskiPack).toBeDefined();
    expect(afterskiPack!.locations.map((location) => location.name.nb)).toEqual(
      expect.arrayContaining(["Skiheisen", "Gondolen", "Skibaren"]),
    );
  });

  it("ber alle si ordet før de peker ut spionen", () => {
    expect(COPY.nb.manualVoteTitle).toBe("Pek ut spionen");
    expect(COPY.nb.manualVoteInstruction).toContain("Alle sier ordet sitt høyt");
    expect(COPY.nb.manualVoteInstruction).toContain("peker alle samtidig");
  });
});

describe("createRound – edge cases", () => {
  it("fungerer med nøyaktig 3 spillere", () => {
    const threePlayers = PLAYERS.slice(0, 3);
    const round = createRound({
      ...DEFAULT_INPUT,
      players: threePlayers,
      spyCount: 1,
    });

    expect(round.players).toHaveLength(3);
    expect(round.spyIds).toHaveLength(1);
  });

  it("fungerer med maksimalt antall spioner (players.length - 1)", () => {
    const round = createRound({
      ...DEFAULT_INPUT,
      spyCount: PLAYERS.length - 1,
    });

    expect(round.spyIds).toHaveLength(PLAYERS.length - 1);
  });

  it("fungerer med flere spioner", () => {
    const round = createRound({
      ...DEFAULT_INPUT,
      spyCount: 2,
    });

    expect(round.spyIds).toHaveLength(2);
    expect(new Set(round.spyIds).size).toBe(2); // Ensure unique spies
  });
});

describe("determineRoundWinner", () => {
  const assignments: Record<string, Assignment> = {
    p1: { playerId: "p1", isSpy: true },
    p2: { playerId: "p2", isSpy: false },
    p3: { playerId: "p3", isSpy: false },
    p4: { playerId: "p4", isSpy: false },
  };

  it("agenter vinner hvis de stemmer på spionen", () => {
    const votes = {
      p2: "p1",
      p3: "p1",
      p4: "p1",
    };

    const result = determineRoundWinner(votes, assignments);

    expect(result.winner).toBe("agents");
    expect(result.suspectId).toBe("p1");
  });

  it("spioner vinner hvis de stemmer på en uskyldige", () => {
    const votes = {
      p1: "p2",
      p3: "p2",
      p4: "p2",
    };

    const result = determineRoundWinner(votes, assignments);

    expect(result.winner).toBe("spies");
    expect(result.suspectId).toBe("p2");
  });

  it("spioner vinner ved stemme-likhet", () => {
    const votes = {
      p1: "p2",
      p2: "p3",
      p3: "p4",
    };

    const result = determineRoundWinner(votes, assignments);

    expect(result.winner).toBe("spies");
    expect(result.suspectId).toBeNull();
  });

  it("spioner vinner hvis ingen stemmer (tom votes)", () => {
    const votes = {};

    const result = determineRoundWinner(votes, assignments);

    expect(result.winner).toBe("spies");
    expect(result.suspectId).toBeNull();
  });

  it("spioner vinner hvis det er to kandidater med like mange stemmer", () => {
    const votes = {
      p1: "p2",
      p2: "p3",
      p3: "p2",
      p4: "p3",
    };

    const result = determineRoundWinner(votes, assignments);

    expect(result.winner).toBe("spies");
    expect(result.suspectId).toBeNull();
  });

  it("agenter kan vinne med bare én stemme hvis den er på spionen", () => {
    const votes = {
      p2: "p1",
    };

    const result = determineRoundWinner(votes, assignments);

    expect(result.winner).toBe("agents");
    expect(result.suspectId).toBe("p1");
  });

  it("fungerer med flere spioner", () => {
    const multiSpyAssignments: Record<string, Assignment> = {
      p1: { playerId: "p1", isSpy: true },
      p2: { playerId: "p2", isSpy: true },
      p3: { playerId: "p3", isSpy: false },
      p4: { playerId: "p4", isSpy: false },
      p5: { playerId: "p5", isSpy: false },
    };

    const votes = {
      p1: "p3",
      p2: "p3",
      p3: "p1",
      p4: "p1",
      p5: "p1",
    };

    const result = determineRoundWinner(votes, multiSpyAssignments);

    expect(result.winner).toBe("agents");
    expect(result.suspectId).toBe("p1");
  });
});
