/**
 * Topic 5 checker (lib/math/multiple.ts): nested quadrature, stages of an
 * iterated integral, anti-derivatives, reversed limits compared as regions,
 * change of variables and Jacobians, using the Chapter 5 worked examples.
 * Equivalent correct forms must be accepted and wrong ones rejected.
 */
import {
  checkMultipleAnswer,
  checkMultipleLine,
  compileForm,
  compileMultiple,
  formTex,
  formValue,
  gaussLegendre,
  integrate1,
  limitsTex,
  type MultipleSpec,
  parseLimits,
} from '@/lib/math/multiple';
import { parseTex } from '@/lib/math/tex';

const ok = (spec: MultipleSpec, line: string) => checkMultipleLine(line, compileMultiple(spec)).status;
const answer = (spec: MultipleSpec, text: string) => checkMultipleAnswer(text, compileMultiple(spec)).status;

// Example 5.1.3: ∫₀²∫_{y²}⁴ dx dy = ∫₀⁴∫₀^{√x} dy dx = 16/3.
const EX_513: MultipleSpec = {
  forms: [
    {
      f: '1',
      vars: ['x', 'y'],
      limits: [
        ['y^2', '4'],
        ['0', '2'],
      ],
      label: 'the order dx dy',
    },
    {
      f: '1',
      vars: ['y', 'x'],
      limits: [
        ['0', 'sqrt(x)'],
        ['0', '4'],
      ],
      label: 'the order dy dx',
    },
  ],
  exact: '16/3',
  answer: { kind: 'limits', form: 1 },
};

// Example 5.1.1 with x free: ∫₁ˣ (2x²y⁻² + 2y) dy = 3x² − 2x − 1.
const EX_511: MultipleSpec = {
  forms: [{ f: '2x^2 y^(-2) + 2y', vars: ['y'], limits: [['1', 'x']] }],
  free: { x: [1.4, 2.3, 3.1] },
  exact: '3x^2 - 2x - 1',
  answer: { kind: 'value' },
};

describe('quadrature', () => {
  test('Gauss–Legendre weights sum to 2 and integrate polynomials exactly', () => {
    const { w } = gaussLegendre(40);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(2, 12);
    expect(integrate1((t) => t ** 7 - 3 * t ** 2, -1, 2, 10)).toBeCloseTo(255 / 8 - 9, 10);
  });

  test('infinite upper limits and reversed limits', () => {
    expect(integrate1((t) => Math.exp(-t * t), 0, Infinity, 80)).toBeCloseTo(Math.sqrt(Math.PI) / 2, 8);
    expect(integrate1((t) => t, 2, 0, 10)).toBeCloseTo(-2, 12);
  });

  test('the Chapter 5 examples by quadrature', () => {
    const v = (f: string, vars: string[], limits: [string, string][]) => formValue(compileForm({ f, vars, limits }));
    expect(
      v(
        '2x^2 y^(-2) + 2y',
        ['y', 'x'],
        [
          ['1', 'x'],
          ['1', '2'],
        ],
      ),
    ).toBeCloseTo(3, 10); // 5.1.2
    expect(
      v(
        'e^(y^2)',
        ['y', 'x'],
        [
          ['x/2', '2'],
          ['0', '4'],
        ],
      ),
    ).toBeCloseTo(Math.exp(4) - 1, 8); // 5.1.4
    expect(
      v(
        'y e^(x^3)',
        ['x', 'y'],
        [
          ['y/2', '1'],
          ['0', '2'],
        ],
      ),
    ).toBeCloseTo((2 / 3) * (Math.E - 1), 8); // 5.1.5
    expect(
      v(
        'e^(-x^2)',
        ['y', 'x'],
        [
          ['0', 'x'],
          ['0', '1'],
        ],
      ),
    ).toBeCloseTo((Math.E - 1) / (2 * Math.E), 10); // 5.2.1
    expect(
      v(
        'xy + yz',
        ['z', 'y', 'x'],
        [
          ['0', '1'],
          ['2', '3'],
          ['-1', '1'],
        ],
      ),
    ).toBeCloseTo(5 / 2, 10); // 5.3.2
    // Example 5.3.1: the printed working gives (19/6)(2e² + 6) = 19(e²/3 + 1) (MR5-08).
    const ex531 = v(
      'e^x (y + 2z)',
      ['z', 'y', 'x'],
      [
        ['0', 'x + y'],
        ['0', 'x'],
        ['0', '2'],
      ],
    );
    expect(ex531).toBeCloseTo(19 * (Math.exp(2) / 3 + 1), 6);
    expect(Math.abs(ex531 - (19 / 6) * (Math.exp(2) / 3 + 1))).toBeGreaterThan(50);
  });
});

describe('lines of working', () => {
  test('stages, anti-derivatives and the value are recognised (Example 5.1.3)', () => {
    expect(ok(EX_513, '4 - y^2')).toBe('correct'); // after integrating x
    expect(ok(EX_513, 'sqrt(x)')).toBe('correct'); // after integrating y (other order)
    expect(ok(EX_513, '4y - y^3/3')).toBe('correct'); // anti-derivative in y
    expect(ok(EX_513, '(2/3)x^(3/2)')).toBe('correct');
    expect(ok(EX_513, '16/3')).toBe('correct');
    expect(ok(EX_513, '4 - y')).toBe('incorrect');
    expect(ok(EX_513, '5')).toBe('incorrect');
  });

  test('a function of the outer variable (Example 5.1.1), and its anti-derivative in y', () => {
    expect(ok(EX_511, '-2x^2/y + y^2')).toBe('correct');
    expect(ok(EX_511, '(-2x^2/x + x^2) - (-2x^2 + 1)')).toBe('correct');
    expect(ok(EX_511, '3x^2 - 2x - 1')).toBe('correct');
    expect(answer(EX_511, '3x^2 - 2x - 1')).toBe('correct');
    expect(answer(EX_511, 'x^2 - 2x - 1')).toBe('incorrect');
    expect(answer(EX_511, '-2x^2/y + y^2')).toBe('incorrect');
  });

  test('chains of equal expressions and a name on the left', () => {
    expect(ok(EX_513, '4 - y^2 = -y^2 + 4')).toBe('correct');
    expect(ok(EX_513, 'A = 16/3')).toBe('correct');
    expect(checkMultipleLine('∫ 4 - y^2 dy', compileMultiple(EX_513)).status).toBe('cannotCheck');
    expect(checkMultipleLine('4 - w^2', compileMultiple(EX_513)).status).toBe('cannotCheck');
  });
});

describe('limits as regions', () => {
  test('the reversed order of Example 5.1.3 in any equivalent form', () => {
    expect(answer(EX_513, '0 <= y <= sqrt(x), 0 <= x <= 4')).toBe('correct');
    expect(answer(EX_513, '0 ≤ y ≤ x^(1/2); 0 ≤ x ≤ 4')).toBe('correct');
    expect(answer(EX_513, '0 <= x <= 4 and 0 <= y <= sqrt(x)')).toBe('correct');
    expect(answer(EX_513, '4 >= x >= 0, sqrt(x) >= y >= 0')).toBe('correct');
  });

  test('the original order, a different region and an invalid description are rejected', () => {
    expect(answer(EX_513, 'y^2 <= x <= 4, 0 <= y <= 2')).toBe('incorrect');
    expect(answer(EX_513, '0 <= y <= x^2, 0 <= x <= 4')).toBe('incorrect');
    expect(answer(EX_513, '0 <= y <= sqrt(x), 0 <= x <= y')).toBe('incorrect');
    expect(checkMultipleLine('y^2 <= x <= 4, 0 <= y <= 2', compileMultiple(EX_513)).status).toBe('correct');
  });

  test('named limits (Tutorial 6 Q10)', () => {
    const q10: MultipleSpec = {
      forms: [
        {
          f: '1',
          vars: ['y', 'x'],
          limits: [
            ['x^2/6', 'x/2'],
            ['0', '3'],
          ],
        },
        {
          f: '1',
          vars: ['x', 'y'],
          limits: [
            ['2y', 'sqrt(6y)'],
            ['0', '3/2'],
          ],
        },
      ],
      answer: { kind: 'limits', form: 1, named: ['a', 'b', 'g', 'h'] },
    };
    expect(answer(q10, 'a = 0, b = 3/2, g(y) = 2y, h(y) = sqrt(6y)')).toBe('correct');
    expect(answer(q10, 'a = 0, b = 3/2, g(y) = 2y, h(y) = sqrt(6)y')).toBe('incorrect');
    expect(answer(q10, '2y <= x <= sqrt(6y), 0 <= y <= 3/2')).toBe('correct');
  });

  test('parseLimits and limitsTex', () => {
    expect(parseLimits('0 <= y <= sqrt(x), 0 <= x <= 4')).toEqual([
      { v: 'y', lo: '0', hi: 'sqrt(x)' },
      { v: 'x', lo: '0', hi: '4' },
    ]);
    expect(() => parseTex(limitsTex('0 <= y <= sqrt(x), 0 <= x <= 4'))).not.toThrow();
    expect(() => parseTex(formTex(EX_513.forms[1]!))).not.toThrow();
  });
});

describe('change of variables', () => {
  // Example 5.4.2: u = x + y, v = x − 2y; ∬ 3xy dA = 164/9.
  const EX_542: MultipleSpec = {
    forms: [
      {
        f: '(1/9)(2u^2 - u v - v^2)',
        vars: ['v', 'u'],
        limits: [
          ['-4', '0'],
          ['1', '4'],
        ],
        label: 'the u, v form',
      },
    ],
    exact: '164/9',
    transform: { vars: ['u', 'v'], x: '(2u + v)/3', y: '(u - v)/3', f: '3x y', inverse: { u: 'x + y', v: 'x - 2y' } },
    answer: { kind: 'value' },
  };

  test('Jacobian, its absolute value, partial derivatives and the transformed integrand', () => {
    expect(ok(EX_542, '-1/3')).toBe('correct');
    expect(ok(EX_542, '1/3')).toBe('correct');
    expect(ok(EX_542, '2/3')).toBe('correct'); // ∂x/∂u
    expect(ok(EX_542, '3((2u + v)/3)((u - v)/3)')).toBe('correct');
    expect(ok(EX_542, '-3')).toBe('correct'); // ∂(u, v)/∂(x, y)
    expect(ok(EX_542, '(1/9)(8u^2 + 8u - 64/3)')).toBe('correct');
    expect(ok(EX_542, '164/9')).toBe('correct');
    expect(answer(EX_542, '164/9')).toBe('correct');
    expect(answer(EX_542, '18.2222')).toBe('correct');
    expect(answer(EX_542, '-164/9')).toBe('incorrect');
  });

  test('Jacobian answers: the sign matters (Tutorial 6 Q20 style)', () => {
    const q: MultipleSpec = {
      forms: [],
      transform: { vars: ['u', 'v'], x: 'u - u v', y: 'u v' },
      answer: { kind: 'jacobian' },
    };
    expect(answer(q, 'u')).toBe('correct');
    expect(answer(q, 'J = u')).toBe('correct');
    expect(answer(q, '-u')).toBe('incorrect');
    const negative: MultipleSpec = {
      forms: [],
      transform: { vars: ['u', 'v'], x: 'e^u sin(v)', y: 'e^u cos(v)' },
      answer: { kind: 'jacobian' },
    };
    expect(answer(negative, '-e^(2u)')).toBe('correct');
    expect(checkMultipleAnswer('e^(2u)', compileMultiple(negative)).message).toMatch(/can be negative|sign/);
  });

  test('polar coordinates with an infinite limit (Tutorial 6 Q25 style)', () => {
    const q: MultipleSpec = {
      forms: [
        {
          f: 'e^(-(x^2 + y^2))',
          vars: ['x', 'y'],
          limits: [
            ['0', 'inf'],
            ['0', 'inf'],
          ],
        },
        {
          f: 'e^(-r^2) r',
          vars: ['r', 'θ'],
          limits: [
            ['0', 'inf'],
            ['0', 'pi/2'],
          ],
          label: 'the polar form',
        },
      ],
      exact: 'pi/4',
      transform: { vars: ['r', 'θ'], x: 'r cos(θ)', y: 'r sin(θ)', f: 'e^(-(x^2 + y^2))' },
      answer: { kind: 'values', values: ['pi/4', 'sqrt(pi)/2'], labels: ['the double integral', '∫₀^∞ e^(−x²) dx'] },
      nodes: 80,
    };
    const c = compileMultiple(q);
    expect(c.values[0]).toBeCloseTo(Math.PI / 4, 12);
    expect(formValue(c.forms[0]!)).toBeCloseTo(Math.PI / 4, 6);
    expect(formValue(c.forms[1]!)).toBeCloseTo(Math.PI / 4, 6);
    expect(ok(q, '1/2')).toBe('correct'); // ∫₀^∞ r e^{-r²} dr
    expect(ok(q, 'r')).toBe('correct'); // the Jacobian
    expect(answer(q, 'pi/4, sqrt(pi)/2')).toBe('correct');
    expect(answer(q, 'pi/4, sqrt(pi)')).toBe('incorrect');
  });

  test('constants in a printed form are graded by value (Tutorial 6 Q12: several pairs are valid)', () => {
    const q: MultipleSpec = {
      forms: [
        {
          f: 'x/(1 + x^3)',
          vars: ['x', 'y'],
          limits: [
            ['2y', '2'],
            ['0', '1'],
          ],
        },
      ],
      exact: 'ln(3)/3',
      answer: { kind: 'constants', names: ['a', 'b'], form: '(a/b) ln(b)' },
    };
    expect(answer(q, 'a = 1, b = 3')).toBe('correct');
    expect(answer(q, 'a = 3, b = 27')).toBe('correct');
    expect(answer(q, 'a = 1, b = 9')).toBe('incorrect');
    expect(answer(q, 'a = 1')).toBe('cannotCheck');
  });
});
