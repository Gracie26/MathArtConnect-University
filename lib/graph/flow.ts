/**
 * Structure and solution-flow creations (no graph art): the learner arranges
 * the stages of a method into a visual composition, adds notes and styles it.
 */
import { shuffled } from '@/lib/games/engine';

import type { MathQuestion } from './studio';

export interface FlowNode {
  id: string;
  /** Stage name, e.g. "du" or "Decomposition". */
  role: string;
  tex: string;
  /** Short app-written description of the stage. */
  note: string;
}

export interface FlowExample {
  id: string;
  title: string;
  /** Nodes in the correct order. */
  nodes: FlowNode[];
}

export interface FlowConfig {
  kind: 'structure' | 'flow';
  concept: string;
  examples: FlowExample[];
  questions: MathQuestion[];
}

export type FlowLayout = 'vertical' | 'zigzag' | 'horizontal';

export interface FlowProject {
  title: string;
  exampleId: string;
  /** Node ids in the learner's order. */
  placed: string[];
  /** True once the order has been checked as correct. */
  verified: boolean;
  notes: Record<string, string>;
  layout: FlowLayout;
  accent: number;
  dashedLinks: boolean;
  math: { answers: Record<string, string>; explanation: string };
}

export const newFlowProject = (config: FlowConfig, title: string): FlowProject => ({
  title,
  exampleId: config.examples[0]?.id ?? '',
  placed: [],
  verified: false,
  notes: {},
  layout: 'vertical',
  accent: 0,
  dashedLinks: false,
  math: { answers: {}, explanation: '' },
});

/** The cards to arrange, in a fixed shuffled order. */
export const cardsFor = (example: FlowExample) => shuffled(example.nodes, example.id);

/** Checks the learner's order; explains the first stage out of place. */
export function checkFlowOrder(example: FlowExample, placed: readonly string[]): { correct: boolean; message: string } {
  if (placed.length < example.nodes.length) {
    return { correct: false, message: `Place all ${example.nodes.length} stages first.` };
  }
  const index = example.nodes.findIndex((node, i) => placed[i] !== node.id);
  if (index === -1) return { correct: true, message: 'Every stage is in order. Now make it your own.' };
  const expected = example.nodes[index] as FlowNode;
  return {
    correct: false,
    message: `Stage ${index + 1} should be “${expected.role}”: ${expected.note}`,
  };
}
