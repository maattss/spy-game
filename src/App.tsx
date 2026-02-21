import { useEffect, useMemo, useState } from "react";
import { Languages, Repeat2 } from "lucide-react";
import { HINT_QUESTIONS, PACKS } from "./content";
import { createRound, normalizeValue } from "./game";
import type { GamePhase, GuessMode, Locale, Player, RoundResult, RoundState } from "./types";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

const DEFAULT_PLAYERS = ["Spiller 1", "Spiller 2", "Spiller 3", "Spiller 4"];
const ROUND_DURATION_SECONDS = 8 * 60;

const TEXT = {
  nb: {
    languageLabel: "Sprak",
    norwegian: "Norsk",
    english: "Engelsk",
    players: "Spillere",
    playersHelp: "3-12 spillere. Telefonen sendes videre mellom hver visning.",
    nameFor: "Navn for",
    remove: "Fjern",
    addPlayer: "+ Legg til spiller",
    setup: "Oppsett",
    spiesCount: "Antall spioner",
    includeRoles: "Bruk roller",
    locationPacks: "Lokasjonspakker",
    scoreboard: "Poengtavle",
    startRound: "Start runde",
    step: "Steg",
    of: "av",
    revealPrompt: "Trykk for a se hemmelig informasjon. Ingen andre skal se skjermen.",
    youAreSpy: "DU ER SPION",
    youAreAgent: "DU ER AGENT",
    spyInstruction: "Spill cool. Still smarte sporsmal. Prov a gjette lokasjonen.",
    location: "Lokasjon",
    role: "Rolle",
    showCard: "Vis kort",
    hideAndPass: "Skjul og gi videre",
    discussion: "Diskusjon",
    discussionInstruction: "Alle stiller sporsmal. Finn spionen uten a avslore lokasjonen.",
    hintLabel: "Hint til neste sporsmal:",
    newHint: "Nytt hint",
    pointAtSuspect: "Pek pa mistenkt",
    pointAtSuspectHelp: "Nar gruppen er enig, pek ut en spiller direkte.",
    spyGuessAction: "Spion gjetter lokasjon",
    endRound: "Avslutt runde",
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
    roleShort: "Rolle",
    reasons: {
      timeout: "Tiden gikk ut. Spionene overlevde runden.",
      wrongVote: (name: string) => `${name} ble pekt ut, men var ikke spion.`,
      spyGuessCorrect: "Spionen gjettet lokasjonen riktig.",
      caughtSpyWrongGuess: "Spionen ble tatt og gjettet feil.",
      freeSpyWrongGuess: "Spionen gjettet feil lokasjon.",
      manualEnd: "Runden ble avsluttet manuelt.",
    },
  },
  en: {
    languageLabel: "Language",
    norwegian: "Norwegian",
    english: "English",
    players: "Players",
    playersHelp: "3-12 players. Pass the phone between each reveal.",
    nameFor: "Name for",
    remove: "Remove",
    addPlayer: "+ Add player",
    setup: "Setup",
    spiesCount: "Number of spies",
    includeRoles: "Use roles",
    locationPacks: "Location packs",
    scoreboard: "Scoreboard",
    startRound: "Start round",
    step: "Step",
    of: "of",
    revealPrompt: "Tap to see your secret information. No one else should look.",
    youAreSpy: "YOU ARE THE SPY",
    youAreAgent: "YOU ARE AN AGENT",
    spyInstruction: "Stay calm. Ask smart questions. Try to guess the location.",
    location: "Location",
    role: "Role",
    showCard: "Show card",
    hideAndPass: "Hide and pass",
    discussion: "Discussion",
    discussionInstruction: "Ask questions. Find the spy without exposing the location.",
    hintLabel: "Hint for the next question:",
    newHint: "New hint",
    pointAtSuspect: "Point at suspect",
    pointAtSuspectHelp: "When your group agrees, point directly at one player.",
    spyGuessAction: "Spy guesses location",
    endRound: "End round",
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
    roleShort: "Role",
    reasons: {
      timeout: "Time ran out. The spies survived the round.",
      wrongVote: (name: string) => `${name} was pointed out, but was not a spy.`,
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

  const text = TEXT[locale];
  const hints = HINT_QUESTIONS[locale];
  const hint = hints[hintIndex % hints.length];

  const playersById = useMemo(() => {
    return Object.fromEntries(players.map((player) => [player.id, player]));
  }, [players]);

  const canStartGame = players.length >= 3 && selectedPackIds.length > 0 && spyCount >= 1 && spyCount < players.length;

  function toggleLocale() {
    setLocale((current) => (current === "nb" ? "en" : "nb"));
  }

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
      durationSeconds: ROUND_DURATION_SECONDS,
      includeRoles,
    });
    setRound(createdRound);
    setPhase("deal");
    setRoundResult(null);
    setRevealIndex(0);
    setShowCard(false);
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

  function accusePlayer(targetId: string) {
    if (!round) {
      return;
    }
    const assignment = round.assignments[targetId];
    if (assignment.isSpy) {
      setGuessMode("caught_spy_guess");
      setGuessingSpyId(targetId);
      setPhase("spy_guess");
      setSpyGuess("");
      return;
    }
    finishRound({
      winner: "spies",
      reason:
        text.reasons.wrongVote(playersById[targetId]?.name ?? (locale === "nb" ? "Ukjent spiller" : "Unknown player")),
    });
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
      <section className="app-frame">
        <header className="app-header">
          <div>
            <p className="kicker">Spy party</p>
            <h1 className="app-title">Spionspillet</h1>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="locale-toggle"
            onClick={toggleLocale}
            aria-label={`${text.languageLabel}: ${locale === "nb" ? text.english : text.norwegian}`}
          >
            <Languages size={16} />
            <span className="locale-toggle__current">{locale === "nb" ? text.norwegian : text.english}</span>
            <Repeat2 size={14} />
            <span className="locale-toggle__next">{locale === "nb" ? text.english : text.norwegian}</span>
          </Button>
        </header>

        {phase === "setup" && (
          <section className="phase-stack phase-stack--setup">
            <Card>
              <CardHeader>
                <CardTitle>{text.players}</CardTitle>
                <CardDescription>{text.playersHelp}</CardDescription>
              </CardHeader>
              <CardContent className="stack-tight">
                {players.map((player) => (
                  <div className="player-row" key={player.id}>
                    <Input
                      aria-label={`${text.nameFor} ${player.name}`}
                      value={player.name}
                      onChange={(event) => updatePlayerName(player.id, event.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={() => removePlayer(player.id)}>
                      {text.remove}
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addPlayer}>
                  {text.addPlayer}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{text.setup}</CardTitle>
              </CardHeader>
              <CardContent className="form-grid">
                <Label className="field">
                  <span>{text.spiesCount}</span>
                  <Input
                    type="number"
                    min={1}
                    max={Math.max(1, players.length - 1)}
                    value={spyCount}
                    onChange={(event) => setSpyCount(Number(event.target.value))}
                  />
                </Label>
                <Label className="check-row">
                  <Checkbox checked={includeRoles} onCheckedChange={(checked) => setIncludeRoles(checked === true)} />
                  <span>{text.includeRoles}</span>
                </Label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{text.locationPacks}</CardTitle>
              </CardHeader>
              <CardContent className="chip-grid">
                {PACKS.map((pack) => (
                  <Button
                    key={pack.id}
                    type="button"
                    variant={selectedPackIds.includes(pack.id) ? "chipActive" : "chip"}
                    onClick={() => togglePack(pack.id)}
                  >
                    {pack.name[locale]}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{text.scoreboard}</CardTitle>
              </CardHeader>
              <CardContent className="score-grid">
                {players.map((player) => (
                  <div key={player.id} className="score-row">
                    <span>{player.name}</span>
                    <strong>{scores[player.id] ?? 0}</strong>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button type="button" size="full" disabled={!canStartGame} onClick={startRound}>
              {text.startRound}
            </Button>
          </section>
        )}

        {phase === "deal" && round && (
          <section className="phase-stack">
            <Card className="stage-card">
              <CardHeader>
                <p className="kicker">
                  {text.step} {revealIndex + 1} {text.of} {round.players.length}
                </p>
                <CardTitle>{round.players[revealIndex].name}</CardTitle>
                {!showCard && <CardDescription>{text.revealPrompt}</CardDescription>}
              </CardHeader>
              <CardContent>
                {showCard && (
                  <div className="reveal-box">
                    {round.assignments[round.players[revealIndex].id].isSpy ? (
                      <>
                        <Badge variant="danger">{text.youAreSpy}</Badge>
                        <p>{text.spyInstruction}</p>
                      </>
                    ) : (
                      <>
                        <Badge variant="success">{text.youAreAgent}</Badge>
                        <p>
                          {text.location}: <strong>{round.location.name}</strong>
                        </p>
                        <p>
                          {text.role}: <strong>{round.assignments[round.players[revealIndex].id].role}</strong>
                        </p>
                      </>
                    )}
                  </div>
                )}
                <div className="action-row">
                  {!showCard && (
                    <Button type="button" size="full" onClick={() => setShowCard(true)}>
                      {text.showCard}
                    </Button>
                  )}
                  {showCard && (
                    <Button type="button" size="full" onClick={goToNextReveal}>
                      {text.hideAndPass}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {phase === "discussion" && round && (
          <section className="phase-stack">
            <Card>
              <CardHeader>
                <p className="kicker">{text.discussion}</p>
                <h2 className="timer">{formatSeconds(remainingSeconds)}</h2>
                <CardDescription>{text.discussionInstruction}</CardDescription>
              </CardHeader>
              <CardContent className="stack-tight">
                <div className="hint-box">
                  <p className="muted">{text.hintLabel}</p>
                  <strong>{hint}</strong>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setHintIndex(randomIndex(hints.length))}>
                    {text.newHint}
                  </Button>
                </div>

                <div className="action-grid">
                  <Button type="button" variant="outline" onClick={openSpyGuessFromDiscussion}>
                    {text.spyGuessAction}
                  </Button>
                  <Button type="button" variant="danger" onClick={revealNow}>
                    {text.endRound}
                  </Button>
                </div>

                <p className="muted">{text.pointAtSuspectHelp}</p>
                <p className="kicker">{text.pointAtSuspect}</p>
                <div className="chip-grid chip-grid--large">
                  {round.players.map((player) => (
                    <Button key={player.id} type="button" variant="chip" onClick={() => accusePlayer(player.id)}>
                      {player.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {phase === "spy_guess" && round && (
          <section className="phase-stack">
            <Card className="stage-card">
              <CardHeader>
                <p className="kicker">{guessMode === "caught_spy_guess" ? text.lastChance : text.spyGuessTitle}</p>
                <CardTitle>{text.guessLocation}</CardTitle>
              </CardHeader>
              <CardContent className="stack-tight">
                {round.spyIds.length > 1 && guessMode === "free_guess" && (
                  <Label className="field">
                    <span>{text.whichSpyGuesses}</span>
                    <Select value={guessingSpyId} onValueChange={setGuessingSpyId}>
                      <SelectTrigger>
                        <SelectValue placeholder={text.whichSpyGuesses} />
                      </SelectTrigger>
                      <SelectContent>
                        {round.spyIds.map((id) => (
                          <SelectItem key={id} value={id}>
                            {playersById[id]?.name ?? id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Label>
                )}

                <Input
                  value={spyGuess}
                  onChange={(event) => setSpyGuess(event.target.value)}
                  placeholder={text.guessPlaceholder}
                />

                <div className="action-grid">
                  <Button type="button" onClick={submitSpyGuess}>
                    {text.submitGuess}
                  </Button>
                  {guessMode === "free_guess" && (
                    <Button type="button" variant="outline" onClick={() => setPhase("discussion")}>
                      {text.backToDiscussion}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {phase === "result" && round && roundResult && (
          <section className="phase-stack">
            <Card>
              <CardHeader>
                <p className="kicker">{text.result}</p>
                <CardTitle>{roundResult.winner === "spies" ? text.spiesWon : text.agentsWon}</CardTitle>
                <CardDescription>{roundResult.reason}</CardDescription>
              </CardHeader>
              <CardContent className="stack-tight">
                <p>
                  {text.location}: <strong>{round.location.name}</strong>
                </p>

                <div className="score-grid">
                  {round.players.map((player) => {
                    const assignment = round.assignments[player.id];
                    return (
                      <div className="score-row" key={player.id}>
                        <span>
                          {player.name} {assignment.isSpy ? `(${text.spyShort})` : `(${text.roleShort}: ${assignment.role})`}
                        </span>
                        <strong>{scores[player.id] ?? 0}</strong>
                      </div>
                    );
                  })}
                </div>

                <div className="action-grid">
                  <Button type="button" onClick={startRound}>
                    {text.newRound}
                  </Button>
                  <Button type="button" variant="outline" onClick={endToSetup}>
                    {text.toSetup}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </section>
    </main>
  );
}
