import { X } from "lucide-react";
import { PACKS } from "../../content";
import type { AppText } from "../../copy";
import type { Player, RoundResult, RoundState } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

type DisplayNameFn = (name: string, index: number) => string;
type PlaceholderFn = (index: number) => string;

type SetupSectionProps = {
  text: AppText;
  locale: "nb" | "en";
  players: Player[];
  selectedPackIds: string[];
  spyCount: number;
  canStartGame: boolean;
  onUpdatePlayerName: (id: string, name: string) => void;
  onRemovePlayer: (id: string) => void;
  onAddPlayer: () => void;
  onSetSpyCount: (value: number) => void;
  onTogglePack: (id: string) => void;
  onStartRound: () => void;
  displayPlayerName: DisplayNameFn;
  playerPlaceholder: PlaceholderFn;
};

export function SetupSection({
  text,
  locale,
  players,
  selectedPackIds,
  spyCount,
  canStartGame,
  onUpdatePlayerName,
  onRemovePlayer,
  onAddPlayer,
  onSetSpyCount,
  onTogglePack,
  onStartRound,
  displayPlayerName,
  playerPlaceholder,
}: SetupSectionProps) {
  return (
    <section className="phase-stack phase-stack--setup">
      <Card>
        <CardHeader>
          <CardTitle>{text.players}</CardTitle>
        </CardHeader>
        <CardContent className="stack-tight">
          {players.map((player, index) => (
            <div className="player-row" key={player.id}>
              <Input
                aria-label={`${text.nameFor} ${displayPlayerName(player.name, index)}`}
                value={player.name}
                placeholder={playerPlaceholder(index)}
                onChange={(event) => onUpdatePlayerName(player.id, event.target.value)}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="player-remove"
                disabled={players.length <= 3}
                aria-label={`${text.remove} ${displayPlayerName(player.name, index)}`}
                onClick={() => onRemovePlayer(player.id)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}

          <Button type="button" variant="secondary" onClick={onAddPlayer}>
            {text.addPlayer}
          </Button>
        </CardContent>
      </Card>

      <div className="setup-side-stack">
        <Card className="setup-card">
          <CardHeader className="setup-card__header">
            <CardTitle>{text.spiesCount}</CardTitle>
          </CardHeader>
          <CardContent className="setup-card__content">
            <Input
              aria-label={text.spiesCount}
              type="number"
              min={1}
              max={Math.max(1, players.length - 1)}
              value={spyCount}
              onChange={(event) => onSetSpyCount(event.target.valueAsNumber)}
            />
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
                onClick={() => onTogglePack(pack.id)}
              >
                {pack.name[locale]}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Button type="button" size="full" disabled={!canStartGame} onClick={onStartRound}>
        {text.startRound}
      </Button>
    </section>
  );
}

type DealSectionProps = {
  text: AppText;
  locale: "nb" | "en";
  round: RoundState;
  revealIndex: number;
  showCard: boolean;
  revealPlayerName: string;
  isSpy: boolean;
  onShowCard: () => void;
  onNextReveal: () => void;
};

export function DealSection({
  text,
  locale,
  round,
  revealIndex,
  showCard,
  revealPlayerName,
  isSpy,
  onShowCard,
  onNextReveal,
}: DealSectionProps) {
  return (
    <section className="phase-stack">
      <Card className={`stage-card ${showCard ? (isSpy ? "stage-card--spy" : "stage-card--agent") : ""}`}>
        <CardHeader>
          <p className="kicker">
            {text.step} {revealIndex + 1} {text.of} {round.players.length}
          </p>
          <CardTitle>{revealPlayerName}</CardTitle>
          {!showCard && <CardDescription>{text.revealPrompt}</CardDescription>}
        </CardHeader>

        <CardContent>
          {showCard && (
            <div className="reveal-box">
              {isSpy ? (
                <>
                  <p className="identity-title identity-title--spy">{text.youAreSpy}</p>
                  <p>{text.spyInstruction}</p>
                </>
              ) : (
                <>
                  <p className="identity-title identity-title--agent">{text.youAreAgent}</p>
                  <p>
                    {text.location}: <strong>{round.location.name[locale]}</strong>
                  </p>
                </>
              )}
            </div>
          )}

          <div className="action-row">
            {!showCard && (
              <Button type="button" size="full" onClick={onShowCard}>
                {text.showCard}
              </Button>
            )}
            {showCard && (
              <Button type="button" size="full" onClick={onNextReveal}>
                {text.hideAndPass}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type VoteSectionProps = {
  text: AppText;
  round: RoundState;
  voteIndex: number;
  onVote: (targetId: string) => void;
  displayPlayerName: DisplayNameFn;
};

export function VoteSection({ text, round, voteIndex, onVote, displayPlayerName }: VoteSectionProps) {
  const currentVoter = round.players[voteIndex];
  return (
    <section className="phase-stack">
      <Card>
        <CardHeader>
          <p className="kicker">{text.voting}</p>
          <CardTitle>
            {text.step} {voteIndex + 1} {text.of} {round.players.length}
          </CardTitle>
          <CardDescription>{text.votingInstruction}</CardDescription>
        </CardHeader>

        <CardContent className="stack-tight">
          <p>
            {text.votingTurn}: <strong>{displayPlayerName(currentVoter?.name ?? "", voteIndex)}</strong>
          </p>
          <p className="kicker">{text.votingQuestion}</p>

          <div className="chip-grid chip-grid--large">
            {round.players.map((player, index) => (
              <Button key={player.id} type="button" variant="chip" onClick={() => onVote(player.id)}>
                {text.voteFor} {displayPlayerName(player.name, index)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type SpyGuessSectionProps = {
  text: AppText;
  spyGuess: string;
  onSetSpyGuess: (value: string) => void;
  onSubmitGuess: () => void;
};

export function SpyGuessSection({ text, spyGuess, onSetSpyGuess, onSubmitGuess }: SpyGuessSectionProps) {
  return (
    <section className="phase-stack">
      <Card className="stage-card stage-card--spy">
        <CardHeader>
          <p className="kicker">{text.lastChance}</p>
          <CardTitle>{text.guessLocation}</CardTitle>
        </CardHeader>

        <CardContent className="stack-tight">
          <Input
            aria-label={text.guessLocation}
            value={spyGuess}
            onChange={(event) => onSetSpyGuess(event.target.value)}
            placeholder={text.guessPlaceholder}
          />
          <Button type="button" onClick={onSubmitGuess}>
            {text.submitGuess}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

type ResultSectionProps = {
  text: AppText;
  locale: "nb" | "en";
  round: RoundState;
  roundResult: RoundResult;
  onNewRound: () => void;
  onBackToSetup: () => void;
  displayPlayerName: DisplayNameFn;
};

export function ResultSection({
  text,
  locale,
  round,
  roundResult,
  onNewRound,
  onBackToSetup,
  displayPlayerName,
}: ResultSectionProps) {
  return (
    <section className="phase-stack">
      <Card>
        <CardHeader>
          <p className="kicker">{text.result}</p>
          <CardTitle>{roundResult.winner === "spies" ? text.spiesWon : text.agentsWon}</CardTitle>
          <CardDescription>{roundResult.reason}</CardDescription>
        </CardHeader>

        <CardContent className="stack-tight">
          <p>
            {text.location}: <strong>{round.location.name[locale]}</strong>
          </p>

          <div className="score-grid">
            {round.players.map((player, index) => {
              const assignment = round.assignments[player.id];
              return (
                <div className="score-row" key={player.id}>
                  <span>
                    {displayPlayerName(player.name, index)}{" "}
                    {assignment.isSpy ? `(${text.spyShort})` : `(${text.agentShort})`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="action-grid">
            <Button type="button" onClick={onNewRound}>
              {text.newRound}
            </Button>
            <Button type="button" variant="outline" onClick={onBackToSetup}>
              {text.toSetup}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
