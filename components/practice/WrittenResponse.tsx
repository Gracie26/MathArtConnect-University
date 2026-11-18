import { CircleCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StepLines } from '@/components/learning/ContentCards';
import { Disclosure } from '@/components/learning/Disclosure';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { PracticeItem } from '@/content/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { studyDay } from '@/features/learning/studyDay';
import { useActivityRecorder } from '@/features/learning/useLearningHistory';
import { useAppTheme } from '@/hooks/useAppTheme';
import { activityLogRepository } from '@/services/repositories/learning';

const MAX_LENGTH = 2000;

interface SavedResponse {
  response: string;
  savedAt: string;
}

/** The learner's latest saved comment for this question, from the activity log. */
function latestResponse(
  records: { refId: string | null; metadata: unknown; occurredAt: string }[],
  itemId: string,
): SavedResponse | null {
  // The newest save wins, whatever order the repository returns.
  let latest: SavedResponse | null = null;
  for (const record of records) {
    const meta = record.metadata as { kind?: unknown; response?: unknown } | null;
    if (record.refId !== itemId || meta?.kind !== 'writtenResponse' || typeof meta.response !== 'string') continue;
    if (!latest || record.occurredAt > latest.savedAt) latest = { response: meta.response, savedAt: record.occurredAt };
  }
  return latest;
}

/**
 * A question that asks for a written comment (e.g. "Comment on the
 * results"). The learner writes and saves a response; it is never graded
 * by string matching. After saving, the app guidance can be opened to
 * compare.
 */
export function WrittenResponse({ item }: { item: PracticeItem }) {
  const theme = useAppTheme();
  const { user } = useAuth();
  const record = useActivityRecorder();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState<SavedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Show the learner's earlier comment when they come back to the question.
  useEffect(() => {
    if (!user) return;
    let active = true;
    void activityLogRepository.list(user.id, item.topicId).then((result) => {
      if (!active || !result.ok) return;
      const previous = latestResponse(result.data, item.id);
      if (previous) {
        setSaved(previous);
        setText((current) => (current.length > 0 ? current : previous.response));
      }
    });
    return () => {
      active = false;
    };
  }, [user, item.id, item.topicId]);

  const save = async () => {
    const response = text.trim().slice(0, MAX_LENGTH);
    const result = await record({
      type: 'practice',
      refId: item.id,
      topicId: item.topicId,
      summary: 'Wrote a comment on a practice question',
      // +2 XP once a day per question; later edits that day are saved with no XP.
      xp: saved && studyDay(new Date(saved.savedAt)) === studyDay() ? 0 : 2,
      metadata: { kind: 'writtenResponse', questionId: item.id, unitId: item.unitId, response },
    });
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setError(null);
    setSaved({ response, savedAt: result.data.occurredAt });
  };

  const unchanged = saved !== null && saved.response === text.trim();

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <AppText variant="eyebrow" color="primary">
        MY RESPONSE
      </AppText>
      <AppText variant="small" color="textSecondary">
        This question asks for a written comment, so it is not marked automatically. Write your response and save it;
        then compare it with the app guidance.
      </AppText>
      <AuthTextField
        label="Your comment"
        value={text}
        onChangeText={(value) => setText(value.slice(0, MAX_LENGTH))}
        placeholder="What do you notice about the results?"
        multiline
        textAlignVertical="top"
        numberOfLines={5}
        helper={`${text.length}/${MAX_LENGTH} characters`}
      />
      <FormError message={error} />
      <LoadingButton
        label={unchanged ? 'Saved' : 'Save my response'}
        disabled={text.trim().length === 0 || unchanged}
        onPress={() => void save()}
      />
      {saved ? (
        <View style={[styles.row, { gap: theme.spacing.sm }]} accessibilityLiveRegion="polite">
          <CircleCheck size={16} color={theme.colors.success} strokeWidth={2.4} />
          <AppText variant="small" color="textSecondary">
            {`Response saved ${new Date(saved.savedAt).toLocaleString()}`}
          </AppText>
        </View>
      ) : null}
      {saved && item.solution ? (
        <Disclosure showLabel="Compare with app guidance" hideLabel="Hide app guidance">
          <View
            style={[
              styles.guidance,
              { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.md, gap: theme.spacing.md },
            ]}
          >
            <AppText variant="small" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              App guidance · written for this app, not an official UNAM or lecturer solution
            </AppText>
            <MathText text={item.solution.method} />
            <StepLines steps={item.solution.steps} />
            <MathExpression tex={item.solution.answerTex} display />
          </View>
        </Disclosure>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  guidance: { padding: 14 },
});
