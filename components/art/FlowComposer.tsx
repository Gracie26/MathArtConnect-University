import { ArrowDown, ArrowRight, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cardsFor, checkFlowOrder, type FlowConfig, type FlowLayout, type FlowProject } from '@/lib/graph/flow';

import type { SaveStatus } from './EquationArtStudio';

const ACCENTS = ['Teal', 'Blue', 'Coral', 'Amber'] as const;
const LAYOUTS: { id: FlowLayout; label: string }[] = [
  { id: 'vertical', label: 'Column' },
  { id: 'zigzag', label: 'Zigzag' },
  { id: 'horizontal', label: 'Row' },
];

function Pill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.pill,
        {
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          minHeight: theme.touchTarget.min,
        },
      ]}
    >
      <AppText
        variant="caption"
        color={selected ? 'primary' : 'textPrimary'}
        style={{ fontFamily: theme.fontFamilies.semibold }}
      >
        {selected ? `✓ ${label}` : label}
      </AppText>
    </Pressable>
  );
}

/**
 * Structure / solution-flow creation: arrange the stages of a method from a
 * course example, check the order, then compose it visually with notes,
 * layout and colour. Mathematically meaningful, not decorative graph art.
 */
export function FlowComposer({
  config,
  initial,
  onSave,
  saveStatus,
}: {
  config: FlowConfig;
  initial: FlowProject;
  onSave: (project: FlowProject, completed: boolean) => void;
  saveStatus: SaveStatus;
}) {
  const theme = useAppTheme();
  const [project, setProject] = useState(initial);
  const [check, setCheck] = useState<{ correct: boolean; message: string } | null>(null);
  const example = config.examples.find((e) => e.id === project.exampleId) ?? config.examples[0];
  if (!example) return null;
  const byId = new Map(example.nodes.map((n) => [n.id, n]));
  const accents = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.achievementStrong];
  const softs = [
    theme.colors.primarySoft,
    theme.colors.secondarySoft,
    theme.colors.accentSoft,
    theme.colors.achievementSoft,
  ];
  const accent = accents[project.accent % accents.length] as string;
  const soft = softs[project.accent % softs.length] as string;
  const update = (change: Partial<FlowProject>) => setProject((p) => ({ ...p, ...change }));
  const answered = config.questions.some((q) => (project.math.answers[q.id] ?? '').trim().length > 0);

  const nodeCard = (id: string, index: number) => {
    const node = byId.get(id);
    if (!node) return null;
    const offset = project.layout === 'zigzag' ? (index % 2 === 0 ? 0 : 36) : 0;
    return (
      <View
        key={id}
        accessible
        accessibilityLabel={`Stage ${index + 1}${project.verified ? `, ${node.role}` : ''}. ${project.notes[id] ?? ''}`}
        style={[
          styles.node,
          {
            marginLeft: offset,
            borderColor: accent,
            borderStyle: project.dashedLinks ? 'dashed' : 'solid',
            backgroundColor: soft,
            borderRadius: theme.radius.md,
            gap: 4,
            width: project.layout === 'horizontal' ? 240 : undefined,
          },
        ]}
      >
        <AppText variant="caption" style={{ color: accent, fontFamily: theme.fontFamilies.bold }}>
          {project.verified ? `${index + 1}. ${node.role}` : `${index + 1}.`}
        </AppText>
        <MathExpression tex={node.tex} display size={16} />
        {project.notes[id] ? <AppText variant="small">{project.notes[id]}</AppText> : null}
      </View>
    );
  };

  const Link = project.layout === 'horizontal' ? ArrowRight : ArrowDown;
  const composition = (
    <View style={[project.layout === 'horizontal' ? styles.rowFlow : styles.columnFlow, { gap: 4 }]}>
      {project.placed.map((id, index) => (
        <View key={id} style={project.layout === 'horizontal' ? styles.rowFlow : undefined}>
          {nodeCard(id, index)}
          {index < project.placed.length - 1 ? (
            <View style={[styles.link, project.layout === 'zigzag' ? { marginLeft: index % 2 === 0 ? 24 : 60 } : null]}>
              <Link size={20} color={accent} strokeWidth={2.4} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <AuthTextField
        label="Project title"
        value={project.title}
        onChangeText={(title) => update({ title: title.slice(0, 120) })}
      />

      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Course example
        </AppText>
        <View style={[styles.wrap, { gap: theme.spacing.xs }]} accessibilityRole="radiogroup">
          {config.examples.map((e) => (
            <Pill
              key={e.id}
              label={e.title}
              selected={e.id === example.id}
              onPress={() => {
                update({ exampleId: e.id, placed: [], verified: false, notes: {} });
                setCheck(null);
              }}
            />
          ))}
        </View>
      </View>

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <AppText variant="h3">{project.verified ? 'Your composition' : 'Arrange the stages'}</AppText>
        {project.verified ? null : (
          <AppText variant="small" color="textSecondary">
            Tap the stages in the order the method uses them. Tap × to take one back.
          </AppText>
        )}
        {project.placed.length === 0 ? (
          <AppText variant="small" color="textMuted">
            No stages placed yet.
          </AppText>
        ) : project.layout === 'horizontal' ? (
          <ScrollView horizontal>{composition}</ScrollView>
        ) : (
          composition
        )}
        {project.verified ? null : (
          <>
            {project.placed.length > 0 ? (
              <View style={[styles.wrap, { gap: theme.spacing.xs }]}>
                {project.placed.map((id, index) => (
                  <Pressable
                    key={id}
                    onPress={() => update({ placed: project.placed.filter((p) => p !== id) })}
                    accessibilityRole="button"
                    accessibilityLabel={`Take back stage ${index + 1}`}
                    style={[
                      styles.pill,
                      {
                        borderRadius: theme.radius.pill,
                        borderColor: theme.colors.border,
                        minHeight: theme.touchTarget.min,
                      },
                    ]}
                  >
                    <View style={[styles.wrap, { gap: 4 }]}>
                      <AppText variant="caption">{`${index + 1}`}</AppText>
                      <X size={14} color={theme.colors.textSecondary} />
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              Stages
            </AppText>
            {cardsFor(example)
              .filter((n) => !project.placed.includes(n.id))
              .map((node) => (
                <Pressable
                  key={node.id}
                  onPress={() => {
                    update({ placed: [...project.placed, node.id] });
                    setCheck(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Place this stage next`}
                  style={[
                    styles.card,
                    {
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.md,
                      minHeight: theme.touchTarget.comfortable,
                    },
                  ]}
                >
                  <MathExpression tex={node.tex} display size={16} />
                </Pressable>
              ))}
            <LoadingButton
              label="Check order"
              disabled={project.placed.length === 0}
              onPress={() => {
                const result = checkFlowOrder(example, project.placed);
                setCheck(result);
                if (result.correct) update({ verified: true });
              }}
            />
          </>
        )}
        {check ? (
          <MathText
            text={`${check.correct ? '✓' : '✗'} ${check.message}`}
            variant="small"
            color={check.correct ? 'success' : 'textPrimary'}
          />
        ) : null}
      </View>

      {project.verified ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
          <AppText variant="h3">Make it yours</AppText>
          <View style={[styles.wrap, { gap: theme.spacing.xs }]} accessibilityRole="radiogroup">
            {LAYOUTS.map((l) => (
              <Pill
                key={l.id}
                label={l.label}
                selected={project.layout === l.id}
                onPress={() => update({ layout: l.id })}
              />
            ))}
          </View>
          <View style={[styles.wrap, { gap: theme.spacing.xs }]} accessibilityRole="radiogroup">
            {ACCENTS.map((name, i) => (
              <Pill key={name} label={name} selected={project.accent === i} onPress={() => update({ accent: i })} />
            ))}
          </View>
          <Pill
            label="Dashed outlines"
            selected={project.dashedLinks}
            onPress={() => update({ dashedLinks: !project.dashedLinks })}
          />
          {example.nodes.map((node, i) => (
            <AuthTextField
              key={node.id}
              label={`Note for stage ${i + 1}: ${node.role}`}
              value={project.notes[node.id] ?? ''}
              onChangeText={(text) => update({ notes: { ...project.notes, [node.id]: text.slice(0, 140) } })}
              placeholder={node.note}
            />
          ))}
        </View>
      ) : null}

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <AppText variant="h3">Math behind my creation</AppText>
        <MathText text={config.concept} />
        {config.questions.map((q) => (
          <View key={q.id} style={{ gap: theme.spacing.xs }}>
            <MathText text={q.prompt} />
            <AuthTextField
              label="Your answer"
              value={project.math.answers[q.id] ?? ''}
              onChangeText={(text) =>
                update({ math: { ...project.math, answers: { ...project.math.answers, [q.id]: text } } })
              }
              multiline
            />
          </View>
        ))}
        <AuthTextField
          label="Explain your creation (optional)"
          value={project.math.explanation}
          onChangeText={(explanation) => update({ math: { ...project.math, explanation } })}
          multiline
        />
      </View>

      {saveStatus.status === 'error' ? <FormError message={saveStatus.message} /> : null}
      {saveStatus.status === 'saved' ? (
        <AppText variant="small" color="success" accessibilityLiveRegion="polite">
          {`Saved "${project.title}".`}
        </AppText>
      ) : null}
      <LoadingButton
        label={project.verified && answered ? 'Save and mark complete' : 'Save project'}
        loading={saveStatus.status === 'saving'}
        loadingLabel="Saving"
        onPress={() => onSave(project, project.verified && answered)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  pill: { paddingHorizontal: 12, justifyContent: 'center' },
  card: { borderWidth: 1, paddingHorizontal: 8, justifyContent: 'center' },
  node: { borderWidth: 2, padding: 10 },
  columnFlow: { flexDirection: 'column' },
  rowFlow: { flexDirection: 'row', alignItems: 'center' },
  link: { alignItems: 'center', justifyContent: 'center', padding: 2 },
});
