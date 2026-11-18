import { integrationTopic } from '@/content/topics/integration';
import { parseTex, speakTex, splitInlineMath, TexParseError } from '@/lib/math/tex';
import { deferredValidator } from '@/lib/math/validation';
import { texOf } from '@/test-utils/contentWalk';

describe('TeX subset parser', () => {
  test('builds fractions, powers, roots and integrals', () => {
    const tree = parseTex('\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C');
    expect(tree.kind).toBe('row');
    const kinds = tree.kind === 'row' ? tree.children.map((c) => c.kind) : [];
    expect(kinds).toEqual(['integral', 'sup', 'space', 'ident', 'ident', 'op', 'frac', 'op', 'ident']);
    expect(parseTex('\\sqrt[3]{x}')).toEqual({
      kind: 'row',
      children: [
        {
          kind: 'sqrt',
          index: { kind: 'row', children: [{ kind: 'number', text: '3' }] },
          body: { kind: 'row', children: [{ kind: 'ident', text: 'x' }] },
        },
      ],
    });
  });

  test('\\left. is the invisible delimiter, so evaluation bars such as \\left.f\\right|_{(a,b)} display', () => {
    const bar = parseTex('\\left.\\frac{dz}{dx}\\right|_{(a,b)}');
    expect(bar.kind === 'row' && bar.children[0]).toEqual({ kind: 'op', text: '' });
    expect(bar.kind === 'row' && bar.children.at(-1)?.kind).toBe('sub');
    // A number straight after "\left." keeps its digits.
    expect(parseTex('\\left.5\\right|')).toEqual({
      kind: 'row',
      children: [
        { kind: 'op', text: '' },
        { kind: 'number', text: '5' },
        { kind: 'op', text: '|' },
      ],
    });
  });

  test('x^23 means x^{2}3, as in LaTeX', () => {
    expect(parseTex('x^23')).toEqual({
      kind: 'row',
      children: [
        { kind: 'sup', base: { kind: 'ident', text: 'x' }, sup: { kind: 'number', text: '2' } },
        { kind: 'number', text: '3' },
      ],
    });
  });

  test('keeps spaces inside \\text{…}', () => {
    expect(parseTex('a \\text{ or } b')).toEqual({
      kind: 'row',
      children: [
        { kind: 'ident', text: 'a' },
        { kind: 'text', text: ' or ' },
        { kind: 'ident', text: 'b' },
      ],
    });
  });

  test.each(['\\frac{1}', '{x', 'x}', '^2', '\\notacommand{x}', '\\'])(
    'rejects malformed or unsupported input %s',
    (tex) => {
      expect(() => parseTex(tex)).toThrow(TexParseError);
    },
  );

  test('is a parser only: input is never executed', () => {
    // Would be dangerous if evaluated; here it is just characters.
    expect(() => parseTex('alert(1); process.exit()')).not.toThrow();
  });
});

describe('spoken form for screen readers', () => {
  test.each([
    // "x to the power 7 over 7" could be heard as x^(7/7), so a powered numerator is bracketed.
    [
      '\\int x^{6}\\,dx = \\frac{x^{7}}{7} + C',
      'integral of x to the power 6 d x equals fraction, x to the power 7, over 7, end fraction plus C',
    ],
    ['x^{2}', 'x squared'],
    ['\\sin^{-1}x', 'inverse sine x'],
    ['\\ln|x|', 'natural log absolute value bar x absolute value bar'],
    ['\\sqrt{1-x^{2}}', 'square root of 1 minus x squared, end root'],
    ['\\theta', 'theta'],
  ])('%s', (tex, spoken) => {
    expect(speakTex(tex)).toBe(spoken);
  });
});

describe('inline maths in paragraphs', () => {
  test('splits $…$ segments', () => {
    expect(splitInlineMath('Take $f(x) = 2x$ now.')).toEqual([
      { type: 'text', value: 'Take ' },
      { type: 'math', value: 'f(x) = 2x' },
      { type: 'text', value: ' now.' },
    ]);
  });
});

/** Every formula in the Integration content must parse (no silent fallbacks in the app). */
describe('Integration content formulas', () => {
  const formulas = [...new Set(integrationTopic.units.flatMap((u) => u.steps.flatMap((s) => s.blocks.flatMap(texOf))))];

  test('there is a substantial amount of mathematics to check', () => {
    expect(formulas.length).toBeGreaterThan(400);
  });

  test.each(formulas.map((tex) => [tex]))('parses: %s', (tex) => {
    expect(() => parseTex(tex)).not.toThrow();
  });
});

describe('answer validation (deferred engine)', () => {
  test('never marks an answer wrong before the engine exists', async () => {
    await expect(deferredValidator.checkAntiderivative({ integrand: '2*x', proposed: 'x^2' })).resolves.toMatchObject({
      status: 'cannotVerify',
    });
    await expect(deferredValidator.checkEquivalent({ expected: 'x', proposed: 'y' })).resolves.toMatchObject({
      status: 'cannotVerify',
    });
  });
});
