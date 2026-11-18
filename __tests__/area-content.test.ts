/**
 * Source completeness audit for Topic 2 (Chapter 2 and Tutorial 2).
 *
 * Fails if any approved inventory item has no learner destination or an
 * empty body, if a figure or worked example is lost, if a Tutorial 2 part is
 * missing, duplicated, placed in the wrong subtopic or not reachable from a
 * Practise / Try it step, if the review-held items become visible, or if the
 * database migration drifts from the content.
 */
import { readFileSync } from 'fs';

import { estimateSubtopicMinutes } from '@/content/estimate';
import { areaTopic, AREA_UNITS as U } from '@/content/topics/area';
import { CHAPTER2_PRACTICE } from '@/content/topics/area/chapterPractice';
import { CHAPTER2_FIGURES } from '@/content/topics/area/figures';
import { CHAPTER2_INVENTORY } from '@/content/topics/area/inventory';
import { AREA_MANUAL_REVIEW } from '@/content/topics/area/manualReview';
import { CHAPTER2_SECTION_MAP, TUTORIAL2_PART_MAP } from '@/content/topics/area/sources';
import { TUTORIAL2_ITEMS } from '@/content/topics/area/tutorial2';
import { integrationTopic } from '@/content/topics/integration';
import { TUTORIAL2_CHAPTER1_ITEMS } from '@/content/topics/integration/tutorial2';
import { listLearnerTopics } from '@/content/registry';
import type { ContentBlock, LessonStepKind, PracticeItem } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { blocksOf, inventoryIdsOf, textOf } from '@/test-utils/contentWalk';

const unitById = new Map(areaTopic.units.map((u) => [u.id, u]));
const key = (item: PracticeItem) =>
  item.sourceSubquestion ? `${item.sourceQuestion}(${item.sourceSubquestion})` : (item.sourceQuestion ?? '');
const practiceInStep = (unitId: string, kind: LessonStepKind): PracticeItem[] =>
  (unitById.get(unitId)?.steps.filter((s) => s.kind === kind) ?? [])
    .flatMap((s) => s.blocks)
    .flatMap((b) => (b.type === 'practiceGroup' ? b.items : []));
type Example = Extract<ContentBlock, { type: 'workedExample' }>;
const examples = areaTopic.units.flatMap((u) => blocksOf(u).filter((b): b is Example => b.type === 'workedExample'));
/** Every figure drawn in the lessons: figure blocks and figures shown with worked examples. */
const drawnFigures = areaTopic.units.flatMap((u) =>
  blocksOf(u).flatMap((b) =>
    b.type === 'figure' ? [b.figure] : b.type === 'workedExample' && b.figure ? [b.figure] : [],
  ),
);

describe('structure', () => {
  test('the eight approved subtopics, in order', () => {
    expect(areaTopic.title).toBe('Integration as a Process of Finding the Area Under the Graph');
    expect(areaTopic.units.map((u) => u.title)).toEqual([
      'Area Under a Graph and Riemann Sums',
      'The Definite Integral',
      'Properties of the Definite Integral',
      'The Fundamental Theorem of Calculus',
      'The Mean Value Theorem for Integrals',
      'Improper Integrals: Infinite Intervals',
      'Improper Integrals: Discontinuous Integrands',
      'Comparison Test for Improper Integrals',
    ]);
    expect(listLearnerTopics().map((t) => t.id)).toEqual([
      'integration',
      'integration-area',
      'differential-calculus-rn',
      'partial-derivative-applications',
    ]);
  });

  test('every source heading is its own section, in order, in its approved subtopic', () => {
    expect((areaTopic.sections ?? []).map((s) => [s.label, s.heading, s.unitId])).toEqual([
      ['2.1', 'Area Under a Graph', U.riemann],
      ['2.2', 'Riemann Sums', U.riemann],
      ['2.2.1', 'The Definite Integral', U.definite],
      ['2.2.2', 'Properties of the Definite Integral', U.properties],
      ['2.3', 'The Fundamental Theorem of Calculus', U.ftc],
      ['2.4', 'The Mean Value Theorem for Integrals', U.mvt],
      ['2.5', 'Improper Integrals', U.typeOne],
      ['2.5.1', 'TYPE I: Integrals over infinite intervals', U.typeOne],
      ['2.5.2', 'TYPE II: Discontinuous Integrands', U.typeTwo],
      ['2.5.3', 'A Comparison Test for Improper Integrals', U.comparison],
    ]);
    expect(CHAPTER2_SECTION_MAP.map((s) => s.section)).toEqual([
      '2.1',
      '2.2',
      '2.2.1',
      '2.2.2',
      '2.3',
      '2.4',
      '2.5',
      '2.5.1',
      '2.5.2',
      '2.5.3',
    ]);
  });

  test('the Mean Value Theorem keeps its own subtopic and the Mid-point Rule stays in The Definite Integral', () => {
    expect(unitById.get(U.mvt)?.steps.find((s) => s.kind === 'concept')?.blocks.length).toBeGreaterThan(3);
    const midpoint = unitById.get(U.definite)?.steps.find((s) => s.key === 'midpoint-rule');
    expect(midpoint?.blocks.some((b) => b.type === 'formula' && b.title === 'Mid-point Rule')).toBe(true);
    expect(midpoint?.blocks.some((b) => b.type === 'workedExample' && b.title === 'Example 2.2.3')).toBe(true);
  });
});

describe('Chapter 2 inventory', () => {
  test('112 items, unique ids, each in its section’s subtopic', () => {
    expect(CHAPTER2_INVENTORY).toHaveLength(112);
    expect(new Set(CHAPTER2_INVENTORY.map((i) => i.id)).size).toBe(112);
    for (const item of CHAPTER2_INVENTORY) {
      const section = item.section === '2' ? '2.1' : item.section;
      expect(CHAPTER2_SECTION_MAP.find((s) => s.section === section)?.unitId).toBe(item.unitId);
    }
  });

  test.each(CHAPTER2_INVENTORY.map((i) => [i.id, i] as const))(
    '%s has a learner destination with content',
    (id, item) => {
      const unit = unitById.get(item.unitId)!;
      const blocks = blocksOf(unit).filter(
        (b) => inventoryIdsOf(b).includes(id) || (b.type === 'figure' && b.source?.inventoryId === id),
      );
      const practice = [...CHAPTER2_PRACTICE].filter((p) => p.id === id);
      expect(blocks.length + practice.length).toBeGreaterThan(0);
      for (const block of blocks) {
        const words = textOf(block).join(' ').trim();
        const drawn = block.type === 'figure' || (block.type === 'workedExample' && block.steps.length > 0);
        expect(words.length > 0 || drawn || block.type === 'math').toBe(true);
      }
      // The section page shows it too.
      const section = (areaTopic.sections ?? []).find((s) => s.id === item.navSection);
      const onPage = [
        ...(section?.blocks ?? []).flatMap((b) => [...inventoryIdsOf(b), b.source?.inventoryId ?? '']),
        ...(section?.tryIt ?? []).map((p) => p.id),
      ];
      expect(onPage).toContain(id);
    },
  );

  test('content never points at an unknown source item', () => {
    const known = new Set(CHAPTER2_INVENTORY.map((i) => i.id));
    const used = areaTopic.units.flatMap((u) => blocksOf(u).flatMap(inventoryIdsOf));
    expect(used.filter((id) => !known.has(id))).toEqual([]);
  });

  test('all 11 worked examples are shown step by step, as printed (9 numbered, 2 unlabelled)', () => {
    const inventoried = CHAPTER2_INVENTORY.filter((i) => i.type === 'worked-example');
    expect(inventoried).toHaveLength(11);
    expect(examples.map((e) => e.source.inventoryId).sort()).toEqual(inventoried.map((i) => i.id).sort());
    for (const title of ['2.2.1', '2.2.2', '2.2.3', '2.3.1', '2.3.2', '2.3.3', '2.5.1', '2.5.2', '2.5.3']) {
      expect(examples.map((e) => e.title)).toContain(`Example ${title}`);
    }
    for (const example of examples) {
      expect(example.steps.length).toBeGreaterThan(0);
      expect(example.solutionStatus).toBe('unamSource');
      expect(example.resultTex.length).toBeGreaterThan(0);
    }
    // Every worked solution is covered by its example.
    const solutions = CHAPTER2_INVENTORY.filter((i) => i.type === 'worked-solution').map((i) => i.id);
    const covered = examples.flatMap((e) => e.covers ?? []);
    for (const id of solutions) expect(covered).toContain(id);
  });

  test('all 17 figures of the notes are drawn, none is a placeholder', () => {
    const inventoried = CHAPTER2_INVENTORY.filter((i) => i.type === 'figure').map((i) => i.id);
    expect(inventoried).toHaveLength(17);
    expect(Object.keys(CHAPTER2_FIGURES).sort()).toEqual([...inventoried].sort());
    const unam = drawnFigures.filter((f) => f.origin === 'unamFigure');
    expect(new Set(unam.map((f) => f.id)).size).toBe(17);
    const numbers = unam
      .flatMap((f) => (f.number ? [f.number] : []))
      .sort((a, b) => Number(a.split('.')[1]) - Number(b.split('.')[1]));
    expect(numbers).toEqual(Array.from({ length: 16 }, (_, k) => `2.${k + 1}`));
    for (const figure of Object.values(CHAPTER2_FIGURES)) {
      expect(figure.description.length).toBeGreaterThan(30);
      for (const panel of figure.panels) expect(panel.items.length).toBeGreaterThan(0);
    }
    expect(CHAPTER2_FIGURES['ch2-fig-2.5']?.panels).toHaveLength(3);
    expect(CHAPTER2_FIGURES['ch2-fig-2.7']?.panels).toHaveLength(4);
  });

  test('right, left, sample-point and midpoint rectangles each have their own drawing', () => {
    const ids = drawnFigures.map((f) => f.id);
    expect(ids).toEqual(expect.arrayContaining(['figure-2-3', 'app-left-endpoints', 'figure-2-4', 'app-midpoints']));
    // App drawings are always labelled as such.
    for (const figure of drawnFigures.filter((f) => f.id.startsWith('app-')))
      expect(figure.origin).toBe('appIllustration');
  });

  test('the You Try It (Exercise 2.2.1) is a Try it question worked in My Working', () => {
    expect(CHAPTER2_PRACTICE.map((p) => p.id)).toEqual(['ch2-ex-2.2.1-yti']);
    expect(practiceInStep(U.definite, 'try-it').map((p) => p.id)).toEqual(['ch2-ex-2.2.1-yti']);
    expect(CHAPTER2_PRACTICE[0]?.definite).toBeDefined();
  });
});

describe('Tutorial 2', () => {
  test('69 Topic 2 parts, unique, matching the approved map; Q1(a)–(g) only in Topic 1', () => {
    expect(TUTORIAL2_ITEMS).toHaveLength(69);
    expect(new Set(TUTORIAL2_ITEMS.map((i) => i.id)).size).toBe(69);
    expect(TUTORIAL2_ITEMS.map(key).sort()).toEqual(Object.keys(TUTORIAL2_PART_MAP).sort());
    expect(TUTORIAL2_ITEMS.some((i) => i.sourceQuestion === 'Q1')).toBe(false);
    expect(TUTORIAL2_CHAPTER1_ITEMS.map(key)).toEqual(['Q1(a)', 'Q1(b)', 'Q1(c)', 'Q1(d)', 'Q1(e)', 'Q1(f)', 'Q1(g)']);
    expect(
      (integrationTopic.practiceItems ?? []).filter((i) => i.source.document === 'unam-s3512mc-tut2-2026'),
    ).toHaveLength(7);
    expect((areaTopic.practiceItems ?? []).filter((i) => i.sourceQuestion === 'Q1')).toHaveLength(0);
  });

  test.each(TUTORIAL2_ITEMS.map((i) => [key(i), i] as const))(
    '%s is in the Practise step of its subtopic',
    (part, item) => {
      expect(item.unitId).toBe(TUTORIAL2_PART_MAP[part]);
      expect(practiceInStep(item.unitId, 'practise').map((p) => p.id)).toContain(item.id);
      expect(item.source.document).toBe('unam-s3512mc-tut2-2026');
      expect(item.problemTex.length).toBeGreaterThan(0);
      expect(item.sourceSection.length).toBeGreaterThan(0);
      expect(item.solution?.status).toBe('pendingLecturerReview');
    },
  );

  test('Q3 and Q8(d) stay hidden for lecturer review; the other 67 are learner-visible', () => {
    const hidden = TUTORIAL2_ITEMS.filter((i) => !isPracticeItemVisible(i, { reviewerMode: false }));
    expect(hidden.map(key).sort()).toEqual(['Q3', 'Q8(d)']);
    for (const item of hidden) expect(item.needsManualReview).toBe(true);
    expect(TUTORIAL2_ITEMS.length - hidden.length).toBe(67);
  });

  test('every visible part can be checked in My Working', () => {
    for (const item of TUTORIAL2_ITEMS.filter((i) => isPracticeItemVisible(i, { reviewerMode: false }))) {
      expect(item.definite).toBeDefined();
      expect(item.hints.every((h) => h.length > 0)).toBe(true);
      expect(item.solution?.steps.length).toBeGreaterThan(0);
    }
  });
});

describe('manual-review links', () => {
  const used = [
    ...areaTopic.units.flatMap((u) =>
      blocksOf(u).flatMap((b) => [
        ...(b.reviewIds ?? []),
        ...(b.type === 'workedExample' ? b.steps.flatMap((s) => s.reviewIds ?? []) : []),
      ]),
    ),
    ...(areaTopic.practiceItems ?? []).flatMap((i) => i.reviewIds),
  ];
  test('content refers only to review items that exist, and every item-specific entry is attached', () => {
    const known = new Set(AREA_MANUAL_REVIEW.map((m) => m.id));
    expect(used.filter((id) => !known.has(id))).toEqual([]);
    for (const entry of AREA_MANUAL_REVIEW.filter((m) => m.id !== 'MR2-SOL')) expect(used).toContain(entry.id);
  });
});

describe('database migration matches the content', () => {
  const sql = readFileSync('supabase/migrations/20261014000000_integration_area_topic.sql', 'utf8');
  const rows = [
    ...sql.matchAll(
      /\('(area-[a-z-]+)', 'integration-area', '([^']+)',\s*'([^']+)', (\d+),\s*array\[([^\]]+)\], (\d+), false\)/g,
    ),
  ];

  test('registers the eight units with the same ids, titles, summaries, order, steps and estimates', () => {
    expect(rows).toHaveLength(8);
    rows.forEach((row, index) => {
      const unit = areaTopic.units[index]!;
      const [, id, title, summary, sortOrder, sections, minutes] = row;
      expect(id).toBe(unit.id);
      expect(title).toBe(unit.title);
      expect(summary).toBe(unit.summary);
      expect(Number(sortOrder)).toBe(index + 1);
      expect(sections!.split(',').map((s) => s.trim().replace(/'/g, ''))).toEqual(unit.steps.map((s) => s.key));
      // estimated_minutes is informational; the app calculates study time from the content (content/estimate.ts).
      expect(Number(minutes)).toBeGreaterThan(0);
      expect(estimateSubtopicMinutes(unit)).toBeGreaterThan(0);
    });
    expect(sql).toContain(`'${areaTopic.title}'`);
    expect(sql).toContain(`'${areaTopic.description}'`);
  });

  test('is insert-only and leaves the active topic, tables and policies alone', () => {
    const code = sql.replace(/--.*$/gm, '');
    expect(code).not.toMatch(/\b(drop|truncate|delete|alter\s+table|grant|revoke|create\s+policy|is_active)\b/i);
  });
});
