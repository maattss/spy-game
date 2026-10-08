import { useEffect, useState } from "react";
import { ArrowRight, Check, Fingerprint, Hand, MapPin, Plus, Radar, RotateCcw, ScrollText, Sliders, UserRound, VenetianMask, X } from "lucide-react";
import { PACKS } from "../../content";
import type { AppText } from "../../copy";
import type { Locale, Player, RoundState } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

type DisplayNameFn = (name: string, index: number) => string;
type PlaceholderFn = (index: number) => string;

const relativeStep = (currentIndex: number, starterIndex: number, totalPlayers: number) =>
  ((currentIndex - starterIndex + totalPlayers) % totalPlayers) + 1;

function CardHead({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <CardHeader>
      <span className="card-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="card-headings">
        <CardTitle>{title}</CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
      </div>
    </CardHeader>
  );
}

type SetupSectionProps = {
  text: AppText;
  locale: Locale;
  players: Player[];
  selectedPackIds: string[];
  spyCount: number;
  canStartGame: boolean;
  minPlayerCount: number;
  maxPlayerCount: number;
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
  minPlayerCount,
  maxPlayerCount,
  onUpdatePlayerName,
  onRemovePlayer,
  onAddPlayer,
  onSetSpyCount,
  onTogglePack,
  onStartRound,
  displayPlayerName,
  playerPlaceholder,
}: SetupSectionProps) {
  const maxSpyCount = Math.max(1, players.length - 1);
  const spyOptions = Array.from({ length: maxSpyCount }, (_, index) => index + 1);

  return (
    <div className="phase phase--setup">
      <Card className="rules-card">
        <CardHead icon={<ScrollText size={17} />} title={text.howToPlay} />
        <CardContent>
          <ol className="rules">
            <li>{text.ruleDeal}</li>
            <li>{text.ruleSecret}</li>
            <li>{text.ruleTalk}</li>
            <li>{text.rulePoint}</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="players-card">
        <CardHead icon={<UserRound size={17} />} title={text.players} hint={text.playerCountHint} />
        <CardContent>
          <div className="roster">
            {players.map((player, index) => (
              <div className="roster__row" key={player.id}>
                <span className="roster__index" aria-hidden="true">
                  {index + 1}
                </span>
                <Input
                  aria-label={`${text.nameFor} ${displayPlayerName(player.name, index)}`}
                  value={player.name}
                  placeholder={playerPlaceholder(index)}
                  autoComplete="off"
                  onChange={(event) => onUpdatePlayerName(player.id, event.target.value)}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="quiet"
                  className="roster__remove"
                  disabled={players.length <= minPlayerCount}
                  aria-label={`${text.remove} ${displayPlayerName(player.name, index)}`}
                  onClick={() => onRemovePlayer(player.id)}
                >
                  <X size={15} />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="full"
            disabled={players.length >= maxPlayerCount}
            onClick={onAddPlayer}
          >
            <Plus size={16} />
            {text.addPlayer}
          </Button>
        </CardContent>
      </Card>

      <Card className="spies-card">
        <CardHead icon={<Sliders size={17} />} title={text.spiesCount} hint={text.spyCountHint} />
        <CardContent>
          <div className="segmented" role="group" aria-label={text.spiesCount}>
            {spyOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`segmented__option ${option === spyCount ? "is-active" : ""}`}
                aria-pressed={option === spyCount}
                aria-label={`${text.spyCountOption} ${option}`}
                onClick={() => onSetSpyCount(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="packs-card">
        <CardHead icon={<MapPin size={17} />} title={text.locationPacks} />
        <CardContent>
          <div className="packs">
            {PACKS.map((pack) => {
              const isSelected = selectedPackIds.includes(pack.id);
              return (
                <button
                  key={pack.id}
                  type="button"
                  className={`pack ${isSelected ? "is-active" : ""}`}
                  aria-pressed={isSelected}
                  aria-label={pack.name[locale]}
                  onClick={() => onTogglePack(pack.id)}
                >
                  <span className="pack__emoji" aria-hidden="true">
                    {pack.emoji}
                  </span>
                  <span className="pack__check" aria-hidden="true">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="pack__name">{pack.name[locale]}</span>
                  <span className="pack__count">{text.locationsCount(pack.locations.length)}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="action-bar">
        <Button type="button" size="full" className="cta" disabled={!canStartGame} onClick={onStartRound}>
          {text.startRound}
          <ArrowRight size={17} />
        </Button>
      </div>
    </div>
  );
}

type DealSectionProps = {
  text: AppText;
  locale: Locale;
  round: RoundState;
  revealIndex: number;
  showCard: boolean;
  revealPlayerName: string;
  isSpy: boolean;
  missionLabel: string;
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
  missionLabel,
  onShowCard,
  onNextReveal,
}: DealSectionProps) {
  const totalPlayers = round.players.length;
  const step = relativeStep(revealIndex, round.starterPlayerIndex, totalPlayers);

  return (
    <div className="phase phase--deal">
      <div className="progress" role="img" aria-label={text.playerStep(step, totalPlayers)}>
        {Array.from({ length: totalPlayers }, (_, index) => (
          <span
            key={index}
            className={`progress__dot ${index + 1 < step ? "is-done" : ""} ${index + 1 === step ? "is-current" : ""}`}
          />
        ))}
      </div>

      <div className="deal__meta">
        <p className="kicker">{text.passPhoneTo}</p>
        <h2 className="deal__name">{revealPlayerName}</h2>
      </div>

      <div className={`flip ${showCard ? "is-flipped" : ""}`}>
        <div className="flip__inner">
          <button
            type="button"
            className="flip__face flip__face--front"
            onClick={onShowCard}
            tabIndex={showCard ? -1 : 0}
            aria-hidden={showCard}
          >
            <span className="dossier__top" aria-hidden="true">
              <span>{missionLabel}</span>
              <span>
                {step}/{totalPlayers}
              </span>
            </span>
            <span className="dossier__stamp" aria-hidden="true">
              {text.classified}
            </span>
            <span className="flip__seal" aria-hidden="true">
              <Fingerprint size={34} strokeWidth={1.6} />
            </span>
            <span className="flip__cta">{text.tapToReveal}</span>
            <span className="flip__note">{text.keepItHidden}</span>
            <span className="dossier__redacted" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          {/* Rendered only while revealed: the back face stays visible during the flip-back,
              so keeping it filled would leak the next player's role to the current holder. */}
          <div
            className={`flip__face flip__face--back ${showCard ? (isSpy ? "is-spy" : "is-agent") : ""}`}
            aria-hidden={!showCard}
          >
            {showCard && (
              <>
                <span className="role__icon" aria-hidden="true">
                  {isSpy ? <VenetianMask size={30} /> : <Radar size={30} />}
                </span>
                <p className="role" data-text={isSpy ? text.youAreSpy : text.youAreAgent}>
                  {isSpy ? text.youAreSpy : text.youAreAgent}
                </p>
                {isSpy ? (
                  <p className="role__location role__location--unknown" aria-hidden="true">
                    ???
                  </p>
                ) : (
                  <>
                    <p className="role__label">{text.location}</p>
                    <p className="role__location">{round.location.name[locale]}</p>
                  </>
                )}
                <p className="role__note">{isSpy ? text.spyInstruction : text.agentInstruction}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="action-bar">
        <Button type="button" size="full" disabled={!showCard} onClick={onNextReveal}>
          {text.hideAndPass}
          <ArrowRight size={17} />
        </Button>
      </div>
    </div>
  );
}

type PointSectionProps = {
  text: AppText;
  onTick: (pattern: number | number[]) => void;
  onShowResult: () => void;
};

const COUNTDOWN_START = 3;
const COUNTDOWN_STEP_MS = 900;

export function PointSection({ text, onTick, onShowResult }: PointSectionProps) {
  // null = not started, 3..1 = counting, 0 = point now
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (count === null || count === 0) {
      return;
    }
    const timeout = window.setTimeout(() => setCount(count - 1), COUNTDOWN_STEP_MS);
    return () => window.clearTimeout(timeout);
  }, [count]);

  useEffect(() => {
    if (count === null) {
      return;
    }
    onTick(count === 0 ? [80, 60, 160] : 40);
  }, [count, onTick]);

  const isCounting = count !== null && count > 0;
  const isDone = count === 0;

  return (
    <div className="phase phase--point">
      <div className="point">
        {count === null ? (
          <>
            <span className="point__icon" aria-hidden="true">
              <Hand size={34} />
            </span>
            <p className="kicker">{text.pointKicker}</p>
            <h2 className="point__title">{text.pointTitle}</h2>
            <p className="point__instruction">{text.pointInstruction}</p>
          </>
        ) : (
          <div className={`countdown ${isDone ? "is-done" : ""}`} aria-live="assertive">
            <span className="countdown__ring" aria-hidden="true" />
            <span className="countdown__value" key={count}>
              {isDone ? text.pointNow : count}
            </span>
          </div>
        )}
      </div>

      <div className="action-bar">
        {isDone ? (
          <Button type="button" size="full" className="cta" onClick={onShowResult}>
            {text.showResult}
            <ArrowRight size={17} />
          </Button>
        ) : (
          <>
            <Button
              type="button"
              size="full"
              className="cta"
              disabled={isCounting}
              onClick={() => setCount(COUNTDOWN_START)}
            >
              <Hand size={17} />
              {text.startCountdown}
            </Button>
            <Button type="button" variant="quiet" size="full" disabled={isCounting} onClick={onShowResult}>
              {text.showResult}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

type ResultSectionProps = {
  text: AppText;
  locale: Locale;
  round: RoundState;
  onNewRound: () => void;
  onBackToSetup: () => void;
  displayPlayerName: DisplayNameFn;
};

export function ResultSection({ text, locale, round, onNewRound, onBackToSetup, displayPlayerName }: ResultSectionProps) {
  const spyNames = round.players.flatMap((player, index) =>
    round.assignments[player.id]?.isSpy ? [displayPlayerName(player.name, index)] : [],
  );

  const spyLabel = spyNames.length === 1 ? text.spyWas : text.spiesWere;
  const joinedSpyNames =
    spyNames.length <= 1
      ? spyNames.join("")
      : `${spyNames.slice(0, -1).join(", ")} ${text.and} ${spyNames[spyNames.length - 1]}`;

  return (
    <div className="phase phase--result">
      <div className="reveal">
        <span className="reveal__stamp" aria-hidden="true">
          {text.exposed}
        </span>
        <p className="kicker">{text.resultKicker}</p>
        <p className="reveal__label">{text.location}</p>
        <h2 className="reveal__location">{round.location.name[locale]}</h2>
        <p className="reveal__spies">
          <span className="reveal__spies-label">{spyLabel}</span>
          <strong>
            <VenetianMask size={20} aria-hidden="true" />
            {joinedSpyNames}
          </strong>
        </p>
      </div>

      <div className="roles">
        {round.players.map((player, index) => {
          const isSpy = round.assignments[player.id]?.isSpy ?? false;
          return (
            <div
              className={`roles__row ${isSpy ? "is-spy" : "is-agent"}`}
              key={player.id}
              style={{ animationDelay: `${300 + index * 60}ms` }}
            >
              <span className="roles__icon" aria-hidden="true">
                {isSpy ? <VenetianMask size={15} /> : <Radar size={15} />}
              </span>
              <span className="roles__name">{displayPlayerName(player.name, index)}</span>
              <span className="roles__tag">{isSpy ? text.spyShort : text.agentShort}</span>
            </div>
          );
        })}
      </div>

      <div className="action-bar action-bar--split">
        <Button type="button" size="full" className="cta" onClick={onNewRound}>
          <RotateCcw size={16} />
          {text.newRound}
        </Button>
        <Button type="button" variant="ghost" size="full" onClick={onBackToSetup}>
          {text.toSetup}
        </Button>
      </div>
    </div>
  );
}
