import { ArrowRight, EyeOff, Hand, MapPin, Plus, Radar, RotateCcw, ShieldCheck, Sliders, UserRound, VenetianMask, X } from "lucide-react";
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
        <CardHead icon={<ShieldCheck size={17} />} title={text.howToPlay} />
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
                  <span className="pack__name">{pack.name[locale]}</span>
                  <span className="pack__count">{text.locationsCount(pack.locations.length)}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="action-bar">
        <Button type="button" size="full" disabled={!canStartGame} onClick={onStartRound}>
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
            <span className="flip__seal" aria-hidden="true">
              <EyeOff size={28} />
            </span>
            <span className="flip__cta">{text.tapToReveal}</span>
            <span className="flip__note">{text.keepItHidden}</span>
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
                  {isSpy ? <VenetianMask size={26} /> : <Radar size={26} />}
                </span>
                <p className="role">{isSpy ? text.youAreSpy : text.youAreAgent}</p>
                {isSpy ? (
                  <p className="role__note">{text.spyInstruction}</p>
                ) : (
                  <>
                    <p className="role__label">{text.location}</p>
                    <p className="role__location">{round.location.name[locale]}</p>
                    <p className="role__note">{text.agentInstruction}</p>
                  </>
                )}
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
  onShowResult: () => void;
};

export function PointSection({ text, onShowResult }: PointSectionProps) {
  return (
    <div className="phase phase--point">
      <div className="point">
        <span className="point__icon" aria-hidden="true">
          <Hand size={32} />
        </span>
        <p className="kicker">{text.pointKicker}</p>
        <h2 className="point__title">{text.pointTitle}</h2>
        <p className="point__instruction">{text.pointInstruction}</p>
        <p className="point__countdown">{text.pointCountdown}</p>
      </div>

      <div className="action-bar">
        <Button type="button" size="full" onClick={onShowResult}>
          {text.showResult}
        </Button>
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
        <p className="kicker">{text.resultKicker}</p>
        <p className="reveal__label">{text.location}</p>
        <h2 className="reveal__location">{round.location.name[locale]}</h2>
        <p className="reveal__spies">
          {spyLabel} <strong>{joinedSpyNames}</strong>
        </p>
      </div>

      <div className="roles">
        {round.players.map((player, index) => {
          const isSpy = round.assignments[player.id]?.isSpy ?? false;
          return (
            <div className={`roles__row ${isSpy ? "is-spy" : "is-agent"}`} key={player.id}>
              <span className="roles__name">{displayPlayerName(player.name, index)}</span>
              <span className="roles__tag">{isSpy ? text.spyShort : text.agentShort}</span>
            </div>
          );
        })}
      </div>

      <div className="action-bar action-bar--split">
        <Button type="button" size="full" onClick={onNewRound}>
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
