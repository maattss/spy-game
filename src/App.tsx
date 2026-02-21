import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { PACKS } from "./content";
import { COPY } from "./copy";
import { createRound } from "./game";
import type { GamePhase, Locale, Player, RoundResult, RoundState } from "./types";
import { Button } from "./components/ui/button";
import { DealSection, ResultSection, SetupSection, VoteSection } from "./components/game/phase-sections";

const DEFAULT_PLAYER_COUNT = 4;
const THEME_STORAGE_KEY = "spy-theme";

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
  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
}

export function App() {
  const [locale, setLocale] = useState<Locale>("nb");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [players, setPlayers] = useState<Player[]>(buildDefaultPlayers);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(() => [PACKS[0]?.id ?? "classic"]);
  const [spyCount, setSpyCount] = useState(1);

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [round, setRound] = useState<RoundState | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const [revealIndex, setRevealIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);

  const [voteIndex, setVoteIndex] = useState(0);
  const [votesByVoter, setVotesByVoter] = useState<Record<string, string>>({});
  const voteLockedRef = useRef(false);

  const text = COPY[locale];
  const maxSpyCount = Math.max(1, players.length - 1);

  const canStartGame = players.length >= 3 && selectedPackIds.length > 0 && spyCount >= 1 && spyCount <= maxSpyCount;

  const roundPlayerIndexById = useMemo<Record<string, number>>(() => {
    if (!round) {
      return {};
    }
    return Object.fromEntries(round.players.map((player, index) => [player.id, index]));
  }, [round]);

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

  function finishRound(result: RoundResult) {
    setRoundResult(result);
    setPhase("result");
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

    const createdRound = createRound({
      players,
      selectedPackIds,
      spyCount,
    });

    setRound(createdRound);
    setRoundResult(null);
    setPhase("deal");
    setRevealIndex(0);
    setShowCard(false);
    setVoteIndex(0);
    setVotesByVoter({});
    voteLockedRef.current = false;
  }

  function goToNextReveal() {
    if (!round) {
      return;
    }

    if (revealIndex >= round.players.length - 1) {
      setPhase("vote");
      setShowCard(false);
      setVoteIndex(0);
      setVotesByVoter({});
      voteLockedRef.current = false;
      return;
    }

    setRevealIndex((value) => value + 1);
    setShowCard(false);
  }

  function finalizeVotes(votes: Record<string, string>) {
    if (!round) {
      return;
    }

    const counts: Record<string, number> = {};
    for (const targetId of Object.values(votes)) {
      counts[targetId] = (counts[targetId] ?? 0) + 1;
    }

    const entries = Object.entries(counts);
    if (entries.length === 0) {
      finishRound({ winner: "spies", reason: text.reasons.voteTie });
      return;
    }

    const maxVotes = Math.max(...entries.map(([, count]) => count));
    const topCandidates = entries.filter(([, count]) => count === maxVotes).map(([id]) => id);

    if (topCandidates.length !== 1) {
      finishRound({ winner: "spies", reason: text.reasons.voteTie });
      return;
    }

    const suspectId = topCandidates[0];
    const suspectAssignment = round.assignments[suspectId];

    if (suspectAssignment?.isSpy) {
      finishRound({ winner: "agents", reason: text.reasons.caughtSpy });
      return;
    }

    const suspectIndex = roundPlayerIndexById[suspectId] ?? 0;
    const suspectName = displayPlayerName(round.players[suspectIndex]?.name ?? "", suspectIndex);
    finishRound({ winner: "spies", reason: text.reasons.wrongVote(suspectName) });
  }

  function submitVote(targetId: string) {
    if (!round || voteLockedRef.current) {
      return;
    }
    voteLockedRef.current = true;

    const voter = round.players[voteIndex];
    if (!voter) {
      voteLockedRef.current = false;
      return;
    }

    const nextVotes = { ...votesByVoter, [voter.id]: targetId };
    setVotesByVoter(nextVotes);

    if (voteIndex < round.players.length - 1) {
      setVoteIndex((value) => value + 1);
      return;
    }

    finalizeVotes(nextVotes);
  }

  function endToSetup() {
    setPhase("setup");
    setRound(null);
    setRoundResult(null);
    setShowCard(false);
    setVoteIndex(0);
    setVotesByVoter({});
    voteLockedRef.current = false;
  }

  useEffect(() => {
    voteLockedRef.current = false;
  }, [phase, voteIndex]);

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
    const themeColor = theme === "dark" ? "#030507" : "#f4f7fb";
    document.querySelector("meta[name='theme-color']")?.setAttribute("content", themeColor);
  }, [theme]);

  return (
    <main className="app-shell">
      <section className="app-frame">
        <header className="app-header">
          <div className="app-brand">
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
          <>
            <div className="rules-box app-rules" aria-label={text.rulesTitle}>
              <p className="rules-box__title">{text.playersIntro}</p>
              <ul className="rules-list">
                <li>{text.rulePlayerCount}</li>
                <li>{text.rulePassPhone}</li>
                <li>{text.ruleNoPeeking}</li>
                <li>{text.ruleDiscussion}</li>
              </ul>
            </div>

            <SetupSection
              text={text}
              locale={locale}
              players={players}
              selectedPackIds={selectedPackIds}
              spyCount={spyCount}
              canStartGame={canStartGame}
              onUpdatePlayerName={updatePlayerName}
              onRemovePlayer={removePlayer}
              onAddPlayer={addPlayer}
              onSetSpyCount={updateSpyCount}
              onTogglePack={togglePack}
              onStartRound={startRound}
              displayPlayerName={displayPlayerName}
              playerPlaceholder={playerPlaceholder}
            />
          </>
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

        {phase === "vote" && round && (
          <VoteSection
            text={text}
            round={round}
            voteIndex={voteIndex}
            onVote={submitVote}
            displayPlayerName={displayPlayerName}
          />
        )}

        {phase === "result" && round && roundResult && (
          <ResultSection
            text={text}
            locale={locale}
            round={round}
            roundResult={roundResult}
            onNewRound={startRound}
            onBackToSetup={endToSetup}
            displayPlayerName={displayPlayerName}
          />
        )}
      </section>
    </main>
  );
}
