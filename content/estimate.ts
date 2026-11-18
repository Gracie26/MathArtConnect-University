/**
 * Estimated study time, calculated from the content itself (pure, unit-tested).
 *
 * A subtopic's estimate is the time to work through its lesson and the
 * interactions it offers: reading every explanation, following each worked
 * example, answering each Try it question, one practice set in Practise, and
 * one go at each Explore tool, game and Create activity, plus Reflect and
 * Review. A topic's estimate is the sum of its subtopics. Steps planned for a
 * later update count nothing.
 *
 * Practise holds the whole tutorial bank for the subtopic (sometimes 80
 * questions), which learners keep returning to from the Practice hub. The
 * lesson counts one practice set: a couple of questions for each method.
 *
 * The rates are deliberately transparent so they can be tuned in one place:
 */
import type {
  ContentBlock,
  LearningUnitDefinition,
  LessonStepDefinition,
  PracticeItem,
  TopicDefinition,
} from './types';

export const ESTIMATE_RATES = {
  /** Mathematical prose is read carefully: about 120 words a minute. */
  wordsPerMinute: 120,
  /** A displayed formula or equation to read and take in. */
  displayMath: 0.25,
  /** A figure or graph to study. */
  figure: 0.75,
  /** An optional derivation or proof (collapsed until opened). */
  derivation: 0.75,
  /** A worked example: 1 minute plus a quarter of a minute per step, between 1 and 3 minutes. */
  workedExampleBase: 1,
  workedExamplePerStep: 0.25,
  workedExampleMax: 3,
  /** A practice question worked in My Working, by difficulty (1 short, 2 multi-step, 3 longer). */
  practiceByDifficulty: { 1: 2, 2: 3, 3: 4 } as Record<1 | 2 | 3, number>,
  /** Extra time for a written (not auto-graded) answer. */
  writtenAnswerExtra: 1,
  /** Practise counts one practice set: this many questions per method, up to practiseSetMax in all. */
  practiseSetPerMethod: 2,
  practiseSetMax: 8,
  /** A quick recognition question (choose an answer). */
  quickCheck: 0.75,
  /** One go at an Explore tool, a game and a Create activity. */
  activity: { lab: 3, game: 4, studio: 6 } as Record<string, number>,
  reflect: 1.5,
  review: 2,
} as const;

const words = (text: string | undefined) =>
  text
    ? text
        .replace(/\$[^$]*\$/g, ' x ')
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
const read = (...texts: (string | undefined)[]) =>
  texts.reduce((sum, text) => sum + words(text), 0) / ESTIMATE_RATES.wordsPerMinute;

export function practiceItemMinutes(item: PracticeItem): number {
  return (
    ESTIMATE_RATES.practiceByDifficulty[item.difficulty] +
    (item.grading === 'written' ? ESTIMATE_RATES.writtenAnswerExtra : 0)
  );
}

/** Minutes for one content block (unrounded). */
export function blockMinutes(block: ContentBlock): number {
  const r = ESTIMATE_RATES;
  switch (block.type) {
    case 'paragraph':
      return read(block.text);
    case 'math':
      return r.displayMath;
    case 'figure':
      return r.figure;
    case 'definition':
      return read(block.term, block.text) + (block.tex ? r.displayMath : 0);
    case 'theorem':
      return (
        read(block.title, block.text, block.textAfter) +
        (block.tex ? r.displayMath : 0) +
        (block.proof ? r.derivation : 0)
      );
    case 'formula':
      return read(block.title, block.note) + r.displayMath;
    case 'formulaList':
      return read(block.title) + block.items.length * r.displayMath;
    case 'table':
      return read(block.title, block.note, ...block.rows.flatMap((row) => [row.left, row.right]));
    case 'callout':
      return read(block.title, block.text) + (block.tex ? r.displayMath : 0);
    case 'derivation':
      return r.derivation;
    case 'summary':
      return read(block.title, ...block.points);
    case 'workedExample':
      return (
        Math.min(r.workedExampleMax, r.workedExampleBase + r.workedExamplePerStep * block.steps.length) +
        (block.figure ? r.figure / 2 : 0)
      );
    case 'practiceGroup':
      return read(block.text) + block.items.reduce((sum, item) => sum + practiceItemMinutes(item), 0);
    case 'quickCheck':
      return read(block.text) + block.questions.length * r.quickCheck;
    case 'activities':
      return block.activities
        .filter((a) => a.availability.status === 'available')
        .reduce((sum, a) => sum + (r.activity[a.kind] ?? 0), 0);
    case 'reflect':
      return r.reflect;
    case 'review':
      return r.review;
  }
}

/** The questions a Practise step's practice set counts: the first few of each method, in course order. */
export function practiseSetItems(step: LessonStepDefinition): PracticeItem[] {
  const { practiseSetPerMethod, practiseSetMax } = ESTIMATE_RATES;
  return step.blocks
    .flatMap((block) => (block.type === 'practiceGroup' ? [block.items.slice(0, practiseSetPerMethod)] : []))
    .flat()
    .slice(0, practiseSetMax);
}

/** Minutes for one lesson step (unrounded); a step planned for a later update counts nothing. */
export function stepMinutes(step: LessonStepDefinition): number {
  if (step.availability.status !== 'available') return 0;
  if (step.kind === 'practise') {
    const other = step.blocks.filter((block) => block.type !== 'practiceGroup');
    return (
      other.reduce((sum, block) => sum + blockMinutes(block), 0) +
      practiseSetItems(step).reduce((sum, item) => sum + practiceItemMinutes(item), 0)
    );
  }
  return step.blocks.reduce((sum, block) => sum + blockMinutes(block), 0);
}

/** A subtopic's estimate in whole minutes (at least 1). */
export function estimateSubtopicMinutes(unit: LearningUnitDefinition): number {
  return Math.max(1, Math.ceil(unit.steps.reduce((sum, step) => sum + stepMinutes(step), 0)));
}

/** A topic's estimate: the sum of its subtopic estimates. */
export function estimateTopicMinutes(topic: TopicDefinition): number {
  return topic.units.reduce((sum, unit) => sum + estimateSubtopicMinutes(unit), 0);
}

/** Minutes still to go in a subtopic: the steps not yet completed. */
export function remainingSubtopicMinutes(unit: LearningUnitDefinition, completedKeys: ReadonlySet<string>): number {
  const left = unit.steps.filter((s) => !completedKeys.has(s.key)).reduce((sum, s) => sum + stepMinutes(s), 0);
  return left <= 0 ? 0 : Math.max(1, Math.ceil(left));
}

/**
 * Rounds for display without false precision: under 10 minutes to the
 * minute, otherwise to the nearest 5 minutes.
 */
export function roundStudyMinutes(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 10) return Math.max(1, Math.round(minutes));
  return Math.max(10, Math.round(minutes / 5) * 5);
}

/** "8 min", "25 min", "1 hr", "1 hr 20 min" (rounded with roundStudyMinutes). */
export function formatStudyTime(minutes: number): string {
  const rounded = roundStudyMinutes(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

/** Screen-reader form: "about 1 hour 20 minutes". */
export function spokenStudyTime(minutes: number): string {
  const rounded = roundStudyMinutes(minutes);
  const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  if (rounded < 60) return `about ${unit(rounded, 'minute')}`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return `about ${unit(hours, 'hour')}${rest ? ` ${unit(rest, 'minute')}` : ''}`;
}
