import { Minus, Plus, X } from "lucide-react";
import { PACKS } from "../../content";
import type { AppText } from "../../copy";
import type { Player, RoundResult, RoundState } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

type DisplayNameFn = (name: string, index: number) => string;
type PlaceholderFn = (index: number) => string;
type RelativeStepNumberFn = (currentIndex: number, starterIndex: number, totalPlayers: number) => number;

const getRelativeStepNumber: RelativeStepNumberFn = (currentIndex, starterIndex, totalPlayers) =>
  ((currentIndex - starterIndex + totalPlayers) % totalPlayers) + 1;

type SetupSectionProps = {
  text: AppText;
  locale: "nb" | "en";
  players: Player[];
  selectedPackIds: string[];
  spyCount: number;
  pointVotingEnabled: boolean;
  canStartGame: boolean;
  minPlayerCount: number;
  onUpdatePlayerName: (id: string, name: string) => void;
  onRemovePlayer: (id: string) => void;
  onAddPlayer: () => void;
  onSetSpyCount: (value: number) => void;
  onSetPointVotingEnabled: (value: boolean) => void;
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
  pointVotingEnabled,
  canStartGame,
  minPlayerCount,
  onUpdatePlayerName,
  onRemovePlayer,
  onAddPlayer,
  onSetSpyCount,
  onSetPointVotingEnabled,
  onTogglePack,
  onStartRound,
  displayPlayerName,
  playerPlaceholder,
}: SetupSectionProps) {
  const maxSpyCount = Math.max(1, players.length - 1);
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
                disabled={players.length <= minPlayerCount}
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
            <div className="spy-count-stepper">
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={spyCount <= 1}
                aria-label={text.decreaseSpyCount}
                onClick={() => onSetSpyCount(spyCount - 1)}
              >
                <Minus size={16} />
              </Button>

              <Input
                aria-label={text.spiesCount}
                className="spy-count-input"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={maxSpyCount}
                step={1}
                value={spyCount}
                onChange={(event) => onSetSpyCount(event.target.valueAsNumber)}
              />

              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={spyCount >= maxSpyCount}
                aria-label={text.increaseSpyCount}
                onClick={() => onSetSpyCount(spyCount + 1)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text.voting}</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="check-row">
              <Switch checked={pointVotingEnabled} onCheckedChange={onSetPointVotingEnabled} />
              <span>{text.pointVoting}</span>
            </label>
            {pointVotingEnabled && <p className="muted">{text.manualVotingHint}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text.locationPacks}</CardTitle>
          </CardHeader>
          <CardContent className="chip-grid">
            {PACKS.map((pack) => {
              const isSelected = selectedPackIds.includes(pack.id);
              return (
                <Button
                  key={pack.id}
                  type="button"
                  variant={isSelected ? "chipActive" : "chip"}
                  className="pack-chip"
                  aria-pressed={isSelected}
                  onClick={() => onTogglePack(pack.id)}
                >
                  <span className="pack-chip__emoji" aria-hidden="true">
                    {pack.emoji}
                  </span>
                  <span className="pack-chip__label">{pack.name[locale]}</span>
                </Button>
              );
            })}
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
  const revealStep = getRelativeStepNumber(revealIndex, round.starterPlayerIndex, round.players.length);
  return (
    <section className="phase-stack">
      <Card className={`stage-card ${showCard ? (isSpy ? "stage-card--spy" : "stage-card--agent") : ""}`}>
        <CardHeader>
          <p className="kicker">
            {text.step} {revealStep} {text.of} {round.players.length}
          </p>
          <CardTitle>{revealPlayerName}</CardTitle>
          {!showCard && <CardDescription>{text.revealPrompt}</CardDescription>}
        </CardHeader>

        <CardContent className="stage-card__content">
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

          <div className="action-row stage-card__actions">
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
  activeVoteTargetId: string | null;
  displayPlayerName: DisplayNameFn;
};

export function VoteSection({ text, round, voteIndex, onVote, activeVoteTargetId, displayPlayerName }: VoteSectionProps) {
  const currentVoter = round.players[voteIndex];
  const voteStep = getRelativeStepNumber(voteIndex, round.starterPlayerIndex, round.players.length);
  return (
    <section className="phase-stack">
      <Card>
        <CardHeader>
          <p className="kicker">{text.voting}</p>
          <CardTitle>
            {text.step} {voteStep} {text.of} {round.players.length}
          </CardTitle>
          <CardDescription>{text.votingInstruction}</CardDescription>
        </CardHeader>

        <CardContent className="stack-tight">
          <p aria-live="polite">
            {text.votingTurn}: <strong>{displayPlayerName(currentVoter?.name ?? "", voteIndex)}</strong>
          </p>
          <p className="kicker">{text.votingQuestion}</p>

          <div className="chip-grid chip-grid--large">
            {round.players.map((player, index) => (
              <Button
                key={player.id}
                type="button"
                variant="chip"
                className={`vote-option ${activeVoteTargetId === player.id ? "vote-option--active" : ""}`}
                aria-pressed={activeVoteTargetId === player.id}
                onClick={() => onVote(player.id)}
              >
                {text.voteFor} {displayPlayerName(player.name, index)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type ManualVoteSectionProps = {
  text: AppText;
  onShowResult: () => void;
};

export function ManualVoteSection({ text, onShowResult }: ManualVoteSectionProps) {
  return (
    <section className="phase-stack">
      <Card>
        <CardHeader>
          <p className="kicker">{text.voting}</p>
          <CardTitle>{text.manualVoteTitle}</CardTitle>
          <CardDescription>{text.manualVoteInstruction}</CardDescription>
        </CardHeader>

        <CardContent>
          <Button type="button" size="full" onClick={onShowResult}>
            {text.showResult}
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
  const spyWinnerLabel = round.spyIds.length === 1 ? text.spyWon : text.spiesWon;

  return (
    <section className="phase-stack">
      <Card>
        <CardHeader>
          <p className="kicker">{text.result}</p>
          <CardTitle>
            {roundResult.winner === "spies" ? spyWinnerLabel : roundResult.winner === "agents" ? text.agentsWon : text.manualRound}
          </CardTitle>
          <CardDescription>{roundResult.reason}</CardDescription>
        </CardHeader>

        <CardContent className="stack-tight">
          <p>
            {text.location}: <strong>{round.location.name[locale]}</strong>
          </p>

          <div className="score-grid">
            {round.players.map((player, index) => {
              const assignment = round.assignments[player.id];
              const roleClass = assignment.isSpy ? "score-row--spy" : "score-row--agent";
              return (
                <div className={`score-row ${roleClass}`} key={player.id}>
                  <span>
                    {displayPlayerName(player.name, index)}{" "}
                    <span className="score-row__role">{assignment.isSpy ? `(${text.spyShort})` : `(${text.agentShort})`}</span>
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
