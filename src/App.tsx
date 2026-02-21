import { useEffect, useMemo, useState } from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { HINT_QUESTIONS, PACKS } from "./content";
import { COPY } from "./copy";
import { createRound, normalizeValue } from "./game";
import type { GamePhase, GuessMode, Locale, Player, RoundResult, RoundState } from "./types";
import { Button } from "./components/ui/button";
import {
  DealSection,
  DiscussionSection,
  ResultSection,
  SetupSection,
  SpyGuessSection,
} from "./components/game/phase-sections";

const DEFAULT_PLAYER_COUNT = 4;
const ROUND_DURATION_SECONDS = 8 * 60;
const THEME_STORAGE_KEY = "spy-theme";

type Theme = "dark" | "light";

function newPlayer(name: string): Player {
  return { id: crypto.randomUUID(), name };
}

function buildDefaultPlayers(): Player[] {
  return Array.from({ length: DEFAULT_PLAYER_COUNT }, () => newPlayer(""));
}

function formatSeconds(total: number): string {
  const safeTotal = Math.max(0, total);
  const minutes = Math.floor(safeTotal / 60);
  const seconds = safeTotal % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
}

export function App() {
  const [locale, setLocale] = useState<Locale>("nb");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [players, setPlayers] = useState<Player[]>(buildDefaultPlayers);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(() => [PACKS[0]?.id ?? "classic"]);
  const [spyCount, setSpyCount] = useState(1);
  const [includeRoles, setIncludeRoles] = useState(true);

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [round, setRound] = useState<RoundState | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const [revealIndex, setRevealIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);

  const [guessMode, setGuessMode] = useState<GuessMode>("free_guess");
  const [guessingSpyId, setGuessingSpyId] = useState<string>("");
  const [spyGuess, setSpyGuess] = useState("");

  const text = COPY[locale];
  const hints = HINT_QUESTIONS[locale];
  const hint = hints[hintIndex % hints.length];

  const playersById = useMemo<Record<string, Player>>(
    () => Object.fromEntries(players.map((player) => [player.id, player])),
    [players],
  );

  const playerIndexById = useMemo<Record<string, number>>(
    () => Object.fromEntries(players.map((player, index) => [player.id, index])),
    [players],
  );

  const roundPlayerIndexById = useMemo<Record<string, number>>(() => {
    if (!round) {
      return {};
    }
    return Object.fromEntries(round.players.map((player, index) => [player.id, index]));
  }, [round]);

  const canStartGame = players.length >= 3 && selectedPackIds.length > 0 && spyCount >= 1 && spyCount < players.length;

  const currentRevealPlayer = round?.players[revealIndex] ?? null;
  const currentRevealAssignment = currentRevealPlayer ? round?.assignments[currentRevealPlayer.id] : null;

  function playerPlaceholder(index: number): string {
    return locale === "nb" ? `Spiller ${index + 1}` : `Player ${index + 1}`;
  }

  function toggleLocale() {
    setLocale((current) => (current === "nb" ? "en" : "nb"));
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function displayPlayerName(name: string, index: number): string {
    const trimmedName = name.trim();
    return trimmedName.length > 0 ? trimmedName : playerPlaceholder(index);
  }

  function finishRound(result: RoundResult) {
    if (!round) {
      return;
    }

    setRoundResult(result);
    setPhase("result");
    setScores((current) => {
      const next = { ...current };

      for (const player of round.players) {
        const assignment = round.assignments[player.id];
        const gainsPoint =
          (result.winner === "spies" && assignment.isSpy) ||
          (result.winner === "agents" && !assignment.isSpy);
        next[player.id] = gainsPoint ? (next[player.id] ?? 0) + 1 : (next[player.id] ?? 0);
      }

      return next;
    });
  }

  function addPlayer() {
    if (players.length >= 12) {
      return;
    }
    setPlayers((current) => [...current, newPlayer("")]);
  }

  function removePlayer(id: string) {
    if (players.length <= 3) {
      return;
    }

    setPlayers((current) => current.filter((player) => player.id !== id));
    setScores((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function updatePlayerName(id: string, name: string) {
    setPlayers((current) => current.map((player) => (player.id === id ? { ...player, name } : player)));
  }

  function togglePack(packId: string) {
    setSelectedPackIds((current) => {
      if (current.includes(packId)) {
        return current.length === 1 ? current : current.filter((id) => id !== packId);
      }
      return [...current, packId];
    });
  }

  function startRound() {
    if (!canStartGame) {
      return;
    }

    const createdRound = createRound({
      players,
      selectedPackIds,
      spyCount,
      durationSeconds: ROUND_DURATION_SECONDS,
      includeRoles,
    });

    setRound(createdRound);
    setRoundResult(null);
    setPhase("deal");
    setRevealIndex(0);
    setShowCard(false);
    setRemainingSeconds(createdRound.durationSeconds);
    setHintIndex(randomIndex(hints.length));
    setSpyGuess("");
    setGuessMode("free_guess");
    setGuessingSpyId(createdRound.spyIds[0] ?? "");
  }

  function goToNextReveal() {
    if (!round) {
      return;
    }

    if (revealIndex >= round.players.length - 1) {
      setPhase("discussion");
      setShowCard(false);
      return;
    }

    setRevealIndex((value) => value + 1);
    setShowCard(false);
  }

  function accusePlayer(targetId: string) {
    if (!round) {
      return;
    }

    const assignment = round.assignments[targetId];
    if (assignment.isSpy) {
      setGuessMode("caught_spy_guess");
      setGuessingSpyId(targetId);
      setSpyGuess("");
      setPhase("spy_guess");
      return;
    }

    const targetIndex = roundPlayerIndexById[targetId] ?? playerIndexById[targetId] ?? 0;
    finishRound({
      winner: "spies",
      reason: text.reasons.wrongVote(displayPlayerName(playersById[targetId]?.name ?? "", targetIndex)),
    });
  }

  function openSpyGuessFromDiscussion() {
    if (!round) {
      return;
    }

    setGuessMode("free_guess");
    setGuessingSpyId(round.spyIds[0] ?? "");
    setSpyGuess("");
    setPhase("spy_guess");
  }

  function submitSpyGuess() {
    if (!round) {
      return;
    }

    const expectedLocation = normalizeValue(round.location.name);
    const guess = normalizeValue(spyGuess);

    if (!guess) {
      return;
    }

    if (guess === expectedLocation) {
      finishRound({ winner: "spies", reason: text.reasons.spyGuessCorrect });
      return;
    }

    finishRound({
      winner: "agents",
      reason: guessMode === "caught_spy_guess" ? text.reasons.caughtSpyWrongGuess : text.reasons.freeSpyWrongGuess,
    });
  }

  function endToSetup() {
    setPhase("setup");
    setRound(null);
    setRoundResult(null);
    setShowCard(false);
  }

  function revealNow() {
    finishRound({ winner: "agents", reason: text.reasons.manualEnd });
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    const themeColor = theme === "dark" ? "#030507" : "#f4f7fb";
    document.querySelector("meta[name='theme-color']")?.setAttribute("content", themeColor);
  }, [theme]);

  useEffect(() => {
    if (phase !== "discussion") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => value - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "discussion" || !round || remainingSeconds > 0) {
      return;
    }

    finishRound({ winner: "spies", reason: text.reasons.timeout });
  }, [phase, round, remainingSeconds, text.reasons.timeout]);

  return (
    <main className="app-shell">
      <section className="app-frame">
        <header className="app-header">
          <div>
            <p className="kicker">{text.brandKicker}</p>
            <h1 className="app-title">Spy</h1>
          </div>

          <div className="header-controls">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="header-switch"
              onClick={toggleLocale}
              aria-label={`${text.languageLabel}: ${locale === "nb" ? text.english : text.norwegian}`}
            >
              <Languages size={16} />
              <span className="header-switch__label">{text.languageLabel}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="header-switch"
              onClick={toggleTheme}
              aria-label={`${text.themeLabel}: ${theme === "dark" ? text.light : text.dark}`}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              <span className="header-switch__label">{text.themeLabel}</span>
            </Button>
          </div>
        </header>

        {phase === "setup" && (
          <SetupSection
            text={text}
            locale={locale}
            players={players}
            scores={scores}
            selectedPackIds={selectedPackIds}
            spyCount={spyCount}
            includeRoles={includeRoles}
            canStartGame={canStartGame}
            onUpdatePlayerName={updatePlayerName}
            onRemovePlayer={removePlayer}
            onAddPlayer={addPlayer}
            onSetSpyCount={setSpyCount}
            onSetIncludeRoles={setIncludeRoles}
            onTogglePack={togglePack}
            onStartRound={startRound}
            displayPlayerName={displayPlayerName}
            playerPlaceholder={playerPlaceholder}
          />
        )}

        {phase === "deal" && round && currentRevealPlayer && currentRevealAssignment && (
          <DealSection
            text={text}
            round={round}
            revealIndex={revealIndex}
            showCard={showCard}
            revealPlayerName={displayPlayerName(currentRevealPlayer.name, revealIndex)}
            isSpy={currentRevealAssignment.isSpy}
            role={currentRevealAssignment.role}
            onShowCard={() => setShowCard(true)}
            onNextReveal={goToNextReveal}
          />
        )}

        {phase === "discussion" && round && (
          <DiscussionSection
            text={text}
            round={round}
            formattedTime={formatSeconds(remainingSeconds)}
            hint={hint}
            onNewHint={() => setHintIndex(randomIndex(hints.length))}
            onAccusePlayer={accusePlayer}
            onOpenSpyGuess={openSpyGuessFromDiscussion}
            onEndRound={revealNow}
            displayPlayerName={displayPlayerName}
          />
        )}

        {phase === "spy_guess" && round && (
          <SpyGuessSection
            text={text}
            round={round}
            guessMode={guessMode}
            guessingSpyId={guessingSpyId}
            spyGuess={spyGuess}
            roundPlayerIndexById={roundPlayerIndexById}
            onSetGuessingSpyId={setGuessingSpyId}
            onSetSpyGuess={setSpyGuess}
            onSubmitGuess={submitSpyGuess}
            onBackToDiscussion={() => setPhase("discussion")}
            displayPlayerName={displayPlayerName}
          />
        )}

        {phase === "result" && round && roundResult && (
          <ResultSection
            text={text}
            round={round}
            roundResult={roundResult}
            scores={scores}
            onNewRound={startRound}
            onBackToSetup={endToSetup}
            displayPlayerName={displayPlayerName}
          />
        )}
      </section>
    </main>
  );
}
