import { CircleCheck, FileSearch, ListOrdered } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { figureHeading, MathFigure } from '@/components/figures/MathFigure';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { FadeIn } from '@/components/ui/FadeIn';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import type { SolutionStatus, WorkedStep } from '@/content/types';
import { isSolutionVisibleToLearners } from '@/content/visibility';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureSpec } from '@/lib/figures/scene';

import { ReviewNote } from './ContentCards';
import { Disclosure } from './Disclosure';

interface WorkedExampleProps {
  title: string;
  prompt?: string;
  problemTex: string;
  method?: string;
  steps: WorkedStep[];
  resultTex: string;
  solutionStatus: SolutionStatus;
  reviewIds?: string[];
  /** A drawing shown with the problem, so the calculation and the picture stay together. */
  figure?: FigureSpec;
}

/**
 * Step-by-step solution revealed one step at a time (or all at once), so the
 * learner can predict each next step. A step may offer an app-written "Why
 * this step?" note on request. Unreviewed app-authored solutions are never
 * shown to learners.
 */
export function WorkedExample({
  title,
  prompt,
  problemTex,
  method,
  steps,
  resultTex,
  solutionStatus,
  reviewIds,
  figure,
}: WorkedExampleProps) {
  const theme = useAppTheme();
  const [shown, setShown] = useState(0);
  const finished = shown >= steps.length;

  if (!isSolutionVisibleToLearners(solutionStatus)) {
    return (
      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          <FileSearch size={18} color={theme.colors.textSecondary} />
          <AppText variant="title">{title}</AppText>
        </View>
        <MathExpression tex={problemTex} display />
        <AppText variant="small" color="textSecondary">
          The solution for this example is being reviewed and will appear here once it is approved.
        </AppText>
      </View>
    );
  }

  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        <ListOrdered size={16} color={theme.colors.secondary} strokeWidth={2.4} />
        <AppText variant="eyebrow" color="textSecondary">
          WORKED EXAMPLE
        </AppText>
      </View>
      <AppText variant="h3">{title}</AppText>
      {method ? (
        <AppText variant="small" color="textSecondary">
          {`Method: ${method}`}
        </AppText>
      ) : null}
      {prompt ? <MathText text={prompt} /> : null}
      <View style={[styles.problem, { backgroundColor: theme.colors.secondarySoft, borderRadius: theme.radius.sm }]}>
        <MathExpression tex={problemTex} display />
      </View>
      <ReviewNote reviewIds={reviewIds} />
      {figure ? (
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            {figureHeading(figure)}
          </AppText>
          <MathFigure figure={figure} />
          {figure.caption ? <MathText text={figure.caption} /> : null}
          <AppText variant="small" color="textSecondary">
            {figure.description}
          </AppText>
        </View>
      ) : null}

      {steps.slice(0, shown).map((stepItem, index) => (
        <FadeIn key={`${index}-${stepItem.explanation}`}>
          <View style={[styles.step, { gap: theme.spacing.md }]}>
            <View style={[styles.badge, { backgroundColor: theme.colors.primarySoft }]}>
              <AppText variant="small" color="primary" style={{ fontFamily: theme.fontFamilies.bold }}>
                {String(index + 1)}
              </AppText>
            </View>
            <View style={[styles.stepBody, { gap: theme.spacing.xs }]}>
              <MathText text={stepItem.explanation} />
              {stepItem.tex ? <MathExpression tex={stepItem.tex} display size={18} /> : null}
              <ReviewNote reviewIds={stepItem.reviewIds} />
              {stepItem.why ? (
                <Disclosure showLabel="Why this step?" hideLabel="Hide the reason">
                  <MathText text={stepItem.why} color="textSecondary" />
                </Disclosure>
              ) : null}
            </View>
          </View>
        </FadeIn>
      ))}

      {finished ? (
        <FadeIn>
          <View
            style={[
              styles.result,
              { backgroundColor: theme.colors.successSoft, borderRadius: theme.radius.sm, gap: theme.spacing.xs },
            ]}
          >
            <View style={[styles.row, { gap: theme.spacing.sm }]}>
              <CircleCheck size={16} color={theme.colors.success} strokeWidth={2.4} />
              <AppText variant="eyebrow" color="textPrimary">
                RESULT
              </AppText>
            </View>
            <MathExpression tex={resultTex} display />
          </View>
        </FadeIn>
      ) : (
        <View style={{ gap: theme.spacing.xs }}>
          <LoadingButton
            variant="secondary"
            label={shown === 0 ? 'Show the first step' : 'Show next step'}
            accessibilityHint={`Step ${shown + 1} of ${steps.length}`}
            onPress={() => setShown((n) => n + 1)}
          />
          <SecondaryTextButton
            label="Show the full solution"
            color="textSecondary"
            onPress={() => setShown(steps.length)}
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  problem: { paddingHorizontal: 8 },
  step: { flexDirection: 'row', alignItems: 'flex-start' },
  badge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepBody: { flex: 1, minWidth: 0 },
  result: { padding: 12 },
});
