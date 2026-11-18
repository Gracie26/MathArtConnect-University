/**
 * Independent numerical verification of every result displayed in the
 * Integration lessons: an anti-derivative F is correct when F'(x) = f(x).
 * F' is computed by a central difference at many sample points, so the check
 * does not trust any answer string. (The expressions below mirror the TeX in
 * content/topics/integration/units/*.)
 */

type Fn = (x: number) => number;

function derivative(F: Fn, x: number): number {
  const h = 1e-5 * Math.max(1, Math.abs(x));
  return (F(x + h) - F(x - h)) / (2 * h);
}

function expectAntiderivative(F: Fn, f: Fn, points: number[]) {
  for (const x of points) {
    const expected = f(x);
    const actual = derivative(F, x);
    expect(Number.isFinite(expected)).toBe(true);
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1e-5 * Math.max(1, Math.abs(expected)));
  }
}

const positive = [0.3, 0.7, 1.2, 2.5, 4.1];
const general = [-2.3, -1.1, -0.4, 0.35, 0.9, 1.7, 3.2];

describe('Understanding Integration', () => {
  test('∫(2x + 5) dx = x² + 5x + C', () => {
    expectAntiderivative(
      (x) => x * x + 5 * x,
      (x) => 2 * x + 5,
      general,
    );
  });
  test('x², x² − 1 and x² + 10 all have derivative 2x', () => {
    for (const c of [0, -1, 10])
      expectAntiderivative(
        (x) => x * x + c,
        (x) => 2 * x,
        general,
      );
  });
});

describe('Basic Integration Rules', () => {
  test('power rule for several rational n (n ≠ −1)', () => {
    for (const n of [6, 2.5, -5, 0.5, -1 / 3, -2]) {
      expectAntiderivative(
        (x) => x ** (n + 1) / (n + 1),
        (x) => x ** n,
        positive,
      );
    }
  });
  test('the n = −1 exception: ∫ 1/x dx = ln|x| + C', () => {
    expectAntiderivative(
      (x) => Math.log(Math.abs(x)),
      (x) => 1 / x,
      general,
    );
  });
  test('∫x⁻⁵dx = −1/(4x⁴) + C and ∫√x dx = (2/3)x^{3/2} + C', () => {
    expectAntiderivative(
      (x) => -1 / (4 * x ** 4),
      (x) => x ** -5,
      positive,
    );
    expectAntiderivative(
      (x) => (2 / 3) * x ** 1.5,
      (x) => Math.sqrt(x),
      positive,
    );
  });
  test('∫(4x − 2x^{−1/3} + 5/x²) dx = 2x² − 3x^{2/3} − 5x⁻¹ + C', () => {
    expectAntiderivative(
      (x) => 2 * x * x - 3 * x ** (2 / 3) - 5 / x,
      (x) => 4 * x - 2 * x ** (-1 / 3) + 5 / (x * x),
      positive,
    );
  });
  test('standard anti-derivatives', () => {
    expectAntiderivative(Math.sin, Math.cos, general);
    expectAntiderivative((x) => -Math.cos(x), Math.sin, general);
    expectAntiderivative(Math.tan, (x) => 1 / Math.cos(x) ** 2, [-1.2, -0.5, 0.2, 1.1]);
    expectAntiderivative(Math.exp, Math.exp, general);
    expectAntiderivative(Math.asin, (x) => 1 / Math.sqrt(1 - x * x), [-0.8, -0.2, 0.3, 0.7]);
    expectAntiderivative(Math.atan, (x) => 1 / (1 + x * x), general);
  });
});

describe('Substitution', () => {
  test('∫ sin 10x dx = −(1/10)cos 10x + C', () => {
    expectAntiderivative(
      (x) => -Math.cos(10 * x) / 10,
      (x) => Math.sin(10 * x),
      general,
    );
  });
  test('∫ x(x² + 2)³ dx = (1/8)(x² + 2)⁴ + C', () => {
    expectAntiderivative(
      (x) => (x * x + 2) ** 4 / 8,
      (x) => x * (x * x + 2) ** 3,
      general,
    );
  });
  test('∫ x/(4x² + 3)⁶ dx = −(1/40)(4x² + 3)⁻⁵ + C', () => {
    expectAntiderivative(
      (x) => -((4 * x * x + 3) ** -5) / 40,
      (x) => x / (4 * x * x + 3) ** 6,
      general,
    );
  });
});

describe('Partial Fractions', () => {
  const points = [-5.2, -1.5, 0.5, 3.6, 6.1];
  test('(x + 7)/(x² − x − 6) = 2/(x − 3) − 1/(x + 2)', () => {
    for (const x of points) expect((x + 7) / (x * x - x - 6)).toBeCloseTo(2 / (x - 3) - 1 / (x + 2), 10);
  });
  test('∫ (x + 7)/(x² − x − 6) dx = 2 ln|x − 3| − ln|x + 2| + C', () => {
    expectAntiderivative(
      (x) => 2 * Math.log(Math.abs(x - 3)) - Math.log(Math.abs(x + 2)),
      (x) => (x + 7) / (x * x - x - 6),
      points,
    );
  });
  test('repeated factor: A = 6, B = −1, C = 9 and the final anti-derivative', () => {
    const f = (x: number) => (5 * x * x + 20 * x + 6) / (x ** 3 + 2 * x * x + x);
    for (const x of [-3.5, -0.5, 0.4, 2.2]) expect(f(x)).toBeCloseTo(6 / x - 1 / (x + 1) + 9 / (x + 1) ** 2, 10);
    expectAntiderivative((x) => Math.log(Math.abs(x ** 6 / (x + 1))) - 9 / (x + 1), f, [-3.5, -0.5, 0.4, 2.2]);
  });
  test('∫ μ/(β² + (x + α)²) dx = (μ/β) tan⁻¹((x + α)/β)', () => {
    const [mu, alpha, beta] = [3, -1.5, 2];
    expectAntiderivative(
      (x) => (mu / beta) * Math.atan((x + alpha) / beta),
      (x) => mu / (beta * beta + (x + alpha) ** 2),
      general,
    );
  });
});

describe('Algebraic and Trigonometric Substitution', () => {
  test('t = √(4x + 1) turns the integrand into t(t² + 4t + 5)/(5t² − 4t − 33)', () => {
    const integrand = (x: number) => (2 * x + 3 + 2 * Math.sqrt(4 * x + 1)) / (5 * x - 7 - Math.sqrt(4 * x + 1));
    for (const t of [0.5, 1.5, 4, 6]) {
      const x = (t * t - 1) / 4;
      const dxdt = t / 2;
      expect(integrand(x) * dxdt).toBeCloseTo((t * (t * t + 4 * t + 5)) / (5 * t * t - 4 * t - 33), 10);
    }
  });
  test('t = tan(x/2) identities', () => {
    for (const x of [-2.5, -1, 0.4, 1.9]) {
      const t = Math.tan(x / 2);
      expect(Math.cos(x)).toBeCloseTo((1 - t * t) / (1 + t * t), 10);
      expect(Math.sin(x)).toBeCloseTo((2 * t) / (1 + t * t), 10);
    }
  });
  test('∫ dx/(5 + 3cos x) = ½ tan⁻¹(½ tan(x/2)) + C', () => {
    expectAntiderivative(
      (x) => 0.5 * Math.atan(0.5 * Math.tan(x / 2)),
      (x) => 1 / (5 + 3 * Math.cos(x)),
      [-2.5, -1, 0.4, 1.9],
    );
  });
});

describe('Integration by Parts', () => {
  test('∫ x eˣ dx = x eˣ − eˣ + C', () => {
    expectAntiderivative(
      (x) => x * Math.exp(x) - Math.exp(x),
      (x) => x * Math.exp(x),
      general,
    );
  });
  test('∫ x² ln x dx = (x³/3) ln x − x³/9 + C', () => {
    expectAntiderivative(
      (x) => (x ** 3 / 3) * Math.log(x) - x ** 3 / 9,
      (x) => x * x * Math.log(x),
      positive,
    );
  });
  test('∫ x² eˣ dx = eˣ(x² − 2x + 2) + C', () => {
    expectAntiderivative(
      (x) => Math.exp(x) * (x * x - 2 * x + 2),
      (x) => x * x * Math.exp(x),
      general,
    );
  });
});

describe('Advanced Integration Patterns', () => {
  test('∫ sin³x dx = −cos x + (1/3)cos³x + C', () => {
    expectAntiderivative(
      (x) => -Math.cos(x) + Math.cos(x) ** 3 / 3,
      (x) => Math.sin(x) ** 3,
      general,
    );
  });
  test('∫ cos⁴x dx = (3/8)x + (1/4)sin 2x + (1/32)sin 4x + C', () => {
    expectAntiderivative(
      (x) => (3 / 8) * x + Math.sin(2 * x) / 4 + Math.sin(4 * x) / 32,
      (x) => Math.cos(x) ** 4,
      general,
    );
  });
  test('the sinⁿ reduction formula holds (checked for n = 2, 3, 4)', () => {
    // Base cases, then apply the formula F_n = −sinⁿ⁻¹x cos x / n + ((n−1)/n) F_{n−2}.
    const F: Record<number, Fn> = { 0: (x) => x, 1: (x) => -Math.cos(x) };
    for (const n of [2, 3, 4]) {
      const previous = F[n - 2]!;
      F[n] = (x) => (-(Math.sin(x) ** (n - 1)) * Math.cos(x)) / n + ((n - 1) / n) * previous(x);
      expectAntiderivative(F[n]!, (x) => Math.sin(x) ** n, general);
    }
  });
  test('product-to-sum identities', () => {
    for (const [p, q] of [
      [8, 6],
      [2, 4],
      [3, 1],
    ] as const) {
      for (const x of general) {
        expect(Math.sin(p * x) * Math.cos(q * x)).toBeCloseTo(
          0.5 * Math.sin((p + q) * x) + 0.5 * Math.sin((p - q) * x),
          10,
        );
        expect(Math.sin(p * x) * Math.sin(q * x)).toBeCloseTo(
          -0.5 * Math.cos((p + q) * x) + 0.5 * Math.cos((p - q) * x),
          10,
        );
        expect(Math.cos(p * x) * Math.cos(q * x)).toBeCloseTo(
          0.5 * Math.cos((p + q) * x) + 0.5 * Math.cos((p - q) * x),
          10,
        );
      }
    }
  });
});
