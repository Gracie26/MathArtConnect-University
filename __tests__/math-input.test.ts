import { checkFinalAnswer, checkWorking, type CheckProblem } from '@/lib/math/check';
import { evaluate } from '@/lib/math/input/evaluate';
import { ParseError, parseStatement } from '@/lib/math/input/parse';
import { statementToTex } from '@/lib/math/input/toTex';
import { parseTex } from '@/lib/math/tex';
import { integrandOf } from '@/lib/math/tex/evaluate';
import { numericValidator } from '@/lib/math/validation';

const preview = (input: string) => statementToTex(parseStatement(input));

const problem = (tex: string, extra: Partial<CheckProblem> = {}): CheckProblem => {
  const variable = extra.variable ?? 'x';
  const constants = extra.constants ?? {};
  const f = integrandOf(tex, variable);
  return {
    integrand: (x) => f({ ...constants, [variable]: x }),
    variable,
    points: [0.35, 0.8, 1.4, 2.2],
    constants,
    ...extra,
  };
};

describe('learner input parser', () => {
  test.each([
    ['(3x+5)^6/18 + C', '\\frac{\\left(3x + 5\\right)^{6}}{18} + C'],
    ['sin 2x', '\\sin\\left(2x\\right)'],
    ['sin^2 x cos x', '\\sin^{2}\\left(x\\right)\\cos\\left(x\\right)'],
    ['tan^-1(x)', '\\tan^{-1}\\left(x\\right)'],
    ['ln|x+1|', '\\ln\\left(\\left|x + 1\\right|\\right)'],
    ['√x + x^(1/3)', '\\sqrt{x} + x^{\\frac{1}{3}}'],
    ['∫ u^5 du', '\\int u^{5}\\,du'],
    ['int (x+1) dx', '\\int \\left(x + 1\\right)\\,dx'],
    ['∫ x + 1 dx', '\\int \\left(x + 1\\right)\\,dx'],
    ['∫ dx/(x^2+1)', '\\int \\frac{1}{x^{2} + 1}\\,dx'],
    ['u = 3x+5', 'u = 3x + 5'],
    ['du = 3 dx', 'du = 3dx'],
    ['x² + 2theta', 'x^{2} + 2\\theta'],
    ['e^(3x)', 'e^{3x}'],
    ['sin(x)^2', '\\left(\\sin\\left(x\\right)\\right)^{2}'],
  ])('reads %s', (input, tex) => {
    expect(preview(input)).toBe(tex);
    expect(() => parseTex(tex)).not.toThrow();
  });

  test.each([
    ['', 'Type a step first.'],
    ['(x+1', 'A "(" is not closed.'],
    ['∫ x', 'Add the differential at the end of the integral, for example dx.'],
    ['x $ 2', 'I don\'t recognise the symbol "$".'],
    ['sin', 'A function needs something to act on, for example sin(x).'],
  ])('explains what is wrong with %j', (input, message) => {
    expect(() => parseStatement(input)).toThrow(new ParseError(message));
  });

  test('never runs input as code: words are read as letters multiplied together', () => {
    expect(preview('alert(1)')).toBe('alert \\cdot 1');
    expect(() => parseStatement('x; y')).toThrow(ParseError);
  });

  test('derivatives are exact (dual numbers)', () => {
    const tree = parseStatement('x^3 sin x');
    if (tree.k !== 'expr') throw new Error('expected an expression');
    const at = evaluate(tree.node, 1.2, { variable: 'x', constants: {}, definitions: {}, base: 0 });
    expect(at.d).toBeCloseTo(3 * 1.2 ** 2 * Math.sin(1.2) + 1.2 ** 3 * Math.cos(1.2), 12);
  });
});

describe('final answers', () => {
  const p = problem('\\int (3x+5)^{5}\\,dx');

  test('accepts any correct form, and asks for + C when missing', () => {
    expect(checkFinalAnswer('(3x+5)^6/18 + C', p).status).toBe('correct');
    expect(checkFinalAnswer('1/18 (3x+5)^6 + 7 + C', p).status).toBe('correct');
    expect(checkFinalAnswer('(3x+5)^6/18', p).status).toBe('missingConstant');
  });

  test('rejects wrong answers with teaching feedback', () => {
    const wrong = checkFinalAnswer('(3x+5)^6/6 + C', p);
    expect(wrong.status).toBe('incorrect');
    expect(wrong.message).toMatch(/does not give the integrand/);
    expect(checkFinalAnswer('∫ (3x+5)^5 dx', p).status).toBe('incorrect');
    expect(checkFinalAnswer('u^6/18 + C', p).message).toMatch(/in terms of x/);
  });

  test('never marks an unreadable answer wrong', () => {
    expect(checkFinalAnswer('(3x+5', p).status).toBe('cannotCheck');
  });

  test('works with the question’s own constants and variable', () => {
    const general = problem('\\int \\frac{1}{ax+b}\\,dx', { constants: { a: 2, b: 3 } });
    expect(checkFinalAnswer('1/a ln|ax+b| + C', general).status).toBe('correct');
    const theta = problem('\\int \\frac{\\cos\\theta}{\\sin^{2}\\theta}\\,d\\theta', { variable: 'θ' });
    expect(checkFinalAnswer('-1/sin(theta) + C', theta).status).toBe('correct');
  });
});

describe('step checking', () => {
  test('substitution working, line by line', () => {
    const p = problem('\\int x(x^{2}+2)^{3}\\,dx');
    const feedback = checkWorking(
      ['u = x^2 + 2', 'du = 2x dx', '∫ x(x^2+2)^3 dx = 1/2 ∫ u^3 du', '1/2 · u^4/4 + C', '(x^2+2)^4/8 + C'],
      p,
    );
    expect(feedback.map((f) => f.status)).toEqual(['info', 'correct', 'correct', 'correct', 'correct']);
    expect(feedback[3]?.message).toMatch(/in terms of x/);
    expect(feedback[4]?.message).toMatch(/anti-derivative/);
  });

  test('a wrong differential and a wrong step are caught', () => {
    const p = problem('\\int x(x^{2}+2)^{3}\\,dx');
    const feedback = checkWorking(['u = x^2 + 2', 'du = x dx', '∫ u^3 du'], p);
    expect(feedback.map((f) => f.status)).toEqual(['info', 'incorrect', 'incorrect']);
  });

  test('partial fractions: a rewrite of the integrand, then the integral', () => {
    const p = problem('\\int \\frac{x+7}{x^{2}-x-6}\\,dx');
    const feedback = checkWorking(['2/(x-3) - 1/(x+2)', '2 ln|x-3| - ln|x+2| + C', '3/(x-3)'], p);
    expect(feedback.map((f) => f.status)).toEqual(['correct', 'correct', 'incorrect']);
    expect(feedback[0]?.message).toMatch(/rewrites the integrand/);
  });

  test('integration by parts with an integral still in the step', () => {
    const p = problem('\\int xe^{x}\\,dx');
    const feedback = checkWorking(['x e^x - ∫ e^x dx', 'x e^x + ∫ e^x dx'], p);
    expect(feedback.map((f) => f.status)).toEqual(['correct', 'incorrect']);
  });

  test('half-angle substitution t = tan(x/2)', () => {
    const p = problem('\\int \\frac{dx}{5 + 3\\cos x}');
    const feedback = checkWorking(['t = tan(x/2)', 'dx = 2/(1+t^2) dt', '∫ 1/(t^2+4) dt', '1/2 tan^-1(t/2) + C'], p);
    expect(feedback.map((f) => f.status)).toEqual(['info', 'correct', 'correct', 'correct']);
  });

  test('an inverse substitution is noted honestly, not guessed', () => {
    const p = problem('\\int \\frac{dx}{\\sqrt{4-3x^{2}}}');
    const feedback = checkWorking(['x = 2/sqrt(3) sin θ', '∫ 1/sqrt(3) dθ'], p);
    expect(feedback.map((f) => f.status)).toEqual(['info', 'cannotCheck']);
  });

  test('an undefined symbol is explained, not marked wrong', () => {
    const p = problem('\\int x^{2}\\,dx');
    const [feedback] = checkWorking(['k x^3'], p);
    expect(feedback?.status).toBe('cannotCheck');
    expect(feedback?.message).toMatch(/don't know what k stands for/);
  });
});

describe('numeric validator', () => {
  test('checks anti-derivatives and equivalence', async () => {
    await expect(numericValidator.checkAntiderivative({ integrand: '2x', proposed: 'x^2 + 4' })).resolves.toMatchObject(
      {
        status: 'correct',
      },
    );
    await expect(numericValidator.checkAntiderivative({ integrand: '2x', proposed: 'x^3' })).resolves.toMatchObject({
      status: 'incorrect',
    });
    await expect(
      numericValidator.checkEquivalent({ expected: '(x+1)^2', proposed: 'x^2+2x+1' }),
    ).resolves.toMatchObject({
      status: 'correct',
    });
    await expect(numericValidator.checkAntiderivative({ integrand: '2x', proposed: '((' })).resolves.toMatchObject({
      status: 'cannotVerify',
    });
  });
});
