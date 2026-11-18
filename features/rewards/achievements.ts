/**
 * Badges (milestones), derived only from the learner's real record (pure and
 * unit-tested). Nothing is stored or awarded by tapping: a badge is earned
 * when the record shows the learning behaviour it describes, so it can never
 * be earned twice, never disappears after reopening, and needs no database
 * write. Opening a page never counts.
 *
 * Badges carry no XP: the XP rules (record_activity) are unchanged, so no
 * reward can be double-counted. Where the record dates the moment a badge was
 * earned, `earnedAt` is that moment (used for "new badge" moments and
 * notifications); streak and XP badges have no single dated event.
 */
import type { TopicDefinition } from '@/content/types';
import type { LearnerRecord } from '@/features/insights/useLearnerRecord';
import { computeTopicProgress } from '@/features/learning/progress';

export type BadgeCategory = 'firsts' | 'practice' | 'progress' | 'streak' | 'xp' | 'topic';

export interface BadgeInput {
  topics: readonly { topic: TopicDefinition; record: LearnerRecord }[];
  xp: number;
  longestStreak: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  /** What earns it, in plain words (the completion criterion). */
  criterion: string;
  category: BadgeCategory;
  /** The topic a topic-specific badge belongs to. */
  topicId?: string;
  target: number;
  /** Unit shown in "n more …" messages. */
  unit: [string, string];
}

export interface BadgeStatus extends BadgeDefinition {
  progress: number;
  earned: boolean;
  /** When the record shows it was earned (null for streak and XP badges, or when not earned). */
  earnedAt: string | null;
}

interface Evidence {
  /** Dated events, one per unit of progress; the target-th earliest is when the badge was earned. */
  times?: string[];
  /** A count without dates (streak, XP). */
  count?: number;
}

const PDA = 'partial-derivative-applications';

const all = (input: BadgeInput) => input.topics.map((t) => t.record);
const attempts = (input: BadgeInput) => all(input).flatMap((r) => r.attempts);
const activity = (input: BadgeInput, type: string) =>
  all(input).flatMap((r) => r.activity.filter((a) => a.type === type));

/** First time each distinct question was answered correctly (optionally in some units only). */
function correctQuestionTimes(input: BadgeInput, unitIds?: readonly string[]): string[] {
  const first = new Map<string, string>();
  for (const a of attempts(input)) {
    if (!a.isCorrect) continue;
    if (unitIds && !unitIds.includes(a.unitId ?? '')) continue;
    const key = `${a.topicId}|${a.questionId}`;
    const previous = first.get(key);
    if (!previous || a.answeredAt < previous) first.set(key, a.answeredAt);
  }
  return [...first.values()];
}

/** The time each completed subtopic was completed (its last required step), and each completed topic. */
function completions(input: BadgeInput): { subtopics: string[]; topics: string[] } {
  const subtopics: string[] = [];
  const topics: string[] = [];
  for (const { topic, record } of input.topics) {
    const progress = computeTopicProgress(topic, record.lessons);
    const done: string[] = [];
    for (const unit of topic.units) {
      if (progress.subtopics[unit.id]?.status !== 'completed') continue;
      const required = new Set(unit.steps.filter((s) => s.required).map((s) => s.key));
      const at = record.lessons
        .filter((l) => l.unitId === unit.id && required.has(l.sectionKey) && l.completedAt)
        .map((l) => l.completedAt!)
        .sort()
        .at(-1);
      if (at) done.push(at);
    }
    subtopics.push(...done);
    if (topic.units.length > 0 && done.length === topic.units.length) topics.push(done.sort().at(-1)!);
  }
  return { subtopics, topics };
}

const badge = (
  id: string,
  title: string,
  criterion: string,
  category: BadgeCategory,
  target: number,
  unit: [string, string],
  evidence: (input: BadgeInput) => Evidence,
  topicId?: string,
): BadgeDefinition & { evidence: (input: BadgeInput) => Evidence } => ({
  id,
  title,
  criterion,
  category,
  target,
  unit,
  evidence,
  ...(topicId ? { topicId } : {}),
});

const ANSWER: [string, string] = ['correct answer', 'correct answers'];

export const BADGES = [
  badge(
    'first-practice',
    'First Practice',
    'Check your first practice answer in My Working.',
    'firsts',
    1,
    ['answer', 'answers'],
    (i) => ({
      times: attempts(i).map((a) => a.answeredAt),
    }),
  ),
  badge(
    'first-explore',
    'First Exploration',
    'Complete an Explore tool.',
    'firsts',
    1,
    ['Explore tool', 'Explore tools'],
    (i) => ({
      times: activity(i, 'explore').map((a) => a.occurredAt),
    }),
  ),
  badge(
    'first-create',
    'First Creation',
    'Save a project in a Create studio.',
    'firsts',
    1,
    ['project', 'projects'],
    (i) => ({
      times: all(i).flatMap((r) => r.art.map((p) => p.createdAt)),
    }),
  ),
  badge(
    'first-reflection',
    'First Reflection',
    'Save a reflection in a Reflect step.',
    'firsts',
    1,
    ['reflection', 'reflections'],
    (i) => ({
      times: activity(i, 'reflection').map((a) => a.occurredAt),
    }),
  ),
  badge('first-game', 'First Game', 'Complete every round of a game.', 'firsts', 1, ['game', 'games'], (i) => ({
    times: all(i).flatMap((r) => r.games.filter((g) => g.completed).map((g) => g.endedAt ?? g.startedAt)),
  })),
  badge(
    'correct-5',
    '5 Correct Answers',
    'Answer 5 different practice questions correctly.',
    'practice',
    5,
    ANSWER,
    (i) => ({
      times: correctQuestionTimes(i),
    }),
  ),
  badge(
    'correct-10',
    '10 Correct Answers',
    'Answer 10 different practice questions correctly.',
    'practice',
    10,
    ANSWER,
    (i) => ({
      times: correctQuestionTimes(i),
    }),
  ),
  badge(
    'correct-25',
    '25 Correct Answers',
    'Answer 25 different practice questions correctly.',
    'practice',
    25,
    ANSWER,
    (i) => ({
      times: correctQuestionTimes(i),
    }),
  ),
  badge(
    'reviewed-3',
    'Mistakes Put Right',
    'Put right 3 practice answers that were wrong at first, by answering them again correctly.',
    'practice',
    3,
    ['mistake', 'mistakes'],
    (i) => ({ times: attempts(i).flatMap((a) => (a.reviewResolvedAt ? [a.reviewResolvedAt] : [])) }),
  ),
  badge(
    'subtopic-complete',
    'Subtopic Complete',
    'Complete every required step of a subtopic.',
    'progress',
    1,
    ['subtopic', 'subtopics'],
    (i) => ({
      times: completions(i).subtopics,
    }),
  ),
  badge(
    'topic-complete',
    'Topic Complete',
    'Complete every subtopic of a topic.',
    'progress',
    1,
    ['topic', 'topics'],
    (i) => ({
      times: completions(i).topics,
    }),
  ),
  badge('streak-3', '3-Day Streak', 'Study on 3 days in a row.', 'streak', 3, ['day', 'days'], (i) => ({
    count: i.longestStreak,
  })),
  badge('streak-7', '7-Day Streak', 'Study on 7 days in a row.', 'streak', 7, ['day', 'days'], (i) => ({
    count: i.longestStreak,
  })),
  badge('streak-14', '14-Day Streak', 'Study on 14 days in a row.', 'streak', 14, ['day', 'days'], (i) => ({
    count: i.longestStreak,
  })),
  badge('xp-100', '100 XP', 'Earn 100 XP from learning activities.', 'xp', 100, ['XP', 'XP'], (i) => ({ count: i.xp })),
  badge('xp-250', '250 XP', 'Earn 250 XP from learning activities.', 'xp', 250, ['XP', 'XP'], (i) => ({ count: i.xp })),
  badge('xp-500', '500 XP', 'Earn 500 XP from learning activities.', 'xp', 500, ['XP', 'XP'], (i) => ({ count: i.xp })),
  // Topic 4: each combines the subtopic's activity with correct answers to its practice.
  badge(
    'gradient-explorer',
    'Gradient Explorer',
    'Complete the Gradient Probe and answer 3 different gradient questions correctly (Topic 4, The Gradient).',
    'topic',
    4,
    ['step', 'steps'],
    (i) => ({
      times: [
        ...activity(i, 'explore')
          .filter((a) => a.refId === 'pda-gradient-probe')
          .map((a) => a.occurredAt)
          .sort()
          .slice(0, 1),
        ...correctQuestionTimes(i, ['pda-gradient']).sort().slice(0, 3),
      ],
    }),
    PDA,
  ),
  badge(
    'plane-builder',
    'Plane Builder',
    'Complete the Plane Builder game and answer 2 different tangent-plane questions correctly (Topic 4).',
    'topic',
    3,
    ['step', 'steps'],
    (i) => ({
      times: [
        ...all(i)
          .flatMap((r) => r.games.filter((g) => g.gameId === 'pda-plane-builder' && g.completed))
          .map((g) => g.endedAt ?? g.startedAt)
          .sort()
          .slice(0, 1),
        ...correctQuestionTimes(i, ['pda-tangent-planes-normal-lines']).sort().slice(0, 2),
      ],
    }),
    PDA,
  ),
  badge(
    'critical-point-detective',
    'Critical Point Detective',
    'Find the critical points correctly in 3 different questions (Topic 4, Critical Points and Relative Extrema).',
    'topic',
    3,
    ANSWER,
    (i) => ({ times: correctQuestionTimes(i, ['pda-critical-points-relative-extrema']) }),
    PDA,
  ),
  badge(
    'classification-expert',
    'Classification Expert',
    'Find and classify every critical point correctly in 5 different questions (Topic 4, The Second Partials Test).',
    'topic',
    5,
    ANSWER,
    (i) => ({ times: correctQuestionTimes(i, ['pda-second-partials-test']) }),
    PDA,
  ),
] as const;

/** Every badge with its progress and whether (and when) it was earned. */
export function evaluateBadges(input: BadgeInput): BadgeStatus[] {
  return BADGES.map(({ evidence, ...definition }) => {
    const e = evidence(input);
    if (e.times) {
      const sorted = [...e.times].sort();
      const earned = sorted.length >= definition.target;
      return {
        ...definition,
        progress: Math.min(sorted.length, definition.target),
        earned,
        earnedAt: earned ? sorted[definition.target - 1]! : null,
      };
    }
    const count = Math.max(0, e.count ?? 0);
    return {
      ...definition,
      progress: Math.min(count, definition.target),
      earned: count >= definition.target,
      earnedAt: null,
    };
  });
}

/** "2 more correct answers", "15 XP", … */
export function remainingText(b: BadgeStatus): string {
  const left = b.target - b.progress;
  if (b.category === 'xp') return `${left} XP`;
  return `${left} more ${left === 1 ? b.unit[0] : b.unit[1]}`;
}

/**
 * The next badge to aim for: the unearned badge closest to completion (by share of its
 * target), preferring badges already started. Null when every badge is earned.
 */
export function nextBadge(statuses: readonly BadgeStatus[]): BadgeStatus | null {
  const open = statuses.filter((b) => !b.earned);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => b.progress / b.target - a.progress / a.target || a.target - b.target)[0]!;
}

/**
 * In-app notifications for badges whose moment the record dates (streak and XP badges are
 * celebrated on Home instead). Ids are stable ("badge-<id>"), so a badge is never notified twice.
 */
export function badgeNotifications(
  topics: BadgeInput['topics'],
): { id: string; title: string; body: string; at: string }[] {
  return evaluateBadges({ topics, xp: 0, longestStreak: 0 })
    .filter((b) => b.earned && b.earnedAt)
    .map((b) => ({ id: `badge-${b.id}`, title: `Badge earned: ${b.title}`, body: b.criterion, at: b.earnedAt! }));
}
