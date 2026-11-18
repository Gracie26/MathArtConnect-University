/**
 * Topic 3 practice (Phase B): Tutorial 3, Tutorial 4 and §3.3 App practice.
 *
 * Locks the approved counts (125 + 41 + 3 = 169), checks every item's source,
 * section and subtopic, and runs every app-authored suggested answer through
 * the same checker learners use, so a wrong suggestion or a checker that
 * accepts wrong answers fails the build. Written questions must never be
 * auto-graded.
 */
import { matchesPracticeSource, practiceSourceLabel, practiceSourceOptions } from '@/content/practiceSources';
import { getTopic } from '@/content/registry';
import { differentialTopic, RN_UNITS as U } from '@/content/topics/differential';
import { RN_PRACTICE_ITEMS } from '@/content/topics/differential/allPractice';
import { APP_PRACTICE_ITEMS } from '@/content/topics/differential/appPractice';
import { RN_MANUAL_REVIEW } from '@/content/topics/differential/manualReview';
import { SUGGESTED } from '@/content/topics/differential/practice';
import { TUT3, TUT4 } from '@/content/topics/differential/sources';
import { TUTORIAL3_ITEMS } from '@/content/topics/differential/tutorial3';
import { TUTORIAL4_ITEMS } from '@/content/topics/differential/tutorial4';
import type { PracticeItem } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { checkerFor } from '@/features/practice/checkProblem';
import { checkPartialAnswer, compilePartial } from '@/lib/math/partial';

const topic = differentialTopic;
const spec = (item: PracticeItem) => {
  const s = SUGGESTED.get(item.id);
  if (!s) throw new Error(`No suggested working for ${item.id}`);
  return s;
};
const written = RN_PRACTICE_ITEMS.filter((i) => i.grading === 'written');
const graded = RN_PRACTICE_ITEMS.filter((i) => i.grading !== 'written');

describe('locked counts', () => {
  test('Tutorial 3 has 125 parts, Tutorial 4 has 41, App practice has 3: 169 in all', () => {
    expect(TUTORIAL3_ITEMS).toHaveLength(125);
    expect(TUTORIAL4_ITEMS).toHaveLength(41);
    expect(APP_PRACTICE_ITEMS).toHaveLength(3);
    expect(RN_PRACTICE_ITEMS).toHaveLength(169);
    expect(topic.practiceItems).toHaveLength(169);
  });

  test('Tutorial 3 parts per question match the printed tutorial', () => {
    const perQuestion = new Map<string, number>();
    for (const i of TUTORIAL3_ITEMS) perQuestion.set(i.sourceQuestion!, (perQuestion.get(i.sourceQuestion!) ?? 0) + 1);
    expect(Object.fromEntries(perQuestion)).toEqual({
      Q1: 2,
      Q2: 5,
      Q3: 9,
      Q4: 1,
      Q5: 1,
      Q6: 1,
      Q7: 1,
      Q8: 3,
      Q9: 3,
      Q10: 12,
      Q11: 12,
      Q12: 12,
      Q13: 12,
      Q14: 12,
      Q15: 12,
      Q16: 12,
      Q17: 6,
      Q18: 6,
      Q19: 3,
    });
  });

  test('Tutorial 4 has all 37 questions; only Q7 (2), Q8 (3) and Q9 (2) have parts', () => {
    const questions = [...new Set(TUTORIAL4_ITEMS.map((i) => i.sourceQuestion))];
    expect(questions).toEqual(Array.from({ length: 37 }, (_, i) => `Q${i + 1}`));
    const multi = TUTORIAL4_ITEMS.filter((i) => i.sourceSubquestion).map((i) => i.source.item);
    expect(multi).toEqual(['Q7(i)', 'Q7(ii)', 'Q8(a)', 'Q8(b)', 'Q8(c)', 'Q9(i)', 'Q9(ii)']);
  });

  test('ids are unique and nothing is withheld or hidden', () => {
    expect(new Set(RN_PRACTICE_ITEMS.map((i) => i.id)).size).toBe(169);
    expect(RN_PRACTICE_ITEMS.every((i) => !i.withheldFromLearners && isPracticeItemVisible(i))).toBe(true);
  });
});

describe('sources and destinations', () => {
  test('every item names its source document, question and page', () => {
    for (const i of TUTORIAL3_ITEMS) {
      expect(i.sourceType).toBe('tutorial-question');
      expect(i.source.document).toBe(TUT3);
      expect(i.source.page).toBeGreaterThanOrEqual(1);
      expect(i.source.page).toBeLessThanOrEqual(3);
    }
    for (const i of TUTORIAL4_ITEMS) {
      expect(i.sourceType).toBe('tutorial-question');
      expect(i.source.document).toBe(TUT4);
      expect(i.source.page).toBeGreaterThanOrEqual(1);
      expect(i.source.page).toBeLessThanOrEqual(4);
    }
    expect(APP_PRACTICE_ITEMS.map((i) => [i.id, i.sourceType, i.sourceSection, i.unitId])).toEqual([
      ['ap3-1', 'app-practice', '3-3', U.totalDifferential],
      ['ap3-2', 'app-practice', '3-3', U.totalDifferential],
      ['ap3-3', 'app-practice', '3-3', U.totalDifferential],
    ]);
  });

  test('every question shows its source on the card', () => {
    expect(practiceSourceLabel(TUTORIAL3_ITEMS.find((i) => i.id === 'tut3-q10-iv')!)).toBe('Tutorial 3 · Q10(iv)');
    expect(practiceSourceLabel(TUTORIAL4_ITEMS.find((i) => i.id === 'tut4-q35')!)).toBe('Tutorial 4 · Q35');
    for (const i of [...TUTORIAL3_ITEMS, ...TUTORIAL4_ITEMS])
      expect(practiceSourceLabel(i)).toMatch(/^Tutorial [34] · Q\d+/);
    // App practice is labelled APP PRACTICE by the card's eyebrow, never as a tutorial question.
    for (const i of APP_PRACTICE_ITEMS) expect(practiceSourceLabel(i)).toBeNull();
  });

  test('Topics 1 and 2 keep their source question numbers internal', () => {
    for (const id of ['integration', 'integration-area']) {
      for (const i of getTopic(id)!.practiceItems ?? []) expect(practiceSourceLabel(i)).toBeNull();
    }
  });

  test('practice filters: Tutorial 3, Tutorial 4, App practice', () => {
    const options = practiceSourceOptions(topic);
    expect(options.map((o) => o.label)).toEqual(['Tutorial 3', 'Tutorial 4', 'App practice']);
    const counts = options.map((o) => RN_PRACTICE_ITEMS.filter((i) => matchesPracticeSource(i, o)).length);
    expect(counts).toEqual([125, 41, 3]);
  });

  test('Topics 1 and 2 keep their chapter / tutorial filters with the same split', () => {
    for (const id of ['integration', 'integration-area']) {
      const t = getTopic(id)!;
      const [chapter, tutorial] = practiceSourceOptions(t);
      const items = t.practiceItems ?? [];
      expect(items.filter((i) => matchesPracticeSource(i, tutorial)).length).toBe(
        items.filter((i) => i.sourceType === 'tutorial-question').length,
      );
      expect(items.filter((i) => matchesPracticeSource(i, chapter)).length).toBe(
        items.filter((i) => i.sourceType !== 'tutorial-question').length,
      );
    }
  });

  test('sections follow the approved mapping, with no invented §3.4.x numbers', () => {
    const sectionIds = new Set((topic.sections ?? []).map((s) => s.id));
    for (const i of RN_PRACTICE_ITEMS) expect(sectionIds.has(i.sourceSection)).toBe(true);
    expect(RN_PRACTICE_ITEMS.every((i) => !/^3-4-/.test(i.sourceSection))).toBe(true);
    const at = (id: string) => RN_PRACTICE_ITEMS.find((i) => i.id === id)!;
    expect([at('tut3-q1-i'), at('tut3-q2-v')].map((i) => i.sourceSection)).toEqual(['3-1', '3-1']);
    expect([at('tut3-q3-i'), at('tut3-q8-i'), at('tut3-q17-vi')].map((i) => i.sourceSection)).toEqual([
      '3-2-1',
      '3-2-1',
      '3-2-1',
    ]);
    expect([at('tut3-q9-i'), at('tut3-q10-iii'), at('tut3-q19-ii')].map((i) => i.sourceSection)).toEqual([
      '3-2-2',
      '3-2-2',
      '3-2-2',
    ]);
    expect(
      [at('tut3-q7'), at('tut3-q8-iii'), at('tut3-q16-iv'), at('tut3-q18-vi')].map((i) => i.sourceSection),
    ).toEqual(['3-2-3', '3-2-3', '3-2-3', '3-2-3']);
    expect([at('tut4-q1'), at('tut4-q6'), at('tut4-q8-c')].map((i) => i.sourceSection)).toEqual([
      '3-2-3',
      '3-2-3',
      '3-2-3',
    ]);
    expect([at('tut4-q7-i'), at('tut4-q8-b')].map((i) => i.sourceSection)).toEqual(['3-2-1', '3-2-1']);
    expect([at('tut4-q11'), at('tut4-q35'), at('tut4-q37')].map((i) => i.unitId)).toEqual([
      U.chainOne,
      U.changeVariables,
      U.secondOrder,
    ]);
  });

  test('every item appears exactly once, in its own subtopic’s Practise step and its section page', () => {
    const shown = new Map<string, number>();
    for (const unit of topic.units) {
      const practise = unit.steps.find((s) => s.key === 'practise')!;
      expect(practise.availability.status).toBe('available');
      expect(practise.required).toBe(true);
      for (const block of practise.blocks) {
        if (block.type !== 'practiceGroup') continue;
        for (const item of block.items) {
          expect(item.unitId).toBe(unit.id);
          shown.set(item.id, (shown.get(item.id) ?? 0) + 1);
        }
      }
    }
    expect(shown.size).toBe(169);
    expect([...shown.values()].every((n) => n === 1)).toBe(true);
    const inSections = (topic.sections ?? []).flatMap((s) => [...s.tryIt, ...s.tutorial].map((i) => i.id));
    expect(new Set(inSections).size).toBe(169);
  });

  test('App practice groups are labelled APP PRACTICE and say they are not tutorial questions', () => {
    const unit = topic.units.find((u) => u.id === U.totalDifferential)!;
    const groups = unit.steps.find((s) => s.key === 'practise')!.blocks.filter((b) => b.type === 'practiceGroup');
    expect(groups.map((g) => (g.type === 'practiceGroup' ? g.title : ''))).toEqual([
      'APP PRACTICE: The total differential',
    ]);
  });
});

describe('answer checking', () => {
  test('every suggested answer is accepted by the learner checker', () => {
    const failures: string[] = [];
    for (const item of graded) {
      const checker = checkerFor(item);
      const answers = spec(item).answers;
      if (!checker || !answers) {
        failures.push(`${item.id}: no checker or no suggested answer`);
        continue;
      }
      const result = checker.checkAnswer(answers.join(', '));
      if (result.status !== 'correct') failures.push(`${item.id}: ${result.message}`);
    }
    expect(failures).toEqual([]);
  });

  test('a wrong answer is rejected for every graded item (no false positives)', () => {
    const accepted: string[] = [];
    for (const item of graded) {
      const answers = [...spec(item).answers!];
      answers[0] = `(${answers[0]}) + 1/7`;
      const result = checkerFor(item)!.checkAnswer(answers.join(', '));
      if (result.status !== 'incorrect') accepted.push(`${item.id}: ${result.status}`);
    }
    expect(accepted).toEqual([]);
  });

  test('mixed partials follow the notes’ convention: ∂²f/∂x∂y differentiates with respect to y first', () => {
    const q10iv = SUGGESTED.get('tut3-q10-iv')!.partial.targets[0]!;
    const q10v = SUGGESTED.get('tut3-q10-v')!.partial.targets[0]!;
    expect(q10iv).toMatchObject({ label: '∂²f/∂x∂y', wrt: ['y', 'x'] });
    expect(q10v).toMatchObject({ label: '∂²f/∂y∂x', wrt: ['x', 'y'] });
    // Tutorial 4 Q8(c), the case where the order matters: fxy = ∂/∂y(fx) and fyx = ∂/∂x(fy) at (0, 0).
    const fx = (x: number, y: number) => (y * (x ** 4 + 4 * x ** 2 * y ** 2 - y ** 4)) / (x ** 2 + y ** 2) ** 2;
    const fy = (x: number, y: number) => (x * (x ** 4 - 4 * x ** 2 * y ** 2 - y ** 4)) / (x ** 2 + y ** 2) ** 2;
    const h = 1e-6;
    expect(fx(0, h) / h).toBeCloseTo(-1, 6);
    expect(fy(h, 0) / h).toBeCloseTo(1, 6);
    const q8c = SUGGESTED.get('tut4-q8-c')!.partial.targets;
    expect(q8c).toEqual([
      { kind: 'number', label: 'fₓᵧ(0, 0)', value: -1 },
      { kind: 'number', label: 'fᵧₓ(0, 0)', value: 1 },
    ]);
  });

  test('the fixed values are independently right (T4 Q6 c = −1; Q7 and Q8(a) partial derivatives at the origin are 0)', () => {
    // Q6: with c = −1, z = x⁻¹e^(−y/x) satisfies z_x = y z_yy + z_y.
    const pde = compilePartial({
      variables: ['x', 'y'],
      samples: [
        { x: 0.7, y: 1.3 },
        { x: 1.6, y: 0.45 },
        { x: 2.1, y: 1.7 },
      ],
      targets: [{ kind: 'derivative', label: 'z_x', f: 'x^(-1) e^(-y/x)', wrt: ['x'] }],
    });
    expect(checkPartialAnswer('y x^(-3) e^(-y/x) - x^(-2) e^(-y/x)', pde).status).toBe('correct');
    // Q7, Q8(a): f vanishes on both axes, so both difference quotients are 0.
    const pieces = [
      (x: number, y: number) => (3 * x * x * y) / (x ** 4 + y * y),
      (x: number, y: number) => (2 * x * x * y * y) / (x ** 4 + y ** 4),
      (x: number, y: number) => (x * y * (x * x - y * y)) / (x * x + y * y),
    ];
    for (const f of pieces)
      for (const h of [1e-2, 1e-4]) {
        expect(f(h, 0) / h).toBeCloseTo(0, 12);
        expect(f(0, h) / h).toBeCloseTo(0, 12);
      }
  });

  test('suggested working in written questions is itself correct', () => {
    for (const item of written) {
      const verify = spec(item).verify;
      if (!verify) continue;
      const compiled = compilePartial({ ...spec(item).partial, targets: verify.targets });
      expect([item.id, checkPartialAnswer(verify.answers.join(', '), compiled).status]).toEqual([item.id, 'correct']);
    }
  });
});

describe('grading types and written responses', () => {
  test('exactly 28 written questions (including Q17(v), MR3-T9), never auto-graded', () => {
    expect(written.map((i) => i.id)).toEqual([
      'tut3-q2-i',
      'tut3-q2-ii',
      'tut3-q2-iii',
      'tut3-q2-iv',
      'tut3-q2-v',
      'tut3-q8-i',
      'tut3-q8-ii',
      'tut3-q17-v',
      'tut3-q19-i',
      'tut4-q3',
      'tut4-q4',
      'tut4-q5',
      'tut4-q10',
      'tut4-q22',
      'tut4-q23',
      'tut4-q24',
      'tut4-q25',
      'tut4-q26',
      'tut4-q27',
      'tut4-q28',
      'tut4-q29',
      'tut4-q30',
      'tut4-q31',
      'tut4-q32',
      'tut4-q33',
      'tut4-q34',
      'tut4-q36',
      'tut4-q37',
    ]);
    for (const item of written) {
      const checker = checkerFor(item)!;
      expect(checker.gradesAnswer).toBe(false);
      expect(checker.checkAnswer('anything at all').status).toBe('cannotCheck');
      expect(item.partial!.targets).toEqual([]);
      expect(item.solution!.steps.length).toBeGreaterThan(0);
    }
  });

  test('partial questions check the final answer only; the method is written', () => {
    const partial = RN_PRACTICE_ITEMS.filter((i) => i.grading === 'partial').map((i) => i.id);
    expect(partial).toEqual([
      ...['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'].map((s) => `tut3-q3-${s}`),
      'tut3-q7',
      ...['i', 'ii', 'iii', 'iv', 'v', 'vi'].map((s) => `tut3-q18-${s}`),
      'tut4-q1',
      'tut4-q2',
      'tut4-q6',
      'tut4-q7-i',
      'tut4-q7-ii',
      'tut4-q8-a',
      'tut4-q8-c',
    ]);
    for (const id of partial) expect(checkerFor(RN_PRACTICE_ITEMS.find((i) => i.id === id)!)!.gradesAnswer).toBe(true);
  });

  test('T4 Q7 and Q8 are labelled Advanced tutorial practice', () => {
    expect(RN_PRACTICE_ITEMS.filter((i) => i.advanced).map((i) => i.id)).toEqual([
      'tut4-q7-i',
      'tut4-q7-ii',
      'tut4-q8-a',
      'tut4-q8-b',
      'tut4-q8-c',
    ]);
  });

  test('Q17 keeps its prerequisite note to Topic 2, The Fundamental Theorem of Calculus', () => {
    const q17 = TUTORIAL3_ITEMS.filter((i) => i.sourceQuestion === 'Q17');
    expect(q17).toHaveLength(6);
    const area = getTopic('integration-area')!;
    for (const i of q17) {
      expect(i.prerequisite?.topicId).toBe('integration-area');
      expect(area.units.find((u) => u.id === i.prerequisite?.unitId)?.title).toBe(
        'The Fundamental Theorem of Calculus',
      );
    }
  });
});

describe('review flags and wording', () => {
  test('review flags on practice are known, internal and never block learners', () => {
    const known = new Set(RN_MANUAL_REVIEW.map((m) => m.id));
    const used = new Set(RN_PRACTICE_ITEMS.flatMap((i) => i.reviewIds));
    for (const id of used) expect(known.has(id)).toBe(true);
    expect([...used].sort()).toEqual(['MR3-03', 'MR3-T1', 'MR3-T2', 'MR3-T3', 'MR3-T4', 'MR3-T5', 'MR3-T6', 'MR3-T9']);
    expect(TUTORIAL3_ITEMS.find((i) => i.id === 'tut3-q17-v')!.reviewIds).toContain('MR3-T9');
    // Flags never appear in learner-visible text.
    const visible = RN_PRACTICE_ITEMS.flatMap((i) => [
      i.instruction,
      i.condition ?? '',
      ...i.hints,
      i.solution?.method ?? '',
    ]);
    expect(visible.filter((t) => /MR3-/.test(t))).toEqual([]);
  });

  test('all solutions are app guidance pending lecturer review, never official', () => {
    for (const i of RN_PRACTICE_ITEMS) expect(i.solution?.status).toBe('pendingLecturerReview');
    const text = JSON.stringify(RN_PRACTICE_ITEMS);
    expect(text).not.toMatch(/official solution|lecturer solution|UNAM solution|memo/i);
  });
});
