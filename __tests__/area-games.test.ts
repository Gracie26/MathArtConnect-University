/**
 * Topic 2 games: every round is solvable by a correct mathematical decision,
 * wrong decisions are rejected with an explanation, and nothing can be won by
 * guessing a single fixed action.
 */
import { AREA_ACTIVITIES } from '@/content/topics/area/activities';
import { ACTIVITY_EVIDENCE, EVIDENCE_LIMITATION } from '@/content/topics/area/evidence';
import { AREA_GAMES } from '@/content/topics/area/games';
import { simpson } from '@/lib/figures/scene';
import {
  accumulationTargets,
  type AreaWidget,
  averageValue,
  type CheckedEvaluation,
  evaluateAccumulationPlacement,
  evaluateChainCard,
  evaluateCombination,
  evaluateComparison,
  evaluateEqualHeight,
  evaluateImproperPrediction,
  evaluateImproperReason,
  evaluateIntervalPath,
  evaluateMeanPoint,
  evaluateRiemannBuild,
  evaluateRiemannPrediction,
  evaluateRiemannValue,
  evaluateSampleMatch,
  evaluateSplit,
  exactIntegral,
  type PathStep,
  riemannValue,
  smallestN,
} from '@/lib/games/areaWidgets';
import type { GameDefinition } from '@/lib/games/engine';

const widgetsOf = (game: GameDefinition): AreaWidget[] =>
  game.rounds.flatMap((r) => (r.kind === 'widget' ? [r.widget] : []));
const game = (id: string) => AREA_GAMES.find((g) => g.id === id)!;

/** Search for a sequence of interval pieces from the target's start to its end (breadth first). */
function findPath(widget: Extract<AreaWidget, { mode: 'intervals' }>): PathStep[] | null {
  const queue: { at: number; path: PathStep[] }[] = [{ at: widget.target.from, path: [] }];
  while (queue.length) {
    const { at, path } = queue.shift()!;
    if (at === widget.target.to && path.length) return path;
    if (path.length > 4) continue;
    for (const p of widget.pieces) {
      if (p.from === at) queue.push({ at: p.to, path: [...path, { pieceId: p.id, reversed: false }] });
      if (p.to === at) queue.push({ at: p.from, path: [...path, { pieceId: p.id, reversed: true }] });
    }
  }
  return null;
}

/** A correct play for each widget, as a list of evaluations a learner would see. */
function solve(widget: AreaWidget): CheckedEvaluation[] {
  switch (widget.type) {
    case 'riemann': {
      const { goal, fn } = widget;
      if (goal.type === 'predict') {
        const before = riemannValue(fn, { rule: goal.rule, n: goal.fromN, fractions: [] });
        const after = riemannValue(fn, { rule: goal.rule, n: goal.toN, fractions: [] });
        return [evaluateRiemannPrediction(widget, after > before ? 'increase' : 'decrease')];
      }
      if (goal.type === 'compute') {
        const value = riemannValue(fn, { rule: goal.rule, n: goal.n, fractions: [] });
        return [
          evaluateRiemannBuild(widget, { rule: goal.rule, n: goal.n, fractions: [] }),
          evaluateRiemannValue(widget, Number(value.toFixed(4))),
        ];
      }
      if (goal.type === 'sampleMatch') {
        const dx = (fn.b - fn.a) / goal.n;
        const fractions = Array.from({ length: goal.n }, (_, i) => {
          const left = fn.a + i * dx;
          const strip = simpson(fn.f, left, left + dx, 60) / dx;
          let best = 0;
          for (let k = 0; k <= 1000; k++) {
            if (Math.abs(fn.f(left + (k / 1000) * dx) - strip) < Math.abs(fn.f(left + best * dx) - strip))
              best = k / 1000;
          }
          return best;
        });
        return [evaluateSampleMatch(widget, fractions)];
      }
      if (goal.type === 'tolerance') {
        const n = smallestN(fn, 'midpoint', goal.tolerance)!;
        return [evaluateRiemannBuild(widget, { rule: 'midpoint', n, fractions: [] })];
      }
      // Under/overestimate: one of the endpoint rules must work for a monotone function.
      const left = evaluateRiemannBuild(widget, { rule: 'left', n: 4, fractions: [] });
      return [left.correct ? left : evaluateRiemannBuild(widget, { rule: 'right', n: 4, fractions: [] })];
    }
    case 'chain':
      return widget.slots.map((slot, i) => evaluateChainCard(widget, i, slot.cards.find((c) => c.correct)!.id));
    case 'property':
      if (widget.mode === 'combination') {
        return [evaluateCombination(widget, { reversed: widget.reversed, coefficients: widget.coefficients })];
      }
      return [evaluateIntervalPath(widget, findPath(widget)!)];
    case 'accumulation':
      return [evaluateAccumulationPlacement(widget, accumulationTargets(widget)[0]!)];
    case 'equalArea': {
      const avg = averageValue(widget.fn);
      let c = widget.fn.a;
      for (let k = 0; k <= 2000; k++) {
        const x = widget.fn.a + ((widget.fn.b - widget.fn.a) * k) / 2000;
        if (Math.abs(widget.fn.f(x) - avg) < Math.abs(widget.fn.f(c) - avg)) c = x;
      }
      return [evaluateEqualHeight(widget, avg), evaluateMeanPoint(widget, c)];
    }
    case 'improper':
      return [
        ...(widget.split ? [evaluateSplit(widget, widget.split.at)] : []),
        evaluateImproperPrediction(widget, widget.converges ? 'converges' : 'diverges'),
        evaluateImproperReason(widget, widget.reasons.find((r) => r.correct)!.id),
      ];
    case 'comparison': {
      const want = widget.converges ? 'converges' : 'diverges';
      const results = widget.candidates.map((c) => evaluateComparison(widget, c.id, want));
      return [results.find((r) => r.correct) ?? results[0]!];
    }
  }
}

describe('Topic 2 games', () => {
  test('there are eight games, one listed under each planned subtopic', () => {
    expect(AREA_GAMES.map((g) => g.id)).toEqual([
      'riemann-builder',
      'sum-to-integral',
      'property-builder',
      'area-derivative-link',
      'equal-area-height',
      'converge-or-diverge',
      'approach-the-asymptote',
      'compare-and-decide',
    ]);
    for (const g of AREA_GAMES) {
      const activity = AREA_ACTIVITIES.find((a) => a.id === g.id);
      expect(activity?.kind).toBe('game');
      expect(activity?.unitId).toBe(g.unitId);
      expect(activity?.alignment).toBe('course');
      expect(activity?.evidenceBasis?.length).toBeGreaterThan(0);
    }
  });

  test.each(AREA_GAMES.map((g) => [g.title, g]))('%s is well formed and every round is solvable', (_title, g) => {
    expect(g.tutorial.goal && g.tutorial.interaction && g.tutorial.skill && g.tutorial.scoring).toBeTruthy();
    expect(g.rounds.length).toBeGreaterThanOrEqual(3);
    for (const round of g.rounds) {
      expect(round.kind).toBe('widget');
      expect(round.hint.length).toBeGreaterThan(0);
    }
    for (const widget of widgetsOf(g)) {
      for (const result of solve(widget)) {
        expect(result.correct).toBe(true);
        expect(result.feedback.length).toBeGreaterThan(10);
      }
    }
  });

  test('evidence notes are internal and carry the limitation sentence', () => {
    expect(EVIDENCE_LIMITATION).toBe(
      'The cited literature supports the design principle; it does not establish the effectiveness of this specific MathArt Connect activity.',
    );
    for (const g of AREA_GAMES) expect(ACTIVITY_EVIDENCE[g.id]?.length).toBeGreaterThan(0);
    for (const g of AREA_GAMES) expect(JSON.stringify(g.tutorial)).not.toMatch(/Thomas|Schönherr|Tatar|Sylviani|doi/i);
  });
});

describe('Riemann Builder', () => {
  const widgets = widgetsOf(game('riemann-builder'));

  test('the wrong endpoint rule is rejected with the reason', () => {
    const under = widgets[0]!;
    if (under.type !== 'riemann') throw new Error('expected riemann');
    // cos x decreases, so left endpoints overestimate.
    const wrong = evaluateRiemannBuild(under, { rule: 'left', n: 6, fractions: [] });
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toMatch(/above it/);
    expect(evaluateRiemannBuild(under, { rule: 'right', n: 6, fractions: [] }).correct).toBe(true);
  });

  test('R₄ for 2x on [0, 1] is 1.25 (Example 2.2.1)', () => {
    const compute = widgets.find((w) => w.type === 'riemann' && w.goal.type === 'compute')!;
    if (compute.type !== 'riemann') throw new Error('expected riemann');
    expect(evaluateRiemannValue(compute, 1.25).correct).toBe(true);
    expect(evaluateRiemannValue(compute, 1).correct).toBe(false);
    expect(evaluateRiemannBuild(compute, { rule: 'left', n: 4, fractions: [] }).correct).toBe(false);
  });

  test('tolerance rounds cannot be won by maxing out n with an endpoint rule', () => {
    for (const w of widgets) {
      if (w.type !== 'riemann' || w.goal.type !== 'tolerance') continue;
      for (const rule of ['left', 'right'] as const) {
        expect(evaluateRiemannBuild(w, { rule, n: w.goal.maxN, fractions: [] }).correct).toBe(false);
      }
      expect(evaluateRiemannBuild(w, { rule: 'midpoint', n: w.goal.maxN + 5, fractions: [] }).correct).toBe(false);
    }
  });

  test('prediction rounds do not share one answer, so always tapping the same choice cannot win', () => {
    const answers = widgets.flatMap((w) =>
      w.type === 'riemann' && w.goal.type === 'predict'
        ? [evaluateRiemannPrediction(w, 'increase').correct ? 'increase' : 'decrease']
        : [],
    );
    expect(new Set(answers)).toEqual(new Set(['increase', 'decrease']));
    const predict = widgets.find((w) => w.type === 'riemann' && w.goal.type === 'predict')!;
    if (predict.type !== 'riemann') throw new Error('expected riemann');
    expect(evaluateRiemannPrediction(predict, 'decrease').feedback).toMatch(/thinner rectangles waste less/);
  });

  test('sample points all at the left end do not match the area', () => {
    const match = widgets.find((w) => w.type === 'riemann' && w.goal.type === 'sampleMatch')!;
    if (match.type !== 'riemann') throw new Error('expected riemann');
    expect(exactIntegral(match.fn)).toBeCloseTo(9, 6);
    expect(evaluateSampleMatch(match, [0, 0, 0]).correct).toBe(false);
  });
});

describe('Sum to Integral', () => {
  test('every link has exactly one correct card and every distractor explains its error', () => {
    for (const w of widgetsOf(game('sum-to-integral'))) {
      if (w.type !== 'chain') throw new Error('expected chain');
      expect(w.slots.map((s) => s.id)).toEqual(['dx', 'xi', 'term', 'sum', 'limit']);
      expect(simpson(w.fn.f, w.fn.a, w.fn.b, 2000)).toBeCloseTo(w.value, 6);
      for (const slot of w.slots) {
        expect(slot.cards.filter((c) => c.correct)).toHaveLength(1);
        for (const c of slot.cards.filter((card) => !card.correct)) expect(c.why).not.toMatch(/^Correct/);
      }
    }
  });
});

describe('Property Builder', () => {
  const widgets = widgetsOf(game('property-builder'));

  test('combination targets agree with the Tutorial 2 values', () => {
    const values = widgets.flatMap((w) =>
      w.type === 'property' && w.mode === 'combination'
        ? [w.known.reduce((s, k) => s + (w.coefficients[k.id] ?? 0) * k.value, 0) * (w.reversed ? -1 : 1)]
        : [],
    );
    expect(values).toEqual([150, -54, -38]);
  });

  test('forgetting to reverse the limits is caught', () => {
    const reversed = widgets.find((w) => w.type === 'property' && w.mode === 'combination' && w.reversed)!;
    if (reversed.type !== 'property' || reversed.mode !== 'combination') throw new Error('expected combination');
    const result = evaluateCombination(reversed, { reversed: false, coefficients: reversed.coefficients });
    expect(result.correct).toBe(false);
    expect(result.feedback).toMatch(/Theorem 2\.2\.3/);
  });

  test('interval paths must join end to end, and ∫₆² 2x dx = −32', () => {
    const backwards = widgets.find((w) => w.type === 'property' && w.mode === 'intervals' && w.target.from === 6)!;
    if (backwards.type !== 'property' || backwards.mode !== 'intervals') throw new Error('expected intervals');
    const path = findPath(backwards)!;
    expect(evaluateIntervalPath(backwards, path).value).toBe(-32);
    expect(evaluateIntervalPath(backwards, [{ pieceId: 'p3', reversed: false }]).correct).toBe(false);
  });
});

describe('Area–Derivative Link and Equal-Area Height', () => {
  test('A is largest where f changes from positive to negative', () => {
    const peak = widgetsOf(game('area-derivative-link')).at(-1)!;
    if (peak.type !== 'accumulation') throw new Error('expected accumulation');
    expect(accumulationTargets(peak)[0]).toBeCloseTo((7 * Math.PI) / 6, 1);
    expect(evaluateAccumulationPlacement(peak, 6).correct).toBe(false);
  });

  test('the mean value height balances excess against deficit; c must give f(c) = average', () => {
    const square = widgetsOf(game('equal-area-height'))[1]!;
    if (square.type !== 'equalArea') throw new Error('expected equalArea');
    expect(averageValue(square.fn)).toBeCloseTo(4 / 3, 6);
    expect(evaluateEqualHeight(square, 2).feedback).toMatch(/Too high/);
    expect(evaluateEqualHeight(square, 1).feedback).toMatch(/Too low/);
    expect(evaluateMeanPoint(square, 2 / Math.sqrt(3)).correct).toBe(true);
    expect(evaluateMeanPoint(square, 1).correct).toBe(false);
  });

  test('Equal-Area Height is labelled App practice', () => {
    expect(game('equal-area-height').tutorial.goal).toMatch(/App practice/);
    expect(AREA_ACTIVITIES.find((a) => a.id === 'equal-area-height')?.summary).toMatch(/App practice/);
  });
});

describe('improper integral games', () => {
  test('partial areas agree with the integrand and converge to the stated limits', () => {
    for (const id of ['converge-or-diverge', 'approach-the-asymptote']) {
      for (const w of widgetsOf(game(id))) {
        if (w.type !== 'improper') throw new Error('expected improper');
        const t = w.mode === 'infinite' ? 4 : w.approaches + (w.fixed > w.approaches ? 0.5 : -0.5);
        const [lo, hi] = t < w.fixed ? [t, w.fixed] : [w.fixed, t];
        expect(w.partial(t)).toBeCloseTo(simpson(w.f, lo, hi, 4000), 3);
        if (w.converges) {
          const far = w.mode === 'infinite' ? 1e7 : w.approaches + (w.fixed > w.approaches ? 1e-12 : -1e-12);
          expect(w.partial(far)).toBeCloseTo(w.limit!, 3);
        }
        expect(w.reasons.filter((r) => r.correct)).toHaveLength(1);
      }
    }
  });

  test('the interior asymptote round rejects the naive F(b) − F(a) split', () => {
    const interior = widgetsOf(game('approach-the-asymptote')).find((w) => w.type === 'improper' && w.split)!;
    if (interior.type !== 'improper') throw new Error('expected improper');
    expect(evaluateSplit(interior, 1).correct).toBe(false);
    expect(evaluateSplit(interior, 0).correct).toBe(true);
    expect(evaluateImproperPrediction(interior, 'converges').correct).toBe(false);
  });

  test('"approaches 0" is never accepted as the reason', () => {
    const w = widgetsOf(game('converge-or-diverge'))[0]!;
    if (w.type !== 'improper') throw new Error('expected improper');
    expect(evaluateImproperReason(w, 'zero').correct).toBe(false);
  });
});

describe('Compare & Decide', () => {
  test('a comparison that proves nothing does not win and is not scored as wrong', () => {
    const w = widgetsOf(game('compare-and-decide'))[0]!;
    if (w.type !== 'comparison') throw new Error('expected comparison');
    // 1/x is above e^(−x²) but its integral diverges: nothing follows.
    const nothing = evaluateComparison(w, 'recip', 'nothing');
    expect(nothing.correct).toBe(false);
    expect(nothing.cannotCheck).toBe(true);
    expect(nothing.feedback).toMatch(/Remark 2\.5\.4/);
    expect(evaluateComparison(w, 'recip', 'diverges').correct).toBe(false);
    expect(evaluateComparison(w, 'exp', 'converges').correct).toBe(true);
  });

  test('every round has a decoy whose comparison proves nothing', () => {
    for (const w of widgetsOf(game('compare-and-decide'))) {
      if (w.type !== 'comparison') throw new Error('expected comparison');
      const outcomes = w.candidates.map((c) => evaluateComparison(w, c.id, 'nothing'));
      expect(outcomes.some((o) => o.cannotCheck)).toBe(true);
    }
  });
});
