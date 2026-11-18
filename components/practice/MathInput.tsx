import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, type TextInputInstance, View } from 'react-native';

import { AuthTextField } from '@/components/forms/AuthTextField';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { parseStatement } from '@/lib/math/input/parse';
import { statementToTex } from '@/lib/math/input/toTex';

export interface InputKey {
  insert: string;
  label: string;
  spoken: string;
}

/** Keys that insert common symbols at the cursor; the label is what learners see. */
const KEYS: InputKey[] = [
  { insert: '∫ ', label: '∫', spoken: 'integral sign' },
  { insert: ' dx', label: 'dx', spoken: 'd x' },
  { insert: ' du', label: 'du', spoken: 'd u' },
  { insert: '^', label: 'xⁿ', spoken: 'power' },
  { insert: '/', label: '÷', spoken: 'divide' },
  { insert: '(', label: '(', spoken: 'open bracket' },
  { insert: ')', label: ')', spoken: 'close bracket' },
  { insert: '√(', label: '√', spoken: 'square root' },
  { insert: 'ln|', label: 'ln|', spoken: 'natural log of absolute value' },
  { insert: '|', label: '|', spoken: 'absolute value bar' },
  { insert: 'sin(', label: 'sin', spoken: 'sine' },
  { insert: 'cos(', label: 'cos', spoken: 'cosine' },
  { insert: 'tan(', label: 'tan', spoken: 'tangent' },
  { insert: 'sec(', label: 'sec', spoken: 'secant' },
  { insert: 'tan^-1(', label: 'tan⁻¹', spoken: 'inverse tangent' },
  { insert: 'sin^-1(', label: 'sin⁻¹', spoken: 'inverse sine' },
  { insert: 'e^(', label: 'eˣ', spoken: 'e to the power' },
  { insert: 'π', label: 'π', spoken: 'pi' },
  { insert: 'θ', label: 'θ', spoken: 'theta' },
  { insert: ' + C', label: '+ C', spoken: 'plus C' },
];

const VERDICT = /^\s*(converges?|convergent|diverges?|divergent)\s*\.?\s*$/i;
const INFINITY = /^\s*([-+−]?)\s*(∞|inf|infinity)\s*$/i;
const LIMIT = /^\s*lim\s*(?:_?\s*\(?\s*([nt])\s*(?:→|->)\s*([^)\s]*)\s*\)?)?\s*/i;
const INEQUALITY = /(≤|≥|<=|>=|<|>)/;
const RELATION_TEX: Record<string, string> = {
  '≤': '\\le',
  '<=': '\\le',
  '≥': '\\ge',
  '>=': '\\ge',
  '<': '<',
  '>': '>',
};

/** TeX for one side: a number, ∞, a limit, or an expression. Throws when it cannot be read. */
function sideTex(text: string): string {
  const infinity = INFINITY.exec(text);
  if (infinity) return `${infinity[1] ? '-' : ''}\\infty`;
  const limit = LIMIT.exec(text);
  if (limit && /^\s*lim/i.test(text)) {
    const variable = limit[1] ?? 'n';
    const target = (limit[2] ?? '').replace(/^(∞|inf|infinity)$/i, '\\infty') || '\\infty';
    return `\\lim_{${variable} \\to ${target}} ${statementToTex(parseStatement(text.slice(limit[0].length)))}`;
  }
  return statementToTex(parseStatement(text));
}

/** How a line is read: words such as "diverges", an inequality, a limit, or ordinary mathematics. */
export function readLine(text: string): { tex: string } | { words: string } | { error: string } | null {
  if (text.trim().length === 0) return null;
  if (VERDICT.test(text)) return { words: text.trim().toLowerCase() };
  try {
    const line = text.replace(/->/g, '→');
    const relation = INEQUALITY.exec(line);
    if (relation) {
      const [left = '', right = ''] = [line.slice(0, relation.index), line.slice(relation.index + relation[0].length)];
      return { tex: `${sideTex(left)} ${RELATION_TEX[relation[0]] ?? relation[0]} ${sideTex(right)}` };
    }
    // Only a line with a limit or ∞ is read side by side; anything else is one statement.
    if (/\blim|∞|infinity/i.test(line)) return { tex: line.split('=').map(sideTex).join(' = ') };
    return { tex: sideTex(line) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'This cannot be read yet.' };
  }
}

/** Shows how the input was read, or why it cannot be read yet. */
export function MathPreview({ text }: { text: string }) {
  const theme = useAppTheme();
  const parsed = useMemo(() => readLine(text), [text]);
  if (!parsed) return null;
  if ('words' in parsed) {
    return (
      <AppText variant="small" color="textSecondary">
        {`Read as: ${parsed.words}`}
      </AppText>
    );
  }
  if ('error' in parsed) {
    return (
      <AppText variant="small" color="textSecondary">
        {`Reading this as you type: ${parsed.error}`}
      </AppText>
    );
  }
  return (
    <View style={[styles.preview, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}>
      <MathExpression tex={parsed.tex} display size={18} />
    </View>
  );
}

/**
 * Text input for one line of mathematics, with a symbol keypad and a live
 * preview of how the line is read. Plain text such as "(3x+5)^6/18 + C" or
 * "∫ u^5 du" is accepted; see lib/math/input/parse.ts.
 */
export function MathInput({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  extraKeys = [],
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helper?: string;
  /** Keys for the question's method, shown before the standard ones (e.g. Δx, n, ∞). */
  extraKeys?: InputKey[];
}) {
  const theme = useAppTheme();
  const input = useRef<TextInputInstance>(null);
  const [selection, setSelection] = useState({ start: value.length, end: value.length });

  const insert = (text: string) => {
    const start = Math.min(selection.start, value.length);
    const end = Math.min(selection.end, value.length);
    const next = value.slice(0, start) + text + value.slice(end);
    onChangeText(next);
    const cursor = start + text.length;
    setSelection({ start: cursor, end: cursor });
    input.current?.focus();
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <AuthTextField
        ref={input}
        label={label}
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        placeholder={placeholder}
        helper={helper}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="default"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.keys, { gap: theme.spacing.xs }]}>
          {[...extraKeys, ...KEYS].map((key) => (
            <Pressable
              key={key.label}
              onPress={() => insert(key.insert)}
              accessibilityRole="button"
              accessibilityLabel={`Insert ${key.spoken}`}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: pressed ? theme.colors.surfacePressed : theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                  minHeight: theme.touchTarget.min,
                },
              ]}
            >
              <AppText variant="body" color="textPrimary">
                {key.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <MathPreview text={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  keys: { flexDirection: 'row' },
  key: { minWidth: 44, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  preview: { paddingHorizontal: 8, paddingVertical: 4 },
});
