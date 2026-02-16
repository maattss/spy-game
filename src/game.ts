import { PACKS } from "./content";
import type { Assignment, LocationCard, Player, RoundState } from "./types";

interface CreateRoundInput {
  players: Player[];
  selectedPackIds: string[];
  spyCount: number;
  durationSeconds: number;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function normalizeValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getLocationPool(selectedPackIds: string[]): LocationCard[] {
  return PACKS.filter((pack) => selectedPackIds.includes(pack.id)).flatMap((pack) => pack.locations);
}

export function createRound(input: CreateRoundInput): RoundState {
  const { players, selectedPackIds, spyCount, durationSeconds } = input;
  const locationPool = getLocationPool(selectedPackIds);
  if (locationPool.length === 0) {
    throw new Error("Ingen lokasjoner er valgt.");
  }
  if (players.length < 3) {
    throw new Error("Minst 3 spillere kreves.");
  }
  if (spyCount < 1 || spyCount >= players.length) {
    throw new Error("Ugyldig antall spioner.");
  }

  const location = locationPool[Math.floor(Math.random() * locationPool.length)];
  const shuffledPlayers = shuffle(players);
  const spyIds = shuffledPlayers.slice(0, spyCount).map((player) => player.id);

  const assignments: Record<string, Assignment> = {};
  for (const player of players) {
    assignments[player.id] = {
      playerId: player.id,
      isSpy: spyIds.includes(player.id),
    };
  }

  return {
    location,
    assignments,
    players,
    spyIds,
    durationSeconds,
  };
}

export function tallyVotes(votes: Record<string, string>): { topTargetId: string | null; isTie: boolean } {
  const counter: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    counter[targetId] = (counter[targetId] ?? 0) + 1;
  }

  const entries = Object.entries(counter).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return { topTargetId: null, isTie: false };
  }
  if (entries.length > 1 && entries[0][1] === entries[1][1]) {
    return { topTargetId: null, isTie: true };
  }
  return { topTargetId: entries[0][0], isTie: false };
}
