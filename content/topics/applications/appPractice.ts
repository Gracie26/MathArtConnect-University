/**
 * APP PRACTICE for §4.3.1 critical points (approved plan: Subtopic 3 has no
 * Tutorial 5 part of its own, because Q5 always asks to find AND classify).
 *
 * Four questions written for the app, following the Definition of Critical
 * Point and Examples 4.3.1 and 4.3.2. They ask only for the critical points.
 * The one with a point where the partial derivatives do not exist uses a
 * function where BOTH fail to exist together, so the answer does not depend
 * on the "and"/"or" wording of the definition (MR4-06). Always labelled APP
 * PRACTICE; never presented as tutorial questions.
 */
import type { PracticeItem } from '../../types';

import { PDA_UNITS } from './ids';
import { type ExtremaItemSpec, pdaItem } from './practice';
import { CH4 } from './sources';

const base = (n: number) => ({
  id: `ap4-${n}`,
  sourceType: 'app-practice' as const,
  // The section of the notes these items practise (they are not printed there).
  source: { document: CH4, section: '4.3.1', item: `APP PRACTICE AP4-${n}`, page: 59 },
  sourceSection: '4-3-1',
  unitId: PDA_UNITS.criticalPoints,
});

const find = (
  spec: Omit<ExtremaItemSpec, 'kind' | 'instruction' | 'technique' | 'method' | 'classify'>,
): ExtremaItemSpec => ({
  kind: 'extrema',
  instruction: 'Find all the critical points of f.',
  technique: 'pda-critical-points',
  method:
    'Find f_x and f_y. Solve f_x = 0 and f_y = 0 together, and check for points where the partial derivatives do not exist. Give each point in brackets, separated by semicolons.',
  classify: false,
  ...spec,
});

export const APP_PRACTICE_ITEMS: PracticeItem[] = [
  pdaItem(
    base(1),
    find({
      problem: 'f(x, y) = x^{2} + 4y^{2} - 6x + 8y + 1',
      difficulty: 1,
      f: 'x^2 + 4y^2 - 6x + 8y + 1',
      fx: '2x - 6',
      fy: '8y + 8',
      solve:
        'Both partial derivatives are defined everywhere. $f_{x} = 0$ gives $x = 3$ and $f_{y} = 0$ gives $y = -1$.',
      points: [{ x: '3', y: '-1' }],
    }),
  ),
  pdaItem(
    base(2),
    find({
      problem: 'f(x, y) = x^{3} - 12x + y^{2} - 4y',
      difficulty: 1,
      f: 'x^3 - 12x + y^2 - 4y',
      fx: '3x^2 - 12',
      fy: '2y - 4',
      solve: '$f_{x} = 0$ gives $x^{2} = 4$, so $x = \\pm 2$; $f_{y} = 0$ gives $y = 2$.',
      points: [
        { x: '2', y: '2' },
        { x: '-2', y: '2' },
      ],
    }),
  ),
  pdaItem(
    base(3),
    find({
      problem: 'f(x, y) = 4 - \\sqrt{x^{2} + y^{2}}',
      difficulty: 2,
      f: '4 - sqrt(x^2 + y^2)',
      fx: '-x/sqrt(x^2 + y^2)',
      fy: '-y/sqrt(x^2 + y^2)',
      solve:
        'Both partial derivatives are defined except at $(0, 0)$, where neither exists, and elsewhere they are never both 0 (that would need $x = y = 0$). So the only critical point is $(0, 0)$, the type of Example 4.3.2.',
      points: [{ x: '0', y: '0' }],
    }),
  ),
  pdaItem(
    base(4),
    find({
      problem: 'f(x, y) = xe^{y} - e^{x}',
      difficulty: 2,
      f: 'x e^y - e^x',
      fx: 'e^y - e^x',
      fy: 'x e^y',
      solve: 'Since $e^{y} > 0$, $f_{y} = 0$ gives $x = 0$; then $f_{x} = e^{y} - 1 = 0$ gives $y = 0$.',
      points: [{ x: '0', y: '0' }],
    }),
  ),
];
