import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { PACKS } from "./content";
import { COPY } from "./copy";
import { createRound, getLocationKey } from "./game";
import type { GamePhase, Locale, Player, RoundState } from "./types";
import { Button } from "./components/ui/button";
import { DealSection, PointSection, ResultSection, SetupSection } from "./components/game/phase-sections";

const DEFAULT_PLAYER_COUNT = 4;
const MIN_PLAYER_COUNT = 3;
const MAX_PLAYER_COUNT = 12;
const THEME_STORAGE_KEY = "spy-theme";
const USED_LOCATIONS_STORAGE_KEY_PREFIX = "spy-used-locations-";
const DEFAULT_PACK_IDS = [PACKS[0]?.id ?? "classic"];

type Theme = "dark" | "light";

function newPlayer(name: string): Player {
  return { id: crypto.randomUUID(), name };
}

function buildDefaultPlayers(): Player[] {
  return Array.from({ length: DEFAULT_PLAYER_COUNT }, () => newPlayer(""));
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" ? "light" : "dark";
}

function usedLocationsStorageKey(packIds: string[]): string {
  return USED_LOCATIONS_STORAGE_KEY_PREFIX + [...packIds].sort().join(",");
}

function loadUsedLocationKeys(packIds: string[]): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(usedLocationsStorageKey(packIds));
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed as string[];
    }
  } catch {
    // Ignore malformed data
  }
  return [];
}

function saveUsedLocationKeys(packIds: string[], keys: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(usedLocationsStorageKey(packIds), JSON.stringify(keys));
  } catch {
    // Ignore quota errors
  }
}

export function App() {
  const [locale, setLocale] = useState<Locale>("nb");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [players, setPlayers] = useState<Player[]>(buildDefaultPlayers);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(() => DEFAULT_PACK_IDS);
  const [spyCount, setSpyCount] = useState(1);
  const [nextStarterPlayerIndex, setNextStarterPlayerIndex] = useState(0);
  const [usedLocationKeys, setUsedLocationKeys] = useState<string[]>(() => loadUsedLocationKeys(DEFAULT_PACK_IDS));

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [round, setRound] = useState<RoundState | null>(null);

  const [revealIndex, setRevealIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);

  const text = COPY[locale];
  const maxSpyCount = Math.max(1, players.length - 1);

  const canStartGame =
    players.length >= MIN_PLAYER_COUNT && selectedPackIds.length > 0 && spyCount >= 1 && spyCount <= maxSpyCount;

  const selectedLocations = useMemo(
    () => PACKS.filter((pack) => selectedPackIds.includes(pack.id)).flatMap((pack) => pack.locations),
    [selectedPackIds],
  );

  const currentRevealPlayer = round?.players[revealIndex] ?? null;
  const currentRevealAssignment = currentRevealPlayer ? round?.assignments[currentRevealPlayer.id] : null;

  function playerPlaceholder(index: number): string {
    return locale === "nb" ? `Spiller ${index + 1}` : `Player ${index + 1}`;
  }

  function displayPlayerName(name: string, index: number): string {
    const trimmedName = name.trim();
    return trimmedName.length > 0 ? trimmedName : playerPlaceholder(index);
  }

  function toggleLocale() {
    setLocale((current) => (current === "nb" ? "en" : "nb"));
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function addPlayer() {
    if (players.length >= MAX_PLAYER_COUNT) {
      return;
    }
    setPlayers((current) => [...current, newPlayer("")]);
  }

  function removePlayer(id: string) {
    if (players.length <= MIN_PLAYER_COUNT) {
      return;
    }
    setPlayers((current) => current.filter((player) => player.id !== id));
  }

  function updatePlayerName(id: string, name: string) {
    setPlayers((current) => current.map((player) => (player.id === id ? { ...player, name } : player)));
  }

  function togglePack(packId: string) {
    const nextPackIds = selectedPackIds[0] === packId ? selectedPackIds : [packId];
    const hasPackSelectionChanged =
      nextPackIds.length !== selectedPackIds.length || nextPackIds.some((id, index) => id !== selectedPackIds[index]);

    if (hasPackSelectionChanged) {
      setUsedLocationKeys(loadUsedLocationKeys(nextPackIds));
    }
    setSelectedPackIds(nextPackIds);
  }

  function updateSpyCount(value: number) {
    if (!Number.isFinite(value)) {
      return;
    }
    const normalized = Math.max(1, Math.min(maxSpyCount, Math.trunc(value)));
    setSpyCount(normalized);
  }

  function startRound() {
    if (!canStartGame) {
      return;
    }
    const normalizedStarterPlayerIndex = players.length > 0 ? nextStarterPlayerIndex % players.length : 0;
    const usedLocationKeySet = new Set(usedLocationKeys);
    const hasUsedAllSelectedLocations =
      selectedLocations.length > 0 && selectedLocations.every((location) => usedLocationKeySet.has(getLocationKey(location)));

    const createdRound = createRound({
      players,
      selectedPackIds,
      spyCount,
      starterPlayerIndex: normalizedStarterPlayerIndex,
      excludedLocationKeys: usedLocationKeys,
    });
    const nextLocationKey = getLocationKey(createdRound.location);
    const nextUsedLocationKeys = hasUsedAllSelectedLocations
      ? [nextLocationKey]
      : [...usedLocationKeys, nextLocationKey];

    setRound(createdRound);
    setUsedLocationKeys(nextUsedLocationKeys);
    saveUsedLocationKeys(selectedPackIds, nextUsedLocationKeys);
    setPhase("deal");
    setRevealIndex(createdRound.starterPlayerIndex);
    setShowCard(false);
    setNextStarterPlayerIndex((value) => (players.length > 0 ? (value + 1) % players.length : 0));
  }

  function goToNextReveal() {
    if (!round) {
      return;
    }

    const nextRevealIndex = (revealIndex + 1) % round.players.length;
    if (nextRevealIndex === round.starterPlayerIndex) {
      setPhase("point");
      setShowCard(false);
      return;
    }

    setRevealIndex(nextRevealIndex);
    setShowCard(false);
  }

  function endToSetup() {
    setPhase("setup");
    setRound(null);
    setShowCard(false);
  }

  useEffect(() => {
    setSpyCount((current) => {
      const value = Number.isFinite(current) ? Math.trunc(current) : 1;
      const clamped = Math.max(1, Math.min(maxSpyCount, value));
      return clamped === current ? current : clamped;
    });
  }, [maxSpyCount]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    const themeColor = theme === "dark" ? "#0c0e11" : "#f5f6f8";
    document.querySelector("meta[name='theme-color']")?.setAttribute("content", themeColor);
  }, [theme]);

  return (
    <main className="app">
      <div className="app__glow" aria-hidden="true" />

      <div className="app__inner">
        <header className="topbar">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              <span className="brand__eye" />
            </span>
            <div className="brand__text">
              <h1 className="brand__title">Spy</h1>
              <p className="brand__tagline">{text.tagline}</p>
            </div>
          </div>

          <div className="topbar__controls">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={toggleLocale}
              aria-label={`${text.languageLabel}: ${locale === "nb" ? text.english : text.norwegian}`}
            >
              <Languages size={16} />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={toggleTheme}
              aria-label={`${text.themeLabel}: ${theme === "dark" ? text.light : text.dark}`}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>
        </header>

        {phase === "setup" && (
          <SetupSection
            text={text}
            locale={locale}
            players={players}
            selectedPackIds={selectedPackIds}
            spyCount={spyCount}
            canStartGame={canStartGame}
            minPlayerCount={MIN_PLAYER_COUNT}
            maxPlayerCount={MAX_PLAYER_COUNT}
            onUpdatePlayerName={updatePlayerName}
            onRemovePlayer={removePlayer}
            onAddPlayer={addPlayer}
            onSetSpyCount={updateSpyCount}
            onTogglePack={togglePack}
            onStartRound={startRound}
            displayPlayerName={displayPlayerName}
            playerPlaceholder={playerPlaceholder}
          />
        )}

        {phase === "deal" && round && currentRevealPlayer && currentRevealAssignment && (
          <DealSection
            text={text}
            locale={locale}
            round={round}
            revealIndex={revealIndex}
            showCard={showCard}
            revealPlayerName={displayPlayerName(currentRevealPlayer.name, revealIndex)}
            isSpy={currentRevealAssignment.isSpy}
            onShowCard={() => setShowCard(true)}
            onNextReveal={goToNextReveal}
          />
        )}

        {phase === "point" && <PointSection text={text} onShowResult={() => setPhase("result")} />}

        {phase === "result" && round && (
          <ResultSection
            text={text}
            locale={locale}
            round={round}
            onNewRound={startRound}
            onBackToSetup={endToSetup}
            displayPlayerName={displayPlayerName}
          />
        )}
      </div>
    </main>
  );
}
