import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { GameFeedback } from '@/components/games/GameParts';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { CASE_LABELS, DECOMPOSER_EXAMPLES, type DecomposerExample } from '@/content/topics/integration/explore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type FactorChoice, factorFeedback, templateTex } from '@/lib/explore/partialFractions';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';
import { OptionQuestion } from './ExploreParts';

type CaseId = keyof typeof CASE_LABELS;
const CASES = Object.keys(CASE_LABELS) as CaseId[];

const sameCases = (a: CaseId[], b: CaseId[]) => a.length === b.length && a.every((c) => b.includes(c));

/**
 * Classify the denominator, then build the partial-fraction template factor
 * by factor. Improper fractions start with long division.
 */
export function FractionDecomposer({ activity }: ActivityProps) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [exampleId, setExampleId] = useState(DECOMPOSER_EXAMPLES[0]!.id);
  const example: DecomposerExample = DECOMPOSER_EXAMPLES.find((e) => e.id === exampleId) ?? DECOMPOSER_EXAMPLES[0]!;
  const [divided, setDivided] = useState(false);
  const [cases, setCases] = useState<CaseId[]>([]);
  const [casesChecked, setCasesChecked] = useState<boolean | null>(null);
  const [choices, setChoices] = useState<FactorChoice[]>([]);
  const [templateChecked, setTemplateChecked] = useState<(string | null)[] | null>(null);
  const [built, setBuilt] = useState<string[]>([]);

  const reset = (id: string) => {
    const e = DECOMPOSER_EXAMPLES.find((x) => x.id === id) ?? DECOMPOSER_EXAMPLES[0]!;
    setExampleId(e.id);
    setDivided(false);
    setCases([]);
    setCasesChecked(null);
    setChoices(e.factors.map(() => ({ numerator: 'constant', powers: 1 })));
    setTemplateChecked(null);
  };
  const currentChoices =
    choices.length === example.factors.length
      ? choices
      : example.factors.map(() => ({ numerator: 'constant' as const, powers: 1 }));
  const needsDivision = Boolean(example.division) && !divided;
  const casesRight = casesChecked === true;
  const templateRight = templateChecked !== null && templateChecked.every((f) => f === null);

  const setChoice = (i: number, patch: Partial<FactorChoice>) => {
    setChoices(currentChoices.map((c, j) => (j === i ? { ...c, ...patch } : c)));
    setTemplateChecked(null);
  };

  const checkTemplate = () => {
    const feedback = example.factors.map((f, i) => factorFeedback(f, currentChoices[i]!));
    setTemplateChecked(feedback);
    if (feedback.every((f) => f === null)) {
      const next = built.includes(example.id) ? built : [...built, example.id];
      setBuilt(next);
      if (next.length >= 3) void complete({ templates: next.length });
    }
  };

  return (
    <ExploreScaffold
      activity={activity}
      intro="Factorise the denominator, say which cases apply, then build the template: constants over linear factors, linear numerators over irreducible quadratics, and one term for every power of a repeated factor."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {DECOMPOSER_EXAMPLES.map((e) => (
          <ChipButton key={e.id} label={e.title} selected={e.id === example.id} onPress={() => reset(e.id)} />
        ))}
      </ChipRow>

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <MathExpression tex={example.fractionTex} display />
        {example.division ? (
          <>
            <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              Step 0. Improper fraction: divide first
            </AppText>
            <OptionQuestion
              key={`${example.id}-division`}
              question="The numerator's degree is not less than the denominator's. What does long division give?"
              options={example.division.options}
              onCorrect={() => setDivided(true)}
            />
          </>
        ) : null}
      </View>

      {!needsDivision ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            1. Classify the denominator (choose every case that applies)
          </AppText>
          <View style={{ gap: theme.spacing.sm }}>
            {CASES.map((c) => (
              <ChipButton
                key={c}
                label={CASE_LABELS[c]}
                selected={cases.includes(c)}
                onPress={() => {
                  setCases((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));
                  setCasesChecked(null);
                }}
              />
            ))}
          </View>
          <LoadingButton
            label="Check classification"
            disabled={cases.length === 0}
            onPress={() => setCasesChecked(sameCases(cases, example.cases))}
          />
          {casesChecked !== null ? (
            <GameFeedback
              correct={casesChecked}
              text={
                casesChecked
                  ? 'Right. Now build the template.'
                  : `Look at each factor: is it linear or an irreducible quadratic, and does it repeat? Factors: ${example.factors
                      .map((f) => `$${f.tex}$${f.multiplicity > 1 ? ` (power ${f.multiplicity})` : ''}`)
                      .join(', ')}.`
              }
            />
          ) : null}
        </View>
      ) : null}

      {!needsDivision && casesRight ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            2. Build the template, factor by factor
          </AppText>
          {example.factors.map((f, i) => {
            const choice = currentChoices[i]!;
            const feedback = templateChecked?.[i];
            return (
              <View
                key={f.tex}
                style={[
                  styles.factor,
                  {
                    gap: theme.spacing.sm,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.sm,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                <MathExpression tex={f.multiplicity > 1 ? `(${f.tex})^{${f.multiplicity}}` : f.tex} size={18} />
                <AppText variant="small" color="textSecondary">
                  Numerator
                </AppText>
                <ChipRow>
                  <ChipButton
                    label="Constant (A)"
                    selected={choice.numerator === 'constant'}
                    onPress={() => setChoice(i, { numerator: 'constant' })}
                  />
                  <ChipButton
                    label="Linear (Bx + C)"
                    selected={choice.numerator === 'linear'}
                    onPress={() => setChoice(i, { numerator: 'linear' })}
                  />
                </ChipRow>
                <AppText variant="small" color="textSecondary">
                  Powers of this factor in the template
                </AppText>
                <ChipRow>
                  {[1, 2, 3, 4].map((p) => (
                    <ChipButton
                      key={p}
                      label={p === 1 ? 'Power 1 only' : `Powers 1 to ${p}`}
                      selected={choice.powers === p}
                      onPress={() => setChoice(i, { powers: p })}
                    />
                  ))}
                </ChipRow>
                {templateChecked ? (
                  <GameFeedback correct={!feedback} text={feedback ?? 'Right for this factor.'} />
                ) : null}
              </View>
            );
          })}
          <LoadingButton label="Check template" onPress={checkTemplate} />
          {templateRight ? (
            <View style={{ gap: theme.spacing.xs }} accessibilityLiveRegion="polite">
              <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                Your template
              </AppText>
              <MathExpression
                tex={`${example.division ? '\\text{remainder} = ' : ''}${templateTex(example.factors)}`}
                display
              />
              <AppText variant="small" color="textSecondary">
                Next, find the constants by equating numerators, then integrate each term.
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}
    </ExploreScaffold>
  );
}

const styles = StyleSheet.create({
  factor: { borderWidth: 1 },
});
