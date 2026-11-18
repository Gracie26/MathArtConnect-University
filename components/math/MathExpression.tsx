import { memo, type ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { type MathNode, parseTex, speak } from '@/lib/math/tex';

interface MathExpressionProps {
  tex: string;
  /** Block formula: centred, larger, scrolls horizontally if wider than the screen. */
  display?: boolean;
  /** Base font size (dp). */
  size?: number;
  /** Text colour; defaults to the primary text role. */
  color?: string;
  /** Overrides the generated spoken form. */
  accessibilityLabel?: string;
}

/** Binary operators and relations get a little space either side. */
const SPACED = new Set(['+', '−', '=', '±', '∓', '·', '×', '÷', '≠', '≤', '≥', '<', '>', '≈', '→', '⇒', '⇔']);
const SCRIPT_SCALE = 0.68;

interface Ctx {
  size: number;
  color: string;
  font: string;
  fontMedium: string;
  fontBold: string;
}

function Glyph({ text, ctx, spaced = false, scale = 1 }: { text: string; ctx: Ctx; spaced?: boolean; scale?: number }) {
  const size = ctx.size * scale;
  return (
    <Text
      allowFontScaling={false}
      style={{
        fontFamily: ctx.font,
        fontSize: size,
        lineHeight: size * 1.25,
        color: ctx.color,
        marginHorizontal: spaced ? size * 0.22 : 0,
        includeFontPadding: false,
      }}
    >
      {text}
    </Text>
  );
}

/** ∑ and lim take their limits above and below, not at the side. */
const stacksLimits = (base: MathNode): boolean =>
  base.kind === 'largeop' || (base.kind === 'fn' && base.name === 'lim');

function stacked(base: MathNode, ctx: Ctx, key: string | number, sub?: MathNode, sup?: MathNode): ReactNode {
  const small: Ctx = { ...ctx, size: ctx.size * SCRIPT_SCALE };
  return (
    <View key={key} style={[styles.stack, { marginHorizontal: ctx.size * 0.1 }]}>
      {sup ? renderNode(sup, small, 'sup') : null}
      {renderNode(base, ctx, 'base')}
      {sub ? renderNode(sub, small, 'sub') : null}
    </View>
  );
}

function renderNode(node: MathNode, ctx: Ctx, key: string | number = 0): ReactNode {
  const small: Ctx = { ...ctx, size: ctx.size * SCRIPT_SCALE };
  switch (node.kind) {
    case 'row':
      return (
        <View key={key} style={styles.row}>
          {node.children.map((child, index) => renderNode(child, ctx, index))}
        </View>
      );
    case 'ident':
    case 'number':
      return <Glyph key={key} text={node.text} ctx={ctx} />;
    case 'op':
      return <Glyph key={key} text={node.text} ctx={ctx} spaced={SPACED.has(node.text)} />;
    case 'fn':
      return (
        // A thin space before the name, as in TeX, so "a cos x" never reads as "acos x".
        <View key={key} style={{ marginLeft: ctx.size * 0.1, marginRight: ctx.size * 0.12 }}>
          <Glyph text={node.name} ctx={ctx} />
        </View>
      );
    case 'text':
      return <Glyph key={key} text={node.text} ctx={ctx} />;
    case 'space':
      return <View key={key} style={{ width: ctx.size * node.em }} />;
    case 'integral':
      return (
        <View key={key} style={{ marginRight: ctx.size * 0.08 }}>
          <Glyph text="∫" ctx={ctx} scale={1.45} />
        </View>
      );
    case 'largeop':
      return <Glyph key={key} text={node.text} ctx={ctx} scale={1.4} />;
    case 'bar':
      return (
        <View key={key} style={{ borderTopWidth: Math.max(1, ctx.size * 0.06), borderColor: ctx.color, paddingTop: 1 }}>
          {renderNode(node.body, ctx)}
        </View>
      );
    case 'under':
      return (
        <View key={key} style={styles.stack}>
          {renderNode(node.body, ctx, 'body')}
          <View
            style={[
              styles.brace,
              { borderColor: ctx.color, height: ctx.size * 0.35, borderWidth: Math.max(1, ctx.size * 0.06) },
            ]}
          />
          {renderNode(node.label, small, 'label')}
        </View>
      );
    case 'bold':
      return renderNode(node.body, { ...ctx, font: ctx.fontBold }, key);
    case 'matrix': {
      const columns = Math.max(...node.rows.map((r) => r.length));
      const bar = Math.max(1, ctx.size * 0.07);
      const edge = (side: 'left' | 'right') =>
        node.delimiter === 'bars' ? (
          <View style={{ width: bar, alignSelf: 'stretch', backgroundColor: ctx.color }} />
        ) : (
          <View
            style={{
              width: ctx.size * 0.3,
              alignSelf: 'stretch',
              borderColor: ctx.color,
              borderWidth: bar,
              ...(side === 'left'
                ? { borderRightWidth: 0, borderTopLeftRadius: ctx.size, borderBottomLeftRadius: ctx.size }
                : { borderLeftWidth: 0, borderTopRightRadius: ctx.size, borderBottomRightRadius: ctx.size }),
            }}
          />
        );
      return (
        <View key={key} style={[styles.row, { marginHorizontal: ctx.size * 0.15 }]}>
          {edge('left')}
          <View style={[styles.row, { paddingHorizontal: ctx.size * 0.3, gap: ctx.size * 0.8 }]}>
            {Array.from({ length: columns }, (_, c) => (
              <View key={c} style={[styles.stack, { gap: ctx.size * 0.2 }]}>
                {node.rows.map((row, r) => (
                  <View key={r}>{row[c] ? renderNode(row[c], ctx) : null}</View>
                ))}
              </View>
            ))}
          </View>
          {edge('right')}
        </View>
      );
    }
    case 'sup':
      if (stacksLimits(node.base)) return stacked(node.base, ctx, key, undefined, node.sup);
      return (
        <View key={key} style={styles.supWrap}>
          {renderNode(node.base, ctx)}
          <View style={{ marginBottom: ctx.size * 0.5 }}>{renderNode(node.sup, small)}</View>
        </View>
      );
    case 'sub':
      if (stacksLimits(node.base)) return stacked(node.base, ctx, key, node.sub);
      return (
        <View key={key} style={styles.subWrap}>
          {renderNode(node.base, ctx)}
          <View style={{ marginTop: ctx.size * 0.45 }}>{renderNode(node.sub, small)}</View>
        </View>
      );
    case 'subsup':
      if (stacksLimits(node.base)) return stacked(node.base, ctx, key, node.sub, node.sup);
      return (
        <View key={key} style={styles.row}>
          {renderNode(node.base, ctx)}
          <View style={[styles.scripts, { minHeight: ctx.size * 1.6 }]}>
            {renderNode(node.sup, small, 'sup')}
            {renderNode(node.sub, small, 'sub')}
          </View>
        </View>
      );
    case 'frac': {
      const inner: Ctx = { ...ctx, size: ctx.size * 0.9 };
      return (
        <View key={key} style={[styles.frac, { marginHorizontal: ctx.size * 0.12 }]}>
          <View style={styles.fracPart}>{renderNode(node.num, inner)}</View>
          <View style={[styles.fracBar, { backgroundColor: ctx.color, height: Math.max(1, ctx.size * 0.065) }]} />
          <View style={styles.fracPart}>{renderNode(node.den, inner)}</View>
        </View>
      );
    }
    case 'sqrt':
      return (
        <View key={key} style={styles.row}>
          {node.index ? <View style={{ marginBottom: ctx.size * 0.45 }}>{renderNode(node.index, small)}</View> : null}
          <Glyph text="√" ctx={ctx} scale={1.15} />
          <View
            style={{
              borderTopWidth: Math.max(1, ctx.size * 0.065),
              borderColor: ctx.color,
              paddingTop: 1,
              paddingHorizontal: 2,
            }}
          >
            {renderNode(node.body, ctx)}
          </View>
        </View>
      );
  }
}

/**
 * Native rendering of a formula written in the content TeX subset (no
 * WebView). Exposed to assistive technology as one element with a spoken
 * form, e.g. "integral of x to the power 6, d x".
 */
export const MathExpression = memo(function MathExpression({
  tex,
  display = false,
  size,
  color,
  accessibilityLabel,
}: MathExpressionProps) {
  const theme = useAppTheme();
  const parsed = useMemo(() => {
    try {
      const tree = parseTex(tex);
      return { tree, spoken: speak(tree).replace(/\s+/g, ' ').trim() };
    } catch (error) {
      if (__DEV__) console.warn(`MathExpression: could not parse "${tex}"`, error);
      return null;
    }
  }, [tex]);

  const ctx: Ctx = {
    size: size ?? (display ? 20 : 16),
    color: color ?? theme.colors.textPrimary,
    font: theme.fontFamilies.regular,
    fontMedium: theme.fontFamilies.medium,
    fontBold: theme.fontFamilies.bold,
  };

  // Never show nothing: fall back to the raw source if the formula cannot be laid out.
  const content = parsed ? renderNode(parsed.tree, ctx) : <Glyph text={tex} ctx={ctx} />;
  const label = accessibilityLabel ?? parsed?.spoken ?? tex;

  if (!display) {
    return (
      <View accessible accessibilityRole="text" accessibilityLabel={label} style={styles.inline}>
        {content}
      </View>
    );
  }
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={label}>
      {/* A formula wider than the screen scrolls; the indicator shows that more is hidden. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={styles.displayContent}
        style={styles.display}
      >
        {content}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center' },
  supWrap: { flexDirection: 'row', alignItems: 'flex-end' },
  subWrap: { flexDirection: 'row', alignItems: 'flex-start' },
  scripts: { justifyContent: 'space-between', marginLeft: 1 },
  stack: { alignItems: 'center', justifyContent: 'center' },
  brace: { alignSelf: 'stretch', borderTopWidth: 0, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  frac: { alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  fracPart: { paddingHorizontal: 3, alignItems: 'center' },
  fracBar: { alignSelf: 'stretch', marginVertical: 2 },
  display: { flexGrow: 0 },
  displayContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 6 },
});
