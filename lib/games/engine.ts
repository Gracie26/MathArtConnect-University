/**
 * Shared game engine: round types, answer evaluation, scoring and XP.
 * Pure functions only, so every game is tested the same way and the UI
 * (components/games) stays a thin layer.
 *
 * Round types, so games are not all multiple choice:
 *   select   choose one answer, or every valid answer (e.g. all anti-derivatives)
 *   order    arrange action cards in the right order (distractor cards left out)
 *   match    pair each item on the left with one on the right
 *   stages   a reasoning chain (choose u → du → … → back-substitute), scored per stage
 *   input    type an expression; checked by the maths engine (an anti-derivative, or
 *            for Topic 3 partial derivatives and chain-rule results via lib/math/partial,
 *            or for Topic 5 values, limits and Jacobians via lib/math/multiple)
 *   widget   an interactive graph round (Topic 2: build, drag, adjust, predict),
 *            evaluated by the pure functions in ./areaWidgets
 */
import { checkFinalAnswer, type CheckProblem } from '@/lib/math/check';
import { checkMultipleAnswer, compileMultiple, type MultipleSpec } from '@/lib/math/multiple';
import { checkPartialAnswer, compilePartial, type PartialSpec } from '@/lib/math/partial';

import type { AreaWidget } from './areaWidgets';

export interface Choice {
  id: string;
  /** Text with optional $…$ maths. */
  text?: string;
  tex?: string;
  correct: boolean;
  /** Why this choice is right or wrong; shown after the learner picks it. */
  feedback: string;
}

/** What a card shows: words (with optional $…$ maths), a formula, or both. */
export interface CardFace {
  text?: string;
  tex?: string;
}

export interface Card extends CardFace {
  id: string;
}

interface RoundBase {
  /** Difficulty level (1 = first level). */
  level: number;
  prompt: string;
  promptTex?: string;
  hint: string;
  /** Shown once the round is solved. */
  explanation?: string;
}

export type Round =
  | (RoundBase & { kind: 'select'; choices: Choice[]; multiple?: boolean })
  | (RoundBase & { kind: 'order'; cards: Card[]; distractors?: (Card & { why: string })[] })
  | (RoundBase & { kind: 'match'; pairs: { id: string; left: CardFace; right: CardFace }[] })
  | (RoundBase & { kind: 'stages'; stages: { label: string; question: string; choices: Choice[] }[] })
  | (RoundBase & {
      kind: 'input';
      placeholder?: string;
      check: CheckProblem | PartialCheck | MultipleCheck;
      answerTex: string;
    })
  | (RoundBase & { kind: 'widget'; widget: AreaWidget });

/** An input round checked as a Topic 3 partial-derivative answer. */
export interface PartialCheck {
  partial: PartialSpec;
}

/** An input round checked as a Topic 5 multiple-integral answer (a value, limits or a Jacobian). */
export interface MultipleCheck {
  multiple: MultipleSpec;
}

export interface GameTutorial {
  goal: string;
  interaction: string;
  skill: string;
  scoring: string;
}

export interface GameDefinition {
  id: string;
  title: string;
  unitId: string;
  topicId: string;
  summary: string;
  tutorial: GameTutorial;
  rounds: Round[];
}

// -----------------------------------------------------------------------------
// Evaluation
// -----------------------------------------------------------------------------

export interface Evaluation {
  correct: boolean;
  feedback: string;
}

export function evaluateSelect(round: Extract<Round, { kind: 'select' }>, selected: readonly string[]): Evaluation {
  const picked = round.choices.filter((c) => selected.includes(c.id));
  if (!round.multiple) {
    const choice = picked[0];
    if (!choice) return { correct: false, feedback: 'Choose an answer first.' };
    return { correct: choice.correct, feedback: choice.feedback };
  }
  const wrong = picked.find((c) => !c.correct);
  if (wrong) return { correct: false, feedback: wrong.feedback };
  const missing = round.choices.filter((c) => c.correct && !selected.includes(c.id));
  if (missing.length > 0) {
    return {
      correct: false,
      feedback: `Not all of them yet: ${missing.length === 1 ? 'one more answer is' : `${missing.length} more answers are`} also valid.`,
    };
  }
  return { correct: true, feedback: 'All the valid answers, and only those.' };
}

export function evaluateOrder(round: Extract<Round, { kind: 'order' }>, sequence: readonly string[]): Evaluation {
  const distractor = round.distractors?.find((d) => sequence.includes(d.id));
  if (distractor) return { correct: false, feedback: distractor.why };
  if (sequence.length < round.cards.length) return { correct: false, feedback: 'A step is still missing.' };
  const firstWrong = round.cards.findIndex((card, i) => sequence[i] !== card.id);
  if (firstWrong >= 0) return { correct: false, feedback: `Step ${firstWrong + 1} is not in the right place yet.` };
  return { correct: true, feedback: 'Every step is in the right order.' };
}

export function evaluateMatch(
  round: Extract<Round, { kind: 'match' }>,
  pairing: Readonly<Record<string, string>>,
): Evaluation {
  const unmatched = round.pairs.filter((p) => !pairing[p.id]);
  if (unmatched.length > 0) return { correct: false, feedback: 'Pair every item first.' };
  const wrong = round.pairs.filter((p) => pairing[p.id] !== p.id).length;
  return wrong === 0
    ? { correct: true, feedback: 'Every pair matches.' }
    : { correct: false, feedback: `${wrong === 1 ? 'One pair does' : `${wrong} pairs do`} not match yet.` };
}

export function evaluateStage(
  round: Extract<Round, { kind: 'stages' }>,
  stageIndex: number,
  choiceId: string,
): Evaluation {
  const choice = round.stages[stageIndex]?.choices.find((c) => c.id === choiceId);
  return choice
    ? { correct: choice.correct, feedback: choice.feedback }
    : { correct: false, feedback: 'Choose an answer first.' };
}

export function evaluateInput(
  round: Extract<Round, { kind: 'input' }>,
  input: string,
): Evaluation & { cannotCheck: boolean } {
  if ('multiple' in round.check) {
    const result = checkMultipleAnswer(input, compileMultiple(round.check.multiple));
    return {
      correct: result.status === 'correct',
      feedback: result.message,
      cannotCheck: result.status === 'cannotCheck',
    };
  }
  if ('partial' in round.check) {
    const result = checkPartialAnswer(input, compilePartial(round.check.partial));
    return {
      correct: result.status === 'correct',
      feedback: result.message,
      cannotCheck: result.status === 'cannotCheck',
    };
  }
  const result = checkFinalAnswer(input, round.check);
  return {
    correct: result.status === 'correct' || result.status === 'missingConstant',
    feedback: result.message,
    cannotCheck: result.status === 'cannotCheck',
  };
}

/**
 * A deterministic shuffle (same order every time for the same seed), so cards
 * never appear in the answer order and tests stay reproducible.
 */
export function shuffled<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const random = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  // Never show the answer order itself.
  if (out.length > 1 && out.every((item, i) => item === items[i])) out.push(out.shift() as T);
  return out;
}

// -----------------------------------------------------------------------------
// Scoring
// -----------------------------------------------------------------------------

/** Points for one scored unit (a round, or a stage of a stages round). Mistakes never cost points. */
export function pointsFor(wrongAttempts: number, hinted: boolean): number {
  const base = wrongAttempts === 0 ? 10 : 5;
  return Math.max(2, base - (hinted ? 3 : 0));
}

/** Number of scored units in a round. */
export const unitsIn = (round: Round): number => (round.kind === 'stages' ? round.stages.length : 1);

export const maxScore = (game: GameDefinition): number => game.rounds.reduce((n, r) => n + unitsIn(r) * 10, 0);

/** XP for a finished game: a fifth of the score, at least 5 for finishing. */
export const xpFor = (score: number): number => Math.max(5, Math.round(score / 5));

export interface UnitEvent {
  round: number;
  stage?: number;
  wrongAttempts: number;
  hinted: boolean;
  points: number;
}

export interface GameState {
  roundIndex: number;
  stageIndex: number;
  wrongAttempts: number;
  hinted: boolean;
  score: number;
  hintsUsed: number;
  events: UnitEvent[];
  finished: boolean;
}

export const initialGameState = (): GameState => ({
  roundIndex: 0,
  stageIndex: 0,
  wrongAttempts: 0,
  hinted: false,
  score: 0,
  hintsUsed: 0,
  events: [],
  finished: false,
});

export type GameAction = { type: 'wrong' } | { type: 'hint' } | { type: 'solved' } | { type: 'restart' };

/** Advances the game. "solved" scores the current unit and moves to the next stage, round or the end. */
export function gameReducer(game: GameDefinition, state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'restart':
      return initialGameState();
    case 'wrong':
      return { ...state, wrongAttempts: state.wrongAttempts + 1 };
    case 'hint':
      return state.hinted ? state : { ...state, hinted: true, hintsUsed: state.hintsUsed + 1 };
    case 'solved': {
      const round = game.rounds[state.roundIndex];
      if (!round || state.finished) return state;
      const points = pointsFor(state.wrongAttempts, state.hinted);
      const event: UnitEvent = {
        round: state.roundIndex,
        ...(round.kind === 'stages' ? { stage: state.stageIndex } : {}),
        wrongAttempts: state.wrongAttempts,
        hinted: state.hinted,
        points,
      };
      const moreStages = round.kind === 'stages' && state.stageIndex + 1 < round.stages.length;
      const nextRound = moreStages ? state.roundIndex : state.roundIndex + 1;
      return {
        ...state,
        score: state.score + points,
        events: [...state.events, event],
        roundIndex: nextRound,
        stageIndex: moreStages ? state.stageIndex + 1 : 0,
        wrongAttempts: 0,
        // A hint covers the rest of a stages round, so it is only counted once.
        hinted: moreStages ? state.hinted : false,
        finished: nextRound >= game.rounds.length,
      };
    }
  }
}

/** Highest level reached so far. */
export const levelReached = (game: GameDefinition, state: GameState): number =>
  Math.max(0, ...game.rounds.slice(0, state.finished ? game.rounds.length : state.roundIndex + 1).map((r) => r.level));
