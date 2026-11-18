import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, type TextColorRole } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { speakTex, splitInlineMath } from '@/lib/math/tex';
import type { TypographyVariant } from '@/theme';

import { MathExpression } from './MathExpression';

interface MathTextProps {
  /** Text with inline mathematics between $…$. */
  text: string;
  variant?: TypographyVariant;
  color?: TextColorRole;
}

/**
 * A paragraph that mixes words and inline formulas. Words wrap naturally on
 * narrow screens; screen readers hear one sentence with the formulas spoken.
 */
export const MathText = memo(function MathText({ text, variant = 'body', color = 'textPrimary' }: MathTextProps) {
  const theme = useAppTheme();
  const parts = useMemo(() => splitInlineMath(text), [text]);
  const spoken = useMemo(
    () =>
      parts
        .map((p) => (p.type === 'math' ? speakTex(p.value) : p.value))
        .join('')
        .replace(/\s+/g, ' ')
        .trim(),
    [parts],
  );

  // Plain text: keep native line breaking.
  if (!parts.some((p) => p.type === 'math')) {
    return (
      <AppText variant={variant} color={color}>
        {text}
      </AppText>
    );
  }

  const fontSize = theme.typography[variant].fontSize;
  const words: { type: 'text' | 'math'; value: string; key: string }[] = parts.flatMap((part, partIndex) =>
    part.type === 'math'
      ? [{ type: part.type, value: part.value, key: `m${partIndex}` }]
      : part.value
          .split(/(\s+)/)
          .filter((w) => w.length > 0)
          .map((w, i) => ({ type: part.type, value: w, key: `t${partIndex}-${i}` })),
  );

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={spoken} style={styles.wrap}>
      {words.map((word) =>
        word.type === 'math' ? (
          <View key={word.key} style={styles.inlineMath}>
            <MathExpression tex={word.value} size={fontSize} />
          </View>
        ) : (
          <AppText key={word.key} variant={variant} color={color}>
            {word.value.replace(/\s+/g, ' ')}
          </AppText>
        ),
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  // rowGap keeps a root's bar or a fraction from touching the line above when text wraps.
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 4 },
  inlineMath: { marginHorizontal: 1 },
});
