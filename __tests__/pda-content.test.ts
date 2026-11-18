/**
 * Source completeness audit for Topic 4 (Chapter 4 and Tutorial 5).
 *
 * Locks the approved structure and verified source counts, and fails if a
 * Chapter 4 item loses its learner destination, an example goes missing, a
 * printed heading has no section page, an internal review flag leaks into a
 * learner block, a formula cannot be displayed, an activity moves subtopic,
 * app guidance is not labelled, or the database migration drifts.
 */
import { readFileSync } from 'fs';

import { listLearnerTopics } from '@/content/registry';
import { applicationsTopic, PDA_UNITS as U } from '@/content/topics/applications';
import { PDA_STUDIOS } from '@/content/topics/applications/activities';
import { PDA_GAMES } from '@/content/topics/applications/games';
import { CHAPTER4_INVENTORY } from '@/content/topics/applications/inventory';
import { PDA_MANUAL_REVIEW } from '@/content/topics/applications/manualReview';
import { CHAPTER4_SECTION_MAP } from '@/content/topics/applications/sources';
import type { ContentBlock } from '@/content/types';
import { parseTex } from '@/lib/math/tex';
import { blocksOf, inventoryIdsOf, texOf, textOf } from '@/test-utils/contentWalk';

const topic = applicationsTopic;
const unitById = new Map(topic.units.map((u) => [u.id, u]));
type Example = Extract<ContentBlock, { type: 'workedExample' }>;
const examples = topic.units.flatMap((u) => blocksOf(u).filter((b): b is Example => b.type === 'workedExample'));

describe('Topic 4 structure', () => {
  test('registered after Topics 1–3', () => {
    expect(listLearnerTopics().map((t) => t.id)).toEqual([
      'integration',
      'integration-area',
      'differential-calculus-rn',
      'partial-derivative-applications',
    ]);
    expect(topic.title).toBe('Applications of Partial Derivatives');
    expect(topic.family).toBe('applications-of-derivatives');
  });

  test('the four approved subtopics, in order', () => {
    expect(topic.units.map((u) => u.title)).toEqual([
      'The Gradient',
      'Tangent Planes and Normal Lines',
      'Critical Points and Relative Extrema',
      'The Second Partials Test',
    ]);
  });

  test('every printed heading (5) is its own section page, in order, with content', () => {
    expect((topic.sections ?? []).map((s) => [s.label, s.heading])).toEqual([
      ['4.1', 'The Gradient of a Function of Two Variables'],
      ['4.2', 'Tangent Planes and Normal Lines'],
      ['4.2.1', 'Tangent Plane and Normal Line to a Surface'],
      ['4.3', 'Extrema of Functions of Two Variables'],
      ['4.3.1', 'Absolute Extrema and Relative Extrema'],
    ]);
    expect(CHAPTER4_SECTION_MAP).toHaveLength(5);
    for (const section of topic.sections ?? []) expect(section.blocks.length).toBeGreaterThan(0);
    // §4.2 and §4.3 are headings only in the notes: their pages say so and invent nothing.
    for (const id of ['4-2', '4-3']) {
      const page = topic.sections!.find((s) => s.id === id)!;
      expect(page.blocks.every((b) => b.type === 'paragraph' && b.source === undefined)).toBe(true);
    }
  });

  test('§4.3.1 is taught in Subtopics 3 and 4 and no new section numbers are invented', () => {
    expect(CHAPTER4_SECTION_MAP.find((s) => s.section === '4.3.1')?.unitIds).toEqual([
      U.criticalPoints,
      U.secondPartials,
    ]);
    for (const unit of topic.units) for (const s of unit.steps) expect(s.title).not.toMatch(/^4\.\d\.\d\.\d/);
    expect(CHAPTER4_INVENTORY.every((i) => ['4', '4.1', '4.2.1', '4.3.1'].includes(i.section))).toBe(true);
  });

  test('lesson steps: Concept, Worked example and Practise are required; no Create in Subtopic 3', () => {
    for (const unit of topic.units) {
      const required = unit.steps.filter((s) => s.required).map((s) => s.key);
      expect(required).toEqual(['concept', 'worked-example', 'practise']);
      expect(unit.steps.some((s) => s.key === 'create')).toBe(unit.id !== U.criticalPoints);
    }
  });
});

describe('Chapter 4 inventory', () => {
  test('unique ids, each in a subtopic that teaches its printed section', () => {
    expect(new Set(CHAPTER4_INVENTORY.map((i) => i.id)).size).toBe(CHAPTER4_INVENTORY.length);
    for (const item of CHAPTER4_INVENTORY) {
      const section = item.section === '4' ? '4.1' : item.section;
      expect(CHAPTER4_SECTION_MAP.find((s) => s.section === section)?.unitIds).toContain(item.unitId);
    }
  });

  test('counts: 8 examples with 8 solutions, 5 theorems, 3 definitions, no figures', () => {
    const count = (type: string) => CHAPTER4_INVENTORY.filter((i) => i.type === type).length;
    expect(count('worked-example')).toBe(8);
    expect(count('worked-solution')).toBe(8);
    expect(count('theorem')).toBe(5);
    expect(count('definition')).toBe(3);
    expect(count('figure')).toBe(0);
  });

  test.each(CHAPTER4_INVENTORY.map((i) => [i.id, i] as const))(
    '%s has a learner destination with content',
    (id, item) => {
      const unit = unitById.get(item.unitId)!;
      const blocks = blocksOf(unit).filter((b) => inventoryIdsOf(b).includes(id));
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        const words = textOf(block).join(' ').trim();
        expect(words.length > 0 || block.type === 'math').toBe(true);
      }
      const section = (topic.sections ?? []).find((s) => s.id === item.navSection);
      expect(section?.blocks.flatMap(inventoryIdsOf)).toContain(id);
    },
  );

  test('content never points at an unknown source item', () => {
    const known = new Set(CHAPTER4_INVENTORY.map((i) => i.id));
    const used = topic.units.flatMap((u) => blocksOf(u).flatMap(inventoryIdsOf));
    expect(used.filter((id) => !known.has(id))).toEqual([]);
  });
});

describe('worked examples and figures', () => {
  test('exactly 8 numbered worked examples, each with its printed solution, as unamSource', () => {
    expect(examples.map((e) => e.title)).toEqual(
      ['4.1.1', '4.1.2', '4.2.1', '4.2.2', '4.2.3', '4.3.1', '4.3.2', '4.3.3'].map((n) => `Example ${n}`),
    );
    for (const e of examples) {
      expect(e.origin).toBe('unamSource');
      expect(e.solutionStatus).toBe('unamSource');
      expect(e.steps.length).toBeGreaterThan(0);
      expect(e.covers?.[0]).toBe(e.source.inventoryId!.replace('-ex-', '-sol-'));
    }
  });

  test('printed text is kept exactly as printed (MR4-01, MR4-03 and MR4-07 are not silently corrected)', () => {
    const tex = (title: string) =>
      examples
        .find((e) => e.title === title)!
        .steps.map((s) => s.tex ?? '')
        .join(' ');
    expect(tex('Example 4.1.1')).toContain('(\\ln 1 + 2(1)(2))\\mathbf{i} = 6\\mathbf{i} + 4\\mathbf{j}');
    const words = topic.units.flatMap((u) => blocksOf(u).flatMap(textOf)).join(' ');
    expect(words).toContain('$p = (x_{0}, y_{0}, z_{0})$ be the point on $S$');
    expect(words).toContain('To locate relative extreme of $f$');
    expect(words).toContain('$f_{x}(x_{0}, y_{0})$ and $f_{y}(x_{0}, y_{0})$ does not exist.');
    expect(words).toContain('the type for which either $f_{x}(x, y)$ or $f_{y}(x, y)$ is undefined');
  });

  test('theorems as printed, with their labels', () => {
    const theorems = topic.units.flatMap((u) =>
      blocksOf(u).flatMap((b) => (b.type === 'theorem' ? [[b.label, b.title ?? ''] as const] : [])),
    );
    expect(theorems).toEqual([
      ['Theorem 4.2.1', 'Definition of Tangent Plane and Normal Line'],
      ['Theorem 4.2.2', 'Equation of Tangent Plane'],
      ['Theorem 4.3.1', 'Extreme Value Theorem'],
      ['Theorem 4.3.2', ''],
      ['Theorem 4.3.3', ''],
    ]);
  });

  test('Chapter 4 has no figures: no figure block claims to be a UNAM figure', () => {
    const figures = topic.units.flatMap((u) => blocksOf(u).filter((b) => b.type === 'figure'));
    expect(figures).toEqual([]);
  });

  test('app guidance next to the notes is labelled and never presented as UNAM material', () => {
    const guidance = topic.units.flatMap((u) =>
      blocksOf(u).filter((b) => b.type === 'callout' && b.title.startsWith('APP GUIDANCE')),
    );
    expect(guidance).toHaveLength(3);
    for (const g of guidance) expect(g.source).toBeUndefined();
  });
});

describe('review flags and display', () => {
  test('MR4-01 to MR4-12 are registered, open, and stay internal (no learner block carries them)', () => {
    expect(PDA_MANUAL_REVIEW.map((m) => m.id)).toEqual(
      Array.from({ length: 12 }, (_, i) => `MR4-${String(i + 1).padStart(2, '0')}`),
    );
    expect(PDA_MANUAL_REVIEW.every((m) => m.status === 'open' && !m.blocksLearnerUse)).toBe(true);
    for (const unit of topic.units) {
      for (const block of blocksOf(unit)) {
        expect(block.reviewIds ?? []).toEqual([]);
        if (block.type === 'workedExample') for (const s of block.steps) expect(s.reviewIds ?? []).toEqual([]);
      }
    }
    const known = new Set(PDA_MANUAL_REVIEW.map((m) => m.id));
    for (const item of CHAPTER4_INVENTORY) for (const id of item.reviewIds ?? []) expect(known.has(id)).toBe(true);
  });

  test('no mastery claim anywhere in Topic 4', () => {
    const words = topic.units.flatMap((u) => blocksOf(u).flatMap(textOf)).join(' ');
    expect(words).not.toMatch(/mastery/i);
  });

  test('MR4-12: the gradient is described by its definition only (no steepest-ascent or level-curve claim)', () => {
    const words = [
      ...topic.units.flatMap((u) => blocksOf(u).flatMap(textOf)),
      ...topic.activities.flatMap((a) => [a.title, a.summary]),
    ].join(' ');
    expect(words).not.toMatch(/steepest|perpendicular to (the )?level/i);
  });

  test('all Topic 4 TeX can be displayed', () => {
    const tex = [
      ...topic.units.flatMap((u) => blocksOf(u).flatMap(texOf)),
      ...(topic.practiceItems ?? []).flatMap((i) => [i.problemTex, i.solution?.answerTex ?? '']),
      ...(topic.retrievalItems ?? []).flatMap((i) => [i.problemTex, i.solution?.answerTex ?? '']),
    ].filter((t) => t.length > 0);
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

describe('activities (approved placement)', () => {
  test('Explore, Play and Create per subtopic, exactly as approved', () => {
    const by = (unitId: string, kind: string) =>
      topic.activities.filter((a) => a.unitId === unitId && a.kind === kind).map((a) => a.title);
    expect([by(U.gradient, 'lab'), by(U.gradient, 'game'), by(U.gradient, 'studio')]).toEqual([
      ['Gradient Probe'],
      ['Gradient Builder'],
      ['Gradient Field Art'],
    ]);
    expect([by(U.tangentPlanes, 'lab'), by(U.tangentPlanes, 'game'), by(U.tangentPlanes, 'studio')]).toEqual([
      ['Tangent Plane Lab'],
      ['Plane Builder'],
      ['Faceted Surface'],
    ]);
    expect([by(U.criticalPoints, 'lab'), by(U.criticalPoints, 'game'), by(U.criticalPoints, 'studio')]).toEqual([
      ['Critical Point Finder'],
      ['Is It Critical?'],
      [],
    ]);
    expect([by(U.secondPartials, 'lab'), by(U.secondPartials, 'game'), by(U.secondPartials, 'studio')]).toEqual([
      ['Saddle or Not'],
      ['Classify It'],
      ['Landscape Designer'],
    ]);
  });

  test('Explore and Create are distinct: labs are course-aligned, studios are creative with a studio config', () => {
    for (const a of topic.activities) {
      if (a.kind === 'lab') expect(a.alignment).toBe('course');
      if (a.kind === 'studio') {
        expect(a.alignment).toBe('creative');
        expect(a.createType).toBe('paArt');
        expect(PDA_STUDIOS[a.id]).toBeDefined();
      }
      expect(a.evidenceBasis?.length ?? 0).toBeGreaterThan(0);
    }
  });

  test('every game round is a well-formed mathematical decision', () => {
    for (const game of PDA_GAMES) {
      expect(game.rounds.length).toBeGreaterThanOrEqual(6);
      for (const round of game.rounds) {
        if (round.kind === 'select') expect(round.choices.some((c) => c.correct)).toBe(true);
        if (round.kind === 'stages')
          for (const s of round.stages) expect(s.choices.filter((c) => c.correct)).toHaveLength(1);
        if (round.kind === 'match') expect(round.pairs.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe('database migration', () => {
  test('the migration inserts the topic and all four units with the content’s step keys, and removes nothing', () => {
    const sql = readFileSync('supabase/migrations/20261018000000_partial_derivative_applications_topic.sql', 'utf8');
    expect(sql).toContain("'partial-derivative-applications'");
    expect(sql).toContain("'applications-of-derivatives'");
    expect(sql).not.toMatch(/\b(delete|drop|truncate|alter)\b/i);
    for (const unit of topic.units) {
      const row = new RegExp(`\\('${unit.id}', 'partial-derivative-applications'[\\s\\S]*?array\\[([^\\]]*)\\]`).exec(
        sql,
      );
      expect(row).not.toBeNull();
      const keys = row![1]!.split(',').map((k) => k.trim().replace(/'/g, ''));
      expect(keys).toEqual(unit.steps.map((s) => s.key));
    }
  });
});
