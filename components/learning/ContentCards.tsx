import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  ChartSpline,
  Hourglass,
  Lightbulb,
  ListChecks,
  type LucideIcon,
  ScrollText,
  Sigma,
  Table,
  TriangleAlert,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { figureHeading, MathFigure } from '@/components/figures/MathFigure';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import type { FormulaItem, TableRow, WorkedStep } from '@/content/types';
import { isReviewerMode } from '@/content/visibility';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { FigureSpec } from '@/lib/figures/scene';
import { speakTex, splitInlineMath } from '@/lib/math/tex';

import { Disclosure } from './Disclosure';

/** Spoken form of text with inline $…$ maths. */
const speakText = (text: string): string =>
  splitInlineMath(text)
    .map((part) => (part.type === 'math' ? speakTex(part.value) : part.value))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

function CardFrame({
  icon: Icon,
  eyebrow,
  title,
  accent,
  background,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title?: string;
  accent: string;
  background?: string;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        cardStyle(theme),
        styles.frame,
        { padding: theme.spacing.lg, gap: theme.spacing.md, borderLeftColor: accent },
        background ? { backgroundColor: background } : null,
      ]}
    >
      <View style={[styles.eyebrow, { gap: theme.spacing.sm }]}>
        <Icon size={16} color={accent} strokeWidth={2.4} />
        <AppText variant="eyebrow" color="textSecondary">
          {eyebrow}
        </AppText>
      </View>
      {title ? <AppText variant="h3">{title}</AppText> : null}
      {children}
    </View>
  );
}

/**
 * Marks material shown exactly as printed while a manual-review item is open.
 * Learners see a short neutral note; reviewer mode also shows the item ids.
 */
export function ReviewNote({ reviewIds }: { reviewIds?: string[] }) {
  const theme = useAppTheme();
  if (!reviewIds || reviewIds.length === 0) return null;
  const ids = isReviewerMode() ? ` (${reviewIds.join(', ')})` : '';
  return (
    <View
      style={[
        styles.reviewNote,
        { gap: theme.spacing.xs, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
      ]}
    >
      <Hourglass size={14} color={theme.colors.textSecondary} />
      <AppText variant="small" color="textSecondary" style={styles.flex}>
        {`Shown as printed in the course notes · awaiting lecturer review${ids}`}
      </AppText>
    </View>
  );
}

/** Numbered lines of a proof or derivation. */
export function StepLines({ steps }: { steps: WorkedStep[] }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      {steps.map((line, index) => (
        <View key={`${index}-${line.explanation}`} style={{ gap: theme.spacing.xs }}>
          {line.explanation ? <MathText text={line.explanation} /> : null}
          {line.tex ? <MathExpression tex={line.tex} display size={17} /> : null}
          <ReviewNote reviewIds={line.reviewIds} />
        </View>
      ))}
    </View>
  );
}

/** Mathematics information uses the blue role; teaching cues use teal and amber. */
export function DefinitionCard({ term, text, tex }: { term: string; text: string; tex?: string }) {
  const theme = useAppTheme();
  return (
    <CardFrame icon={BookOpenText} eyebrow="DEFINITION" title={term} accent={theme.colors.secondary}>
      <MathText text={text} />
      {tex ? <MathExpression tex={tex} display /> : null}
    </CardFrame>
  );
}

export function TheoremCard({
  label,
  title,
  text,
  tex,
  textAfter,
  proof,
}: {
  label: string;
  title?: string;
  text: string;
  tex?: string;
  textAfter?: string;
  proof?: WorkedStep[];
}) {
  const theme = useAppTheme();
  return (
    <CardFrame icon={BadgeCheck} eyebrow={label.toUpperCase()} title={title} accent={theme.colors.secondary}>
      <MathText text={text} />
      {tex ? <MathExpression tex={tex} display /> : null}
      {textAfter ? <MathText text={textAfter} /> : null}
      {proof && proof.length > 0 ? (
        <Disclosure showLabel="Show the proof" hideLabel="Hide the proof">
          <StepLines steps={proof} />
        </Disclosure>
      ) : null}
    </CardFrame>
  );
}

export function FormulaCard({ title, tex, note }: { title: string; tex: string; note?: string }) {
  const theme = useAppTheme();
  return (
    <CardFrame icon={Sigma} eyebrow="KEY FORMULA" title={title} accent={theme.colors.secondary}>
      <MathExpression tex={tex} display />
      {note ? (
        <AppText variant="small" color="textSecondary">
          {note}
        </AppText>
      ) : null}
    </CardFrame>
  );
}

export function FormulaListCard({ title, items }: { title: string; items: FormulaItem[] }) {
  const theme = useAppTheme();
  return (
    <CardFrame icon={Sigma} eyebrow="FORMULAS" title={title} accent={theme.colors.secondary}>
      <View style={{ gap: theme.spacing.sm }}>
        {items.map((item, index) => (
          <View
            key={item.tex}
            style={[
              styles.listItem,
              { paddingTop: index === 0 ? 0 : theme.spacing.sm, borderTopColor: theme.colors.border },
              index === 0 ? null : styles.listDivider,
            ]}
          >
            <MathExpression tex={item.tex} display size={17} />
            {item.note ? (
              <AppText variant="small" color="textSecondary">
                {item.note}
              </AppText>
            ) : null}
            <ReviewNote reviewIds={item.reviewIds} />
          </View>
        ))}
      </View>
    </CardFrame>
  );
}

/** A two-column table, stacked on phones: each row reads "integrand → substitution". */
export function TableCard({
  title,
  columns,
  rows,
  note,
}: {
  title: string;
  columns: [string, string];
  rows: TableRow[];
  note?: string;
}) {
  const theme = useAppTheme();
  return (
    <CardFrame icon={Table} eyebrow="TABLE" title={title} accent={theme.colors.secondary}>
      <AppText variant="small" color="textSecondary">
        {`${columns[0]} → ${columns[1]}`}
      </AppText>
      <View style={{ gap: theme.spacing.sm }}>
        {rows.map((row, index) => (
          <View
            key={`${index}-${row.left}`}
            accessible
            accessibilityLabel={`${columns[0]}: ${speakText(row.left)}. ${columns[1]}: ${speakText(row.right)}.`}
            style={[
              styles.listItem,
              {
                paddingTop: index === 0 ? 0 : theme.spacing.sm,
                borderTopColor: theme.colors.border,
                gap: theme.spacing.xs,
              },
              index === 0 ? null : styles.listDivider,
            ]}
          >
            <MathText text={row.left} />
            <View style={[styles.eyebrow, { gap: theme.spacing.sm }]}>
              <ArrowRight size={16} color={theme.colors.primary} strokeWidth={2.4} />
              <View style={styles.flex}>
                <MathText text={row.right} />
              </View>
            </View>
            <ReviewNote reviewIds={row.reviewIds} />
          </View>
        ))}
      </View>
      {note ? (
        <AppText variant="small" color="textSecondary">
          {note}
        </AppText>
      ) : null}
    </CardFrame>
  );
}

/** An expandable derivation: the result is always visible, the steps on request. */
export function DerivationCard({
  title,
  intro,
  steps,
  resultTex,
}: {
  title: string;
  intro?: string;
  steps: WorkedStep[];
  resultTex?: string;
}) {
  const theme = useAppTheme();
  return (
    <CardFrame icon={ScrollText} eyebrow="DERIVATION" title={title} accent={theme.colors.secondary}>
      {intro ? <MathText text={intro} /> : null}
      {resultTex ? (
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="small" color="textSecondary">
            Result
          </AppText>
          <MathExpression tex={resultTex} display />
        </View>
      ) : null}
      <Disclosure showLabel="Show the derivation" hideLabel="Hide the derivation">
        <StepLines steps={steps} />
      </Disclosure>
    </CardFrame>
  );
}

export function SummaryCard({ title, points }: { title: string; points: string[] }) {
  const theme = useAppTheme();
  return (
    <CardFrame icon={ListChecks} eyebrow="KEY POINTS" title={title} accent={theme.colors.primary}>
      <View style={{ gap: theme.spacing.sm }}>
        {points.map((point) => (
          <View key={point} style={[styles.bullet, { gap: theme.spacing.sm }]}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <View style={styles.flex}>
              <MathText text={point} />
            </View>
          </View>
        ))}
      </View>
    </CardFrame>
  );
}

export function CalloutCard({
  tone,
  title,
  text,
  tex,
}: {
  tone: 'insight' | 'caution';
  title: string;
  text: string;
  tex?: string;
}) {
  const theme = useAppTheme();
  const insight = tone === 'insight';
  return (
    <CardFrame
      icon={insight ? Lightbulb : TriangleAlert}
      eyebrow={insight ? 'INSIGHT' : 'WATCH OUT'}
      title={title}
      accent={insight ? theme.colors.primary : theme.colors.achievementStrong}
      background={insight ? theme.colors.primarySoft : theme.colors.achievementSoft}
    >
      <MathText text={text} />
      {tex ? <MathExpression tex={tex} display /> : null}
    </CardFrame>
  );
}

/**
 * A figure from the course notes (or an app illustration, labelled as such),
 * redrawn to scale with the screen, with its printed caption and a short
 * description of what it shows.
 */
export function FigureCard({ figure }: { figure: FigureSpec }) {
  const theme = useAppTheme();
  return (
    <CardFrame
      icon={ChartSpline}
      eyebrow={figureHeading(figure).toUpperCase()}
      accent={figure.origin === 'unamFigure' ? theme.colors.secondary : theme.colors.primary}
    >
      <MathFigure figure={figure} />
      {figure.caption ? <MathText text={figure.caption} /> : null}
      <AppText variant="small" color="textSecondary">
        {figure.description}
      </AppText>
    </CardFrame>
  );
}

const styles = StyleSheet.create({
  frame: { borderLeftWidth: 4 },
  eyebrow: { flexDirection: 'row', alignItems: 'center' },
  listItem: { gap: 2 },
  listDivider: { borderTopWidth: StyleSheet.hairlineWidth },
  reviewNote: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
  flex: { flex: 1, minWidth: 0 },
});
