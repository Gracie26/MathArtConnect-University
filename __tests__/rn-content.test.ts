/**
 * Source completeness audit for Topic 3 (Chapter 3, Tutorials 3 and 4).
 *
 * Locks the verified source counts (approved specification) and fails if a
 * Chapter 3 item loses its learner destination, an example or figure goes
 * missing, a printed heading has no section page, §3.4 gains invented
 * subsection numbers, an internal review flag leaks into a learner block, a
 * formula cannot be displayed, or the database migration drifts.
 */
import { readFileSync } from 'fs';

import { listLearnerTopics } from '@/content/registry';
import { differentialTopic, RN_UNITS as U } from '@/content/topics/differential';
import { CHAPTER3_FIGURES } from '@/content/topics/differential/figures';
import { CHAPTER3_INVENTORY } from '@/content/topics/differential/inventory';
import { RN_MANUAL_REVIEW } from '@/content/topics/differential/manualReview';
import { CHAPTER3_SECTION_MAP } from '@/content/topics/differential/sources';
import type { ContentBlock } from '@/content/types';
import { parseTex } from '@/lib/math/tex';
import { blocksOf, inventoryIdsOf, texOf, textOf } from '@/test-utils/contentWalk';

const topic = differentialTopic;
const unitById = new Map(topic.units.map((u) => [u.id, u]));
type Example = Extract<ContentBlock, { type: 'workedExample' }>;
const examples = topic.units.flatMap((u) => blocksOf(u).filter((b): b is Example => b.type === 'workedExample'));
const figureBlocks = topic.units.flatMap((u) => blocksOf(u).flatMap((b) => (b.type === 'figure' ? [b] : [])));

describe('Topic 3 structure', () => {
  test('registered after Topics 1 and 2', () => {
    expect(listLearnerTopics().map((t) => t.id)).toEqual([
      'integration',
      'integration-area',
      'differential-calculus-rn',
      'partial-derivative-applications',
    ]);
    expect(topic.title).toBe('Differential Calculus in ℝⁿ');
  });

  test('the nine approved subtopics, in order', () => {
    expect(topic.units.map((u) => u.title)).toEqual([
      'Functions of Several Variables',
      'Partial Derivatives',
      'Partial Derivatives of Three or More Variables',
      'Higher-Order Partial Derivatives and Clairaut’s Theorem',
      'The Total Differential',
      'Chain Rule: One Independent Variable',
      'Chain Rule: Two or More Independent Variables',
      'Changing Variables with Differentials',
      'Second-Order Chain Rule and Coordinate Changes',
    ]);
  });

  test('every printed heading (7) is its own section page, in order', () => {
    expect((topic.sections ?? []).map((s) => [s.label, s.heading])).toEqual([
      ['3.1', 'Definition of a Function of Two Variables'],
      ['3.2', 'Partial Derivatives'],
      ['3.2.1', 'Partial Derivatives of a Function of Two Variables'],
      ['3.2.2', 'Partial Derivatives of a function of Three or More Variables'],
      ['3.2.3', 'Higher-Order Partial Derivatives'],
      ['3.3', 'Total Differential'],
      ['3.4', 'Chain Rules for Functions of Several Variables'],
    ]);
    expect(CHAPTER3_SECTION_MAP).toHaveLength(7);
    for (const section of topic.sections ?? []) expect(section.blocks.length).toBeGreaterThan(0);
  });

  test('subtopics 6–9 keep the printed source section §3.4 and no 3.4.x numbers are invented', () => {
    for (const id of [U.chainOne, U.chainTwo, U.changeVariables, U.secondOrder]) {
      const unit = unitById.get(id)!;
      expect(unit.source.map((s) => s.section)).toEqual(['3.4']);
      for (const block of blocksOf(unit)) expect(block.source?.section ?? '3.4').toBe('3.4');
      // Step titles never present a 3.4.x heading; only printed example numbers mention 3.4.x.
      for (const s of unit.steps) expect(s.title).not.toMatch(/^3\.4\.\d/);
    }
    expect(CHAPTER3_SECTION_MAP.find((s) => s.section === '3.4')?.unitIds).toEqual([
      U.chainOne,
      U.chainTwo,
      U.changeVariables,
      U.secondOrder,
    ]);
    expect(CHAPTER3_SECTION_MAP.some((s) => /^3\.4\./.test(s.section))).toBe(false);
  });
});

describe('Chapter 3 inventory', () => {
  test('unique ids, each in a subtopic that teaches its printed section', () => {
    expect(new Set(CHAPTER3_INVENTORY.map((i) => i.id)).size).toBe(CHAPTER3_INVENTORY.length);
    for (const item of CHAPTER3_INVENTORY) {
      const section = item.section === '3' ? '3.1' : item.section;
      expect(CHAPTER3_SECTION_MAP.find((s) => s.section === section)?.unitIds).toContain(item.unitId);
    }
  });

  test.each(CHAPTER3_INVENTORY.map((i) => [i.id, i] as const))(
    '%s has a learner destination with content',
    (id, item) => {
      const unit = unitById.get(item.unitId)!;
      const blocks = blocksOf(unit).filter((b) => inventoryIdsOf(b).includes(id));
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        const words = textOf(block).join(' ').trim();
        const drawn = block.type === 'figure' || (block.type === 'workedExample' && block.steps.length > 0);
        expect(words.length > 0 || drawn || block.type === 'math').toBe(true);
      }
      const section = (topic.sections ?? []).find((s) => s.id === item.navSection);
      expect(section?.blocks.flatMap(inventoryIdsOf)).toContain(id);
    },
  );

  test('content never points at an unknown source item', () => {
    const known = new Set(CHAPTER3_INVENTORY.map((i) => i.id));
    const used = topic.units.flatMap((u) => blocksOf(u).flatMap(inventoryIdsOf));
    expect(used.filter((id) => !known.has(id))).toEqual([]);
  });
});

describe('worked examples and figures', () => {
  test('exactly 14 numbered worked examples, each with its printed solution, as unamSource', () => {
    const numbers = [
      '3.1.1',
      '3.2.1',
      '3.2.2',
      '3.2.3',
      '3.2.4',
      '3.2.5',
      '3.3.1',
      '3.4.1',
      '3.4.2',
      '3.4.3',
      '3.4.4',
      '3.4.5',
      '3.4.6',
      '3.4.7',
    ];
    expect(examples).toHaveLength(14);
    expect(examples.map((e) => e.title)).toEqual(numbers.map((n) => `Example ${n}`));
    expect(CHAPTER3_INVENTORY.filter((i) => i.type === 'worked-example')).toHaveLength(14);
    expect(CHAPTER3_INVENTORY.filter((i) => i.type === 'worked-solution')).toHaveLength(14);
    for (const e of examples) {
      expect(e.origin).toBe('unamSource');
      expect(e.solutionStatus).toBe('unamSource');
      expect(e.steps.length).toBeGreaterThan(0);
      expect(e.covers?.[0]).toBe(e.source.inventoryId!.replace('-ex-', '-sol-'));
    }
  });

  test('multi-part examples keep every printed sub-part', () => {
    const byTitle = new Map(examples.map((e) => [e.title, e]));
    const parts = (title: string) =>
      byTitle.get(title)!.steps.filter((s) => /^\((i|ii|iii)\)/.test(s.explanation)).length;
    expect(parts('Example 3.1.1')).toBe(2);
    expect(parts('Example 3.2.3')).toBe(3);
    expect(parts('Example 3.3.1')).toBe(2);
    // Example 3.4.6 keeps the extra derivative ∂u/∂x and equations (3.1) and (3.2) exactly as printed.
    const parabolic = byTitle
      .get('Example 3.4.6')!
      .steps.map((s) => s.tex ?? '')
      .join(' ');
    expect(parabolic).toContain('\\frac{\\partial u}{\\partial x} = \\frac{u}{u^{2} + v^{2}}');
    expect(parabolic).toContain('(3.1)');
    expect(parabolic).toContain('(3.2)');
    // Example 3.4.4 keeps its printed stray parenthesis (MR3-04).
    expect(
      byTitle
        .get('Example 3.4.4')!
        .steps.map((s) => s.tex)
        .join(' '),
    ).toContain('(\\cos t)+)(x + z)');
  });

  test('exactly 2 printed figures, drawn faithfully and placed in their subtopics', () => {
    expect(Object.keys(CHAPTER3_FIGURES)).toEqual(['ch3-fig-3.1', 'ch3-fig-3.2']);
    const printed = figureBlocks.filter((b) => b.type === 'figure' && b.figure.origin === 'unamFigure');
    expect(printed.map((b) => b.type === 'figure' && b.figure.number)).toEqual(['3.1', '3.2']);
    const f1 = CHAPTER3_FIGURES['ch3-fig-3.1']!;
    const f2 = CHAPTER3_FIGURES['ch3-fig-3.2']!;
    expect(f1.caption).toBe('Chain rule: one independent variable');
    expect(f2.caption).toBe('Chain Rule: Two independent variables');
    const nodes = (spec: typeof f1) => spec.panels[0]!.items.flatMap((i) => (i.k === 'node' ? [i.text] : [])).sort();
    const fractions = (spec: typeof f1) =>
      spec.panels[0]!.items.flatMap((i) => (i.k === 'fraction' ? [`${i.num}/${i.den}`] : [])).sort();
    expect(nodes(f1)).toEqual(['t', 't', 'w', 'x', 'y']);
    expect(fractions(f1)).toEqual(['dx/dt', 'dy/dt', '∂w/∂x', '∂w/∂y']);
    expect(nodes(f2)).toEqual(['s', 's', 't', 't', 'w', 'x', 'y']);
    expect(fractions(f2)).toEqual(['∂w/∂x', '∂w/∂y', '∂x/∂s', '∂x/∂t', '∂y/∂s', '∂y/∂t']);
    expect(blocksOf(unitById.get(U.chainOne)!).some((b) => b.type === 'figure' && b.figure.number === '3.1')).toBe(
      true,
    );
    expect(blocksOf(unitById.get(U.chainTwo)!).some((b) => b.type === 'figure' && b.figure.number === '3.2')).toBe(
      true,
    );
  });

  test('every figure not printed in the notes is an app illustration', () => {
    const drawings = [
      ...figureBlocks.flatMap((b) => (b.type === 'figure' ? [b.figure] : [])),
      ...examples.flatMap((e) => (e.figure ? [e.figure] : [])),
    ];
    for (const d of drawings) {
      if (d.origin === 'unamFigure') expect(Object.keys(CHAPTER3_FIGURES)).toContain(d.id);
      else expect(d.origin).toBe('appIllustration');
    }
  });
});

describe('review flags and display', () => {
  test('all approved review flags are registered and stay internal (no learner block carries them)', () => {
    expect(RN_MANUAL_REVIEW.map((m) => m.id)).toEqual([
      'MR3-01',
      'MR3-02',
      'MR3-03',
      'MR3-04',
      'MR3-05',
      'MR3-06',
      'MR3-T1',
      'MR3-T2',
      'MR3-T3',
      'MR3-T4',
      'MR3-T5',
      'MR3-T6',
      'MR3-T7',
      'MR3-T8',
      'MR3-T9',
    ]);
    expect(RN_MANUAL_REVIEW.every((m) => m.status === 'open' && !m.blocksLearnerUse)).toBe(true);
    for (const unit of topic.units) {
      for (const block of blocksOf(unit)) {
        expect(block.reviewIds ?? []).toEqual([]);
        if (block.type === 'workedExample') for (const s of block.steps) expect(s.reviewIds ?? []).toEqual([]);
      }
    }
    // Inventory flags point only at registered entries.
    const known = new Set(RN_MANUAL_REVIEW.map((m) => m.id));
    for (const item of CHAPTER3_INVENTORY) for (const id of item.reviewIds ?? []) expect(known.has(id)).toBe(true);
  });

  test('theorems keep their printed wording (Theorem 3.2.1 hypothesis as printed, MR3-02)', () => {
    const clairaut = blocksOf(unitById.get(U.higherOrder)!).find(
      (b) => b.type === 'theorem' && b.label === 'Theorem 3.2.1',
    );
    expect(clairaut && clairaut.type === 'theorem' && clairaut.text).toContain(
      'such that $f_{x}$ and $f_{y}$ are continuous on an open disc $R$',
    );
    const labels = topic.units.flatMap((u) => blocksOf(u).flatMap((b) => (b.type === 'theorem' ? [b.label] : [])));
    expect(labels).toEqual(['Theorem 3.2.1', 'Theorem 3.4.1', 'Theorem 3.4.2']);
  });

  test('all Topic 3 TeX can be displayed', () => {
    const tex = topic.units.flatMap((u) => blocksOf(u).flatMap(texOf)).filter((t) => t.length > 0);
    const failures = tex.filter((t) => {
      try {
        parseTex(t);
        return false;
      } catch {
        return true;
      }
    });
    expect(failures).toEqual([]);
  });
});

describe('database migration', () => {
  test('the migration inserts the topic and all nine units with the content’s step keys', () => {
    const sql = readFileSync('supabase/migrations/20261015000000_differential_rn_topic.sql', 'utf8');
    expect(sql).toContain("'differential-calculus-rn'");
    expect(sql).not.toMatch(/\b(delete|drop|truncate|alter)\b/i);
    for (const unit of topic.units) {
      const row = new RegExp(`\\('${unit.id}', 'differential-calculus-rn'[\\s\\S]*?array\\[([^\\]]*)\\]`).exec(sql);
      expect(row).not.toBeNull();
      const keys = row![1]!.split(',').map((k) => k.trim().replace(/'/g, ''));
      expect(keys).toEqual(unit.steps.map((s) => s.key));
    }
  });
});
