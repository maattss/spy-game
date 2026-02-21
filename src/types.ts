export type GamePhase = "setup" | "deal" | "vote" | "spy_guess" | "result";
export type Winner = "agents" | "spies";
export type GuessMode = "free_guess" | "caught_spy_guess";
export type Locale = "nb" | "en";

export interface LocalizedText {
  nb: string;
  en: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface LocationCard {
  name: LocalizedText;
}

export interface LocationPack {
  id: string;
  name: LocalizedText;
  locations: LocationCard[];
}

export interface Assignment {
  playerId: string;
  isSpy: boolean;
}

export interface RoundResult {
  winner: Winner;
  reason: string;
}

export interface RoundState {
  location: LocationCard;
  assignments: Record<string, Assignment>;
  players: Player[];
  spyIds: string[];
  durationSeconds: number;
}
