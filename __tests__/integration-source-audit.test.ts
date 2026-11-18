/**
 * Source completeness audit for Topic 1.
 *
 * Fails if any item in the Chapter 1 inventory or any Tutorial 1 part has no
 * mapped app content, if content points at an unknown source item, or if an
 * item is mapped to the wrong subtopic. Run on its own with
 * `npm run audit:content`.
 */
import { integrationTopic, INTEGRATION_UNITS } from '@/content/topics/integration';
import { CHAPTER1_PRACTICE } from '@/content/topics/integration/chapterPractice';
import { CHAPTER1_INVENTORY } from '@/content/topics/integration/inventory';
import { MANUAL_REVIEW_REGISTER } from '@/content/topics/integration/manualReview';
import { CHAPTER1_SECTION_MAP, TUTORIAL1_PART_MAP } from '@/content/topics/integration/sources';
import { TUTORIAL1_ITEMS } from '@/content/topics/integration/tutorial1';
import type { ContentBlock, LessonStepKind, PracticeItem } from '@/content/types';
import { blocksOf, inventoryIdsOf } from '@/test-utils/contentWalk';

const unitById = new Map(integrationTopic.units.map((u) => [u.id, u]));

const practiceInStep = (unitId: string, kind: LessonStepKind): PracticeItem[] =>
  (unitById.get(unitId)?.steps.filter((s) => s.kind === kind) ?? [])
    .flatMap((s) => s.blocks)
    .flatMap((b) => (b.type === 'practiceGroup' ? b.items : []));

describe('Chapter 1 inventory', () => {
  test('sections 1.1 to 1.14 are all inventoried and mapped', () => {
    const sections = CHAPTER1_SECTION_MAP.map((s) => s.section);
    for (let n = 1; n <= 14; n++) expect(sections).toContain(`1.${n}`);
    for (const section of sections) expect(CHAPTER1_INVENTORY.some((i) => i.section === section)).toBe(true);
  });

  test('inventory ids are unique and each item sits in its section’s subtopic', () => {
    expect(new Set(CHAPTER1_INVENTORY.map((i) => i.id)).size).toBe(CHAPTER1_INVENTORY.length);
    for (const item of CHAPTER1_INVENTORY) {
      expect(CHAPTER1_SECTION_MAP.find((s) => s.section === item.section)?.unitId).toBe(item.unitId);
    }
  });

  test.each(CHAPTER1_INVENTORY.map((i) => [i.id, i] as const))('%s has mapped content in its subtopic', (id, item) => {
    const unit = unitById.get(item.unitId);
    expect(unit).toBeDefined();
    const presented = new Set(blocksOf(unit!).flatMap(inventoryIdsOf));
    expect(presented.has(id)).toBe(true);
  });

  test('content never points at an unknown source item', () => {
    const known = new Set(CHAPTER1_INVENTORY.map((i) => i.id));
    const used = integrationTopic.units.flatMap((u) => blocksOf(u).flatMap(inventoryIdsOf));
    expect(used.filter((id) => !known.has(id) && !id.startsWith('tut1-'))).toEqual([]);
  });

  test('all 36 worked examples are included, each as its own step-by-step example', () => {
    const inventoried = CHAPTER1_INVENTORY.filter((i) => i.type === 'worked-example');
    expect(inventoried).toHaveLength(36);
    const examples = integrationTopic.units.flatMap((u) =>
      blocksOf(u).filter((b): b is Extract<ContentBlock, { type: 'workedExample' }> => b.type === 'workedExample'),
    );
    expect(examples.map((e) => e.source.inventoryId).sort()).toEqual(inventoried.map((i) => i.id).sort());
    for (const example of examples) {
      expect(example.steps.length).toBeGreaterThan(0);
      expect(example.solutionStatus).toBe('unamSource');
    }
  });

  test('all 13 "You Try It" items and exercises are practice items in their subtopic’s Try it step', () => {
    const inventoried = CHAPTER1_INVENTORY.filter((i) => i.type === 'you-try-it' || i.type === 'chapter-exercise');
    expect(inventoried).toHaveLength(13);
    expect(CHAPTER1_PRACTICE.map((p) => p.id).sort()).toEqual(inventoried.map((i) => i.id).sort());
    for (const item of inventoried) {
      const practice = CHAPTER1_PRACTICE.find((p) => p.id === item.id);
      expect(practice?.sourceType).toBe(item.type);
      expect(practiceInStep(item.unitId, 'try-it').map((p) => p.id)).toContain(item.id);
    }
  });
});

describe('Tutorial 1', () => {
  const key = (item: PracticeItem) =>
    item.sourceSubquestion ? `${item.sourceQuestion}(${item.sourceSubquestion})` : (item.sourceQuestion ?? '');

  test('all 84 parts are present, with unique ids', () => {
    expect(TUTORIAL1_ITEMS).toHaveLength(84);
    expect(new Set(TUTORIAL1_ITEMS.map((i) => i.id)).size).toBe(84);
    expect(TUTORIAL1_ITEMS.map(key).sort()).toEqual(Object.keys(TUTORIAL1_PART_MAP).sort());
  });

  test.each(TUTORIAL1_ITEMS.map((i) => [key(i), i] as const))(
    '%s is in the Practise step of its subtopic',
    (part, item) => {
      expect(item.unitId).toBe(TUTORIAL1_PART_MAP[part]);
      expect(practiceInStep(item.unitId, 'practise').map((p) => p.id)).toContain(item.id);
      expect(item.source.document).toBe('unam-s3512mc-tut1-2026');
      expect(item.problemTex.length).toBeGreaterThan(0);
      expect(item.techniqueLabel.length).toBeGreaterThan(0);
      expect(item.needsManualReview).toBe(item.reviewIds.length > 0);
      expect(item.solution?.status).toBe('pendingLecturerReview');
    },
  );

  test('can be filtered by subtopic and by technique', () => {
    const items = integrationTopic.practiceItems ?? [];
    const bySubtopic = items.filter(
      (i) => i.sourceType === 'tutorial-question' && i.unitId === INTEGRATION_UNITS.byParts,
    );
    // 8 Tutorial 1 parts and Tutorial 2 Question 1(a) (integration by parts).
    expect(bySubtopic).toHaveLength(9);
    expect(bySubtopic.filter((i) => i.source.document === 'unam-s3512mc-tut2-2026').map((i) => i.id)).toEqual([
      'tut2-q1-a',
    ]);
    expect(items.filter((i) => i.technique === 'tan-half-angle').length).toBeGreaterThan(0);
  });
});

describe('manual-review links', () => {
  const contentReviewIds = [
    ...integrationTopic.units.flatMap((u) =>
      blocksOf(u).flatMap((b) => [
        ...(b.reviewIds ?? []),
        ...(b.type === 'workedExample' || b.type === 'derivation' ? b.steps.flatMap((s) => s.reviewIds ?? []) : []),
        ...(b.type === 'formulaList' ? b.items.flatMap((i) => i.reviewIds ?? []) : []),
        ...(b.type === 'table' ? b.rows.flatMap((r) => r.reviewIds ?? []) : []),
      ]),
    ),
    ...(integrationTopic.practiceItems ?? []).flatMap((i) => i.reviewIds),
  ];

  test('content only refers to review items that exist', () => {
    const known = new Set(MANUAL_REVIEW_REGISTER.map((m) => m.id));
    expect(contentReviewIds.filter((id) => !known.has(id))).toEqual([]);
  });

  test('every item-specific review entry is attached to the content it concerns', () => {
    // MR-14 applies to all app-authored solutions through their solution status.
    for (const entry of MANUAL_REVIEW_REGISTER.filter((m) => m.id !== 'MR-14')) {
      expect(contentReviewIds).toContain(entry.id);
    }
  });
});
