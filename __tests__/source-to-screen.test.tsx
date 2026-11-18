/**
 * Source-to-screen audit: every Chapter 1 section (and Table 1.1) must be
 * reachable by learners as its own page, nested in the right subtopic, with
 * all of its worked examples, "You Try It" items, exercises and mapped
 * tutorial questions on screen. Fails if anything exists only in data.
 *
 * Set PRINT_AUDIT=1 to print the audit table.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { integrationTopic, INTEGRATION_UNITS as U } from '@/content/topics/integration';
import { CHAPTER1_INVENTORY } from '@/content/topics/integration/inventory';
import type { SourceSection } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { seedSignedInLearner } from '@/test-utils/auth';

// The first full-router render compiles the whole app, which is slow on a cold cache.
jest.setTimeout(400_000);

/** The required structure: every heading of the notes, in order, inside its app subtopic. */
const REQUIRED: [label: string, heading: string, unitId: string][] = [
  ['1.1', 'Anti-derivatives', U.understanding],
  ['1.2', 'Indefinite Integral', U.understanding],
  ['1.3', 'The Indefinite Integral of a Power', U.basicRules],
  ['1.4', 'Some Anti-Differentiation Formulas', U.basicRules],
  ['1.5', 'u-Substitution', U.substitution],
  ['1.6', 'Partial Fractions', U.partialFractions],
  ['1.6.1', 'Integrating with Repeated Factors', U.partialFractions],
  ['1.6.2', 'Integrating an Improper Rational Function', U.partialFractions],
  ['1.6.3', 'Quadratic Factors', U.partialFractions],
  ['1.7', 'Integrals of the form', U.partialFractions],
  ['1.8', 'Algebraic Functions: Integration by Substitution and Rationalisation', U.algebraicTrig],
  ['Table 1.1', 'Suggested substitutions', U.algebraicTrig],
  ['1.8.1', 'Integrals of the form', U.algebraicTrig],
  ['1.9', 'Integration of Rational Functions of Sine and Cosine', U.algebraicTrig],
  ['1.10', 'Integration by Parts', U.byParts],
  ['1.11', 'Using Integration by Parts Repeatedly', U.byParts],
  ['1.12', 'Reduction Formulas', U.advancedPatterns],
  ['1.13', 'Integration of Powers of Trigonometric Functions', U.advancedPatterns],
  ['1.14', 'Integrals of the form', U.advancedPatterns],
];

const sections = integrationTopic.sections ?? [];
const route = (s: SourceSection) => `/topic/integration/section/${s.id}`;
const examplesIn = (s: SourceSection) => s.blocks.filter((b) => b.type === 'workedExample').length;
const visible = (items: SourceSection['tryIt']) =>
  items.filter((i) => isPracticeItemVisible(i, { reviewerMode: false }));

describe('source structure in the app', () => {
  test('every required heading is its own section, in order, in the right subtopic', () => {
    expect(sections.map((s) => [s.label, s.heading, s.unitId])).toEqual(REQUIRED);
    expect(sections.find((s) => s.label === '1.7')?.headingTex).toBe('\\int \\frac{Ax+B}{ax^{2}+bx+c}\\,dx');
    expect(sections.find((s) => s.label === '1.8.1')?.headingTex).toBe('\\int \\frac{Ax+B}{\\sqrt{ax^{2}+2bx+c}}\\,dx');
    expect(sections.find((s) => s.label === '1.14')?.headingTex).toBe(
      '\\int \\frac{a\\cos x + b\\sin x + c}{A\\cos x + B\\sin x + C}\\,dx',
    );
  });

  test('every section has content, and every source item lands in exactly one section', () => {
    for (const section of sections) expect(section.blocks.length + section.tryIt.length).toBeGreaterThan(0);
    expect(sections.reduce((n, s) => n + examplesIn(s), 0)).toBe(36);
    expect(sections.reduce((n, s) => n + s.tryIt.length, 0)).toBe(13);
    // 84 Tutorial 1 parts and Tutorial 2 Question 1(a)–(g), which practises Chapter 1 methods.
    expect(sections.reduce((n, s) => n + s.tutorial.length, 0)).toBe(91);
    const tutorialIds = sections.flatMap((s) => s.tutorial.map((i) => i.id));
    expect(new Set(tutorialIds).size).toBe(91);
    expect(tutorialIds.filter((id) => id.startsWith('tut2-q1-'))).toHaveLength(7);
    // Every inventoried item is presented in some section page.
    const presented = new Set(
      sections.flatMap((s) => [
        ...s.blocks.flatMap((b) => [
          b.source?.inventoryId,
          ...(b.covers ?? []),
          ...(b.type === 'formulaList' ? b.items.map((i) => i.source?.inventoryId) : []),
          ...(b.type === 'table' ? b.rows.map((r) => r.source?.inventoryId) : []),
        ]),
        ...s.tryIt.map((i) => i.id),
      ]),
    );
    expect(CHAPTER1_INVENTORY.filter((i) => !presented.has(i.id)).map((i) => i.id)).toEqual([]);
  });

  test('Table 1.1 has all ten rows', () => {
    const table = sections.find((s) => s.label === 'Table 1.1');
    const block = table?.blocks.find((b) => b.type === 'table');
    expect(block?.type === 'table' && block.rows).toHaveLength(10);
  });

  if (process.env.PRINT_AUDIT) {
    test('print the audit table', () => {
      const rows = sections.map((s) => {
        const unit = integrationTopic.units.find((u) => u.id === s.unitId);
        const hidden = s.tryIt.length + s.tutorial.length - visible(s.tryIt).length - visible(s.tutorial).length;
        return `| ${s.label} | ${route(s)} | ${unit?.title} | ${examplesIn(s)} | ${s.tryIt.length} | ${s.tutorial.length} | ${hidden} |`;
      });
      console.log(
        [
          '| Section | Route | Subtopic | Worked examples | Try it / exercises | Tutorial | Hidden for review |',
          ...rows,
        ].join('\n'),
      );
    });
  }
});

describe('every section is reachable by learners and shows all of its content', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await seedSignedInLearner();
  });

  test.each(sections.map((s) => [s.label, s] as const))('section %s', async (_label, section) => {
    await renderRouter('./app', { initialUrl: route(section) });
    expect(await screen.findByText(section.label)).toBeOnTheScreen();
    // The page heading (a card inside may repeat it, as Table 1.1's table title does).
    expect(screen.getAllByRole('header', { name: section.heading })[0]).toBeOnTheScreen();

    expect(screen.queryAllByText('WORKED EXAMPLE')).toHaveLength(examplesIn(section));
    expect(screen.queryAllByText(/^(TRY IT|EXERCISE) \d+$/)).toHaveLength(visible(section.tryIt).length);
    expect(screen.queryAllByText(/^PRACTICE \d+$/)).toHaveLength(visible(section.tutorial).length);
    // Each question can be worked on in the app.
    expect(screen.queryAllByRole('button', { name: 'Start working' })).toHaveLength(
      visible(section.tryIt).length + visible(section.tutorial).length,
    );
  });

  test('a lesson opens its sections from the course-notes chips', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/partial-fractions' });
    for (const label of ['1.6', '1.6.1', '1.6.2', '1.6.3', '1.7']) {
      expect(await screen.findByLabelText(new RegExp(`^Open section ${label.replace('.', '\\.')} `))).toBeOnTheScreen();
    }
    await user.press(screen.getByLabelText(/^Open section 1\.6\.1 /));
    expect(await screen.findByRole('header', { name: 'Integrating with Repeated Factors' })).toBeOnTheScreen();
  });
});
