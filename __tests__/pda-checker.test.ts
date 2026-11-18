/**
 * Topic 4 checking (lib/math/applications.ts), the TeX additions it needs, and
 * the pure mathematics behind the Topic 4 Explore and Create tools.
 *
 * The checkers must accept every equivalent form of a right answer (as a
 * lecturer would) and reject wrong ones, using the notes' own examples.
 */
import {
  checkExtremaAnswer,
  checkExtremaLine,
  checkSurfaceAnswer,
  checkSurfaceLine,
  compileExtrema,
  compileSurface,
} from '@/lib/math/applications';
import {
  landscapeCriticals,
  newPaProject,
  normalisePaProject,
  paArtMath,
  paArtScene,
  type PaArtProject,
} from '@/lib/art/paArt';
import { contourLevels, levelSegments } from '@/lib/explore/contours';
import { classify, findCriticalPoints } from '@/lib/explore/extrema';
import { parseTex, speakTex } from '@/lib/math/tex';

// Example 4.2.1: z² − 2x² − 2y² = 12 at (1, −1, 4); Example 4.2.3: xyz = 6 at (2, 3, 1).
const hyperboloid = compileSurface({ F: 'z^2 - 2x^2 - 2y^2 - 12', point: { x: 1, y: -1, z: 4 }, ask: ['plane'] });
const xyz6 = compileSurface({ F: 'x y z - 6', point: { x: 2, y: 3, z: 1 }, ask: ['plane', 'normal'] });

describe('tangent planes (Theorem 4.2.2)', () => {
  test.each([
    'x - y - 2z + 6 = 0',
    '-4(x - 1) + 4(y + 1) + 8(z - 4) = 0',
    '-4x + 4y + 8z - 24 = 0',
    '2z = x - y + 6',
    'z = (x - y + 6)/2',
  ])('Example 4.2.1 accepts the equivalent form %s', (answer) => {
    expect(checkSurfaceAnswer(answer, hyperboloid).status).toBe('correct');
  });

  test.each(['x - y - 2z + 7 = 0', 'x + y - 2z + 6 = 0', 'x - y - 2z = 0', 'z^2 - 2x^2 - 2y^2 = 12'])(
    'Example 4.2.1 rejects %s',
    (answer) => {
      expect(checkSurfaceAnswer(answer, hyperboloid).status).toBe('incorrect');
    },
  );

  test('a plane must be an equation', () => {
    expect(checkSurfaceAnswer('x - y - 2z + 6', hyperboloid).status).toBe('cannotCheck');
  });

  test('a point that is not on the surface, or ∇F = 0, is refused when the question is built', () => {
    expect(() => compileSurface({ F: 'x y z - 6', point: { x: 1, y: 1, z: 1 }, ask: ['plane'] })).toThrow();
    expect(() => compileSurface({ F: 'x^2 + y^2 + z^2', point: { x: 0, y: 0, z: 0 }, ask: ['plane'] })).toThrow();
  });
});

describe('normal lines (Theorem 4.2.1, Example 4.2.3)', () => {
  const plane = '3x + 2y + 6z = 18';
  test.each([
    '(x - 2)/3 = (y - 3)/2 = (z - 1)/6',
    '(x - 2)/6 = (y - 3)/4 = (z - 1)/12',
    '(x - 2)/(-3) = (y - 3)/(-2) = (z - 1)/(-6)',
  ])('accepts %s (any nonzero multiple of the direction numbers)', (line) => {
    expect(checkSurfaceAnswer(`${plane}; ${line}`, xyz6).status).toBe('correct');
  });

  test.each(['(x - 2)/2 = (y - 3)/3 = (z - 1)/6', '(x - 3)/2 = (y - 2)/3 = (z - 6)/1', '(x - 2)/3 = (y - 3)/2'])(
    'rejects %s',
    (line) => {
      expect(checkSurfaceAnswer(`${plane}; ${line}`, xyz6).status).toBe('incorrect');
    },
  );

  test('both parts are needed, separated by a semicolon', () => {
    expect(checkSurfaceAnswer(plane, xyz6).status).toBe('cannotCheck');
  });
});

describe('lines of working on surfaces', () => {
  test('partial derivatives, values at P, the plane and the surface are recognised', () => {
    expect(checkSurfaceLine('F_x = -4x', hyperboloid)).toMatchObject({
      status: 'correct',
      message: 'This equals F_x.',
    });
    expect(checkSurfaceLine('F_z = 8', hyperboloid).status).toBe('correct');
    expect(checkSurfaceLine('-4(x - 1) + 4(y + 1) + 8(z - 4) = 0', hyperboloid).message).toBe(
      'This is the tangent plane at P.',
    );
    expect(checkSurfaceLine('z^2 - 2x^2 - 2y^2 - 12 = 0', hyperboloid).status).toBe('info');
    expect(checkSurfaceLine('(x - 2)/3 = (y - 3)/2 = (z - 1)/6', xyz6).message).toMatch(/normal line/);
  });
});

describe('critical points and the Second Partials Test', () => {
  // Example 4.3.3: f = −x³ + 4xy − 2y² + 1; saddle at (0, 0), relative maximum at (4/3, 4/3).
  const ex433 = compileExtrema({
    f: '-x^3 + 4x y - 2y^2 + 1',
    classify: true,
    points: [
      { x: '0', y: '0', type: 'saddle' },
      { x: '4/3', y: '4/3', type: 'max' },
    ],
  });

  test.each([
    '(0, 0) saddle; (4/3, 4/3) max',
    '(4/3, 4/3) relative maximum, (0, 0) saddle point',
    '(0,0) saddle; (1.3333333333, 1.3333333333) maximum',
  ])('accepts %s', (answer) => {
    expect(checkExtremaAnswer(answer, ex433).status).toBe('correct');
  });

  test('missing points, extra points, wrong types and missing types are not accepted', () => {
    expect(checkExtremaAnswer('(4/3, 4/3) max', ex433)).toMatchObject({ status: 'incorrect' });
    expect(checkExtremaAnswer('(4/3, 4/3) max', ex433).message).toMatch(/1 of the 2 critical points/);
    expect(checkExtremaAnswer('(0, 0) saddle; (4/3, 4/3) max; (1, 1) min', ex433).message).toMatch(
      /\(1, 1\) is not a critical point/,
    );
    expect(checkExtremaAnswer('(0, 0) min; (4/3, 4/3) max', ex433).message).toMatch(/not a relative minimum/);
    expect(checkExtremaAnswer('(0, 0); (4/3, 4/3) max', ex433).message).toMatch(/Say what kind of point/);
    expect(checkExtremaAnswer('0, 0 saddle', ex433).status).toBe('cannotCheck');
  });

  test('exact irrational coordinates are accepted (Tutorial 5 Q5(i) style)', () => {
    const c = compileExtrema({
      f: '3y^3 - x^2 y^2 + 8y^2 + 4x^2 - 20y',
      classify: false,
      points: [
        { x: '0', y: '(-8 + 2sqrt(61))/9' },
        { x: '0', y: '(-8 - 2sqrt(61))/9' },
        { x: '2sqrt(3)', y: '2' },
        { x: '-2sqrt(3)', y: '2' },
        { x: '2', y: '-2' },
        { x: '-2', y: '-2' },
      ],
    });
    expect(
      checkExtremaAnswer(
        '(0, (-8 + 2sqrt(61))/9); (0, (-8 - 2sqrt(61))/9); (sqrt(12), 2); (-sqrt(12), 2); (2, -2); (-2, -2)',
        c,
      ).status,
    ).toBe('correct');
  });

  test('lines of working: f_x = 0 and f_y = 0 are recognised as equations, not as unequal sides', () => {
    const ex431 = compileExtrema({ f: '2x^2 + y^2 + 8x - 6y + 20', classify: false, points: [{ x: '-2', y: '3' }] });
    expect(checkExtremaLine('4x + 8 = 0', ex431)).toMatchObject({
      status: 'correct',
      message: 'This is the equation f_x = 0.',
    });
    expect(checkExtremaLine('2y - 6 = 0', ex431).message).toBe('This is the equation f_y = 0.');
    expect(checkExtremaLine('x = -2', ex431).status).toBe('correct');
    expect(checkExtremaLine('x = 2', ex431).status).toBe('incorrect');
    expect(checkExtremaLine('f_x = 4x + 8', ex431).status).toBe('correct');
    // Example 4.3.3: x = 0 holds at one of the two critical points only.
    expect(checkExtremaLine('x = 0', ex433).status).toBe('info');
  });
});

describe('TeX additions', () => {
  test('∇, bold unit vectors and the determinant of Theorem 4.3.3 parse and read aloud', () => {
    expect(() => parseTex('\\nabla f(x, y) = f_{x}\\mathbf{i} + f_{y}\\mathbf{j}')).not.toThrow();
    const det = 'd = \\begin{vmatrix} f_{xx}(a, b) & f_{xy}(a, b) \\\\ f_{yx}(a, b) & f_{yy}(a, b) \\end{vmatrix}';
    const tree = parseTex(det);
    expect(JSON.stringify(tree)).toContain('"kind":"matrix"');
    expect(speakTex(det)).toMatch(/^d equals determinant with rows/);
    expect(speakTex('\\nabla f')).toBe('del f');
    expect(() => parseTex('\\begin{matrix} a \\end{matrix}')).toThrow();
    expect(() => parseTex('\\begin{vmatrix} a & b \\end{pmatrix}')).toThrow();
  });
});

describe('Explore and Create mathematics', () => {
  test('level curves of x² + y² = 1 lie on the unit circle', () => {
    const segments = levelSegments((x, y) => x * x + y * y, [-2, 2], [-2, 2], 1, 40);
    expect(segments.length).toBeGreaterThan(20);
    for (const segment of segments) {
      expect(segment).toHaveLength(2);
      for (const [x, y] of segment) expect(Math.hypot(x, y)).toBeCloseTo(1, 1);
    }
    expect(contourLevels((x, y) => x + y, [0, 1], [0, 1], 3)).toEqual([0.5, 1, 1.5]);
  });

  test('critical points are found and classified by Theorem 4.3.3 (Example 4.3.3)', () => {
    const found = findCriticalPoints((x, y) => -(x ** 3) + 4 * x * y - 2 * y * y + 1, [-1, 3], [-1, 3]);
    expect(found.map((p) => [Number(p.x.toFixed(4)), Number(p.y.toFixed(4)), p.type])).toEqual([
      [0, 0, 'saddle'],
      [1.3333, 1.3333, 'max'],
    ]);
    expect(classify(2, 0)).toBe('inconclusive');
  });

  test('Landscape Designer labels every critical point of its terrain, by words', () => {
    const project = newPaProject({ studio: 'landscape', starter: 'twoPeaks', question: '' }, 'Test');
    const found = landscapeCriticals(project.course.features);
    expect(found.filter((p) => p.type === 'max')).toHaveLength(2);
    expect(found.filter((p) => p.type === 'min')).toHaveLength(1);
    expect(found.some((p) => p.type === 'saddle')).toBe(true);
    const labels = paArtScene(project).items.flatMap((i) => (i.k === 'label' ? [i.text] : []));
    expect(labels.sort()).toEqual(found.map((p) => (p.type === 'inconclusive' ? '?' : p.type)).sort());
  });

  test('every facet of Faceted Surface is a tangent plane; every arrow of Gradient Field Art is (fx, fy)', () => {
    const facet = newPaProject({ studio: 'facetedSurface', starter: 'paraboloid', question: '' }, 'F');
    // 7 × 7 facets (Math view adds the 3D axes and their scale around them).
    expect(paArtScene(facet).items.filter((i) => i.k === 'polygon')).toHaveLength(49);
    expect(paArtMath(facet).rows[0]!.label).toBe('Tangent plane (§4.2.1)');
    const field = newPaProject({ studio: 'gradientField', starter: 'saddle', question: '' }, 'G');
    const arrows = paArtScene(field).items.filter((i) => i.k === 'segment');
    // f = x² − y²: ∇f = 2x i − 2y j, so every arrow points along (x, −y) from its point.
    for (const a of arrows) {
      if (a.k !== 'segment') continue;
      const mx = (a.x1 + a.x2) / 2;
      const my = (a.y1 + a.y2) / 2;
      const cross = (a.x2 - a.x1) * (-2 * my) - (a.y2 - a.y1) * (2 * mx);
      expect(Math.abs(cross)).toBeLessThan(1e-9);
    }
  });

  test('saved projects are read back safely', () => {
    const p = newPaProject({ studio: 'landscape', starter: 'twoPeaks', question: '' }, 'Mine');
    expect(normalisePaProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(normalisePaProject({ version: 2 })).toBeNull();
    const damaged = normalisePaProject({
      version: 1,
      studio: 'gradientField',
      course: { source: 'nope', density: 99 },
      creative: { scheme: 'purple' },
    }) as PaArtProject;
    expect(damaged.course).toMatchObject({ source: 'saddle', density: 15 });
    expect(damaged.creative.scheme).toBe('primary');
  });
});
