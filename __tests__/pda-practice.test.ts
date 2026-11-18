/**
 * Topic 4 practice: Tutorial 5 (35 parts) and §4.3.1 APP PRACTICE (4 items).
 *
 * Locks the approved counts and placement, and verifies every piece of
 * app-authored working independently of the authoring: derivatives against
 * the safe evaluator, values of ∇F at the point, planes and normal lines
 * against the checker, critical points against a numerical search (so a
 * missing critical point fails the build), and every value of d and every
 * classification against Theorem 4.3.3. Every suggested answer must be
 * accepted and a wrong answer rejected. Tutorial 5 has no answer key: every
 * solution is an APP-GENERATED SOLUTION, pending lecturer review; Q5(m) is a
 * written self-check question with its solution withheld (MR4-10).
 */
import { matchesPracticeSource, practiceSourceLabel, practiceSourceOptions } from '@/content/practiceSources';
import { applicationsTopic, PDA_UNITS as U } from '@/content/topics/applications';
import { PDA_PRACTICE_ITEMS } from '@/content/topics/applications/allPractice';
import { APP_PRACTICE_ITEMS } from '@/content/topics/applications/appPractice';
import { evaluateNumber, type PdaPracticeSpec, SUGGESTED } from '@/content/topics/applications/practice';
import { PDA_RETRIEVAL } from '@/content/topics/applications/review';
import { TUT5 } from '@/content/topics/applications/sources';
import { TUTORIAL5_ITEMS } from '@/content/topics/applications/tutorial5';
import type { PracticeItem } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { checkerFor } from '@/features/practice/checkProblem';
import { classify, findCriticalPoints } from '@/lib/explore/extrema';
import { compileFn } from '@/lib/explore/rn';
import { checkSurfaceLine, compileSurface } from '@/lib/math/applications';

const topic = applicationsTopic;
const ALL = [...PDA_PRACTICE_ITEMS, ...PDA_RETRIEVAL];
const spec = (item: PracticeItem): PdaPracticeSpec => {
  const s = SUGGESTED.get(item.id);
  if (!s) throw new Error(`No authored working for ${item.id}`);
  return s;
};
const close = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

/** The suggested final answer, in the syntax learners type. */
function suggested(s: PdaPracticeSpec): string {
  switch (s.kind) {
    case 'derivatives':
      return s.answers.join(', ');
    case 'surface':
      return s.line ? `${s.plane}; ${s.line}` : s.plane;
    case 'extrema':
      return s.points.map((p) => `(${p.x}, ${p.y})${s.classify ? ` ${p.type}` : ''}`).join('; ');
    case 'written':
      return '';
  }
}

describe('locked counts and placement', () => {
  test('Tutorial 5 has 35 parts, App practice has 4: 39 in all', () => {
    expect(TUTORIAL5_ITEMS).toHaveLength(35);
    expect(APP_PRACTICE_ITEMS).toHaveLength(4);
    expect(PDA_PRACTICE_ITEMS).toHaveLength(39);
    expect(topic.practiceItems).toHaveLength(39);
    const perQuestion: Record<string, number> = {};
    for (const i of TUTORIAL5_ITEMS) perQuestion[i.sourceQuestion!] = (perQuestion[i.sourceQuestion!] ?? 0) + 1;
    expect(perQuestion).toEqual({ Q1: 8, Q2: 4, Q3: 5, Q4: 5, Q5: 13 });
    expect(TUTORIAL5_ITEMS.filter((i) => i.sourceQuestion === 'Q5').map((i) => i.sourceSubquestion)).toEqual(
      'abcdefghijklm'.split(''),
    );
  });

  test('ids are unique and nothing is withheld or hidden', () => {
    expect(new Set(ALL.map((i) => i.id)).size).toBe(ALL.length);
    expect(PDA_PRACTICE_ITEMS.every((i) => !i.withheldFromLearners && isPracticeItemVisible(i))).toBe(true);
  });

  test('approved placement: Q1 (§3.3 review) and Q2 in The Gradient, Q3–Q4 in Tangent Planes, Q5 in the Second Partials Test', () => {
    const where = (q: string) => [
      ...new Set(TUTORIAL5_ITEMS.filter((i) => i.sourceQuestion === q).map((i) => `${i.unitId} ${i.sourceSection}`)),
    ];
    expect(where('Q1')).toEqual([`${U.gradient} 3-3`]);
    expect(where('Q2')).toEqual([`${U.gradient} 4-1`]);
    expect(where('Q3')).toEqual([`${U.tangentPlanes} 4-2-1`]);
    expect(where('Q4')).toEqual([`${U.tangentPlanes} 4-2-1`]);
    expect(where('Q5')).toEqual([`${U.secondPartials} 4-3-1`]);
    for (const i of APP_PRACTICE_ITEMS) {
      expect([i.sourceType, i.unitId, i.sourceSection]).toEqual(['app-practice', U.criticalPoints, '4-3-1']);
    }
  });

  test('every tutorial question shows its source; App practice is labelled by its card, never as a tutorial question', () => {
    for (const i of TUTORIAL5_ITEMS) {
      expect(i.sourceType).toBe('tutorial-question');
      expect(i.source.document).toBe(TUT5);
      expect([1, 2]).toContain(i.source.page);
      expect(practiceSourceLabel(i)).toBe(`Tutorial 5 · ${i.source.item}`);
    }
    expect(practiceSourceLabel(TUTORIAL5_ITEMS.find((i) => i.id === 'tut5-q5-m')!)).toBe('Tutorial 5 · Q5(m)');
    for (const i of APP_PRACTICE_ITEMS) expect(practiceSourceLabel(i)).toBeNull();
  });

  test('practice filters: Tutorial 5 and App practice', () => {
    const options = practiceSourceOptions(topic);
    expect(options.map((o) => o.label)).toEqual(['Tutorial 5', 'App practice']);
    expect(options.map((o) => PDA_PRACTICE_ITEMS.filter((i) => matchesPracticeSource(i, o)).length)).toEqual([35, 4]);
  });

  test('every item appears exactly once, in its own subtopic’s Practise step', () => {
    const shown = new Map<string, number>();
    for (const unit of topic.units) {
      const practise = unit.steps.find((s) => s.key === 'practise')!;
      expect(practise.required).toBe(true);
      for (const block of practise.blocks) {
        if (block.type !== 'practiceGroup') continue;
        for (const item of block.items) {
          expect(item.unitId).toBe(unit.id);
          shown.set(item.id, (shown.get(item.id) ?? 0) + 1);
        }
      }
    }
    expect(shown.size).toBe(39);
    expect([...shown.values()].every((n) => n === 1)).toBe(true);
  });

  test('Q1 is a clearly labelled review of §3.3 prior knowledge, kept within Topic 4', () => {
    const unit = topic.units.find((u) => u.id === U.gradient)!;
    const groups = unit.steps
      .find((s) => s.key === 'practise')!
      .blocks.filter((b) => b.type === 'practiceGroup')
      .map((b) => (b.type === 'practiceGroup' ? b : null)!);
    const review = groups.find((g) => g.title === 'Review from §3.3: Total Differential and Gradient Components')!;
    expect(review.items.map((i) => i.id)).toEqual(
      TUTORIAL5_ITEMS.filter((i) => i.sourceQuestion === 'Q1').map((i) => i.id),
    );
    expect(review.text).toMatch(/prior knowledge from Chapter 3 §3\.3/);
    expect(review.text).toMatch(/components of the gradient/);
    // Not on any Chapter 4 section page (it is §3.3 material), and Topic 3 is not changed.
    const onPages = (topic.sections ?? []).flatMap((s) => [...s.tryIt, ...s.tutorial].map((i) => i.id));
    expect(onPages.filter((id) => id.startsWith('tut5-q1-'))).toEqual([]);
    expect(new Set(onPages).size).toBe(27);
  });

  test('Subtopic 3 practises with App practice and points to Q5 in Subtopic 4', () => {
    const unit = topic.units.find((u) => u.id === U.criticalPoints)!;
    const practise = unit.steps.find((s) => s.key === 'practise')!;
    const groups = practise.blocks.filter((b) => b.type === 'practiceGroup');
    expect(groups.map((g) => (g.type === 'practiceGroup' ? g.title : ''))).toEqual([
      'APP PRACTICE: Finding critical points',
    ]);
    const text = practise.blocks.map((b) => (b.type === 'paragraph' ? b.text : '')).join(' ');
    expect(text).toContain('Question 5');
  });
});

describe('labels and grading', () => {
  test('38 auto-graded items (34 Tutorial 5 parts, 4 App practice) and one written self-check question (Q5(m), MR4-10, solution withheld)', () => {
    const written = PDA_PRACTICE_ITEMS.filter((i) => i.grading === 'written');
    expect(written.map((i) => i.id)).toEqual(['tut5-q5-m']);
    expect(PDA_PRACTICE_ITEMS.filter((i) => i.grading === 'auto')).toHaveLength(38);
    const m = written[0]!;
    expect(m.solution).toBeUndefined();
    expect(m.reviewIds).toEqual(['MR4-08', 'MR4-10']);
    const checker = checkerFor(m)!;
    expect(checker.gradesAnswer).toBe(false);
    expect(checker.checkAnswer('(1, 1) max').message).toMatch(/withheld until the lecturer gives guidance/);
  });

  test('every other solution is an APP-GENERATED SOLUTION, pending lecturer review, never an official one', () => {
    for (const item of ALL.filter((i) => i.grading !== 'written')) {
      expect(item.solution?.status).toBe('pendingLecturerReview');
      expect(item.solution?.appGenerated).toBe(true);
      expect(item.solution?.steps.length).toBeGreaterThan(0);
      expect(item.hints).toHaveLength(3);
    }
  });

  test('review flags: MR4-08 on every Q5 part, MR4-11 on Q5(i), MR4-02 on Q2(iv)', () => {
    for (const i of TUTORIAL5_ITEMS.filter((x) => x.sourceQuestion === 'Q5')) expect(i.reviewIds).toContain('MR4-08');
    expect(TUTORIAL5_ITEMS.find((i) => i.id === 'tut5-q5-i')!.reviewIds).toEqual(['MR4-08', 'MR4-11']);
    expect(TUTORIAL5_ITEMS.find((i) => i.id === 'tut5-q2-iv')!.reviewIds).toEqual(['MR4-02']);
  });
});

describe('authored working is verified independently', () => {
  test('every derivative written in a walkthrough is the derivative of the question', () => {
    const failures: string[] = [];
    for (const item of ALL) {
      const s = spec(item);
      if (s.kind === 'derivatives') {
        const F = compileFn((s.partial.targets[0] as { f: string }).f, s.partial.variables);
        for (const [i, text] of s.derivatives.entries()) {
          const D = compileFn(text, s.partial.variables);
          for (const p of s.partial.samples) {
            const want = F.d(p, s.partial.variables[i]!);
            if (!close(D.value(p), want, 1e-7)) failures.push(`${item.id} ∂/∂${s.partial.variables[i]}`);
          }
        }
      }
      if (s.kind === 'surface') {
        const F = compileFn(s.surface.F, ['x', 'y', 'z']);
        const P = s.surface.point;
        const near = [0, 1, 2].map((k) => ({ x: P.x + 0.1 * k + 0.03, y: P.y - 0.07 * k + 0.02, z: P.z + 0.05 * k }));
        s.partials.forEach((text, i) => {
          const v = ['x', 'y', 'z'][i]!;
          const D = compileFn(text, ['x', 'y', 'z']);
          for (const q of near) if (!close(D.value(q), F.d(q, v), 1e-7)) failures.push(`${item.id} F_${v}`);
          if (!close(evaluateNumber(s.values[i]!), F.d(P, v), 1e-9)) failures.push(`${item.id} F_${v}(P)`);
        });
      }
      if (s.kind === 'extrema') {
        const F = compileFn(s.f, ['x', 'y']);
        const samples = [
          { x: 0.7, y: 1.3 },
          { x: 1.6, y: 0.45 },
          { x: -0.35, y: 2.2 },
        ];
        for (const [v, text] of [
          ['x', s.fx],
          ['y', s.fy],
        ] as const) {
          for (const p of samples)
            if (!close(compileFn(text, ['x', 'y']).value(p), F.d(p, v), 1e-7)) failures.push(`${item.id} f_${v}`);
        }
        if (s.second) {
          const pairs: [string, string][] = [
            ['x', 'x'],
            ['y', 'y'],
            ['x', 'y'],
          ];
          s.second.forEach((text, i) => {
            const [a, b] = pairs[i]!;
            for (const p of samples) {
              if (!close(compileFn(text, ['x', 'y']).value(p), F.d2(p, a, b), 1e-5))
                failures.push(`${item.id} f_${a}${b}`);
            }
          });
        }
      }
    }
    expect(failures).toEqual([]);
  });

  test('every critical point is critical, every d and f_xx is right, and every type follows Theorem 4.3.3', () => {
    const failures: string[] = [];
    for (const item of ALL) {
      const s = spec(item);
      if (s.kind !== 'extrema') continue;
      const F = compileFn(s.f, ['x', 'y']);
      for (const point of s.points) {
        const p = { x: evaluateNumber(point.x), y: evaluateNumber(point.y) };
        const gx = F.d(p, 'x');
        const gy = F.d(p, 'y');
        const undefinedThere = !Number.isFinite(gx) || !Number.isFinite(gy);
        if (!undefinedThere && (!close(gx, 0, 1e-8) || !close(gy, 0, 1e-8)))
          failures.push(`${item.id} ${point.x},${point.y} not critical`);
        if (!s.classify) continue;
        const fxx = F.d2(p, 'x', 'x');
        const d = fxx * F.d2(p, 'y', 'y') - F.d2(p, 'x', 'y') ** 2;
        if (!close(evaluateNumber(point.fxx!), fxx, 1e-4)) failures.push(`${item.id} fxx at ${point.x},${point.y}`);
        if (!close(evaluateNumber(point.d!), d, 1e-4)) failures.push(`${item.id} d at ${point.x},${point.y}`);
        if (classify(fxx, d, Math.abs(d) + 1) !== point.type) failures.push(`${item.id} type at ${point.x},${point.y}`);
      }
    }
    expect(failures).toEqual([]);
  });

  test('no critical point is missing (numerical search over a wide box)', () => {
    const failures: string[] = [];
    for (const item of ALL) {
      const s = spec(item);
      if (s.kind !== 'extrema' || item.id === 'ap4-3') continue; // ap4-3: only critical point is where the partials do not exist
      const F = compileFn(s.f, ['x', 'y']);
      const listed = s.points.map((p) => ({ x: evaluateNumber(p.x), y: evaluateNumber(p.y) }));
      const R = Math.max(4, ...listed.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)])) + 3;
      const found = findCriticalPoints((x, y) => F.value({ x, y }), [-R, R], [-R, R], 16);
      for (const f of found) {
        if (!listed.some((p) => Math.hypot(p.x - f.x, p.y - f.y) < 1e-4))
          failures.push(`${item.id} misses (${f.x}, ${f.y})`);
      }
      // Every listed point is non-degenerate, so the independent search must find each one too.
      for (const p of listed) {
        if (!found.some((f) => Math.hypot(p.x - f.x, p.y - f.y) < 1e-4))
          failures.push(`${item.id}: search did not find (${p.x}, ${p.y})`);
      }
    }
    expect(failures).toEqual([]);
  });

  test('ap4-3: the partial derivatives exist and are never both 0 away from (0, 0)', () => {
    const F = compileFn('4 - sqrt(x^2 + y^2)', ['x', 'y']);
    for (const p of [
      { x: 0.3, y: -0.2 },
      { x: -1.1, y: 0.7 },
      { x: 2, y: 0 },
    ]) {
      expect(Number.isFinite(F.d(p, 'x'))).toBe(true);
      expect(Math.hypot(F.d(p, 'x'), F.d(p, 'y'))).toBeCloseTo(1, 9);
    }
    expect(Number.isFinite(F.d({ x: 0, y: 0 }, 'x'))).toBe(false);
  });

  test('every substituted plane of Theorem 4.2.2 is the tangent plane', () => {
    for (const item of ALL) {
      const s = spec(item);
      if (s.kind !== 'surface') continue;
      const compiled = compileSurface(s.surface);
      expect([item.id, checkSurfaceLine(s.substituted, compiled).status]).toEqual([item.id, 'correct']);
    }
  });
});

describe('answer checking', () => {
  const graded = ALL.filter((i) => i.grading !== 'written');

  test('every suggested answer is accepted by the learner checker', () => {
    const failures: string[] = [];
    for (const item of graded) {
      const checker = checkerFor(item);
      if (!checker) {
        failures.push(`${item.id}: no checker`);
        continue;
      }
      const result = checker.checkAnswer(suggested(spec(item)));
      if (result.status !== 'correct') failures.push(`${item.id}: ${result.message}`);
    }
    expect(failures).toEqual([]);
  });

  test('a wrong answer is rejected for every graded item (no false positives)', () => {
    const accepted: string[] = [];
    const reject = (item: PracticeItem, answer: string, why: string) => {
      const result = checkerFor(item)!.checkAnswer(answer);
      if (result.status !== 'incorrect') accepted.push(`${item.id} (${why}): ${result.status} ${result.message}`);
    };
    for (const item of graded) {
      const s = spec(item);
      if (s.kind === 'derivatives') {
        const answers = [...s.answers];
        answers[0] = `(${answers[0]}) + 1/7`;
        reject(item, answers.join(', '), 'first component');
      }
      if (s.kind === 'surface') {
        const [lhs, rhs] = s.plane.split('=');
        const wrongPlane = `${lhs} = ${rhs} + 1`;
        reject(item, s.line ? `${wrongPlane}; ${s.line}` : wrongPlane, 'plane');
        if (s.line) {
          const P = s.surface.point;
          const [a, b, c] = s.values;
          const wrongLine = `(x - ${P.x})/(${a} + 1) = (y - ${P.y})/(${b}) = (z - ${P.z})/(${c})`;
          reject(item, `${s.plane}; ${wrongLine}`, 'normal line');
        }
      }
      if (s.kind === 'extrema') {
        const listed = s.points.map((p) => `(${p.x}, ${p.y})${s.classify ? ` ${p.type}` : ''}`);
        if (listed.length > 1) reject(item, listed.slice(1).join('; '), 'a point missing');
        reject(item, [...listed, `(9, 9)${s.classify ? ' min' : ''}`].join('; '), 'an extra point');
        if (s.classify) {
          const swapped = s.points.map(
            (p, i) => `(${p.x}, ${p.y}) ${i === 0 ? (p.type === 'saddle' ? 'min' : 'saddle') : p.type}`,
          );
          reject(item, swapped.join('; '), 'a wrong type');
        }
      }
    }
    expect(accepted).toEqual([]);
  });
});
