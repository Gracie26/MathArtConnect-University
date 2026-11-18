import { CircleAlert, CircleCheck, Lightbulb, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { CardFace } from '@/lib/games/engine';

/** Title, level and round counter. */
export function GameHeader({
  title,
  level,
  round,
  rounds,
  onHowToPlay,
}: {
  title: string;
  level: number;
  round: number;
  rounds: number;
  onHowToPlay: () => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <AppText variant="eyebrow" color="textSecondary">
          {`LEVEL ${level} · ROUND ${Math.min(round, rounds)} OF ${rounds}`}
        </AppText>
        <Pressable
          onPress={onHowToPlay}
          accessibilityRole="button"
          hitSlop={8}
          style={{ minHeight: theme.touchTarget.min, justifyContent: 'center' }}
        >
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            How to play
          </AppText>
        </Pressable>
      </View>
      <AppText variant="h1">{title}</AppText>
    </View>
  );
}

export function GameProgress({ done, total }: { done: number; total: number }) {
  return (
    <ProgressBar
      value={total === 0 ? 0 : done / total}
      height={6}
      accessibilityLabel={`${done} of ${total} rounds done`}
    />
  );
}

export function GameScore({ score, hintsUsed }: { score: number; hintsUsed: number }) {
  const theme = useAppTheme();
  return (
    <View
      style={[styles.row, { gap: theme.spacing.md }]}
      accessible
      accessibilityLabel={`Score ${score}. Hints used ${hintsUsed}.`}
    >
      <View style={[styles.row, { gap: 4 }]}>
        <Star size={16} color={theme.colors.achievementStrong} strokeWidth={2.4} />
        <AppText variant="caption" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          {`Score ${score}`}
        </AppText>
      </View>
      <AppText variant="caption" color="textSecondary">
        {`Hints ${hintsUsed}`}
      </AppText>
    </View>
  );
}

/** Hint button, then the hint text once asked for. */
export function GameHint({ hint, shown, onShow }: { hint: string; shown: boolean; onShow: () => void }) {
  const theme = useAppTheme();
  if (shown) {
    return (
      <View
        style={[
          styles.box,
          { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.sm, gap: theme.spacing.xs },
        ]}
      >
        <View style={[styles.row, { gap: 6 }]}>
          <Lightbulb size={15} color={theme.colors.primary} strokeWidth={2.4} />
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            Hint
          </AppText>
        </View>
        <MathText text={hint} />
      </View>
    );
  }
  return (
    <Pressable
      onPress={onShow}
      accessibilityRole="button"
      accessibilityLabel="Show a hint"
      hitSlop={8}
      style={[styles.row, { gap: 6, minHeight: theme.touchTarget.min }]}
    >
      <Lightbulb size={15} color={theme.colors.primary} strokeWidth={2.4} />
      <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        Hint
      </AppText>
    </Pressable>
  );
}

/** Feedback after an answer; icon and words, never colour alone. */
export function GameFeedback({ correct, text }: { correct: boolean; text: string }) {
  const theme = useAppTheme();
  const Icon = correct ? CircleCheck : CircleAlert;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.box,
        styles.row,
        {
          gap: theme.spacing.sm,
          borderRadius: theme.radius.sm,
          backgroundColor: correct ? theme.colors.successSoft : theme.colors.achievementSoft,
          alignItems: 'flex-start',
        },
      ]}
    >
      <Icon size={18} color={correct ? theme.colors.success : theme.colors.achievementStrong} strokeWidth={2.4} />
      <View style={styles.flex}>
        <AppText variant="caption" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          {correct ? 'Correct' : 'Not yet'}
        </AppText>
        <MathText text={text} variant="small" />
      </View>
    </View>
  );
}

/** Content of a card or choice: words with inline maths, and/or a display formula. */
export function CardContent({ item }: { item: CardFace }) {
  return (
    <View style={styles.flex}>
      {item.text ? <MathText text={item.text} /> : null}
      {item.tex ? <MathExpression tex={item.tex} display size={17} /> : null}
    </View>
  );
}

/** A tappable card for choices, order cards and match items. */
export function GameCard({
  item,
  selected,
  disabled = false,
  onPress,
  label,
  badge,
}: {
  item: CardFace;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
  label: string;
  /** Short state word shown on the card (e.g. "Selected", "1"). */
  badge?: string;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: theme.radius.md,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected
            ? theme.colors.primarySoft
            : pressed
              ? theme.colors.surfacePressed
              : theme.colors.surface,
          minHeight: theme.touchTarget.comfortable,
          gap: theme.spacing.sm,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill }]}>
          <AppText variant="small" color="onPrimary" style={{ fontFamily: theme.fontFamilies.bold }}>
            {badge}
          </AppText>
        </View>
      ) : null}
      <CardContent item={item} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1, minWidth: 0 },
  box: { padding: 12 },
  card: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  badge: { minWidth: 26, height: 26, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
});
