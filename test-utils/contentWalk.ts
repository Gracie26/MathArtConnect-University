/**
 * Helpers for tests that inspect lesson content: every formula, every piece
 * of learner-visible text and every source link in a block.
 */
import type { ContentBlock, LearningUnitDefinition, PracticeItem, WorkedStep } from '@/content/types';
import { splitInlineMath } from '@/lib/math/tex';

const inline = (text: string) =>
  splitInlineMath(text)
    .filter((p) => p.type === 'math')
    .map((p) => p.value);

const stepTex = (steps: WorkedStep[]) =>
  steps.flatMap((s) => [...inline(s.explanation), ...(s.tex ? [s.tex] : []), ...(s.why ? inline(s.why) : [])]);

function practiceTex(item: PracticeItem): string[] {
  return [
    item.problemTex,
    ...(item.condition ? inline(item.condition) : []),
    ...(item.solution
      ? [item.solution.answerTex, ...inline(item.solution.method), ...stepTex(item.solution.steps)]
      : []),
  ];
}

/** Every TeX string in a block (display maths and inline $…$ maths). */
export function texOf(block: ContentBlock): string[] {
  switch (block.type) {
    case 'paragraph':
      return inline(block.text);
    case 'math':
      return [block.tex];
    case 'figure':
      return [];
    case 'definition':
      return [...inline(block.text), ...(block.tex ? [block.tex] : [])];
    case 'theorem':
      return [
        ...inline(block.text),
        ...(block.tex ? [block.tex] : []),
        ...inline(block.textAfter ?? ''),
        ...stepTex(block.proof ?? []),
      ];
    case 'formula':
      return [block.tex];
    case 'formulaList':
      return block.items.map((i) => i.tex);
    case 'table':
      return block.rows.flatMap((r) => [...inline(r.left), ...inline(r.right)]);
    case 'callout':
      return [...inline(block.text), ...(block.tex ? [block.tex] : [])];
    case 'derivation':
      return [...inline(block.intro ?? ''), ...stepTex(block.steps), ...(block.resultTex ? [block.resultTex] : [])];
    case 'summary':
      return block.points.flatMap(inline);
    case 'workedExample':
      return [...inline(block.prompt ?? ''), block.problemTex, block.resultTex, ...stepTex(block.steps)];
    case 'practiceGroup':
      return [...inline(block.text ?? ''), ...block.items.flatMap(practiceTex)];
    case 'quickCheck':
      return [
        ...inline(block.text ?? ''),
        ...block.questions.flatMap((q) => [
          ...inline(q.prompt),
          ...(q.tex ? [q.tex] : []),
          ...inline(q.hint),
          ...q.options.flatMap((o) => [...inline(o.text), ...inline(o.feedback)]),
        ]),
      ];
    case 'activities':
    case 'review':
      return [];
    case 'reflect':
      return inline(block.question);
  }
}

const stepText = (steps: WorkedStep[]) => steps.flatMap((s) => [s.explanation, s.why ?? '']);

/** Learner-visible words in a block (labels, titles, prose); maths excluded. */
export function textOf(block: ContentBlock): string[] {
  switch (block.type) {
    case 'paragraph':
      return [block.text];
    case 'math':
      return [];
    case 'figure':
      return [block.figure.description, block.figure.caption ?? '', ...block.figure.panels.map((p) => p.caption ?? '')];
    case 'definition':
      return [block.term, block.text];
    case 'theorem':
      return [block.label, block.title ?? '', block.text, block.textAfter ?? '', ...stepText(block.proof ?? [])];
    case 'formula':
      return [block.title, block.note ?? ''];
    case 'formulaList':
      return [block.title, ...block.items.map((i) => i.note ?? '')];
    case 'table':
      return [block.title, ...block.columns, block.note ?? '', ...block.rows.flatMap((r) => [r.left, r.right])];
    case 'callout':
      return [block.title, block.text];
    case 'derivation':
      return [block.title, block.intro ?? '', ...stepText(block.steps)];
    case 'summary':
      return [block.title, ...block.points];
    case 'workedExample':
      return [block.title, block.prompt ?? '', block.method ?? '', ...stepText(block.steps)];
    case 'practiceGroup':
      return [
        block.title,
        block.text ?? '',
        ...block.items.flatMap((i) => [i.instruction, i.condition ?? '', i.techniqueLabel]),
      ];
    case 'quickCheck':
      return [
        block.title,
        block.text ?? '',
        ...block.questions.flatMap((q) => [q.prompt, q.hint, ...q.options.flatMap((o) => [o.text, o.feedback])]),
      ];
    case 'activities':
      return block.activities.flatMap((a) => [a.title, a.summary]);
    case 'review':
      return [];
    case 'reflect':
      return [block.question, ...block.difficulties];
  }
}

/** Source-inventory ids presented by a block (its own source, extra `covers`, list items and table rows). */
export function inventoryIdsOf(block: ContentBlock): string[] {
  const ids = [block.source?.inventoryId, ...(block.covers ?? [])];
  if (block.type === 'formulaList') ids.push(...block.items.map((i) => i.source?.inventoryId));
  if (block.type === 'table') ids.push(...block.rows.map((r) => r.source?.inventoryId));
  if (block.type === 'practiceGroup') ids.push(...block.items.map((i) => i.source.inventoryId));
  return ids.filter((id): id is string => typeof id === 'string');
}

export const blocksOf = (unit: LearningUnitDefinition): ContentBlock[] => unit.steps.flatMap((s) => s.blocks);
