import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { studyDay } from '@/features/learning/studyDay';
import { useActivityRecorder, useLearningHistory } from '@/features/learning/useLearningHistory';
import { useAppTheme } from '@/hooks/useAppTheme';

const CONFIDENCE = ['Not confident', 'A little', 'Getting there', 'Confident', 'Very confident'];

export interface ReflectionMetadata {
  question: string;
  answer: string;
  confidence: number;
  difficulty: string;
  note: string;
}

const asReflection = (metadata: unknown): ReflectionMetadata | null => {
  if (!metadata || typeof metadata !== 'object') return null;
  const m = metadata as Partial<ReflectionMetadata>;
  return typeof m.answer === 'string' && typeof m.confidence === 'number'
    ? {
        question: m.question ?? '',
        answer: m.answer,
        confidence: m.confidence,
        difficulty: m.difficulty ?? '',
        note: m.note ?? '',
      }
    : null;
};

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.option,
        {
          borderRadius: theme.radius.md,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          minHeight: theme.touchTarget.min,
        },
      ]}
    >
      <AppText variant="body" color="textPrimary">
        {selected ? `✓ ${label}` : label}
      </AppText>
    </Pressable>
  );
}

/**
 * Reflect: one conceptual question, a confidence rating (1–5), what was
 * difficult, and an optional note. Saved to the learner's history. It is not
 * a test, and confidence is never used to estimate mastery.
 */
export function ReflectCard({
  topicId,
  unitId,
  question,
  difficulties,
}: {
  topicId: string;
  unitId: string;
  question: string;
  difficulties: string[];
}) {
  const theme = useAppTheme();
  const record = useActivityRecorder();
  const { state, reload } = useLearningHistory(topicId);
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const previous =
    state.status === 'ready'
      ? state.history.activity
          .filter((a) => a.type === 'reflection' && a.refId === unitId)
          .map((a) => ({ at: a.occurredAt, reflection: asReflection(a.metadata) }))
          .filter((r): r is { at: string; reflection: ReflectionMetadata } => r.reflection !== null)
      : [];

  const save = async () => {
    if (answer.trim().length === 0 || confidence === null || difficulty === null) {
      setError('Answer the question, rate your confidence and choose what was difficult.');
      return;
    }
    setSaving(true);
    setError(null);
    const metadata: ReflectionMetadata = { question, answer: answer.trim(), confidence, difficulty, note: note.trim() };
    // Every reflection is saved; XP only for the first reflection on this subtopic each study day.
    const today = studyDay();
    const reflectedToday = previous.some((p) => studyDay(new Date(p.at)) === today);
    const result = await record({
      type: 'reflection',
      refId: unitId,
      topicId,
      summary: 'Reflected on a subtopic',
      xp: reflectedToday ? 0 : 5,
      metadata: { ...metadata },
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setSaved(true);
    setAnswer('');
    setConfidence(null);
    setDifficulty(null);
    setNote('');
    void reload();
  };

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.lg }]}>
        <AppText variant="small" color="textSecondary">
          A short reflection, not a test. Your answers are saved to your own learning history.
        </AppText>
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            1. Think about it
          </AppText>
          <MathText text={question} variant="bodyLarge" />
          <AuthTextField
            label="Your answer"
            value={answer}
            onChangeText={setAnswer}
            multiline
            placeholder="In your own words…"
          />
        </View>
        <View style={{ gap: theme.spacing.sm }} accessibilityRole="radiogroup">
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            2. How confident do you feel? (1–5)
          </AppText>
          <View style={[styles.wrap, { gap: theme.spacing.xs }]}>
            {CONFIDENCE.map((label, index) => (
              <Option
                key={label}
                label={`${index + 1} · ${label}`}
                selected={confidence === index + 1}
                onPress={() => setConfidence(index + 1)}
              />
            ))}
          </View>
        </View>
        <View style={{ gap: theme.spacing.sm }} accessibilityRole="radiogroup">
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            3. What was difficult?
          </AppText>
          {difficulties.map((label) => (
            <Option key={label} label={label} selected={difficulty === label} onPress={() => setDifficulty(label)} />
          ))}
        </View>
        <AuthTextField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Anything to remember…"
        />
        <FormError message={error} />
        {saved ? (
          <AppText variant="small" color="success" accessibilityLiveRegion="polite">
            Reflection saved.
          </AppText>
        ) : null}
        <LoadingButton label="Save reflection" loading={saving} loadingLabel="Saving" onPress={() => void save()} />
      </View>

      {previous.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="h3">Your earlier reflections</AppText>
          {previous.slice(0, 3).map(({ at, reflection }) => (
            <View key={at} style={[cardStyle(theme), { padding: theme.spacing.md, gap: 4 }]}>
              <AppText variant="small" color="textSecondary">
                {`${new Date(at).toLocaleDateString()} · confidence ${reflection.confidence} of 5 · ${reflection.difficulty}`}
              </AppText>
              <AppText variant="body">{reflection.answer}</AppText>
              {reflection.note ? (
                <AppText variant="small" color="textSecondary">
                  {reflection.note}
                </AppText>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center' },
});
