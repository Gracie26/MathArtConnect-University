/**
 * The Progress tab's first layer (pure and unit-tested): a few totals across
 * every topic, one compact card per topic, and at most three rule-based
 * insights. The full per-topic report (progressReport.ts) is one tap away on
 * the topic's detail screen. Nothing here is a "mastery" score.
 */
import type { Href } from 'expo-router';

import type { TopicDefinition } from '@/content/types';
import { subtopicHref, topicHref } from '@/features/learning/navigation';

import type { ProgressReport, Recommendation } from './progressReport';

export interface TopicOverview {
  topic: TopicDefinition;
  report: ProgressReport;
  started: boolean;
  /** 0–1, required lesson steps done. */
  completion: number;
  practice: { checked: number; correct: number };
  openMistakes: number;
  continueLabel: string;
  continueHref: Href;
}

export interface ProgressOverview {
  totals: {
    topicsStarted: number;
    topicsTotal: number;
    stepsDone: number;
    stepsTotal: number;
    practiceChecked: number;
    practiceCorrect: number;
    openMistakes: number;
  };
  topics: TopicOverview[];
  insights: Recommendation[];
}

function topicOverview(topic: TopicDefinition, report: ProgressReport): TopicOverview {
  const openMistakes = report.subtopics.reduce((n, s) => n + s.openMistakes, 0);
  const next = report.recommendations.find((r) => r.id.startsWith('continue-'));
  const first = topic.units[0];
  return {
    topic,
    report,
    started: !report.isEmpty,
    completion: report.completion.fraction,
    practice: { checked: report.practice.attempts, correct: report.practice.correct },
    openMistakes,
    continueLabel: report.isEmpty ? 'Start' : next ? 'Continue' : 'Revisit',
    continueHref: next?.href ?? (report.isEmpty && first ? subtopicHref(topic.id, first.slug) : topicHref(topic.id)),
  };
}

/** Totals, topic cards and up to three insights from each topic's real report. */
export function buildProgressOverview(
  entries: readonly { topic: TopicDefinition; report: ProgressReport }[],
): ProgressOverview {
  const topics = entries.map((e) => topicOverview(e.topic, e.report));
  const sum = (f: (t: TopicOverview) => number) => topics.reduce((n, t) => n + f(t), 0);

  // Insights: each started topic's own most useful rule (see progressReport.recommend), most
  // recently studied topic first, skipping plain "continue" (the topic cards already offer it).
  const insights = topics
    .filter((t) => t.started)
    .sort((a, b) => ((a.report.lastActiveAt ?? '') < (b.report.lastActiveAt ?? '') ? 1 : -1))
    .flatMap((t) =>
      t.report.recommendations
        .filter((r) => !r.id.startsWith('continue-'))
        .slice(0, 1)
        .map((r) => ({ ...r, id: `${t.topic.id}:${r.id}`, title: `${r.title} · ${t.topic.title}` })),
    )
    .slice(0, 3);

  return {
    totals: {
      topicsStarted: topics.filter((t) => t.started).length,
      topicsTotal: topics.length,
      stepsDone: sum((t) => t.report.completion.requiredStepsDone),
      stepsTotal: sum((t) => t.report.completion.requiredStepsTotal),
      practiceChecked: sum((t) => t.practice.checked),
      practiceCorrect: sum((t) => t.practice.correct),
      openMistakes: sum((t) => t.openMistakes),
    },
    topics,
    insights,
  };
}
