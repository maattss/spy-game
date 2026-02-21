import { PACKS } from "../../content";
import type { AppText } from "../../copy";
import type { GuessMode, Player, RoundResult, RoundState } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { X } from "lucide-react";

type DisplayNameFn = (name: string, index: number) => string;
type PlaceholderFn = (index: number) => string;

type SetupSectionProps = {
  text: AppText;
  locale: "nb" | "en";
  players: Player[];
  scores: Record<string, number>;
  selectedPackIds: string[];
  spyCount: number;
  includeRoles: boolean;
  canStartGame: boolean;
  onUpdatePlayerName: (id: string, name: string) => void;
  onRemovePlayer: (id: string) => void;
  onAddPlayer: () => void;
  onSetSpyCount: (value: number) => void;
  onSetIncludeRoles: (value: boolean) => void;
  onTogglePack: (id: string) => void;
  onStartRound: () => void;
  displayPlayerName: DisplayNameFn;
  playerPlaceholder: PlaceholderFn;
};

export function SetupSection({
  text,
  locale,
  players,
  scores,
  selectedPackIds,
  spyCount,
  includeRoles,
  canStartGame,
  onUpdatePlayerName,
  onRemovePlayer,
  onAddPlayer,
  onSetSpyCount,
  onSetIncludeRoles,
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
          <CardDescription>{text.playersIntro}</CardDescription>
        </CardHeader>
        <CardContent className="stack-tight">
          <div className="rules-box" aria-label={text.rulesTitle}>
            <p className="rules-box__title">{text.rulesTitle}</p>
            <ul className="rules-list">
              <li>{text.rulePlayerCount}</li>
              <li>{text.rulePassPhone}</li>
              <li>{text.ruleNoPeeking}</li>
              <li>{text.ruleDiscussion}</li>
            </ul>
          </div>

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
              onChange={(event) => onSetSpyCount(Number(event.target.value))}
            />
          </Label>
          <Label className="check-row">
            <Checkbox checked={includeRoles} onCheckedChange={(checked) => onSetIncludeRoles(checked === true)} />
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
              onClick={() => onTogglePack(pack.id)}
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
          {players.map((player, index) => (
            <div key={player.id} className="score-row">
              <span>{displayPlayerName(player.name, index)}</span>
              <strong>{scores[player.id] ?? 0}</strong>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="button" size="full" disabled={!canStartGame} onClick={onStartRound}>
        {text.startRound}
      </Button>
    </section>
  );
}

type DealSectionProps = {
  text: AppText;
  round: RoundState;
  revealIndex: number;
  showCard: boolean;
  revealPlayerName: string;
  isSpy: boolean;
  role: string;
  onShowCard: () => void;
  onNextReveal: () => void;
};

export function DealSection({
  text,
  round,
  revealIndex,
  showCard,
  revealPlayerName,
  isSpy,
  role,
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
                  <Badge variant="danger">{text.youAreSpy}</Badge>
                  <p className="identity-title identity-title--spy">{text.youAreSpy}</p>
                  <p>{text.spyInstruction}</p>
                </>
              ) : (
                <>
                  <Badge variant="success">{text.youAreAgent}</Badge>
                  <p className="identity-title identity-title--agent">{text.youAreAgent}</p>
                  <p>
                    {text.location}: <strong>{round.location.name}</strong>
                  </p>
                  <p>
                    {text.role}: <strong>{role}</strong>
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

type DiscussionSectionProps = {
  text: AppText;
  round: RoundState;
  formattedTime: string;
  hint: string;
  onNewHint: () => void;
  onAccusePlayer: (id: string) => void;
  onOpenSpyGuess: () => void;
  onEndRound: () => void;
  displayPlayerName: DisplayNameFn;
};

export function DiscussionSection({
  text,
  round,
  formattedTime,
  hint,
  onNewHint,
  onAccusePlayer,
  onOpenSpyGuess,
  onEndRound,
  displayPlayerName,
}: DiscussionSectionProps) {
  return (
    <section className="phase-stack">
      <Card>
        <CardHeader>
          <p className="kicker">{text.discussion}</p>
          <h2 className="timer">{formattedTime}</h2>
          <CardDescription>{text.discussionInstruction}</CardDescription>
        </CardHeader>

        <CardContent className="stack-tight">
          <div className="hint-box">
            <p className="muted">{text.hintLabel}</p>
            <strong>{hint}</strong>
            <Button type="button" variant="secondary" size="sm" onClick={onNewHint}>
              {text.newHint}
            </Button>
          </div>

          <p className="muted">{text.pointAtSuspectHelp}</p>
          <p className="kicker">{text.pointAtSuspect}</p>
          <div className="chip-grid chip-grid--large">
            {round.players.map((player, index) => (
              <Button key={player.id} type="button" variant="chip" onClick={() => onAccusePlayer(player.id)}>
                {displayPlayerName(player.name, index)}
              </Button>
            ))}
          </div>

          <div className="utility-actions">
            <Button type="button" variant="outline" size="sm" onClick={onOpenSpyGuess}>
              {text.spyGuessAction}
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={onEndRound}>
              {text.endRound}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type SpyGuessSectionProps = {
  text: AppText;
  round: RoundState;
  guessMode: GuessMode;
  guessingSpyId: string;
  spyGuess: string;
  roundPlayerIndexById: Record<string, number>;
  onSetGuessingSpyId: (value: string) => void;
  onSetSpyGuess: (value: string) => void;
  onSubmitGuess: () => void;
  onBackToDiscussion: () => void;
  displayPlayerName: DisplayNameFn;
};

export function SpyGuessSection({
  text,
  round,
  guessMode,
  guessingSpyId,
  spyGuess,
  roundPlayerIndexById,
  onSetGuessingSpyId,
  onSetSpyGuess,
  onSubmitGuess,
  onBackToDiscussion,
  displayPlayerName,
}: SpyGuessSectionProps) {
  return (
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
              <Select value={guessingSpyId} onValueChange={onSetGuessingSpyId}>
                <SelectTrigger>
                  <SelectValue placeholder={text.whichSpyGuesses} />
                </SelectTrigger>
                <SelectContent>
                  {round.spyIds.map((id) => {
                    const playerIndex = roundPlayerIndexById[id] ?? 0;
                    const playerName = round.players[playerIndex]?.name ?? "";
                    return (
                      <SelectItem key={id} value={id}>
                        {displayPlayerName(playerName, playerIndex)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </Label>
          )}

          <Input value={spyGuess} onChange={(event) => onSetSpyGuess(event.target.value)} placeholder={text.guessPlaceholder} />

          <div className="action-grid">
            <Button type="button" onClick={onSubmitGuess}>
              {text.submitGuess}
            </Button>
            {guessMode === "free_guess" && (
              <Button type="button" variant="outline" onClick={onBackToDiscussion}>
                {text.backToDiscussion}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

type ResultSectionProps = {
  text: AppText;
  round: RoundState;
  roundResult: RoundResult;
  scores: Record<string, number>;
  onNewRound: () => void;
  onBackToSetup: () => void;
  displayPlayerName: DisplayNameFn;
};

export function ResultSection({
  text,
  round,
  roundResult,
  scores,
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
            {text.location}: <strong>{round.location.name}</strong>
          </p>

          <div className="score-grid">
            {round.players.map((player, index) => {
              const assignment = round.assignments[player.id];
              return (
                <div className="score-row" key={player.id}>
                  <span>
                    {displayPlayerName(player.name, index)}{" "}
                    {assignment.isSpy ? `(${text.spyShort})` : `(${text.roleShort}: ${assignment.role})`}
                  </span>
                  <strong>{scores[player.id] ?? 0}</strong>
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
