import type { PracticeItem } from '@/content/types';
import { type AnswerStatus, type CheckProblem, checkFinalAnswer, checkWorking, type Feedback } from '@/lib/math/check';
import {
  checkExtremaAnswer,
  checkExtremaLine,
  checkSurfaceAnswer,
  checkSurfaceLine,
  compileExtrema,
  compileSurface,
  extremaAnswerLabel,
  extremaPlaceholder,
  surfaceAnswerLabel,
  surfacePlaceholder,
} from '@/lib/math/applications';
import { answerPrompt, checkDefiniteAnswer, checkDefiniteWorking, compileDefinite } from '@/lib/math/definite';
import { checkMultipleAnswer, checkMultipleWorking, compileMultiple, multipleAnswerPrompt } from '@/lib/math/multiple';
import { answerLabel, checkPartialAnswer, checkPartialLine, compilePartial } from '@/lib/math/partial';
import { integrandOf } from '@/lib/math/tex/evaluate';

/**
 * The checker's view of a practice question: its integrand (read from the
 * displayed formula), main variable, sample points and constant values.
 * Null if the integrand cannot be evaluated, in which case checking is
 * switched off for that question rather than guessed.
 */
export function checkProblemFor(item: PracticeItem): CheckProblem | null {
  try {
    const { variable, constants, points } = item.check;
    const f = integrandOf(item.check.integrandTex ?? item.problemTex, variable);
    return { integrand: (x) => f({ ...constants, [variable]: x }), variable, points, constants };
  } catch {
    return null;
  }
}

/** An example first line for each Topic 2 method (shown as the placeholder of Step 1). */
const STEP_EXAMPLES: Record<string, string> = {
  'riemann-limit': 'e.g. Δx = 3/n',
  'riemann-expression': 'e.g. x_i = 1 + 3i/n',
  'riemann-approximation': 'e.g. Δx = pi/8',
  'midpoint-rule': 'e.g. Δx = 1/2',
  properties: 'e.g. -6',
  'ftc-evaluate': 'e.g. x^2/2',
  'improper-type1': 'e.g. 1 - 1/t',
  'improper-type2': 'e.g. 2sqrt(3) - 2sqrt(t - 2)',
  'comparison-test': 'e.g. e^(-x^2) <= e^(-x)',
  // Topic 3
  'rn-evaluate': 'e.g. (-2)^3 - 2(-2)(3) + 3(3)^2',
  'rn-domain': 'e.g. x^2 + y^2 > 1',
  'rn-limit-definition': 'e.g. (f(x + h, y) - f(x, y))/h',
  'rn-partial': 'e.g. 6x - y',
  'rn-higher-order': 'e.g. 6',
  'rn-total-differential': 'e.g. 2x',
  'rn-chain-one': 'e.g. 2x(e^t)',
  'rn-chain-two': 'e.g. 2y(2s)',
  'rn-chain-general': 'e.g. ∂w/∂x ∂x/∂t',
  'rn-change-variables': 'e.g. x/(x - y)',
  'rn-second-order': 'e.g. w_xx cos^2 θ',
  // Topic 4
  'pda-gradient': 'e.g. f_x = y/x + y^2',
  'pda-total-differential': 'e.g. 6x y^3',
  'pda-tangent-plane': 'e.g. F_x = -4x',
  'pda-normal-line': 'e.g. F_x = yz',
  'pda-critical-points': 'e.g. 4x + 8 = 0',
  'pda-second-partials': 'e.g. f_xx = -6x',
  // Topic 5
  'mi-partial-integration': 'e.g. 2x y - y^2/2',
  'mi-iterated': 'e.g. 2x + 2',
  'mi-rectangle-order': 'e.g. x sin(x y)',
  'mi-sketch-switch': 'e.g. 0 <= y <= sqrt(x), 0 <= x <= 4',
  'mi-switch-evaluate': 'e.g. 0 <= x <= y, 0 <= y <= 2',
  'mi-double-region': 'e.g. x^2 <= y <= x, 0 <= x <= 1',
  'mi-triple': 'e.g. x y + z',
  'mi-jacobian': 'e.g. ∂x/∂u = 1 - v',
  'mi-polar': 'e.g. 0 <= r <= 1, 0 <= θ <= pi/2',
  'mi-change-variables': 'e.g. u = x + y',
};

/** What My Working says about a question that is answered in writing. */
const writtenMessage = (item: PracticeItem): string =>
  item.solution
    ? 'This question is answered in writing. Compare your working with the suggested working.'
    : 'Self-check: this question is not marked automatically, and its app solution is withheld until the lecturer gives guidance.';

/** Everything My Working needs to check one question, whichever kind it is. */
export interface PracticeChecker {
  checkLines: (lines: string[]) => Feedback[];
  checkAnswer: (answer: string) => { status: AnswerStatus; message: string };
  /** False for questions that ask for a written comment: the answer is compared with the guidance, not graded. */
  gradesAnswer: boolean;
  answerLabel: string;
  answerPlaceholder: string;
  stepPlaceholder: string;
}

/**
 * The checker for a practice item: the definite-integral checker when the
 * item has a definite specification, otherwise the indefinite one. Null when
 * the question cannot be checked automatically.
 */
export function checkerFor(item: PracticeItem): PracticeChecker | null {
  const written = item.grading === 'written';
  if (item.multiple) {
    try {
      const compiled = compileMultiple(item.multiple);
      const prompt = multipleAnswerPrompt(item.multiple);
      return {
        checkLines: (lines) => checkMultipleWorking(lines, compiled),
        checkAnswer: (answer) => checkMultipleAnswer(answer, compiled),
        gradesAnswer: true,
        answerLabel: prompt.label,
        answerPlaceholder: prompt.placeholder,
        stepPlaceholder: STEP_EXAMPLES[item.technique] ?? 'Next step',
      };
    } catch {
      return null;
    }
  }
  if (item.surface) {
    try {
      const compiled = compileSurface(item.surface);
      return {
        checkLines: (lines) => lines.map((line) => checkSurfaceLine(line, compiled)),
        checkAnswer: (answer) =>
          written ? { status: 'cannotCheck', message: writtenMessage(item) } : checkSurfaceAnswer(answer, compiled),
        gradesAnswer: !written,
        answerLabel: surfaceAnswerLabel(item.surface),
        answerPlaceholder: surfacePlaceholder(item.surface),
        stepPlaceholder: STEP_EXAMPLES[item.technique] ?? 'Next step',
      };
    } catch {
      return null;
    }
  }
  if (item.extrema) {
    try {
      const compiled = compileExtrema(item.extrema);
      return {
        checkLines: (lines) => lines.map((line) => checkExtremaLine(line, compiled)),
        checkAnswer: (answer) =>
          written ? { status: 'cannotCheck', message: writtenMessage(item) } : checkExtremaAnswer(answer, compiled),
        gradesAnswer: !written,
        answerLabel: written ? 'Your conclusion' : extremaAnswerLabel(item.extrema),
        answerPlaceholder: written ? 'Write your conclusion' : extremaPlaceholder(item.extrema),
        stepPlaceholder: STEP_EXAMPLES[item.technique] ?? 'Next step',
      };
    } catch {
      return null;
    }
  }
  if (item.partial) {
    try {
      const compiled = compilePartial(item.partial);
      return {
        checkLines: (lines) => lines.map((line) => checkPartialLine(line, compiled)),
        // Written questions are compared with the suggested working, never graded.
        checkAnswer: (answer) =>
          written ? { status: 'cannotCheck', message: writtenMessage(item) } : checkPartialAnswer(answer, compiled),
        gradesAnswer: !written,
        answerLabel: written ? 'Your conclusion' : answerLabel(item.partial),
        answerPlaceholder: written ? 'Write your conclusion' : 'e.g. 2x - 3y',
        stepPlaceholder: STEP_EXAMPLES[item.technique] ?? 'Next step',
      };
    } catch {
      return null;
    }
  }
  if (item.definite) {
    try {
      const problem = compileDefinite(item.definite);
      const prompt = answerPrompt(item.definite.answer);
      return {
        checkLines: (lines) => checkDefiniteWorking(lines, problem),
        checkAnswer: (answer) => checkDefiniteAnswer(answer, problem),
        gradesAnswer: item.definite.answer.kind !== 'explanation',
        answerLabel: prompt.label,
        answerPlaceholder: prompt.placeholder,
        stepPlaceholder: STEP_EXAMPLES[item.technique] ?? 'Next step',
      };
    } catch {
      return null;
    }
  }
  const problem = checkProblemFor(item);
  if (!problem) return null;
  const allowIntegral = item.check.answerMayContainIntegral === true;
  return {
    checkLines: (lines) => checkWorking(lines, problem),
    checkAnswer: (answer) => checkFinalAnswer(answer, problem, { allowIntegral }),
    gradesAnswer: true,
    answerLabel: 'Final answer',
    answerPlaceholder: allowIntegral ? 'the right-hand side of the formula' : 'e.g. (3x+5)^6/18 + C',
    stepPlaceholder: 'e.g. u = 3x + 5',
  };
}
