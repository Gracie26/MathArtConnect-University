import { Clock3 } from 'lucide-react-native';
import { View } from 'react-native';

import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { type ContentBlock, LESSON_STEP_LABELS, type LessonStepDefinition } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';

import {
  CalloutCard,
  DefinitionCard,
  DerivationCard,
  FigureCard,
  FormulaCard,
  FormulaListCard,
  ReviewNote,
  SummaryCard,
  TableCard,
  TheoremCard,
} from './ContentCards';
import { ActivityList } from '@/components/activities/ActivityList';
import { ReflectCard } from '@/features/reflect/ReflectCard';
import { ReviewPanel } from '@/features/review/ReviewPanel';

import { PracticeGroup } from './PracticeItems';
import { QuickCheck } from './QuickCheck';
import { WorkedExample } from './WorkedExample';

function BlockContent({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <MathText text={block.text} variant="bodyLarge" />;
    case 'math':
      return <MathExpression tex={block.tex} display />;
    case 'figure':
      return <FigureCard figure={block.figure} />;
    case 'definition':
      return <DefinitionCard term={block.term} text={block.text} tex={block.tex} />;
    case 'theorem':
      return (
        <TheoremCard
          label={block.label}
          title={block.title}
          text={block.text}
          tex={block.tex}
          textAfter={block.textAfter}
          proof={block.proof}
        />
      );
    case 'formula':
      return <FormulaCard title={block.title} tex={block.tex} note={block.note} />;
    case 'formulaList':
      return <FormulaListCard title={block.title} items={block.items} />;
    case 'table':
      return <TableCard title={block.title} columns={block.columns} rows={block.rows} note={block.note} />;
    case 'callout':
      return <CalloutCard tone={block.tone} title={block.title} text={block.text} tex={block.tex} />;
    case 'derivation':
      return <DerivationCard title={block.title} intro={block.intro} steps={block.steps} resultTex={block.resultTex} />;
    case 'summary':
      return <SummaryCard title={block.title} points={block.points} />;
    case 'workedExample':
      return (
        <WorkedExample
          title={block.title}
          prompt={block.prompt}
          problemTex={block.problemTex}
          method={block.method}
          steps={block.steps}
          resultTex={block.resultTex}
          solutionStatus={block.solutionStatus}
          reviewIds={block.reviewIds}
          figure={block.figure}
        />
      );
    case 'practiceGroup':
      return <PracticeGroup title={block.title} text={block.text} items={block.items} />;
    case 'quickCheck':
      return <QuickCheck title={block.title} text={block.text} questions={block.questions} />;
    case 'activities':
      return <ActivityList activities={block.activities} />;
    case 'reflect':
      return (
        <ReflectCard
          topicId={block.topicId}
          unitId={block.unitId}
          question={block.question}
          difficulties={block.difficulties}
        />
      );
    case 'review':
      return <ReviewPanel topicId={block.topicId} unitId={block.unitId} />;
  }
}

/** A content block, with its review note when the material is shown as printed under review. */
export function Block({ block }: { block: ContentBlock }) {
  const theme = useAppTheme();
  // Worked examples place their own note under the problem.
  if (block.type === 'workedExample' || !block.reviewIds || block.reviewIds.length === 0) {
    return <BlockContent block={block} />;
  }
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <BlockContent block={block} />
      <ReviewNote reviewIds={block.reviewIds} />
    </View>
  );
}

/** Honest placeholder for a step delivered in a later development phase. */
function PlannedStep({ step }: { step: LessonStepDefinition }) {
  const theme = useAppTheme();
  if (step.availability.status !== 'planned') return null;
  return (
    <View
      style={[
        cardStyle(theme),
        { padding: theme.spacing.xl, gap: theme.spacing.md, alignItems: 'flex-start', borderStyle: 'dashed' },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Clock3 size={18} color={theme.colors.textSecondary} />
        <AppText variant="title">Coming in a later update</AppText>
      </View>
      <AppText variant="body" color="textSecondary">
        {step.availability.preview}
      </AppText>
      <AppText variant="small" color="textSecondary">
        You can continue to the next step for now.
      </AppText>
    </View>
  );
}

/** Renders one lesson step: its label, title and content blocks. */
export function LessonSection({ step }: { step: LessonStepDefinition }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="eyebrow" color="primary">
          {LESSON_STEP_LABELS[step.kind].toUpperCase()}
        </AppText>
        <AppText variant="h2">{step.title}</AppText>
      </View>
      {step.availability.status === 'planned' ? (
        <PlannedStep step={step} />
      ) : (
        step.blocks.map((block, index) => <Block key={`${step.key}-${index}`} block={block} />)
      )}
    </View>
  );
}
