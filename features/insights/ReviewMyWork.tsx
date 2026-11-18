import { router } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { Disclosure } from '@/components/learning/Disclosure';
import { PracticeItemCard } from '@/components/learning/PracticeItems';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TopicDefinition } from '@/content/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { activityHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { newId } from '@/lib/utils/id';
import { artProjectRepository } from '@/services/repositories/learning';
import type { ArtProjectRecord } from '@/services/repositories/types';

import { Card, EmptyNote, FilterChip, formatWhen, Section } from './components';
import { useLearnerRecord } from './useLearnerRecord';
import {
  buildWorkHistory,
  DEFAULT_FILTER,
  filterEntries,
  filterQuestions,
  type KindFilter,
  type QuestionHistory,
  type StatusFilter,
  type WorkFilter,
  type WorkHistory,
} from './workHistory';

const KINDS: { id: KindFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'practice', label: 'Practice' },
  { id: 'game', label: 'Games' },
  { id: 'explore', label: 'Explore' },
  { id: 'create', label: 'Create' },
  { id: 'lesson', label: 'Lessons' },
];

const STATUSES: { id: StatusFilter; label: string }[] = [
  { id: 'any', label: 'Any status' },
  { id: 'review', label: 'Needs review' },
  { id: 'completed', label: 'Completed' },
  { id: 'recent', label: 'Last 7 days' },
];

const PAGE = 20;

/**
 * Review My Work: recent activity, practice attempts (retry, my working),
 * mistakes grouped for review, games, saved creations and lesson history,
 * filterable by type, subtopic and status. Real data only.
 */
export function ReviewMyWork({
  topic,
  initialFilter,
}: {
  topic: TopicDefinition;
  initialFilter?: Partial<WorkFilter>;
}) {
  const theme = useAppTheme();
  const { state, reload } = useLearnerRecord(topic);
  const [filter, setFilter] = useState<WorkFilter>({ ...DEFAULT_FILTER, ...initialFilter });
  // "Last 7 days" is measured from when the screen opened.
  const [now] = useState(() => new Date());
  const history = useMemo(
    () => (state.status === 'ready' ? buildWorkHistory(topic, state.record) : null),
    [state, topic],
  );

  if (state.status === 'loading') {
    return (
      <View style={{ gap: theme.spacing.md }} accessibilityLabel="Loading your work">
        <Skeleton height={60} radius={theme.radius.card} />
        <Skeleton height={200} radius={theme.radius.card} />
      </View>
    );
  }
  if (state.status === 'error' || !history) {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <FormError message={state.status === 'error' ? state.message : 'Your work could not be loaded.'} />
        <LoadingButton label="Try again" onPress={() => void reload()} />
      </View>
    );
  }
  if (history.isEmpty) {
    return (
      <EmptyNote
        title="You have no previous attempts yet"
        text="Your practice answers, games, saved creations and completed lesson steps will appear here as you learn."
      >
        <LoadingButton
          label={`Open ${topic.title}`}
          onPress={() => router.push({ pathname: '/topic/[topicId]', params: { topicId: topic.id } })}
        />
      </EmptyNote>
    );
  }

  const set = (change: Partial<WorkFilter>) => setFilter((f) => ({ ...f, ...change }));
  const openCount = history.needsReview.reduce((n, g) => n + g.questions.length, 0);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.sm }}>
        <ChipScroller>
          {KINDS.map((k) => (
            <FilterChip
              key={k.id}
              label={k.label}
              selected={filter.kind === k.id}
              onPress={() => set({ kind: k.id })}
              a11y={`Show ${k.label}`}
            />
          ))}
        </ChipScroller>
        <ChipScroller>
          <FilterChip label="All subtopics" selected={filter.unitId === null} onPress={() => set({ unitId: null })} />
          {topic.units.map((u, i) => (
            <FilterChip
              key={u.id}
              label={`${i + 1}. ${u.title}`}
              selected={filter.unitId === u.id}
              onPress={() => set({ unitId: u.id })}
              a11y={`Subtopic ${u.title}`}
            />
          ))}
        </ChipScroller>
        <ChipScroller>
          {STATUSES.map((s) => (
            <FilterChip
              key={s.id}
              label={s.id === 'review' ? `${s.label} (${openCount})` : s.label}
              selected={filter.status === s.id}
              onPress={() => set({ status: s.id })}
              a11y={s.id === 'review' ? `Needs review, ${openCount}` : s.label}
            />
          ))}
        </ChipScroller>
      </View>
      <Body topic={topic} history={history} filter={filter} now={now} onChanged={() => void reload()} />
    </View>
  );
}

function ChipScroller({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.xs, paddingRight: theme.spacing.md }}
    >
      {children}
    </ScrollView>
  );
}

function Body({
  topic,
  history,
  filter,
  now,
  onChanged,
}: {
  topic: TopicDefinition;
  history: WorkHistory;
  filter: WorkFilter;
  now: Date;
  onChanged: () => void;
}) {
  const theme = useAppTheme();
  const inUnit = <T extends { unitId?: string | null }>(x: T) => !filter.unitId || x.unitId === filter.unitId;
  const showReview = filter.kind === 'all' || filter.kind === 'practice';
  const groups = history.needsReview
    .map((g) => ({ ...g, questions: g.questions.filter(inUnit) }))
    .filter((g) => g.questions.length > 0);

  return (
    <View style={{ gap: theme.spacing.xl }}>
      {showReview && filter.status !== 'completed' ? (
        <Section
          title="Needs review"
          subtitle="Questions you have not answered correctly yet, grouped by kind of mistake."
        >
          {groups.length === 0 ? (
            <EmptyNote title="Nothing to review" text="No open mistakes here. Well done." />
          ) : (
            groups.map((g) => (
              <Card key={g.id}>
                <AppText variant="title">{`${g.title} (${g.questions.length})`}</AppText>
                <AppText variant="small" color="textSecondary">
                  {g.description}
                </AppText>
                {g.questions.map((q) => (
                  <AttemptCard key={q.item.id} q={q} compact />
                ))}
              </Card>
            ))
          )}
        </Section>
      ) : null}

      {filter.kind === 'practice' ? <PracticeList history={history} filter={filter} now={now} /> : null}
      {filter.kind === 'game' ? <GamesList topic={topic} history={history} filter={filter} /> : null}
      {filter.kind === 'create' ? (
        <Creations topic={topic} history={history} filter={filter} onChanged={onChanged} />
      ) : null}
      {filter.kind === 'lesson' ? <Lessons history={history} filter={filter} /> : null}
      {filter.kind === 'all' || filter.kind === 'explore' ? (
        <Timeline history={history} filter={filter} now={now} />
      ) : null}
    </View>
  );
}

function Timeline({ history, filter, now }: { history: WorkHistory; filter: WorkFilter; now: Date }) {
  const [shown, setShown] = useState(PAGE);
  const entries = filterEntries(history.entries, filter, now);
  return (
    <Section title="Recent activity" subtitle={`${entries.length} ${entries.length === 1 ? 'item' : 'items'}`}>
      {entries.length === 0 ? (
        <EmptyNote title="Nothing here" text="No activity matches these filters." />
      ) : (
        entries.slice(0, shown).map((e) => (
          <Card
            key={e.id}
            {...(e.href
              ? {
                  onPress: () => router.push(e.href!),
                  label: `${e.title}. ${e.detail}. ${e.statusLabel}. ${formatWhen(e.at, true)}. Open.`,
                }
              : {})}
          >
            <AppText variant="title">{e.title}</AppText>
            <AppText variant="small" color="textSecondary">
              {`${e.detail ? `${e.detail} · ` : ''}${e.statusLabel} · ${formatWhen(e.at, true)}`}
            </AppText>
          </Card>
        ))
      )}
      {entries.length > shown ? (
        <LoadingButton variant="secondary" label="Show more" onPress={() => setShown((n) => n + PAGE)} />
      ) : null}
    </Section>
  );
}

function AttemptCard({ q, compact = false }: { q: QuestionHistory; compact?: boolean }) {
  const theme = useAppTheme();
  const result = q.last.isCorrect
    ? 'Correct'
    : q.working?.outcome === 'missingConstant'
      ? 'Missing + C'
      : 'Not yet correct';
  return (
    <View
      style={[
        styles.attempt,
        { borderColor: theme.colors.border, borderRadius: theme.radius.md, gap: theme.spacing.xs },
      ]}
    >
      <AppText variant="small" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {q.item.techniqueLabel}
      </AppText>
      <MathExpression tex={q.item.problemTex} display />
      <AppText variant="small">
        {`${q.everCorrect && !q.last.isCorrect ? 'Correct before · ' : ''}Latest: ${result} · ${q.attempts.length} ${q.attempts.length === 1 ? 'attempt' : 'attempts'} · ${q.hints} hints · ${formatWhen(q.last.answeredAt, true)}`}
      </AppText>
      {q.working ? (
        <Disclosure showLabel="View my working" hideLabel="Hide my working">
          <View style={{ gap: 4 }}>
            {q.working.steps.map((s, i) => (
              <AppText key={`${i}-${s}`} variant="small">
                {`Step ${i + 1}: ${s}`}
              </AppText>
            ))}
            <AppText variant="small" style={{ fontFamily: theme.fontFamilies.semibold }}>
              {`My answer: ${q.working.answer || '(none)'}`}
            </AppText>
          </View>
        </Disclosure>
      ) : null}
      <Disclosure showLabel="Retry" hideLabel="Hide retry">
        <PracticeItemCard item={q.item} index={0} />
      </Disclosure>
      {!compact ? (
        <LoadingButton variant="secondary" label="Open in the lesson" onPress={() => router.push(q.lessonHref)} />
      ) : null}
    </View>
  );
}

function PracticeList({ history, filter, now }: { history: WorkHistory; filter: WorkFilter; now: Date }) {
  const questions = filterQuestions(history.questions, filter, now);
  return (
    <Section title="Practice attempts" subtitle="Every question you checked, newest first.">
      {questions.length === 0 ? (
        <EmptyNote title="No attempts here" text="No practice questions match these filters." />
      ) : (
        questions.map((q) => (
          <Card key={q.item.id}>
            <AttemptCard q={q} />
          </Card>
        ))
      )}
    </Section>
  );
}

function GamesList({ topic, history, filter }: { topic: TopicDefinition; history: WorkHistory; filter: WorkFilter }) {
  const games = history.games.filter((g) => !filter.unitId || g.activity?.unitId === filter.unitId);
  return (
    <Section title="Games history">
      {games.length === 0 ? (
        <EmptyNote
          title="No games played here"
          text="Play a game in a lesson's Play step and your scores appear here."
        />
      ) : (
        games.map(({ session, activity }) => (
          <Card key={session.id}>
            <AppText variant="title">{activity?.title ?? session.gameId}</AppText>
            <AppText variant="small" color="textSecondary">
              {`Score ${session.score} · ${session.xpEarned} XP · level ${session.levelReached} · ${session.completed ? 'completed' : 'not finished'} · ${formatWhen(session.endedAt ?? session.startedAt, true)}`}
            </AppText>
            {activity ? (
              <LoadingButton
                variant="secondary"
                label={`Play ${activity.title} again`}
                onPress={() => router.push(activityHref(topic.id, activity.id))}
              />
            ) : null}
          </Card>
        ))
      )}
    </Section>
  );
}

function Creations({
  topic,
  history,
  filter,
  onChanged,
}: {
  topic: TopicDefinition;
  history: WorkHistory;
  filter: WorkFilter;
  onChanged: () => void;
}) {
  const theme = useAppTheme();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ArtProjectRecord | null>(null);
  const items = history.creations.filter(
    (c) =>
      (!filter.unitId || c.activity?.unitId === filter.unitId) &&
      (filter.status !== 'completed' || c.project.isCompleted),
  );

  const duplicate = async (project: ArtProjectRecord) => {
    if (!user) return;
    setBusy(true);
    const result = await artProjectRepository.save(user.id, {
      id: newId(),
      topicId: project.topicId,
      activityId: project.activityId,
      title: `${project.title} (copy)`.slice(0, 120),
      composition: project.composition,
      isCompleted: project.isCompleted,
    });
    setBusy(false);
    setError(result.ok ? null : result.error.message);
    onChanged();
  };
  const remove = async () => {
    if (!user || !deleting) return;
    setBusy(true);
    const result = await artProjectRepository.remove(user.id, deleting.id);
    setBusy(false);
    setDeleting(null);
    setError(result.ok ? null : result.error.message);
    onChanged();
  };

  return (
    <Section title="Saved creations">
      <FormError message={error} />
      {items.length === 0 ? (
        <EmptyNote title="No saved creations here" text="Save a project in a Create activity and it appears here." />
      ) : (
        items.map(({ project, activity }) => (
          <Card key={project.id}>
            <AppText variant="title">{project.title}</AppText>
            <AppText variant="small" color="textSecondary">
              {`${activity?.title ?? project.activityId} · ${project.isCompleted ? 'Completed' : 'In progress'} · updated ${formatWhen(project.updatedAt, true)}`}
            </AppText>
            <View style={[styles.actions, { gap: theme.spacing.sm }]}>
              {activity ? (
                <LoadingButton
                  label={project.isCompleted ? 'Open' : 'Continue editing'}
                  onPress={() => router.push(activityHref(topic.id, activity.id, project.id))}
                  style={styles.grow}
                />
              ) : null}
              <LoadingButton
                variant="secondary"
                label="Duplicate"
                disabled={busy}
                onPress={() => void duplicate(project)}
                style={styles.grow}
              />
              <LoadingButton
                variant="secondary"
                label="Delete"
                disabled={busy}
                onPress={() => setDeleting(project)}
                style={styles.grow}
              />
            </View>
          </Card>
        ))
      )}
      <ConfirmDialog
        visible={deleting !== null}
        title="Delete this project?"
        message={deleting ? `“${deleting.title}” will be deleted. This cannot be undone.` : undefined}
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={() => void remove()}
        onCancel={() => setDeleting(null)}
      />
    </Section>
  );
}

function Lessons({ history, filter }: { history: WorkHistory; filter: WorkFilter }) {
  const lessons = history.lessons.filter(
    (l) =>
      (!filter.unitId || l.unit.id === filter.unitId) && (filter.status !== 'completed' || l.status === 'completed'),
  );
  return (
    <Section title="Lesson history" subtitle="Lesson steps you worked through, and where to continue.">
      {lessons.map((l, i) => (
        <Card key={l.unit.id}>
          <AppText variant="title">{`${i + 1}. ${l.unit.title}`}</AppText>
          <AppText variant="small" color="textSecondary">
            {l.completedSteps.length === 0
              ? 'Not started yet'
              : `${l.completedSteps.length} ${l.completedSteps.length === 1 ? 'step' : 'steps'} completed · last ${formatWhen(l.lastAt)}${l.status === 'completed' ? ' · lesson complete' : ''}`}
          </AppText>
          {l.completedSteps.length > 0 ? (
            <AppText variant="small">{l.completedSteps.map((s) => `✓ ${s.title}`).join('   ')}</AppText>
          ) : null}
          <LoadingButton
            variant="secondary"
            label={
              l.completedSteps.length === 0
                ? 'Start learning'
                : l.nextStepTitle
                  ? `Continue: ${l.nextStepTitle}`
                  : 'Open the lesson'
            }
            onPress={() => router.push(l.continueHref)}
          />
        </Card>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  attempt: { borderWidth: 1, padding: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap' },
  grow: { flexGrow: 1 },
});
