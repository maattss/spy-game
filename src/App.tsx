import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { PACKS } from "./content";
import { COPY } from "./copy";
import { createRound, determineRoundWinner } from "./game";
import type { GamePhase, Locale, Player, RoundResult, RoundState } from "./types";
import { Button } from "./components/ui/button";
import { DealSection, ManualVoteSection, ResultSection, SetupSection, VoteSection } from "./components/game/phase-sections";

const DEFAULT_PLAYER_COUNT = 4;
const MIN_PLAYER_COUNT = 3;
const MAX_PLAYER_COUNT = 12;
const THEME_STORAGE_KEY = "spy-theme";
const VOTE_ADVANCE_DELAY_MS = 220;

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
  const [pointVotingEnabled, setPointVotingEnabled] = useState(false);
  const [nextStarterPlayerIndex, setNextStarterPlayerIndex] = useState(0);

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [round, setRound] = useState<RoundState | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const [revealIndex, setRevealIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);

  const [voteIndex, setVoteIndex] = useState(0);
  const [votesByVoter, setVotesByVoter] = useState<Record<string, string>>({});
  const [activeVoteTargetId, setActiveVoteTargetId] = useState<string | null>(null);
  const voteLockedRef = useRef(false);
  const voteAdvanceTimeoutRef = useRef<number | null>(null);

  const text = COPY[locale];
  const maxSpyCount = Math.max(1, players.length - 1);

  const canStartGame =
    players.length >= MIN_PLAYER_COUNT && selectedPackIds.length > 0 && spyCount >= 1 && spyCount <= maxSpyCount;

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
    setSelectedPackIds((current) => {
      return current[0] === packId ? current : [packId];
    });
  }

  function updateSpyCount(value: number) {
    if (!Number.isFinite(value)) {
      return;
    }
    const normalized = Math.max(1, Math.min(maxSpyCount, Math.trunc(value)));
    setSpyCount(normalized);
  }

  function clearVoteAdvanceTimeout() {
    if (voteAdvanceTimeoutRef.current === null) {
      return;
    }
    window.clearTimeout(voteAdvanceTimeoutRef.current);
    voteAdvanceTimeoutRef.current = null;
  }

  function startRound() {
    if (!canStartGame) {
      return;
    }
    const normalizedStarterPlayerIndex = players.length > 0 ? nextStarterPlayerIndex % players.length : 0;

    const createdRound = createRound({
      players,
      selectedPackIds,
      spyCount,
      starterPlayerIndex: normalizedStarterPlayerIndex,
    });

    setRound(createdRound);
    setRoundResult(null);
    setPhase("deal");
    setRevealIndex(createdRound.starterPlayerIndex);
    setShowCard(false);
    setVoteIndex(createdRound.starterPlayerIndex);
    setVotesByVoter({});
    setActiveVoteTargetId(null);
    voteLockedRef.current = false;
    clearVoteAdvanceTimeout();
    setNextStarterPlayerIndex((value) => (players.length > 0 ? (value + 1) % players.length : 0));
  }

  function goToNextReveal() {
    if (!round) {
      return;
    }

    const nextRevealIndex = (revealIndex + 1) % round.players.length;
    if (nextRevealIndex === round.starterPlayerIndex) {
      if (pointVotingEnabled) {
        setPhase("manual-vote");
      } else {
        setPhase("vote");
        setShowCard(false);
        setVoteIndex(round.starterPlayerIndex);
        setVotesByVoter({});
        setActiveVoteTargetId(null);
        voteLockedRef.current = false;
        clearVoteAdvanceTimeout();
      }
      return;
    }

    setRevealIndex(nextRevealIndex);
    setShowCard(false);
  }

  function finalizeVotes(votes: Record<string, string>) {
    if (!round) {
      return;
    }

    const result = determineRoundWinner(votes, round.assignments);

    if (result.winner === "agents") {
      finishRound({ winner: "agents", reason: text.reasons.caughtSpy });
      return;
    }

    if (result.suspectId === null) {
      finishRound({ winner: "spies", reason: text.reasons.voteTie });
      return;
    }

    const suspectIndex = roundPlayerIndexById[result.suspectId] ?? 0;
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
    setActiveVoteTargetId(targetId);

    clearVoteAdvanceTimeout();
    voteAdvanceTimeoutRef.current = window.setTimeout(() => {
      voteAdvanceTimeoutRef.current = null;

      const nextVoteIndex = (voteIndex + 1) % round.players.length;
      if (nextVoteIndex !== round.starterPlayerIndex) {
        setVoteIndex(nextVoteIndex);
        return;
      }

      finalizeVotes(nextVotes);
    }, VOTE_ADVANCE_DELAY_MS);
  }

  function endToSetup() {
    setPhase("setup");
    setRound(null);
    setRoundResult(null);
    setShowCard(false);
    setVoteIndex(0);
    setVotesByVoter({});
    setActiveVoteTargetId(null);
    voteLockedRef.current = false;
    clearVoteAdvanceTimeout();
  }

  useEffect(() => {
    voteLockedRef.current = false;
    setActiveVoteTargetId(null);
  }, [phase, voteIndex]);

  useEffect(() => {
    if (phase !== "vote") {
      clearVoteAdvanceTimeout();
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      clearVoteAdvanceTimeout();
    };
  }, []);

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
              pointVotingEnabled={pointVotingEnabled}
              canStartGame={canStartGame}
              minPlayerCount={MIN_PLAYER_COUNT}
              onUpdatePlayerName={updatePlayerName}
              onRemovePlayer={removePlayer}
              onAddPlayer={addPlayer}
              onSetSpyCount={updateSpyCount}
              onSetPointVotingEnabled={setPointVotingEnabled}
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
            activeVoteTargetId={activeVoteTargetId}
            displayPlayerName={displayPlayerName}
          />
        )}

        {phase === "manual-vote" && (
          <ManualVoteSection
            text={text}
            onShowResult={() => finishRound({ winner: "manual", reason: text.reasons.manualVoting })}
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
