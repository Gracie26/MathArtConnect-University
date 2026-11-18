import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TopicDefinition } from '@/content/types';
import { activityHref, subtopicHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

import {
  Card,
  EmptyNote,
  formatWhen,
  percent,
  Section,
  StandingBadge,
  standingLabel,
  StatGrid,
  StatTile,
} from './components';
import { buildProgressReport, MIN_ATTEMPTS_FOR_JUDGEMENT, type ProgressReport } from './progressReport';
import { useLearnerRecord } from './useLearnerRecord';

/**
 * The Progress tab: completion, practice, games, Explore/Create, improvement,
 * recent activity and next steps, all from the learner's real record and each
 * shown separately (there is no single "mastery" number).
 */
export function ProgressDashboard({ topic }: { topic: TopicDefinition }) {
  const theme = useAppTheme();
  const { state, reload } = useLearnerRecord(topic);
  const report = useMemo(
    () => (state.status === 'ready' ? buildProgressReport(topic, state.record) : null),
    [state, topic],
  );

  if (state.status === 'loading') {
    return (
      <View style={{ gap: theme.spacing.md }} accessibilityLabel="Loading your progress">
        <Skeleton height={120} radius={theme.radius.card} />
        <Skeleton height={220} radius={theme.radius.card} />
      </View>
    );
  }
  if (state.status === 'error' || !report) {
    return (
      <View style={{ gap: theme.spacing.md }}>
        <FormError message={state.status === 'error' ? state.message : 'Your progress could not be loaded.'} />
        <LoadingButton label="Try again" onPress={() => void reload()} />
      </View>
    );
  }
  if (report.isEmpty) {
    return (
      <EmptyNote
        art="curves"
        title={`${topic.title}: nothing recorded yet`}
        text={`Start a lesson in ${topic.title} to begin tracking progress. Opening a page is not counted: progress grows as you work through lesson steps, check practice answers, play games and save your creations.`}
      >
        <LoadingButton
          label={`Start ${topic.units[0]?.title ?? topic.title}`}
          onPress={() => topic.units[0] && router.push(subtopicHref(topic.id, topic.units[0].slug))}
        />
      </EmptyNote>
    );
  }
  return <ReportView topic={topic} report={report} />;
}

function ReportView({ topic, report }: { topic: TopicDefinition; report: ProgressReport }) {
  const theme = useAppTheme();
  const c = report.completion;
  const p = report.practice;
  return (
    <View style={{ gap: theme.spacing.xl }}>
      {/* A. Overall */}
      <Section title={topic.title} subtitle="Completion counts lesson steps you worked through and continued past.">
        <Card>
          <View style={styles.row}>
            <AppText variant="title" style={styles.grow}>
              Lesson completion
            </AppText>
            <AppText variant="h3">{percent(c.fraction)}</AppText>
          </View>
          <ProgressBar
            value={c.fraction}
            height={10}
            accessibilityLabel={`${percent(c.fraction)} complete: ${c.requiredStepsDone} of ${c.requiredStepsTotal} required lesson steps`}
          />
          <AppText variant="small" color="textSecondary">
            {`${c.requiredStepsDone} of ${c.requiredStepsTotal} required lesson steps · ${c.completedSubtopics} of ${c.totalSubtopics} subtopics completed`}
          </AppText>
        </Card>
        <StatGrid>
          <StatTile value={`${report.counts.lessonsCompleted}/${c.totalSubtopics}`} label="Lessons completed" />
          <StatTile
            value={report.counts.practiceQuestions}
            label="Practice questions attempted"
            hint={`${report.counts.practiceAttempts} checked answers`}
          />
          <StatTile value={report.counts.gamesCompleted} label="Games completed" />
          <StatTile value={`${report.counts.exploreDone}/${report.counts.exploreTotal}`} label="Explore tools used" />
          <StatTile
            value={report.counts.createSaved}
            label="Create projects saved"
            hint={`${report.counts.createCompleted} completed`}
          />
        </StatGrid>
      </Section>

      {/* H. Next steps */}
      {report.recommendations.length > 0 ? (
        <Section title="Recommended next steps" subtitle="Simple rules based on your record, not an AI judgement.">
          {report.recommendations.map((r) => (
            <Card key={r.id}>
              <AppText variant="title">{r.title}</AppText>
              <AppText variant="small" color="textSecondary">
                {r.reason}
              </AppText>
              <LoadingButton variant="secondary" label={r.actionLabel} onPress={() => router.push(r.href)} />
            </Card>
          ))}
        </Section>
      ) : null}

      {/* B. Subtopics */}
      <Section
        title="Subtopics"
        subtitle={`Standing uses lesson completion and checked practice answers (at least ${MIN_ATTEMPTS_FOR_JUDGEMENT} before accuracy is judged).`}
      >
        {report.subtopics.map((s, i) => (
          <Card
            key={s.unit.id}
            onPress={() => router.push(subtopicHref(topic.id, s.unit.slug, s.lesson.nextStepKey ?? undefined))}
            label={`${i + 1}. ${s.unit.title}. ${standingLabel(s.standing)}. ${s.standingReason} Lesson ${s.lesson.requiredDone} of ${s.lesson.requiredTotal} required steps. Open the lesson.`}
          >
            <View style={[styles.row, { gap: theme.spacing.sm }]}>
              <AppText variant="title" style={styles.grow}>
                {`${i + 1}. ${s.unit.title}`}
              </AppText>
              <StandingBadge standing={s.standing} />
            </View>
            <ProgressBar value={s.lesson.fraction} height={6} />
            <AppText variant="small" color="textSecondary">
              {`Lesson: ${s.lesson.requiredDone} of ${s.lesson.requiredTotal} required steps`}
            </AppText>
            <AppText variant="small" color="textSecondary">
              {s.practice.attempts === 0
                ? 'Practice: no answers checked yet'
                : `Practice: ${percent(s.practice.accuracy)} correct · ${s.practice.attempts} ${s.practice.attempts === 1 ? 'answer' : 'answers'} · ${s.practice.hints} hints`}
            </AppText>
            <AppText variant="small" color="textSecondary">
              {`Games: ${s.gameSessions === 0 ? 'not played yet' : `${s.gameSessions} ${s.gameSessions === 1 ? 'session' : 'sessions'}, best ${s.bestGameScore}`} · Last studied: ${formatWhen(s.lastStudied)}`}
            </AppText>
            <AppText variant="small">{s.standingReason}</AppText>
          </Card>
        ))}
      </Section>

      {/* C. Practice */}
      <Section
        title="Practice performance"
        subtitle="From answers checked in MY WORKING. Separate from lesson completion."
      >
        {p.attempts === 0 ? (
          <EmptyNote
            title="No practice answers yet"
            text="Check an answer in a Try it or Practise step to see your accuracy here."
          />
        ) : (
          <>
            <StatGrid>
              <StatTile value={p.questions} label="Questions attempted" />
              <StatTile value={p.correct} label="Correct answers" />
              <StatTile value={p.incorrect} label="Not yet correct" />
              <StatTile value={percent(p.accuracy)} label="Accuracy" hint={`of ${p.attempts} checked answers`} />
              <StatTile value={p.hints} label="Hints used" />
            </StatGrid>
            <Card>
              <AppText variant="title">Retry improvement</AppText>
              <AppText variant="small" color="textSecondary">
                {p.retry.wrongFirst === 0
                  ? 'Every question you have tried so far was right first time.'
                  : `${p.retry.laterCorrect} of the ${p.retry.wrongFirst} ${p.retry.wrongFirst === 1 ? 'question' : 'questions'} you got wrong at first ${p.retry.laterCorrect === 1 ? 'was' : 'were'} answered correctly later.`}
              </AppText>
            </Card>
            <Card>
              <AppText variant="title">By method</AppText>
              {p.byTechnique.map((t) => (
                <View
                  key={t.technique}
                  style={{ gap: 4 }}
                  accessible
                  accessibilityLabel={`${t.label}: ${percent(t.accuracy)} correct of ${t.attempts} answers, ${t.hints} hints`}
                >
                  <View style={styles.row}>
                    <AppText variant="small" style={styles.grow}>
                      {t.label}
                    </AppText>
                    <AppText variant="small" style={{ fontFamily: theme.fontFamilies.semibold }}>
                      {`${percent(t.accuracy)} · ${t.attempts}`}
                    </AppText>
                  </View>
                  <ProgressBar value={t.accuracy ?? 0} height={6} />
                </View>
              ))}
            </Card>
          </>
        )}
      </Section>

      {/* F. Improvement */}
      <Section title="Recent improvement">
        {report.improvements.length === 0 ? (
          <EmptyNote
            title="No trend yet"
            text="Complete more practice to see improvement trends. A trend appears once a subtopic or method has at least four checked answers and your later answers are clearly more accurate."
          />
        ) : (
          report.improvements.map((i) => (
            <Card key={i.id}>
              <AppText variant="small">{i.text}</AppText>
            </Card>
          ))
        )}
      </Section>

      {/* D. Games */}
      <Section title="Games">
        {report.games.map((g) => (
          <Card
            key={g.activity.id}
            onPress={() => router.push(activityHref(topic.id, g.activity.id))}
            label={`${g.activity.title}. ${g.sessions === 0 ? 'Not played yet' : `Best score ${g.bestScore}, latest ${g.latestScore}, ${g.xp} XP`}. Open the game.`}
          >
            <AppText variant="title">{g.activity.title}</AppText>
            <AppText variant="small" color="textSecondary">
              {g.sessions === 0
                ? 'Not played yet'
                : `Played ${g.sessions} ${g.sessions === 1 ? 'time' : 'times'} · ${g.completed} completed · best ${g.bestScore} · latest ${g.latestScore} · level ${g.levelReached} · ${g.xp} XP · ${formatWhen(g.lastPlayed)}`}
            </AppText>
          </Card>
        ))}
      </Section>

      {/* E. Explore and Create */}
      <Section title="Explore and Create">
        <Card>
          <AppText variant="title">{`Explore tools used: ${report.counts.exploreDone} of ${report.counts.exploreTotal}`}</AppText>
          {report.explore.map((e) => (
            <AppText key={e.activity.id} variant="small" color={e.done ? 'textPrimary' : 'textSecondary'}>
              {e.done ? `✓ ${e.activity.title} · ${formatWhen(e.lastAt)}` : `○ ${e.activity.title} · not tried yet`}
            </AppText>
          ))}
        </Card>
        <Card>
          <AppText variant="title">{`Create projects saved: ${report.counts.createSaved}`}</AppText>
          {report.create.map((c2) => (
            <AppText key={c2.activity.id} variant="small" color={c2.projects ? 'textPrimary' : 'textSecondary'}>
              {c2.projects
                ? `✓ ${c2.activity.title} · ${c2.projects} saved, ${c2.completed} completed · ${formatWhen(c2.lastAt)}`
                : `○ ${c2.activity.title} · nothing saved yet`}
            </AppText>
          ))}
        </Card>
      </Section>

      {/* G. Recent activity (no streak claims) */}
      <Section
        title="Recent learning activity"
        subtitle={`Active on ${report.activeDaysLast7} of the last 7 days · last activity ${formatWhen(report.lastActiveAt, true)}`}
      >
        <Card>
          <View
            style={[styles.days, { gap: 4 }]}
            accessible
            accessibilityLabel={`Activity over the last 14 days: ${
              report.activityDays
                .filter((d) => d.count > 0)
                .map((d) => `${d.date}, ${d.count}`)
                .join('; ') || 'none'
            }`}
          >
            {report.activityDays.map((d) => {
              const max = Math.max(1, ...report.activityDays.map((x) => x.count));
              return (
                <View key={d.date} style={styles.dayCol}>
                  <View style={[styles.dayTrack, { backgroundColor: theme.colors.surfaceMuted, borderRadius: 3 }]}>
                    <View
                      style={{
                        height: `${d.count === 0 ? 0 : Math.max(12, (d.count / max) * 100)}%`,
                        backgroundColor: theme.colors.primary,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <AppText variant="small" color="textSecondary">
                    {String(Number(d.date.slice(8)))}
                  </AppText>
                </View>
              );
            })}
          </View>
          <AppText variant="small" color="textSecondary">
            Each bar is one day (day of the month underneath); its height is how many things you did that day.
          </AppText>
        </Card>
      </Section>

      {/* Confidence, shown on its own */}
      <Section
        title="Your confidence"
        subtitle="From your Reflect ratings. Shown for you only; never used for progress or standing."
      >
        <Card>
          <AppText variant="small">
            {report.confidence.average === null
              ? 'No reflections yet. Reflect steps ask how confident you feel (1 to 5).'
              : `Average ${report.confidence.average} out of 5 from ${report.confidence.ratings} ${report.confidence.ratings === 1 ? 'reflection' : 'reflections'}.`}
          </AppText>
        </Card>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  grow: { flexGrow: 1, flexShrink: 1 },
  days: { flexDirection: 'row', alignItems: 'flex-end' },
  dayCol: { flex: 1, alignItems: 'center', gap: 4, minWidth: 0 },
  dayTrack: { width: '100%', height: 56, justifyContent: 'flex-end', overflow: 'hidden' },
});
