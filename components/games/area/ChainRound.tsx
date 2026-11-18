import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { LiveScene } from '@/components/explore/area/AreaParts';
import { MathExpression } from '@/components/math/MathExpression';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { type FigureItem, riemannRects } from '@/lib/figures/scene';
import { type ChainWidget, evaluateChainCard } from '@/lib/games/areaWidgets';
import { shuffled } from '@/lib/games/engine';

import { GameCard } from '../GameParts';
import type { WidgetProps } from './WidgetRound';
import { functionScene, show } from './scenes';

/** What the picture shows after each link of the chain is in place. */
function itemsAfter(widget: ChainWidget, placed: number, n: number): FigureItem[] {
  const { fn } = widget;
  const dx = (fn.b - fn.a) / n;
  if (placed === 0) return [{ k: 'area', f: fn.f, from: fn.a, to: fn.b, tone: 'fill2' }];
  const cuts: FigureItem[] = Array.from({ length: n + 1 }, (_, i) => ({
    k: 'segment',
    x1: fn.a + i * dx,
    y1: 0,
    x2: fn.a + i * dx,
    y2: Math.max(fn.f(fn.a + i * dx), 0),
    tone: 'guide',
    width: 1,
  }));
  if (placed === 1) return [{ k: 'area', f: fn.f, from: fn.a, to: fn.b, tone: 'fill2' }, ...cuts];
  const points: FigureItem[] = Array.from({ length: n }, (_, i) => ({
    k: 'point',
    x: fn.a + (i + 1) * dx,
    y: fn.f(fn.a + (i + 1) * dx),
    tone: 'asymptote',
  }));
  if (placed === 2) return [{ k: 'area', f: fn.f, from: fn.a, to: fn.b, tone: 'fill2' }, ...cuts, ...points];
  const rects = riemannRects(fn.f, fn.a, fn.b, n, 'right').rects;
  if (placed >= 5)
    return [
      { k: 'area', f: fn.f, from: fn.a, to: fn.b, tone: 'fill' },
      ...rects.map((r): FigureItem => (r.k === 'rect' ? { ...r, tone: 'fill2' } : r)),
    ];
  return n <= 30 ? [...rects, ...points] : rects;
}

const LINK_WORDS = ['the region', 'n strips', 'right endpoints', 'n rectangles', 'Rₙ in closed form', 'the limit'];

/**
 * Sum to Integral: build the chain Δx → xᵢ → f(xᵢ)Δx → Σ (closed form) →
 * limit, one card per link. The picture follows each link, and the limit
 * animates the rectangles thinning into the definite integral.
 */
export function ChainRound({ widget, locked, onResult }: WidgetProps<ChainWidget>) {
  const theme = useAppTheme();
  const reduced = useReducedMotion();
  const [placed, setPlaced] = useState<string[]>([]);
  const [animatedN, setN] = useState(6);
  const slotIndex = placed.length;
  const slot = widget.slots[slotIndex];
  const done = slotIndex >= widget.slots.length;
  // With Reduce Motion the last link shows the fine rectangles at once.
  const n = done && reduced ? 60 : animatedN;

  // The final link: rectangles thin out towards the integral (skipped with Reduce Motion).
  useEffect(() => {
    if (!done || reduced) return;
    let current = 6;
    const timer = setInterval(() => {
      current = Math.min(60, Math.round(current * 1.35));
      setN(current);
      if (current >= 60) clearInterval(timer);
    }, 160);
    return () => clearInterval(timer);
  }, [done, reduced]);

  const choose = (cardId: string) => {
    if (locked || !slot) return;
    const result = evaluateChainCard(widget, slotIndex, cardId);
    if (!result.correct) {
      onResult(result);
      return;
    }
    const next = [...placed, cardId];
    setPlaced(next);
    if (next.length < widget.slots.length) {
      onResult({ ...result, cannotCheck: true });
      if (next.length === 4) setN(12);
    } else onResult(result);
  };

  const scene = functionScene(widget.fn, itemsAfter(widget, placed.length, n), {
    ticks: [
      { at: widget.fn.a, label: widget.fn.aLabel ?? String(widget.fn.a) },
      { at: widget.fn.b, label: widget.fn.bLabel ?? String(widget.fn.b) },
    ],
  });

  return (
    <View style={{ gap: theme.spacing.md }}>
      <LiveScene
        scene={scene}
        description={`The region under y = ${widget.fn.tex}, showing ${LINK_WORDS[Math.min(placed.length, 5)]}${placed.length >= 3 ? ` with n = ${n}` : ''}.`}
      />
      <View style={{ gap: theme.spacing.sm }}>
        {widget.slots.map((s, i) => {
          const card = s.cards.find((c) => c.id === placed[i]);
          return (
            <View
              key={s.id}
              accessibilityLabel={`${s.label}: ${card ? 'placed' : i === slotIndex ? 'choose a card' : 'empty'}`}
              style={{
                borderWidth: i === slotIndex ? 2 : 1,
                borderStyle: card ? 'solid' : 'dashed',
                borderColor: i === slotIndex ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.radius.md,
                padding: theme.spacing.sm,
                gap: 2,
                backgroundColor: card ? theme.colors.primarySoft : theme.colors.surface,
              }}
            >
              <AppText
                variant="caption"
                color={card ? 'primary' : 'textSecondary'}
                style={{ fontFamily: theme.fontFamilies.semibold }}
              >
                {`${i + 1}. ${s.label}`}
              </AppText>
              {card ? <MathExpression tex={card.tex} size={16} /> : null}
            </View>
          );
        })}
      </View>
      {done ? (
        <MathExpression tex={`${widget.integralTex} = ${show(widget.value)}`} display />
      ) : slot ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="small" color="textSecondary">
            {`Place the card for “${slot.label}”.`}
          </AppText>
          {shuffled(slot.cards, `${widget.integralTex}-${slot.id}`).map((card) => (
            <GameCard
              key={card.id}
              item={{ tex: card.tex }}
              selected={false}
              disabled={locked}
              label={`Card ${card.tex}`}
              onPress={() => choose(card.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
