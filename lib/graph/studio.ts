/**
 * Configuration for a Create activity built on the Equation Art Studio, and
 * the saved composition format. The studio is topic-agnostic: each activity
 * supplies the function families, presets and "Math behind my art" questions
 * for its mathematics.
 */
import { evaluate } from '@/lib/math/input/evaluate';
import { type FunctionName, parseStatement, symbolsOf } from '@/lib/math/input/parse';

import type { Transformation } from './expression';
import type { ArtProject } from './project';
import type { LayerKind } from './sample';

/**
 * "course": built only from mathematics in the course notes (the subtopic's
 * functions, rules or identities). "extension": a creative pattern that uses
 * mathematics beyond Chapter 1 (roses, mandalas, hearts) and is labelled so.
 */
export type PresetCategory = 'course' | 'extension';

export interface StudioPreset {
  id: string;
  title: string;
  description: string;
  category: PresetCategory;
  project: ArtProject;
}

export interface MathQuestion {
  id: string;
  prompt: string;
}

/** Function Curve Composer: integrate a·xⁿ correctly to add its curve. */
export interface ComposerTask {
  id: string;
  /** Exponents the learner can choose (never −1: that is not a power-rule integral). */
  exponents: number[];
}

export interface StudioConfig {
  /** "lite" hides polar layers, repeats, mirroring and presets beyond the starter. */
  mode: 'full' | 'lite';
  layerKinds: LayerKind[];
  functions: FunctionName[];
  /** The mathematical concept the art is built on (shown in Math behind my art). */
  concept: string;
  /** Transformations or identities learners can tick. */
  transformations: string[];
  /** At least one is answered before a project can be marked complete. */
  questions: MathQuestion[];
  presets: StudioPreset[];
  /** Project for "New": the first preset unless stated. */
  starter: () => ArtProject;
  composer?: ComposerTask;
  /** Honest note about where the equations come from. */
  note?: string;
  /** Draw with equal units on both axes (true for picture-like art with circles and petals). */
  equalScale?: boolean;
  /** Prominent "keep a copy at the current values" action, e.g. to stack curves of a family F(x) + C. */
  stamp?: { label: string; hint: string };
  /** Transformation tools: apply a substitution u = g(x) or an outer change to a layer. */
  transform?: { intro: string; operations: Transformation[] };
}

/** Saved art_projects.composition (version 1). */
export interface SavedComposition {
  version: 1;
  /**
   * graph: Equation Art Studio; flow: Flow Composer; area: Topic 2 area studios (lib/art/areaArt);
   * rn: Topic 3 studios (lib/art/rnArt); pa: Topic 4 studios (lib/art/paArt).
   */
  kind: 'graph' | 'flow' | 'area' | 'rn' | 'pa';
  subtopicId: string;
  activityType: string;
  /** The full studio project (graph) or flow (structure / flow). */
  project: unknown;
  /** Summary fields, so saved work can be read without the app. */
  equations: string[];
  parameters: { name: string; value: number; min: number; max: number; step: number }[];
  restrictions: string[];
  canvasState: unknown;
  learnerExplanation: string;
}

/** Reads a number typed in a restriction or slider field: "2", "-1.5", "pi/2", "2pi". Null if blank or invalid. */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  try {
    const statement = parseStatement(trimmed);
    if (statement.k !== 'expr') return null;
    const symbols = [...symbolsOf(statement.node)];
    if (symbols.some((s) => s !== 'π' && s !== 'e')) return null;
    const value = evaluate(statement.node, 0, { variable: '_', constants: {}, definitions: {}, base: 0 }).v;
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}
