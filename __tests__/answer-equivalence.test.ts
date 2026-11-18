/**
 * What the answer checkers accept and reject, written as a learner would type it. Each group covers a
 * correct answer, equivalent forms, formatting variations, sign errors, common mistakes, decimals versus
 * exact forms and (for indefinite integrals) the constant of integration.
 *
 * Every checker compares values numerically at sample points (with exact derivatives by dual numbers);
 * none of them is a symbolic algebra system. That is why any equivalent form is accepted, and why an
 * answer that cannot be read or evaluated is reported as "cannot check", never as wrong.
 */
import { CHAPTER2_PRACTICE } from '@/content/topics/area/chapterPractice';
import { checkerFor } from '@/features/practice/checkProblem';
import { checkExtremaAnswer, compileExtrema } from '@/lib/math/applications';
import { type CheckProblem, checkFinalAnswer, checkWorking } from '@/lib/math/check';
import { checkPartialAnswer, compilePartial, type PartialSpec } from '@/lib/math/partial';
import { integrandOf } from '@/lib/math/tex/evaluate';

function indefinite(tex: string, constants: Record<string, number> = {}): CheckProblem {
  const f = integrandOf(String.raw`\int ${tex}\,dx`, 'x');
  return {
    integrand: (x) => f({ ...constants, x }),
    variable: 'x',
    points: [0.35, 0.8, 1.4, 2.2],
    constants,
  };
}

const status = (answer: string, problem: CheckProblem) => checkFinalAnswer(answer, problem).status;

describe('indefinite integrals: final answers', () => {
  const xSquared = indefinite('x^{2}');

  test.each([
    'x^3/3 + C',
    '(1/3)x^3 + C',
    '1/3 x^3 + C',
    'x³/3 + C',
    'x**3/3 + C',
    '  x^3 / 3   +C ',
    '(x^3)/3 + C',
    'y = x^3/3 + C',
    'F(x) = x^3/3 + C',
  ])('accepts the equivalent form or formatting %s', (answer) => {
    expect(status(answer, xSquared)).toBe('correct');
  });

  test('a lower-case c or k is read as the constant of integration', () => {
    expect(status('x^3/3 + c', xSquared)).toBe('correct');
    expect(status('x^3/3 + k', xSquared)).toBe('correct');
  });

  test('a letter that is a constant of the question is not swallowed as + C', () => {
    // ∫ kx dx with k = 2: "k x^2/2" is right but still needs + C; "+ k" here is the question's k.
    const kx = indefinite('kx', { k: 2 });
    expect(status('k x^2/2 + C', kx)).toBe('correct');
    expect(status('k x^2/2 + k', kx)).toBe('missingConstant');
  });

  test('a missing + C is noted, not marked wrong', () => {
    expect(checkFinalAnswer('x^3/3', xSquared)).toMatchObject({
      status: 'missingConstant',
      message: expect.stringMatching(/\+ C/),
    });
  });

  test('sign errors and common mistakes are rejected', () => {
    expect(status('-x^3/3 + C', xSquared)).toBe('incorrect'); // sign
    expect(status('x^3 + C', xSquared)).toBe('incorrect'); // forgot to divide by the new power
    expect(status('2x + C', xSquared)).toBe('incorrect'); // differentiated instead
  });

  test('different correct forms that differ by a constant are all accepted', () => {
    const sinCos = indefinite(String.raw`\sin x\cos x`);
    for (const answer of ['sin^2 x/2 + C', '-cos^2 x/2 + C', '-cos(2x)/4 + C']) {
      expect(status(answer, sinCos)).toBe('correct');
    }
    const chain = indefinite('2x(x^{2}+1)^{3}');
    expect(status('(x^2+1)^4/4 + C', chain)).toBe('correct');
    expect(status('x^8/4 + x^6 + 3x^4/2 + x^2 + C', chain)).toBe('correct'); // expanded
    expect(status('(x^2+1)^4 + C', chain)).toBe('incorrect'); // missing the factor 1/4
  });

  test('logarithm and function-name variations', () => {
    const reciprocal = indefinite(String.raw`\frac{1}{x}`);
    for (const answer of ['ln|x| + C', 'ln x + C', 'ln(x) + C', 'log(x) + C']) {
      expect(status(answer, reciprocal)).toBe('correct');
    }
    const cos = indefinite(String.raw`\cos x`);
    for (const answer of ['sin x + C', 'sin(x) + C', 'sinx + C', 'Sin x + C', 'SIN(x) + C']) {
      expect(status(answer, cos)).toBe('correct');
    }
    expect(status('-sin x + C', cos)).toBe('incorrect');
  });

  test('an answer that cannot be evaluated is "cannot check", never "incorrect"', () => {
    expect(status('x^0/0 + C', indefinite(String.raw`\frac{1}{x}`))).toBe('cannotCheck');
    expect(status('x^3/3 + C)', xSquared)).toBe('cannotCheck');
  });
});

describe('My Working: step-by-step checks', () => {
  const chain = indefinite('2x(x^{2}+1)^{3}');

  test('a full substitution is accepted line by line, including + c', () => {
    const lines = ['u = x^2 + 1', 'du = 2x dx', '∫ u^3 du', 'u^4/4 + c', '(x^2+1)^4/4 + c'];
    expect(checkWorking(lines, chain).map((f) => f.status)).toEqual([
      'info',
      'correct',
      'correct',
      'correct',
      'correct',
    ]);
  });

  test('a wrong differential and a wrong integration step are caught', () => {
    const feedback = checkWorking(['u = x^2 + 1', 'du = x dx', 'u^4 + C'], chain);
    expect(feedback.map((f) => f.status)).toEqual(['info', 'incorrect', 'incorrect']);
    expect(feedback[1]?.message).toMatch(/differential/);
  });

  test('a different valid route (expanding first) is accepted', () => {
    const feedback = checkWorking(['2x^7 + 6x^5 + 6x^3 + 2x', 'x^8/4 + x^6 + 3x^4/2 + x^2 + C'], chain);
    expect(feedback.map((f) => f.status)).toEqual(['correct', 'correct']);
  });

  test('a letter c defined as a substitution is not read as + C', () => {
    const feedback = checkWorking(['c = x^2 + 1', '∫ c^3 dc'], chain);
    expect(feedback[0]?.status).toBe('info');
  });
});

describe('definite integrals: fractions, decimals and exact forms', () => {
  const item = CHAPTER2_PRACTICE.find((i) => i.id === 'ch2-ex-2.2.1-yti')!;
  const checker = checkerFor(item)!;

  test.each(['1/2', '0.5', '0.50', ' 1 / 2 ', '2/4'])('accepts %s for 1/2', (answer) => {
    expect(checker.checkAnswer(answer).status).toBe('correct');
  });

  test('wrong and nearly-right values are rejected', () => {
    expect(checker.checkAnswer('1').status).toBe('incorrect');
    expect(checker.checkAnswer('-1/2').status).toBe('incorrect');
    expect(checker.checkAnswer('0.48').status).toBe('incorrect');
  });
});

describe('partial derivatives (Topics 3 and 4)', () => {
  const samples = [
    { x: 0.7, y: 1.3 },
    { x: 1.9, y: -0.6 },
    { x: -1.1, y: 2.4 },
  ];
  const fx: PartialSpec = {
    variables: ['x', 'y'],
    samples,
    targets: [{ kind: 'derivative', label: 'f_x', f: 'x^3y^2 - 4xy', wrt: ['x'] }],
  };
  const atPoint: PartialSpec = {
    variables: ['x', 'y'],
    samples,
    targets: [{ kind: 'value', label: 'f_x(1, 2)', f: 'x e^(xy)', wrt: ['x'], at: { x: 1, y: 2 } }],
  };

  test.each(['3x^2y^2 - 4y', 'f_x = 3x^2y^2 - 4y', '-4y + 3x^2y^2', 'y(3x^2y - 4)', '3x^2 y^2-4y'])(
    'accepts the equivalent form %s',
    (answer) => {
      expect(checkPartialAnswer(answer, compilePartial(fx)).status).toBe('correct');
    },
  );

  test('sign errors and wrong-variable derivatives are rejected', () => {
    expect(checkPartialAnswer('3x^2y^2 + 4y', compilePartial(fx)).status).toBe('incorrect');
    expect(checkPartialAnswer('2x^3y - 4x', compilePartial(fx)).status).toBe('incorrect'); // that is f_y
  });

  test('a value at a point: exact forms, and decimals to four decimal places', () => {
    const c = compilePartial(atPoint);
    expect(checkPartialAnswer('3e^2', c).status).toBe('correct');
    expect(checkPartialAnswer('e^2 + 2e^2', c).status).toBe('correct');
    expect(checkPartialAnswer('22.1672', c)).toMatchObject({
      status: 'correct',
      message: expect.stringMatching(/decimal/),
    });
    expect(checkPartialAnswer('7.389', c).status).toBe('incorrect'); // e², a missing term
    expect(checkPartialAnswer('22', c).status).toBe('incorrect');
  });
});

describe('critical points (Topic 4)', () => {
  // Example 4.3.3: saddle at (0, 0), relative maximum at (4/3, 4/3).
  const c = compileExtrema({
    f: '-x^3 + 4x y - 2y^2 + 1',
    classify: true,
    points: [
      { x: '0', y: '0', type: 'saddle' },
      { x: '4/3', y: '4/3', type: 'max' },
    ],
  });

  test('exact and rounded coordinates, in any order', () => {
    expect(checkExtremaAnswer('(0, 0) saddle; (4/3, 4/3) max', c).status).toBe('correct');
    expect(checkExtremaAnswer('(4/3, 4/3) maximum, (0,0) saddle point', c).status).toBe('correct');
    expect(checkExtremaAnswer('(0, 0) saddle; (1.3333, 1.3333) max', c)).toMatchObject({
      status: 'correct',
      message: expect.stringMatching(/Exact forms are better/),
    });
  });

  test('too-rounded values, wrong types and missing points are rejected', () => {
    expect(checkExtremaAnswer('(0, 0) saddle; (1.3, 1.3) max', c).status).toBe('incorrect');
    expect(checkExtremaAnswer('(0, 0) min; (4/3, 4/3) max', c).status).toBe('incorrect');
    expect(checkExtremaAnswer('(4/3, 4/3) max', c).status).toBe('incorrect');
  });
});
