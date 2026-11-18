import { readFileSync } from 'fs';

import { estimateSubtopicMinutes } from '@/content/estimate';
import { integrationTopic, INTEGRATION_UNITS } from '@/content/topics/integration';
import { MANUAL_REVIEW_REGISTER } from '@/content/topics/integration/manualReview';
import { CHAPTER1_SECTION_MAP, TUTORIAL1_PART_MAP } from '@/content/topics/integration/sources';
import { type ContentBlock, LESSON_STEP_KINDS } from '@/content/types';
import { isPracticeItemVisible, isSolutionVisibleToLearners } from '@/content/visibility';
import { texOf, textOf } from '@/test-utils/contentWalk';

const U = INTEGRATION_UNITS;

describe('Integration topic structure (approved Phase 0 / Phase 1 decisions)', () => {
  test('exactly the seven approved subtopics, in order', () => {
    expect(integrationTopic.units.map((u) => u.title)).toEqual([
      'Understanding Integration',
      'Basic Integration Rules',
      'Substitution',
      'Partial Fractions',
      'Algebraic and Trigonometric Substitution',
      'Integration by Parts',
      'Advanced Integration Patterns',
    ]);
  });

  test('topic title and description', () => {
    expect(integrationTopic.title).toBe('Integration');
    expect(integrationTopic.description).toBe(
      'Understand integration as reversing differentiation and learn how to recognise and apply appropriate integration techniques.',
    );
    expect(integrationTopic.isDemo).toBe(false);
  });

  test('steps follow the standard lesson order with unique keys', () => {
    for (const unit of integrationTopic.units) {
      const order = unit.steps.map((s) => LESSON_STEP_KINDS.indexOf(s.kind));
      expect(order).toEqual([...order].sort((a, b) => a - b));
      expect(new Set(unit.steps.map((s) => s.key)).size).toBe(unit.steps.length);
      // Every subtopic teaches something now and has a worked example.
      expect(unit.steps.some((s) => s.kind === 'concept' && s.availability.status === 'available')).toBe(true);
      expect(unit.steps.some((s) => s.kind === 'worked-example' && s.availability.status === 'available')).toBe(true);
    }
  });

  test('slugs are unique and URL-safe', () => {
    const slugs = integrationTopic.units.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(7);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe('database migration matches the content', () => {
  // Jest runs from the project root.
  const sql = readFileSync('supabase/migrations/20261012000000_integration_topic.sql', 'utf8');
  const rows = [
    ...sql.matchAll(
      /\('(integration-[a-z-]+)', 'integration', '([^']+)',\s*'([^']+)', (\d+),\s*array\[([^\]]+)\], (\d+), false\)/g,
    ),
  ];
  // Later migrations that update step lists (sections) for some units.
  const stepUpdates = readFileSync('supabase/migrations/20261013000000_integration_activity_steps.sql', 'utf8');
  const updated = new Map<string, string>();
  for (const [, sections, ids] of stepUpdates.matchAll(/set sections = array\[([^\]]+)\]\s*where id in \(([^)]+)\)/g)) {
    for (const id of ids!.split(',')) updated.set(id.trim().replace(/'/g, ''), sections!);
  }
  for (const row of rows) {
    const later = updated.get(row[1]!);
    if (later) row[5] = later;
  }

  test('later step-list migration is non-destructive', () => {
    expect(updated.size).toBe(3);
    expect(stepUpdates.replace(/--.*$/gm, '')).not.toMatch(
      /\b(drop|truncate|delete|alter\s+table|grant|revoke|create\s+policy|insert)\b/i,
    );
  });

  test('registers the seven units with the same ids, titles, order, steps and estimates', () => {
    expect(rows).toHaveLength(7);
    rows.forEach((row, index) => {
      const unit = integrationTopic.units[index]!;
      const [, id, title, summary, sortOrder, sections, minutes] = row;
      expect(id).toBe(unit.id);
      expect(title).toBe(unit.title);
      expect(summary).toBe(unit.summary);
      expect(Number(sortOrder)).toBe(index + 1);
      expect(sections!.split(',').map((s: string) => s.trim().replace(/'/g, ''))).toEqual(unit.steps.map((s) => s.key));
      // estimated_minutes is informational; the app calculates study time from the content (content/estimate.ts).
      expect(Number(minutes)).toBeGreaterThan(0);
      expect(estimateSubtopicMinutes(unit)).toBeGreaterThan(0);
    });
  });

  test('is non-destructive', () => {
    expect(sql).not.toMatch(/\b(drop|truncate|delete|alter\s+table|grant|revoke|create\s+policy)\b/i);
  });
});

describe('source traceability', () => {
  test('every Chapter 1 section is mapped; §1.14 belongs to Advanced Integration Patterns', () => {
    expect(CHAPTER1_SECTION_MAP.map((s) => s.section)).toEqual([
      '1.1',
      '1.2',
      '1.3',
      '1.4',
      '1.5',
      '1.6',
      '1.6.1',
      '1.6.2',
      '1.6.3',
      '1.7',
      '1.8',
      '1.8.1',
      '1.9',
      '1.10',
      '1.11',
      '1.12',
      '1.13',
      '1.14',
    ]);
    expect(CHAPTER1_SECTION_MAP.find((s) => s.section === '1.14')?.unitId).toBe(U.advancedPatterns);
  });

  test('all 84 Tutorial 1 parts are classified (none silently omitted)', () => {
    const counts: Record<string, number> = {};
    for (const unitId of Object.values(TUTORIAL1_PART_MAP)) counts[unitId] = (counts[unitId] ?? 0) + 1;
    expect(Object.keys(TUTORIAL1_PART_MAP)).toHaveLength(84);
    expect(counts).toEqual({
      [U.basicRules]: 1,
      [U.substitution]: 20,
      [U.partialFractions]: 20,
      [U.algebraicTrig]: 16,
      [U.byParts]: 8,
      [U.advancedPatterns]: 19,
    });
    expect(TUTORIAL1_PART_MAP['Q12(i)']).toBe(U.advancedPatterns);
  });

  test('worked examples are UNAM examples with their solution printed in the notes', () => {
    const examples = integrationTopic.units.flatMap((u) =>
      u.steps.flatMap((s) =>
        s.blocks.filter((b): b is Extract<ContentBlock, { type: 'workedExample' }> => b.type === 'workedExample'),
      ),
    );
    expect(examples).toHaveLength(36);
    for (const example of examples) {
      expect(example.source.document).toBe('unam-s3512mc-ch1-notes-2026');
      expect(example.source.section).toBeTruthy();
      expect(example.origin).not.toBe('appAuthored');
      expect(example.solutionStatus).toBe('unamSource');
    }
  });

  test('learners never see source numbering as labels', () => {
    const numbering = /\b1\.\d{1,2}(\.\d)?\b|Exercise\s+\d|Example\s+1\.|Q\d+\(|Tutorial\s+1/;
    const visible: string[] = [integrationTopic.title, integrationTopic.description];
    for (const unit of integrationTopic.units) {
      visible.push(unit.title, unit.summary);
      for (const step of unit.steps) {
        visible.push(step.title);
        if (step.availability.status === 'planned') visible.push(step.availability.preview);
        for (const block of step.blocks) visible.push(...textOf(block));
      }
    }
    for (const text of visible) expect(text).not.toMatch(numbering);
  });
});

describe('manual-review register', () => {
  test('records every ambiguity found in the source, all still open', () => {
    expect(MANUAL_REVIEW_REGISTER.map((m) => m.id)).toEqual(
      Array.from({ length: 16 }, (_, i) => `MR-${String(i + 1).padStart(2, '0')}`),
    );
    expect(MANUAL_REVIEW_REGISTER.every((m) => m.status === 'open')).toBe(true);
    const categories = new Set(MANUAL_REVIEW_REGISTER.map((m) => m.category));
    for (const category of [
      'sourceTypo',
      'ambiguousNotation',
      'uncertainExpression',
      'beyondNotes',
      'needsAssumptions',
      'noAnswerKey',
    ]) {
      expect(categories.has(category as never)).toBe(true);
    }
  });

  test('items blocked by an open review are withheld from learner practice, and only those', () => {
    const items = integrationTopic.practiceItems ?? [];
    const withheld = items.filter((i) => !isPracticeItemVisible(i, { reviewerMode: false })).map((i) => i.id);
    expect(withheld.sort()).toEqual(
      ['ch1-1.8-exercise-1', 'tut1-q1-iv', 'tut1-q6', 'tut1-q7-xviii', 'tut1-q10', 'tut1-q11-iv'].sort(),
    );
    // Reviewer mode (development builds only) shows them for checking.
    expect(items.every((i) => isPracticeItemVisible(i, { reviewerMode: true }))).toBe(true);
  });

  test('typos in the notes are shown exactly as printed, never silently corrected', () => {
    const texts = integrationTopic.units.flatMap((u) => u.steps.flatMap((s) => s.blocks.flatMap(texOf)));
    expect(texts).toContain('2t = 4\\,dx \\quad\\text{and so}\\quad dx = \\frac{1}{2}t\\,dt'); // MR-09
    expect(texts).toContain('du = nx^{n-1}, \\quad v = \\int dv = \\int e^{x}\\,dx = e^{x}'); // MR-03
    expect(texts).toContain('\\int [f(x) \\pm g(x)] = \\int f(x)\\,dx \\pm \\int g(x)\\,dx'); // MR-15
    expect(texts).toContain('\\int \\sin^{4}x(\\cos x)\\,dx - \\sin^{6}x(\\cos x)\\,dx'); // MR-05
  });

  test('extension questions (beyond the notes) are labelled', () => {
    const extension = (integrationTopic.practiceItems ?? []).filter((i) => i.isExtension).map((i) => i.id);
    expect(extension).toContain('tut1-q3-viii');
    expect(extension).toContain('tut1-q11-viii');
  });
});

describe('solution visibility (Decision 3)', () => {
  test('only UNAM-printed or lecturer-approved solutions reach learners', () => {
    expect(isSolutionVisibleToLearners('unamSource')).toBe(true);
    expect(isSolutionVisibleToLearners('lecturerApproved')).toBe(true);
    expect(isSolutionVisibleToLearners('pendingLecturerReview')).toBe(false);
    expect(isSolutionVisibleToLearners('pendingLecturerReview', { reviewerMode: false })).toBe(false);
    expect(isSolutionVisibleToLearners('pendingLecturerReview', { reviewerMode: true })).toBe(true);
  });
});
