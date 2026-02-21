import { PACKS } from "./content";
import type { Assignment, LocationCard, Player, RoundState } from "./types";

interface CreateRoundInput {
  players: Player[];
  selectedPackIds: string[];
  spyCount: number;
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
  const packs = PACKS.filter((pack) => selectedPackIds.includes(pack.id));
  return packs.flatMap((pack) => pack.locations);
}

export function createRound(input: CreateRoundInput): RoundState {
  const { players, selectedPackIds, spyCount } = input;
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
    const isSpy = spyIds.includes(player.id);
    assignments[player.id] = {
      playerId: player.id,
      isSpy,
    };
  }

  return {
    location,
    assignments,
    players,
    spyIds,
  };
}
