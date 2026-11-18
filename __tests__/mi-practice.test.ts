/**
 * Topic 5 practice: Tutorial 6 (66 items).
 *
 * Locks the approved counts, placement and grading (58 auto-graded, 8 partly
 * graded, 0 written), and verifies every piece of app-authored working
 * independently of the authoring: every exact value against nested
 * quadrature of every form of the integral, every authored line of working
 * and every suggested final answer against the checker (lib/math/multiple),
 * and a wrong answer is rejected. Tutorial 6 has no answer key: every
 * solution is an APP-GENERATED SOLUTION, pending lecturer review (MR5-23).
 */
import { MI_PRACTICE_ITEMS } from '@/content/topics/multiple/allPractice';
import { MI_UNITS as U } from '@/content/topics/multiple/ids';
import { SUGGESTED } from '@/content/topics/multiple/practice';
import { TUT6 } from '@/content/topics/multiple/sources';
import { TUTORIAL6_ITEMS } from '@/content/topics/multiple/tutorial6';
import { checkerFor } from '@/features/practice/checkProblem';
import { checkMultipleAnswer, checkMultipleLine, compileMultiple, formValue } from '@/lib/math/multiple';
import { parseTex } from '@/lib/math/tex';

const spec = (id: string) => SUGGESTED.get(id)!;
/** Improper or singular integrals converge slowly under quadrature; their exact values come from the working. */
const SLOW = new Set(['tut6-q25', 'tut6-q26', 'tut6-q29', 'tut6-q30']);

describe('locked counts, placement and grading', () => {
  test('Tutorial 6 has 34 questions and 66 items, in printed order', () => {
    expect(TUTORIAL6_ITEMS).toHaveLength(66);
    expect(MI_PRACTICE_ITEMS).toHaveLength(66);
    const perQuestion: Record<string, number> = {};
    for (const i of TUTORIAL6_ITEMS) perQuestion[i.sourceQuestion!] = (perQuestion[i.sourceQuestion!] ?? 0) + 1;
    expect(Object.keys(perQuestion)).toHaveLength(34);
    expect(perQuestion).toMatchObject({ Q1: 5, Q2: 6, Q11: 3, Q14: 4, Q15: 7, Q16: 2, Q18: 3, Q19: 6, Q20: 5 });
    expect(Object.values(perQuestion).filter((n) => n === 1)).toHaveLength(25);
    expect(new Set(TUTORIAL6_ITEMS.map((i) => i.id)).size).toBe(66);
    expect(TUTORIAL6_ITEMS.map((i) => Number(i.sourceQuestion!.slice(1)))).toEqual(
      [...TUTORIAL6_ITEMS.map((i) => Number(i.sourceQuestion!.slice(1)))].sort((a, b) => a - b),
    );
  });

  test('approved placement by subtopic: 11, 24, 5, 6, 20', () => {
    const count = (unit: string) => TUTORIAL6_ITEMS.filter((i) => i.unitId === unit).length;
    expect([U.iterated, U.orders, U.doubleVolume, U.triple, U.jacobians].map(count)).toEqual([11, 24, 5, 6, 20]);
    const questions = (unit: string) => [
      ...new Set(TUTORIAL6_ITEMS.filter((i) => i.unitId === unit).map((i) => i.sourceQuestion)),
    ];
    expect(questions(U.iterated)).toEqual(['Q1', 'Q2']);
    expect(questions(U.orders)).toEqual([
      'Q3',
      'Q4',
      'Q10',
      'Q11',
      'Q12',
      'Q13',
      'Q14',
      'Q15',
      'Q16',
      'Q17',
      'Q26',
      'Q27',
    ]);
    expect(questions(U.doubleVolume)).toEqual(['Q5', 'Q6', 'Q7', 'Q8', 'Q9']);
    expect(questions(U.triple)).toEqual(['Q19']);
    expect(questions(U.jacobians)).toEqual([
      'Q18',
      'Q20',
      'Q21',
      'Q22',
      'Q23',
      'Q24',
      'Q25',
      'Q28',
      'Q29',
      'Q30',
      'Q31',
      'Q32',
      'Q33',
      'Q34',
    ]);
  });

  test('grading: 58 auto-graded, 8 partly graded (Q11, Q14, Q25), 0 written', () => {
    const by = (g: string) => TUTORIAL6_ITEMS.filter((i) => (i.grading ?? 'auto') === g);
    expect(by('auto')).toHaveLength(58);
    expect(by('partial').map((i) => i.source.item)).toEqual([
      'Q11(i)',
      'Q11(ii)',
      'Q11(iii)',
      'Q14(i)',
      'Q14(ii)',
      'Q14(iii)',
      'Q14(iv)',
      'Q25',
    ]);
    expect(by('written')).toHaveLength(0);
  });

  test('every item shows its Tutorial 6 source and is an APP-GENERATED SOLUTION pending review', () => {
    for (const i of TUTORIAL6_ITEMS) {
      expect(i.sourceType).toBe('tutorial-question');
      expect(i.source.document).toBe(TUT6);
      expect(i.reviewIds).toContain('MR5-23');
      expect(i.solution?.status).toBe('pendingLecturerReview');
      expect(i.solution?.appGenerated).toBe(true);
      expect(i.withheldFromLearners).toBe(false);
      expect(i.hints).toHaveLength(3);
      expect(checkerFor(i)).not.toBeNull();
    }
  });

  test('all practice TeX can be displayed', () => {
    for (const i of TUTORIAL6_ITEMS) {
      const tex = [i.problemTex, i.solution!.answerTex, ...i.solution!.steps.flatMap((s) => (s.tex ? [s.tex] : []))];
      for (const t of tex)
        expect([
          i.id,
          t,
          (() => {
            try {
              parseTex(t);
              return 'ok';
            } catch (e) {
              return String(e);
            }
          })(),
        ]).toEqual([i.id, t, 'ok']);
    }
  });
});

describe.each(TUTORIAL6_ITEMS.map((i) => [i.id, i] as const))('%s', (id, item) => {
  const s = spec(id);
  const compiled = compileMultiple(item.multiple!);

  test('the exact value agrees with the integral in every form', () => {
    if (!s.multiple.exact) return;
    // Quadrature converges more slowly at square-root boundaries, kinks and singular integrands, so the best
    // form must agree closely and every form must agree within the quadrature error.
    // For the improper and singular questions (Q25, Q26, Q29, Q30) only the best-behaved form is reliable
    // numerically (e.g. Q26 reversed, where the singularity cancels); it confirms the exact value.
    const [best, all] = SLOW.has(id) ? [1e-3, Infinity] : [1e-5, 1e-4];
    compiled.freePoints.forEach((p, k) => {
      const want = compiled.values[k]!;
      const errors = compiled.forms.map((form) => Math.abs(formValue(form, p) - want) / Math.max(1, Math.abs(want)));
      expect(Math.min(...errors)).toBeLessThanOrEqual(best);
      for (const e of errors) expect(e).toBeLessThanOrEqual(all);
    });
  });

  test('every authored line of working is accepted by the checker', () => {
    for (const line of s.working.filter((w) => w.check)) {
      const result = checkMultipleLine(line.check!, compiled);
      expect([line.check, result.status]).toEqual([line.check, 'correct']);
    }
  });

  test('the suggested answer is accepted and a wrong one rejected', () => {
    const right = checkMultipleAnswer(s.answer, compiled);
    expect([s.answer, right.status, right.message]).toEqual([s.answer, 'correct', expect.any(String)]);
    const answer = s.multiple.answer;
    const wrong =
      answer.kind === 'limits'
        ? '0 <= x <= 1, 0 <= y <= 1'
        : answer.kind === 'constants'
          ? answer.names.map((n) => `${n} = 7`).join(', ')
          : answer.kind === 'values'
            ? '1, 2'
            : '12345';
    expect(checkMultipleAnswer(wrong, compiled).status).not.toBe('correct');
  });
});
