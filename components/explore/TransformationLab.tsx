import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { Disclosure } from '@/components/learning/Disclosure';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { type Scenario, SUBSTITUTION_SCENARIOS, TRIG_SCENARIOS } from '@/content/topics/integration/explore';
import { algebraicTrigSubstitution } from '@/content/topics/integration/units/algebraicTrig';
import type { ContentBlock } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';
import { OptionQuestion, StageStepper } from './ExploreParts';

type TableBlock = Extract<ContentBlock, { type: 'table' }>;

/** Table 1.1 as it appears in the lesson (single source of truth). */
const TABLE_ROWS: TableBlock['rows'] =
  algebraicTrigSubstitution.steps.flatMap((s) => s.blocks).find((b): b is TableBlock => b.type === 'table')?.rows ?? [];

/** Shared lab: pick a scenario, make the first decision, then step through the transformation. */
function Lab({
  activity,
  intro,
  scenarios,
  tableRow,
  onTableRow,
}: ActivityProps & {
  intro: string;
  scenarios: Scenario[];
  tableRow?: number | null;
  onTableRow?: (row: number | null) => void;
}) {
  const theme = useAppTheme();
  const { explored, error, complete } = useExploreCompletion(activity);
  const [id, setId] = useState(scenarios[0]!.id);
  const [chosen, setChosen] = useState<string[]>([]);
  const [finished, setFinished] = useState<string[]>([]);
  const scenario = scenarios.find((s) => s.id === id) ?? scenarios[0]!;
  const ready = !scenario.choose || chosen.includes(scenario.id);
  const stages = scenario.steps;
  const hints = useMemo(() => stages.map((st) => st.hint), [stages]);

  const pick = (next: Scenario) => {
    setId(next.id);
    onTableRow?.(next.tableRow ?? null);
  };

  return (
    <ExploreScaffold activity={activity} intro={intro} explored={explored} error={error}>
      {onTableRow ? (
        <Disclosure showLabel="Show Table 1.1: suggested substitutions" hideLabel="Hide Table 1.1">
          <View style={{ gap: theme.spacing.sm }}>
            {TABLE_ROWS.map((row, i) => {
              const selected = tableRow === i + 1;
              const uses = scenarios.find((s) => s.tableRow === i + 1);
              return (
                <Pressable
                  key={row.left}
                  onPress={() => {
                    onTableRow(i + 1);
                    if (uses) setId(uses.id);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Row ${i + 1}${uses ? ', has an example' : ''}`}
                  style={{
                    gap: theme.spacing.xs,
                    padding: theme.spacing.sm,
                    borderRadius: theme.radius.sm,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                  }}
                >
                  <AppText variant="small" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                    {`Row ${i + 1}${uses ? ' · example below' : ''}`}
                  </AppText>
                  <MathText text={row.left} variant="small" />
                  <MathText text={`→ ${row.right}`} variant="small" color="textSecondary" />
                </Pressable>
              );
            })}
          </View>
        </Disclosure>
      ) : null}

      <ChipRow>
        {scenarios.map((s) => (
          <ChipButton key={s.id} label={s.title} selected={s.id === scenario.id} onPress={() => pick(s)} />
        ))}
      </ChipRow>

      {scenario.tableRow ? (
        <AppText variant="small" color="textSecondary">
          {`Uses row ${scenario.tableRow} of Table 1.1.`}
        </AppText>
      ) : null}

      {scenario.choose ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg }]}>
          <OptionQuestion
            key={scenario.id}
            question={scenario.choose.question}
            options={scenario.choose.options}
            onCorrect={() => setChosen((c) => (c.includes(scenario.id) ? c : [...c, scenario.id]))}
          />
        </View>
      ) : null}

      {ready ? (
        <StageStepper
          key={scenario.id}
          stages={stages}
          hints={hints}
          onFinished={() => {
            const next = finished.includes(scenario.id) ? finished : [...finished, scenario.id];
            setFinished(next);
            if (next.length >= 2) void complete({ scenarios: next.length });
          }}
        />
      ) : (
        <AppText variant="small" color="textSecondary">
          Choose the substitution to start the transformation.
        </AppText>
      )}
    </ExploreScaffold>
  );
}

/** Subtopic 3: u-substitution, step by step with Back, Next, Reset and Hint. */
export function SubstitutionTransformationLab(props: ActivityProps) {
  return (
    <Lab
      {...props}
      scenarios={SUBSTITUTION_SCENARIOS}
      intro="Step through a substitution: choose $u$, find $du$, rewrite, integrate and substitute back. Use Back to compare stages, and Hint if you are unsure what comes next."
    />
  );
}

/** Subtopic 5: Table 1.1 browser, trigonometric and algebraic substitutions, rationalisation and t = tan(x/2). */
export function TrigTransformationLab(props: ActivityProps) {
  const [row, setRow] = useState<number | null>(null);
  return (
    <Lab
      {...props}
      scenarios={TRIG_SCENARIOS}
      tableRow={row}
      onTableRow={setRow}
      intro="Browse Table 1.1, choose a substitution and watch the expression transform: a root disappears, or a trigonometric integrand becomes a rational function."
    />
  );
}
