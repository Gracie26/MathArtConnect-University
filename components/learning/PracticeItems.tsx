import { Link } from 'expo-router';
import { PenLine } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { type HelpPolicy, MyWorking } from '@/components/practice/MyWorking';
import { WrittenResponse } from '@/components/practice/WrittenResponse';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { practiceSourceLabel } from '@/content/practiceSources';
import { getTopic } from '@/content/registry';
import { PRACTICE_MODE_LABELS, type PracticeItem } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { subtopicHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

import { Disclosure } from './Disclosure';

function Chip({ label, tone }: { label: string; tone: 'primary' | 'neutral' | 'achievement' }) {
  const theme = useAppTheme();
  const background =
    tone === 'primary'
      ? theme.colors.primarySoft
      : tone === 'achievement'
        ? theme.colors.achievementSoft
        : theme.colors.surfaceMuted;
  return (
    <View style={[styles.chip, { backgroundColor: background, borderRadius: theme.radius.pill }]}>
      <AppText variant="small" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {label}
      </AppText>
    </View>
  );
}

const EYEBROW: Record<PracticeItem['sourceType'], string> = {
  'you-try-it': 'TRY IT',
  'chapter-exercise': 'EXERCISE',
  'tutorial-question': 'PRACTICE',
  'app-practice': 'APP PRACTICE',
};

/** What is checked automatically, for questions that are not fully auto-graded. */
const GRADING_NOTE: Record<'partial' | 'written', string> = {
  partial:
    'Your final answer is checked automatically. The method (the limit working or the verification) is yours to write: compare it with the app walkthrough.',
  written: 'Written answer: not checked automatically. Compare your working with the suggested working.',
};

/** A link to the subtopic a question depends on (e.g. the Fundamental Theorem of Calculus in Topic 2). */
function Prerequisite({ prerequisite }: { prerequisite: NonNullable<PracticeItem['prerequisite']> }) {
  const unit = getTopic(prerequisite.topicId)?.units.find((u) => u.id === prerequisite.unitId);
  return (
    <View style={{ gap: 2 }}>
      <AppText variant="small" color="textSecondary">
        {prerequisite.note}
      </AppText>
      {unit ? (
        <Link href={subtopicHref(prerequisite.topicId, unit.slug)} accessibilityRole="link">
          <AppText variant="small" color="primary">{`Revise: ${unit.title}`}</AppText>
        </Link>
      ) : null}
    </View>
  );
}

/**
 * One practice question with its "My working" area. Topics 1 and 2 keep source
 * question numbers internal; Topic 3 shows each question's tutorial and number
 * (practiceSourceLabel). Help is always marked as app guidance.
 */
export function PracticeItemCard({
  item,
  index,
  helpPolicy = 'full',
}: {
  item: PracticeItem;
  index: number;
  helpPolicy?: HelpPolicy;
}) {
  const theme = useAppTheme();
  const sourceLabel = practiceSourceLabel(item);
  const grading = item.grading === 'partial' || item.grading === 'written' ? item.grading : null;
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        <PenLine size={16} color={theme.colors.primary} strokeWidth={2.4} />
        <AppText variant="eyebrow" color="textSecondary">
          {`${EYEBROW[item.sourceType]} ${index + 1}`}
        </AppText>
      </View>
      <View style={[styles.chips, { gap: theme.spacing.xs }]}>
        {sourceLabel ? <Chip label={sourceLabel} tone="neutral" /> : null}
        <Chip label={PRACTICE_MODE_LABELS[item.recommendedPracticeMode]} tone="primary" />
        {item.advanced ? <Chip label="Advanced tutorial practice" tone="achievement" /> : null}
        {item.isExtension ? <Chip label="Extension" tone="achievement" /> : null}
        {item.withheldFromLearners ? <Chip label="Withheld while under review" tone="neutral" /> : null}
      </View>
      <AppText variant="body">{item.instruction}</AppText>
      <MathExpression tex={item.problemTex} display />
      {item.condition ? <MathText text={item.condition} color="textSecondary" /> : null}
      {item.isExtension ? (
        <AppText variant="small" color="textSecondary">
          This question goes beyond the methods developed in the course notes.
        </AppText>
      ) : null}
      {item.prerequisite ? <Prerequisite prerequisite={item.prerequisite} /> : null}
      {grading ? (
        <AppText variant="small" color="textSecondary">
          {GRADING_NOTE[grading]}
        </AppText>
      ) : null}
      <Disclosure showLabel="Start working" hideLabel="Hide my working">
        {item.definite?.answer.kind === 'explanation' ? (
          <WrittenResponse item={item} />
        ) : (
          <MyWorking item={item} helpPolicy={helpPolicy} />
        )}
      </Disclosure>
    </View>
  );
}

/** A titled group of practice questions. Items withheld for review are hidden from learners. */
export function PracticeGroup({
  title,
  text,
  items,
  helpPolicy,
}: {
  title: string;
  text?: string;
  items: PracticeItem[];
  helpPolicy?: HelpPolicy;
}) {
  const theme = useAppTheme();
  const visible = items.filter((item) => isPracticeItemVisible(item));
  const hidden = items.length - visible.length;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h3">{title}</AppText>
        {text ? <MathText text={text} color="textSecondary" /> : null}
        <AppText variant="small" color="textSecondary">
          {visible.length === 1 ? '1 question' : `${visible.length} questions`}
          {hidden > 0 ? ` · ${hidden} more after lecturer review` : ''}
        </AppText>
      </View>
      {visible.map((item, index) => (
        <PracticeItemCard key={item.id} item={item} index={index} helpPolicy={helpPolicy} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 4 },
});
