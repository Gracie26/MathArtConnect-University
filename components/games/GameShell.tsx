import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Gamepad2, Trophy } from 'lucide-react-native';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  type Evaluation,
  type GameDefinition,
  gameReducer,
  type GameState,
  initialGameState,
  levelReached,
  maxScore,
  xpFor,
} from '@/lib/games/engine';
import { studyDay } from '@/features/learning/studyDay';
import { newId } from '@/lib/utils/id';
import { gameSessionRepository } from '@/services/repositories/learning';

import { ScrollLockContext } from '@/components/graph/ScrollLock';

import { WidgetRound } from './area/WidgetRound';
import { GameFeedback, GameHeader, GameHint, GameProgress, GameScore } from './GameParts';
import { InputRound, MatchRound, OrderRound, SelectRound, StagesRound } from './GameRounds';

const tutorialKey = (gameId: string) => `mathart.game-tutorial-seen.v1.${gameId}`;

/** Before first play: the goal, how to interact, the mathematical skill, and scoring. */
export function GameInstructions({ game, onStart }: { game: GameDefinition; onStart: () => void }) {
  const theme = useAppTheme();
  const rows: [string, string][] = [
    ['Goal', game.tutorial.goal],
    ['How to play', game.tutorial.interaction],
    ['Skill you practise', game.tutorial.skill],
    ['Scoring', game.tutorial.scoring],
  ];
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.xl, gap: theme.spacing.lg }]}>
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        <Gamepad2 size={20} color={theme.colors.primary} strokeWidth={2.4} />
        <AppText variant="eyebrow" color="textSecondary">
          HOW TO PLAY
        </AppText>
      </View>
      <AppText variant="h2">{game.title}</AppText>
      {rows.map(([title, text]) => (
        <View key={title} style={{ gap: 2 }}>
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            {title}
          </AppText>
          <MathText text={text} />
        </View>
      ))}
      <LoadingButton label="Start playing" onPress={onStart} />
    </View>
  );
}

type SaveState = { status: 'idle' | 'saving' | 'saved' } | { status: 'error'; message: string };

/** Score, XP and a per-round summary at the end. */
export function GameComplete({
  game,
  state,
  save,
  xp,
  onRetrySave,
  onReplay,
}: {
  game: GameDefinition;
  state: GameState;
  save: SaveState;
  /** XP actually awarded (null until known). */
  xp: number | null;
  onRetrySave: () => void;
  onReplay: () => void;
}) {
  const theme = useAppTheme();
  const units = state.events.length;
  const firstTime = state.events.filter((e) => e.wrongAttempts === 0).length;
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.xl, gap: theme.spacing.lg }]}>
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        <Trophy size={22} color={theme.colors.achievementStrong} strokeWidth={2.4} />
        <AppText variant="eyebrow" color="textSecondary">
          GAME COMPLETE
        </AppText>
      </View>
      <AppText variant="h2">{game.title}</AppText>
      <AppText variant="bodyLarge">{`Score ${state.score} of ${maxScore(game)}`}</AppText>
      <AppText variant="body">{`${firstTime} of ${units} steps right first time · ${state.hintsUsed} hints used`}</AppText>
      {xp === null ? null : xp > 0 ? (
        <AppText variant="body" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          {`+${xp} XP`}
        </AppText>
      ) : (
        <AppText variant="small" color="textSecondary">
          No XP this time: you already earned XP for this game today. Your score is still saved.
        </AppText>
      )}
      {save.status === 'saving' ? (
        <AppText variant="small" color="textSecondary">
          Saving your game…
        </AppText>
      ) : null}
      {save.status === 'saved' ? (
        <AppText variant="small" color="textSecondary">
          Saved to your learning history.
        </AppText>
      ) : null}
      {save.status === 'error' ? (
        <View style={{ gap: theme.spacing.sm }}>
          <FormError message={save.message} />
          <LoadingButton variant="secondary" label="Try saving again" onPress={onRetrySave} />
        </View>
      ) : null}
      <LoadingButton label="Play again" onPress={onReplay} />
      <LoadingButton
        variant="secondary"
        label="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
    </View>
  );
}

/**
 * Runs any game built on lib/games/engine: tutorial on first play, rounds
 * with hints and feedback, scoring, and a saved session with XP at the end.
 */
export function GameShell({ game }: { game: GameDefinition }) {
  const theme = useAppTheme();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    (s: GameState, a: Parameters<typeof gameReducer>[2]) => gameReducer(game, s, a),
    undefined,
    initialGameState,
  );
  const [phase, setPhase] = useState<'loading' | 'tutorial' | 'playing'>('loading');
  const [feedback, setFeedback] = useState<Evaluation | null>(null);
  const [solved, setSolved] = useState(false);
  const [save, setSave] = useState<SaveState>({ status: 'idle' });
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [scrollLocked, setScrollLocked] = useState(false);
  const session = useRef({ id: newId(), startedAt: new Date().toISOString() });
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(tutorialKey(game.id))
      .catch(() => null)
      .then((seen) => active && setPhase(seen ? 'playing' : 'tutorial'));
    return () => {
      active = false;
    };
  }, [game.id]);

  const persist = async (finished: GameState) => {
    if (!user) {
      setSave({ status: 'error', message: 'Sign in to save your game.' });
      return;
    }
    setSave({ status: 'saving' });
    // XP once per game per study day: a replay the same day is saved in full, with no XP.
    const today = studyDay();
    const earlier = await gameSessionRepository.list(user.id, game.topicId);
    const rewardedToday =
      earlier.ok &&
      earlier.data.some(
        (s) =>
          s.id !== session.current.id &&
          s.gameId === game.id &&
          s.completed &&
          s.xpEarned > 0 &&
          studyDay(new Date(s.endedAt ?? s.startedAt)) === today,
      );
    const xp = rewardedToday ? 0 : xpFor(finished.score);
    setXpAwarded(xp);
    const result = await gameSessionRepository.save(user.id, {
      id: session.current.id,
      topicId: game.topicId,
      gameId: game.id,
      levelReached: levelReached(game, finished),
      score: finished.score,
      xpEarned: xp,
      hintsUsed: finished.hintsUsed,
      completed: true,
      events: {
        units: finished.events.map((e) => ({ ...e })),
        retries: finished.events.filter((e) => e.wrongAttempts > 0).length,
        unitId: game.unitId,
      },
      startedAt: session.current.startedAt,
      endedAt: new Date().toISOString(),
    });
    setSave(result.ok ? { status: 'saved' } : { status: 'error', message: result.error.message });
  };

  const round = game.rounds[state.roundIndex];
  const startPlaying = () => {
    void AsyncStorage.setItem(tutorialKey(game.id), '1').catch(() => undefined);
    setPhase('playing');
  };

  const onResult = (evaluation: Evaluation & { cannotCheck?: boolean }) => {
    setFeedback(evaluation);
    if (evaluation.cannotCheck) return;
    if (evaluation.correct) setSolved(true);
    else dispatch({ type: 'wrong' });
  };

  const next = () => {
    // The game ends on this press: save the finished session once.
    const after = gameReducer(game, state, { type: 'solved' });
    if (after.finished) void persist(after);
    dispatch({ type: 'solved' });
    setSolved(false);
    setFeedback(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const replay = () => {
    session.current = { id: newId(), startedAt: new Date().toISOString() };
    setSave({ status: 'idle' });
    setXpAwarded(null);
    setFeedback(null);
    setSolved(false);
    dispatch({ type: 'restart' });
  };

  const roundsDone = useMemo(() => (state.finished ? game.rounds.length : state.roundIndex), [state, game]);

  let body: React.ReactNode = null;
  if (phase === 'tutorial') body = <GameInstructions game={game} onStart={startPlaying} />;
  else if (state.finished) {
    body = (
      <GameComplete
        game={game}
        state={state}
        save={save}
        xp={xpAwarded}
        onRetrySave={() => void persist(state)}
        onReplay={replay}
      />
    );
  } else if (phase === 'playing' && round) {
    const roundKey = `${state.roundIndex}`;
    const lastStage = round.kind !== 'stages' || state.stageIndex === round.stages.length - 1;
    body = (
      <View style={{ gap: theme.spacing.lg }}>
        <GameHeader
          title={game.title}
          level={round.level}
          round={state.roundIndex + 1}
          rounds={game.rounds.length}
          onHowToPlay={() => setPhase('tutorial')}
        />
        <GameProgress done={roundsDone} total={game.rounds.length} />
        <GameScore score={state.score} hintsUsed={state.hintsUsed} />
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
          <MathText text={round.prompt} variant="bodyLarge" />
          {round.promptTex ? <MathExpression tex={round.promptTex} display /> : null}
          {round.kind === 'select' ? (
            <SelectRound key={roundKey} round={round} locked={solved} onResult={onResult} />
          ) : null}
          {round.kind === 'order' ? (
            <OrderRound key={roundKey} round={round} locked={solved} onResult={onResult} />
          ) : null}
          {round.kind === 'match' ? (
            <MatchRound key={roundKey} round={round} locked={solved} onResult={onResult} />
          ) : null}
          {round.kind === 'stages' ? (
            <StagesRound
              key={roundKey}
              round={round}
              stageIndex={state.stageIndex}
              locked={solved}
              onResult={onResult}
            />
          ) : null}
          {round.kind === 'input' ? (
            <InputRound key={roundKey} round={round} locked={solved} onResult={onResult} />
          ) : null}
          {round.kind === 'widget' ? (
            <WidgetRound key={roundKey} widget={round.widget} locked={solved} onResult={onResult} />
          ) : null}
        </View>
        {feedback ? <GameFeedback correct={feedback.correct} text={feedback.feedback} /> : null}
        {solved && round.explanation && lastStage ? <MathText text={round.explanation} color="textSecondary" /> : null}
        {solved ? (
          <LoadingButton
            label={
              round.kind === 'stages' && !lastStage
                ? 'Next step'
                : state.roundIndex + 1 >= game.rounds.length
                  ? 'Finish'
                  : 'Next round'
            }
            onPress={next}
          />
        ) : (
          <GameHint hint={round.hint} shown={state.hinted} onShow={() => dispatch({ type: 'hint' })} />
        )}
      </View>
    );
  }

  return (
    // Sliders and graphs in Topic 2 rounds stop the page scrolling while a finger is on them.
    <ScrollLockContext.Provider value={setScrollLocked}>
      <ScrollView
        ref={scroll}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: theme.layout.screenGutter, paddingBottom: theme.spacing.huge }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!scrollLocked}
      >
        <View style={[styles.column, { maxWidth: theme.layout.maxContentWidth, gap: theme.spacing.lg }]}>{body}</View>
      </ScrollView>
    </ScrollLockContext.Provider>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  column: { width: '100%', alignSelf: 'center' },
});
