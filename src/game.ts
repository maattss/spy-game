import { PACKS } from "./content";
import type { Assignment, LocationCard, Player, RoundState } from "./types";

interface CreateRoundInput {
  players: Player[];
  selectedPackIds: string[];
  spyCount: number;
  starterPlayerIndex: number;
  excludedLocationKeys?: string[];
}

export function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function getLocationPool(selectedPackIds: string[]): LocationCard[] {
  const selectedIds = new Set(selectedPackIds);
  const packs = PACKS.filter((pack) => selectedIds.has(pack.id));
  return packs.flatMap((pack) => pack.locations);
}

export function getLocationKey(location: LocationCard): string {
  return `${location.name.nb}\u0000${location.name.en}`;
}

export function createRound(input: CreateRoundInput): RoundState {
  const { players, selectedPackIds, spyCount, starterPlayerIndex, excludedLocationKeys = [] } = input;
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
  if (!Number.isInteger(starterPlayerIndex) || starterPlayerIndex < 0 || starterPlayerIndex >= players.length) {
    throw new Error("Ugyldig startspiller.");
  }

  const excludedLocationKeySet = new Set(excludedLocationKeys);
  const availableLocations = locationPool.filter((locationCard) => !excludedLocationKeySet.has(getLocationKey(locationCard)));
  const candidateLocations = availableLocations.length > 0 ? availableLocations : locationPool;
  const location = candidateLocations[Math.floor(Math.random() * candidateLocations.length)];
  const shuffledPlayers = shuffle(players);
  const spyIds = shuffledPlayers.slice(0, spyCount).map((player) => player.id);
  const spyIdSet = new Set(spyIds);
  const assignments: Record<string, Assignment> = {};
  for (const player of players) {
    const isSpy = spyIdSet.has(player.id);
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
    starterPlayerIndex,
  };
}

export type VoteWinner = "spies" | "agents";

export interface DetermineWinnerResult {
  winner: VoteWinner;
  suspectId: string | null;
}

export function determineRoundWinner(
  votes: Record<string, string>,
  assignments: Record<string, Assignment>,
): DetermineWinnerResult {
  const counts: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    counts[targetId] = (counts[targetId] ?? 0) + 1;
  }

  const entries = Object.entries(counts);
  if (entries.length === 0) {
    return { winner: "spies", suspectId: null };
  }

  const maxVotes = Math.max(...entries.map(([, count]) => count));
  const topCandidates = entries.filter(([, count]) => count === maxVotes).map(([id]) => id);

  if (topCandidates.length !== 1) {
    return { winner: "spies", suspectId: null };
  }

  const suspectId = topCandidates[0];
  const suspectAssignment = assignments[suspectId];

  if (suspectAssignment?.isSpy) {
    return { winner: "agents", suspectId };
  }

  return { winner: "spies", suspectId };
}
