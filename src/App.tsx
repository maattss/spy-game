import { useEffect, useMemo, useState } from "react";
import { HINT_QUESTIONS, PACKS } from "./content";
import { createRound, normalizeValue, tallyVotes } from "./game";
import type { GamePhase, GuessMode, Locale, Player, RoundResult, RoundState } from "./types";

const DEFAULT_PLAYERS = ["Spiller 1", "Spiller 2", "Spiller 3", "Spiller 4"];

const TEXT = {
  nb: {
    appName: "Spion spillet",
    subtitle: "Lokal pass-the-phone i nettleseren",
    languageLabel: "Sprak",
    norwegian: "Norsk",
    english: "Engelsk",
    navTop: ["Spill", "Pakker", "Poeng"],
    navSectionA: "Kom i gang",
    navSectionB: "Kjerneflyt",
    sidebarA: ["Oppsett", "Del ut kort", "Diskusjon"],
    sidebarB: ["Avstemning", "Spiongjetning", "Resultat"],
    players: "Spillere",
    playersHelp: "3-12 spillere. Telefonen sendes videre mellom hver spiller.",
    nameFor: "Navn for",
    remove: "Fjern",
    addPlayer: "+ Legg til spiller",
    setup: "Oppsett",
    spiesCount: "Antall spioner",
    roundMinutes: "Rundetid (min)",
    locationPacks: "Lokasjonspakker",
    scoreboard: "Poengtavle",
    startRound: "Start runde",
    step: "Steg",
    of: "av",
    revealPrompt: "Trykk for a se hemmelig informasjon. Ingen andre skal se skjermen.",
    showCard: "Vis hemmelig kort",
    hideAndPass: "Skjul og gi videre",
    identitySpy: "SPION",
    identityAgent: "AGENT",
    spyInstruction: "Du kjenner ikke lokasjonen. Spill smart og gjett riktig pa slutten.",
    agentInstruction: "Du kjenner lokasjonen. Finn spionen uten a avslore for mye.",
    location: "Lokasjon",
    discussion: "Diskusjon",
    discussionInstruction: "Still sporsmal til hverandre for a avslore spionen.",
    hintLabel: "Hint",
    newHint: "Nytt hint",
    startVote: "Start avstemning",
    spyGuessAction: "Spion gjetter lokasjon",
    endRound: "Avslutt runde",
    votePhase: "Avstemning",
    voteStep: "Stemme",
    phoneWith: "Telefon hos",
    voteInstruction: "Velg hvem du tror er spion, og gi telefonen videre.",
    lastChance: "Siste sjanse",
    spyGuessTitle: "Spionens gjetning",
    guessLocation: "Gjett lokasjonen",
    whichSpyGuesses: "Hvilken spion gjetter?",
    guessPlaceholder: "Skriv lokasjonen...",
    submitGuess: "Send gjetning",
    backToDiscussion: "Tilbake til diskusjon",
    result: "Resultat",
    spiesWon: "Spionene vant",
    agentsWon: "Agentene vant",
    newRound: "Ny runde",
    toSetup: "Til oppsett",
    spyShort: "Spion",
    agentShort: "Agent",
    reasons: {
      timeout: "Tiden gikk ut. Spionene overlevde runden.",
      tieVote: "Uavgjort avstemning. Spionene slipper unna.",
      wrongVote: (name: string) => `${name} ble stemt ut, men var agent.`,
      spyGuessCorrect: "Spionen gjettet lokasjonen riktig.",
      caughtSpyWrongGuess: "Spionen ble tatt og gjettet feil.",
      freeSpyWrongGuess: "Spionen gjettet feil lokasjon.",
      manualEnd: "Runden ble avsluttet manuelt.",
    },
  },
  en: {
    appName: "Spion spillet",
    subtitle: "Local pass-the-phone in the browser",
    languageLabel: "Language",
    norwegian: "Norwegian",
    english: "English",
    navTop: ["Game", "Packs", "Score"],
    navSectionA: "Get started",
    navSectionB: "Core flow",
    sidebarA: ["Setup", "Deal cards", "Discussion"],
    sidebarB: ["Voting", "Spy guess", "Result"],
    players: "Players",
    playersHelp: "3-12 players. Pass the phone between players.",
    nameFor: "Name for",
    remove: "Remove",
    addPlayer: "+ Add player",
    setup: "Setup",
    spiesCount: "Number of spies",
    roundMinutes: "Round time (min)",
    locationPacks: "Location packs",
    scoreboard: "Scoreboard",
    startRound: "Start round",
    step: "Step",
    of: "of",
    revealPrompt: "Tap to see secret information. No one else should look.",
    showCard: "Show secret card",
    hideAndPass: "Hide and pass",
    identitySpy: "SPY",
    identityAgent: "AGENT",
    spyInstruction: "You do not know the location. Play smart and guess at the end.",
    agentInstruction: "You know the location. Find the spy without revealing too much.",
    location: "Location",
    discussion: "Discussion",
    discussionInstruction: "Ask each other questions to expose the spy.",
    hintLabel: "Hint",
    newHint: "New hint",
    startVote: "Start voting",
    spyGuessAction: "Spy guesses location",
    endRound: "End round",
    votePhase: "Voting",
    voteStep: "Vote",
    phoneWith: "Phone with",
    voteInstruction: "Pick who you think is the spy, then pass the phone.",
    lastChance: "Last chance",
    spyGuessTitle: "Spy guess",
    guessLocation: "Guess the location",
    whichSpyGuesses: "Which spy is guessing?",
    guessPlaceholder: "Type the location...",
    submitGuess: "Submit guess",
    backToDiscussion: "Back to discussion",
    result: "Result",
    spiesWon: "Spies won",
    agentsWon: "Agents won",
    newRound: "New round",
    toSetup: "Back to setup",
    spyShort: "Spy",
    agentShort: "Agent",
    reasons: {
      timeout: "Time ran out. The spies survived the round.",
      tieVote: "The vote was tied. The spies got away.",
      wrongVote: (name: string) => `${name} was voted out, but was an agent.`,
      spyGuessCorrect: "The spy guessed the location correctly.",
      caughtSpyWrongGuess: "The caught spy guessed wrong.",
      freeSpyWrongGuess: "The spy guessed the wrong location.",
      manualEnd: "The round was ended manually.",
    },
  },
} as const;

function newPlayer(name: string): Player {
  return { id: crypto.randomUUID(), name };
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

export function App() {
  const [locale, setLocale] = useState<Locale>("nb");
  const [players, setPlayers] = useState<Player[]>(() => DEFAULT_PLAYERS.map((name) => newPlayer(name)));
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(() => [PACKS[0].id]);
  const [spyCount, setSpyCount] = useState(1);
  const [roundMinutes, setRoundMinutes] = useState(8);

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [round, setRound] = useState<RoundState | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  const [revealIndex, setRevealIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);

  const [votes, setVotes] = useState<Record<string, string>>({});
  const [voteIndex, setVoteIndex] = useState(0);

  const [guessMode, setGuessMode] = useState<GuessMode>("free_guess");
  const [guessingSpyId, setGuessingSpyId] = useState<string>("");
  const [spyGuess, setSpyGuess] = useState("");

  const text = TEXT[locale];
  const hints = HINT_QUESTIONS[locale];
  const hint = hints[hintIndex % hints.length];

  const playersById = useMemo(() => {
    return Object.fromEntries(players.map((player) => [player.id, player]));
  }, [players]);

  const canStartGame = players.length >= 3 && selectedPackIds.length > 0 && spyCount >= 1 && spyCount < players.length;

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
    if (phase === "discussion" && remainingSeconds <= 0 && round) {
      finishRound({
        winner: "spies",
        reason: text.reasons.timeout,
      });
    }
  }, [phase, remainingSeconds, round, text.reasons.timeout]);

  function addPlayer() {
    if (players.length >= 12) {
      return;
    }
    const defaultName = locale === "nb" ? `Spiller ${players.length + 1}` : `Player ${players.length + 1}`;
    setPlayers((current) => [...current, newPlayer(defaultName)]);
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
        if (current.length === 1) {
          return current;
        }
        return current.filter((id) => id !== packId);
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
      durationSeconds: roundMinutes * 60,
    });
    setRound(createdRound);
    setPhase("deal");
    setRoundResult(null);
    setRevealIndex(0);
    setShowCard(false);
    setVotes({});
    setVoteIndex(0);
    setRemainingSeconds(createdRound.durationSeconds);
    setHintIndex(randomIndex(hints.length));
    setSpyGuess("");
    setGuessMode("free_guess");
    setGuessingSpyId(createdRound.spyIds[0]);
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

  function startVoting() {
    if (!round) {
      return;
    }
    setVotes({});
    setVoteIndex(0);
    setPhase("vote");
  }

  function castVote(targetId: string) {
    if (!round) {
      return;
    }
    const voter = round.players[voteIndex];
    const nextVotes = { ...votes, [voter.id]: targetId };

    if (voteIndex >= round.players.length - 1) {
      const summary = tallyVotes(nextVotes);
      if (summary.isTie || !summary.topTargetId) {
        finishRound({
          winner: "spies",
          reason: text.reasons.tieVote,
        });
        return;
      }
      const assignment = round.assignments[summary.topTargetId];
      if (assignment.isSpy) {
        setVotes(nextVotes);
        setGuessMode("caught_spy_guess");
        setGuessingSpyId(summary.topTargetId);
        setPhase("spy_guess");
        setSpyGuess("");
        return;
      }
      finishRound({
        winner: "spies",
        reason:
          text.reasons.wrongVote(
            playersById[summary.topTargetId]?.name ?? (locale === "nb" ? "Ukjent spiller" : "Unknown player"),
          ),
      });
      return;
    }

    setVotes(nextVotes);
    setVoteIndex((value) => value + 1);
  }

  function openSpyGuessFromDiscussion() {
    if (!round) {
      return;
    }
    setGuessMode("free_guess");
    setGuessingSpyId(round.spyIds[0]);
    setSpyGuess("");
    setPhase("spy_guess");
  }

  function submitSpyGuess() {
    if (!round) {
      return;
    }
    const locationName = normalizeValue(round.location.name);
    const guess = normalizeValue(spyGuess);
    if (!guess) {
      return;
    }
    if (guess === locationName) {
      finishRound({
        winner: "spies",
        reason: text.reasons.spyGuessCorrect,
      });
      return;
    }
    finishRound({
      winner: "agents",
      reason: guessMode === "caught_spy_guess" ? text.reasons.caughtSpyWrongGuess : text.reasons.freeSpyWrongGuess,
    });
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
        if (gainsPoint) {
          next[player.id] = (next[player.id] ?? 0) + 1;
        } else {
          next[player.id] = next[player.id] ?? 0;
        }
      }
      return next;
    });
  }

  function endToSetup() {
    setPhase("setup");
    setRound(null);
    setRoundResult(null);
    setShowCard(false);
  }

  function revealNow() {
    finishRound({
      winner: "agents",
      reason: text.reasons.manualEnd,
    });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <h1>{text.appName}</h1>
        <p className="muted">{text.subtitle}</p>
        <label className="search">
          <span>Search</span>
          <input value="spion" readOnly />
        </label>
        <div className="nav-group">
          <p className="nav-title">{text.navSectionA}</p>
          {text.sidebarA.map((item) => (
            <button key={item} type="button" className="nav-item">
              {item}
            </button>
          ))}
        </div>
        <div className="nav-group">
          <p className="nav-title">{text.navSectionB}</p>
          {text.sidebarB.map((item) => (
            <button key={item} type="button" className="nav-item">
              {item}
            </button>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-links">
            {text.navTop.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <label className="lang-switch">
            <span>{text.languageLabel}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              <option value="nb">{text.norwegian}</option>
              <option value="en">{text.english}</option>
            </select>
          </label>
        </header>

        <section className="panel">
          {phase === "setup" && (
            <section className="stack">
              <div className="card">
                <h2>{text.players}</h2>
                <p className="muted">{text.playersHelp}</p>
                <div className="stack compact">
                  {players.map((player) => (
                    <div className="row" key={player.id}>
                      <input
                        aria-label={`${text.nameFor} ${player.name}`}
                        value={player.name}
                        onChange={(event) => updatePlayerName(player.id, event.target.value)}
                      />
                      <button type="button" className="ghost" onClick={() => removePlayer(player.id)}>
                        {text.remove}
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="ghost" onClick={addPlayer}>
                  {text.addPlayer}
                </button>
              </div>

              <div className="card">
                <h2>{text.setup}</h2>
                <div className="form-grid">
                  <label>
                    <span>{text.spiesCount}</span>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, players.length - 1)}
                      value={spyCount}
                      onChange={(event) => setSpyCount(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>{text.roundMinutes}</span>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={roundMinutes}
                      onChange={(event) => setRoundMinutes(Number(event.target.value))}
                    />
                  </label>
                </div>
              </div>

              <div className="card">
                <h2>{text.locationPacks}</h2>
                <div className="chips">
                  {PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      className={selectedPackIds.includes(pack.id) ? "chip active" : "chip"}
                      onClick={() => togglePack(pack.id)}
                    >
                      {pack.name[locale]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2>{text.scoreboard}</h2>
                <div className="score-grid">
                  {players.map((player) => (
                    <div key={player.id} className="score-item">
                      <span>{player.name}</span>
                      <strong>{scores[player.id] ?? 0}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" className="primary" disabled={!canStartGame} onClick={startRound}>
                {text.startRound}
              </button>
            </section>
          )}

          {phase === "deal" && round && (
            <section className="stack">
              <div className="card big-card">
                <p className="eyebrow">
                  {text.step} {revealIndex + 1} {text.of} {round.players.length}
                </p>
                <h2>{round.players[revealIndex].name}</h2>
                {!showCard && <p>{text.revealPrompt}</p>}
                {showCard && (
                  <div
                    className={
                      round.assignments[round.players[revealIndex].id].isSpy
                        ? "identity-card identity-card--spy"
                        : "identity-card identity-card--agent"
                    }
                  >
                    {round.assignments[round.players[revealIndex].id].isSpy ? (
                      <>
                        <p className="identity-title">{text.identitySpy}</p>
                        <p>{text.spyInstruction}</p>
                      </>
                    ) : (
                      <>
                        <p className="identity-title">{text.identityAgent}</p>
                        <p>{text.agentInstruction}</p>
                        <p>
                          {text.location}: <strong>{round.location.name}</strong>
                        </p>
                      </>
                    )}
                  </div>
                )}
                <div className="actions">
                  {!showCard && (
                    <button type="button" className="primary" onClick={() => setShowCard(true)}>
                      {text.showCard}
                    </button>
                  )}
                  {showCard && (
                    <button type="button" className="primary" onClick={goToNextReveal}>
                      {text.hideAndPass}
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {phase === "discussion" && round && (
            <section className="stack">
              <div className="card">
                <p className="eyebrow">{text.discussion}</p>
                <h2 className="timer">{formatSeconds(remainingSeconds)}</h2>
                <p>{text.discussionInstruction}</p>
                <div className="hint-box">
                  <p className="muted">{text.hintLabel}</p>
                  <strong>{hint}</strong>
                  <button type="button" className="ghost" onClick={() => setHintIndex(randomIndex(hints.length))}>
                    {text.newHint}
                  </button>
                </div>
                <div className="actions">
                  <button type="button" className="primary" onClick={startVoting}>
                    {text.startVote}
                  </button>
                  <button type="button" className="ghost" onClick={openSpyGuessFromDiscussion}>
                    {text.spyGuessAction}
                  </button>
                  <button type="button" className="ghost danger" onClick={revealNow}>
                    {text.endRound}
                  </button>
                </div>
              </div>
            </section>
          )}

          {phase === "vote" && round && (
            <section className="stack">
              <div className="card big-card">
                <p className="eyebrow">
                  {text.votePhase} {text.voteStep} {voteIndex + 1} {text.of} {round.players.length}
                </p>
                <h2>
                  {text.phoneWith} {round.players[voteIndex].name}
                </h2>
                <p className="muted">{text.voteInstruction}</p>
                <div className="chips vertical">
                  {round.players
                    .filter((player) => player.id !== round.players[voteIndex].id)
                    .map((player) => (
                      <button key={player.id} type="button" className="chip" onClick={() => castVote(player.id)}>
                        {player.name}
                      </button>
                    ))}
                </div>
              </div>
            </section>
          )}

          {phase === "spy_guess" && round && (
            <section className="stack">
              <div className="card big-card">
                <p className="eyebrow">{guessMode === "caught_spy_guess" ? text.lastChance : text.spyGuessTitle}</p>
                <h2>{text.guessLocation}</h2>
                {round.spyIds.length > 1 && guessMode === "free_guess" && (
                  <label>
                    <span>{text.whichSpyGuesses}</span>
                    <select value={guessingSpyId} onChange={(event) => setGuessingSpyId(event.target.value)}>
                      {round.spyIds.map((id) => (
                        <option key={id} value={id}>
                          {playersById[id]?.name ?? id}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <input
                  value={spyGuess}
                  onChange={(event) => setSpyGuess(event.target.value)}
                  placeholder={text.guessPlaceholder}
                />
                <div className="actions">
                  <button type="button" className="primary" onClick={submitSpyGuess}>
                    {text.submitGuess}
                  </button>
                  {guessMode === "free_guess" && (
                    <button type="button" className="ghost" onClick={() => setPhase("discussion")}>
                      {text.backToDiscussion}
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {phase === "result" && round && roundResult && (
            <section className="stack">
              <div className="card">
                <p className="eyebrow">{text.result}</p>
                <h2>{roundResult.winner === "spies" ? text.spiesWon : text.agentsWon}</h2>
                <p>{roundResult.reason}</p>
                <p>
                  {text.location}: <strong>{round.location.name}</strong>
                </p>
                <div className="score-grid">
                  {round.players.map((player) => {
                    const assignment = round.assignments[player.id];
                    return (
                      <div className="score-item" key={player.id}>
                        <span>
                          {player.name}{" "}
                          <strong className={assignment.isSpy ? "pill pill-spy" : "pill pill-agent"}>
                            {assignment.isSpy ? text.spyShort : text.agentShort}
                          </strong>
                        </span>
                        <strong>{scores[player.id] ?? 0}</strong>
                      </div>
                    );
                  })}
                </div>
                <div className="actions">
                  <button type="button" className="primary" onClick={startRound}>
                    {text.newRound}
                  </button>
                  <button type="button" className="ghost" onClick={endToSetup}>
                    {text.toSetup}
                  </button>
                </div>
              </div>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}
