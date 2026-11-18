import { readdirSync, readFileSync, statSync } from 'fs';

import { activitiesFor, INTEGRATION_ACTIVITIES } from '@/content/topics/integration/activities';
import { FLOW_CONFIGS, STUDIO_CONFIGS } from '@/content/topics/integration/create';
import { DECOMPOSER_EXAMPLES, HIGHLIGHT_EXAMPLES, PARTS_EXAMPLES } from '@/content/topics/integration/explore';
import { gameById, INTEGRATION_GAMES } from '@/content/topics/integration/games';
import { integrationTopic } from '@/content/topics/integration';
import type { LearningHistory } from '@/features/learning/useLearningHistory';
import { buildUnitReview, similarQuestion } from '@/features/review/buildReview';
import { factorFeedback, templateTex } from '@/lib/explore/partialFractions';
import {
  expReductionChain,
  fractionTex,
  powerStrategy,
  productToSum,
  sinReductionChain,
  solveStructure,
} from '@/lib/explore/patterns';
import {
  evaluateMatch,
  evaluateOrder,
  evaluateSelect,
  evaluateStage,
  gameReducer,
  initialGameState,
  maxScore,
  pointsFor,
  type Round,
  shuffled,
  xpFor,
} from '@/lib/games/engine';
import { advanceParameters } from '@/components/art/EquationArtStudio';
import { ALL_PARAMETERS } from '@/components/art/StudioPanels';
import { diagnose, MAX_LAYERS } from '@/lib/graph/diagnose';
import { freezeParameters, layerNode, printExpr, transformExpression, usesSymbols } from '@/lib/graph/expression';
import { checkFlowOrder, newFlowProject } from '@/lib/graph/flow';
import { emptyProject, historyReducer, newLayer, projectReducer, startHistory } from '@/lib/graph/project';
import { compileLayer, describeRestriction, parameterValues, sampleLayer, valueAt } from '@/lib/graph/sample';
import { parseNumber } from '@/lib/graph/studio';
import type { QuestionAttemptRecord } from '@/services/repositories/types';

const UNITS = integrationTopic.units.map((u) => u.id);

// -----------------------------------------------------------------------------
// Mapping: every subtopic has its Explore, Game and Create, in its own lesson
// -----------------------------------------------------------------------------

describe('activity mapping', () => {
  const titles = (unitIndex: number, kind: 'lab' | 'game' | 'studio') =>
    activitiesFor(UNITS[unitIndex]!, kind).map((a) => a.title);

  test('each activity sits under the subtopic that teaches it', () => {
    expect(titles(0, 'lab')).toEqual(['Family of Curves']);
    expect(titles(0, 'game')).toEqual(['Reverse the Derivative']);
    expect(titles(0, 'studio')).toEqual(['Antiderivative Curve Art']);
    expect(titles(1, 'lab')).toEqual(['Power Rule Machine']);
    expect(titles(1, 'game')).toEqual(['Rule Builder']);
    expect(titles(1, 'studio')).toEqual(['Function Curve Composer']);
    expect(titles(2, 'lab')).toEqual(['Substitution Highlighter', 'Transformation Lab']);
    expect(titles(2, 'game')).toEqual(['Spot the Substitution']);
    expect(titles(2, 'studio')).toEqual(['Transformation Art']);
    expect(titles(3, 'lab')).toEqual(['Fraction Decomposer']);
    expect(titles(3, 'game')).toEqual(['Build the Decomposition']);
    expect(titles(3, 'studio')).toEqual(['Decomposition Map']);
    expect(titles(4, 'lab')).toEqual(['Trig/Algebraic Transformation Lab']);
    expect(titles(4, 'game')).toEqual(['Transformation Challenge']);
    expect(titles(4, 'studio')).toEqual(['Equation Art Studio', 'Trig Pattern Studio']);
    expect(titles(5, 'lab')).toEqual(['Choose U Lab', 'Repeated-Parts Flow']);
    expect(titles(5, 'game')).toEqual(['Choose U']);
    expect(titles(5, 'studio')).toEqual(['Solution Flow Builder']);
    expect(titles(6, 'lab')).toEqual(['Pattern Explorer', 'Reduction Flow']);
    expect(titles(6, 'game')).toEqual(['Pattern Detective']);
    expect(titles(6, 'studio')).toEqual(['Dynamic Pattern Studio']);
  });

  test('graph art only where the mathematics is graphable; structure and flows elsewhere', () => {
    const typeOf = (id: string) => INTEGRATION_ACTIVITIES.find((a) => a.id === id)?.createType;
    expect(typeOf('transformation-art')).toBe('graphArt');
    expect(typeOf('decomposition-map')).toBe('structure');
    expect(typeOf('solution-flow-builder')).toBe('flow');
    for (const id of Object.keys(STUDIO_CONFIGS)) expect(typeOf(id)).toBe('graphArt');
    for (const id of Object.keys(FLOW_CONFIGS)) expect(['structure', 'flow']).toContain(typeOf(id));
    expect(STUDIO_CONFIGS['function-curve-composer']?.mode).toBe('lite');
  });

  test('every lesson Explore, Play and Create step lists real activities', () => {
    for (const unit of integrationTopic.units) {
      for (const kind of ['explore', 'play', 'create'] as const) {
        const step = unit.steps.find((s) => s.kind === kind);
        expect(step?.availability.status).toBe('available');
        const block = step?.blocks.find((b) => b.type === 'activities');
        expect(block && block.type === 'activities' && block.activities.length).toBeGreaterThan(0);
      }
      for (const kind of ['reflect', 'review'] as const) {
        expect(unit.steps.find((s) => s.kind === kind)?.availability.status).toBe('available');
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Game engine
// -----------------------------------------------------------------------------

describe('game engine', () => {
  test('scoring: first try, after a retry, with a hint; XP from score', () => {
    expect(pointsFor(0, false)).toBe(10);
    expect(pointsFor(2, false)).toBe(5);
    expect(pointsFor(0, true)).toBe(7);
    expect(pointsFor(3, true)).toBe(2);
    expect(xpFor(0)).toBe(5);
    expect(xpFor(100)).toBe(20);
  });

  test('a game plays through to completion, scoring each unit once', () => {
    const game = gameById('reverse-the-derivative')!;
    let state = initialGameState();
    state = gameReducer(game, state, { type: 'wrong' });
    state = gameReducer(game, state, { type: 'hint' });
    state = gameReducer(game, state, { type: 'hint' }); // a second hint on the same unit is not counted twice
    expect(state.hintsUsed).toBe(1);
    let guard = 0;
    while (!state.finished && guard++ < 100) state = gameReducer(game, state, { type: 'solved' });
    expect(state.finished).toBe(true);
    expect(state.events[0]).toMatchObject({ wrongAttempts: 1, hinted: true, points: 2 });
    expect(state.score).toBe(maxScore(game) - 8);
    expect(gameReducer(game, state, { type: 'solved' })).toBe(state); // no scoring after the end
    expect(gameReducer(game, state, { type: 'restart' })).toEqual(initialGameState());
  });

  test('round evaluation explains mistakes', () => {
    const select: Extract<Round, { kind: 'select' }> = {
      kind: 'select',
      level: 1,
      prompt: 'p',
      hint: 'h',
      multiple: true,
      choices: [
        { id: 'a', correct: true, feedback: 'yes' },
        { id: 'b', correct: true, feedback: 'yes' },
        { id: 'c', correct: false, feedback: 'Its derivative is x.' },
      ],
    };
    expect(evaluateSelect(select, ['a']).correct).toBe(false);
    expect(evaluateSelect(select, ['a', 'c']).feedback).toBe('Its derivative is x.');
    expect(evaluateSelect(select, ['a', 'b']).correct).toBe(true);

    const order: Extract<Round, { kind: 'order' }> = {
      kind: 'order',
      level: 1,
      prompt: 'p',
      hint: 'h',
      cards: [{ id: '1' }, { id: '2' }],
      distractors: [{ id: 'x', why: 'Not a step here.' }],
    };
    expect(evaluateOrder(order, ['1', 'x']).feedback).toBe('Not a step here.');
    expect(evaluateOrder(order, ['2', '1']).feedback).toMatch(/Step 1/);
    expect(evaluateOrder(order, ['1', '2']).correct).toBe(true);

    const match: Extract<Round, { kind: 'match' }> = {
      kind: 'match',
      level: 1,
      prompt: 'p',
      hint: 'h',
      pairs: [
        { id: 'a', left: { tex: 'a' }, right: { tex: 'A' } },
        { id: 'b', left: { tex: 'b' }, right: { tex: 'B' } },
      ],
    };
    expect(evaluateMatch(match, { a: 'a' }).correct).toBe(false);
    expect(evaluateMatch(match, { a: 'b', b: 'a' }).feedback).toMatch(/2 pairs/);
    expect(evaluateMatch(match, { a: 'a', b: 'b' }).correct).toBe(true);
  });

  test('shuffling is deterministic and never shows the answer order', () => {
    const items = ['1', '2', '3', '4'];
    expect(shuffled(items, 'seed')).toEqual(shuffled(items, 'seed'));
    expect(shuffled(items, 'seed')).not.toEqual(items);
    expect(shuffled(['a', 'b'], 'x')).toEqual(['b', 'a']);
  });

  test.each(INTEGRATION_GAMES.map((g) => [g.title, g]))('%s is well formed and solvable', (_title, game) => {
    expect(
      game.tutorial.goal && game.tutorial.interaction && game.tutorial.skill && game.tutorial.scoring,
    ).toBeTruthy();
    expect(game.rounds.length).toBeGreaterThanOrEqual(3);
    expect(INTEGRATION_ACTIVITIES.find((a) => a.id === game.id)?.unitId).toBe(game.unitId);
    for (const round of game.rounds) {
      expect(round.hint.length).toBeGreaterThan(0);
      if (round.kind === 'select') expect(round.choices.some((c) => c.correct)).toBe(true);
      if (round.kind === 'stages') {
        round.stages.forEach((stage, i) => {
          const right = stage.choices.find((c) => c.correct)!;
          expect(evaluateStage(round, i, right.id).correct).toBe(true);
        });
      }
      if (round.kind === 'order')
        expect(
          evaluateOrder(
            round,
            round.cards.map((c) => c.id),
          ).correct,
        ).toBe(true);
      for (const c of round.kind === 'select' ? round.choices : []) expect(c.feedback.length).toBeGreaterThan(0);
    }
  });

  test('Pattern Detective offers only valid strategies as correct answers', () => {
    const game = gameById('pattern-detective')!;
    for (const round of game.rounds) {
      if (round.kind !== 'select') continue;
      for (const c of round.choices.filter((choice) => !choice.correct)) expect(c.feedback).not.toMatch(/^Correct/);
    }
  });
});

// -----------------------------------------------------------------------------
// Equation Art Studio: safe parsing, parameters, restrictions, layers
// -----------------------------------------------------------------------------

describe('equation art studio', () => {
  const ok = (expression: string, params: string[] = [], kind: 'cartesian' | 'polar' = 'cartesian') => {
    const c = compileLayer({ kind, expression }, params);
    if (!c.ok) throw new Error(c.error);
    return c;
  };

  test('parses y = … and bare expressions, with allow-listed variables and functions only', () => {
    expect(valueAt(ok('y = a sin(x) + c', ['a', 'c']), Math.PI / 2, { a: 2, c: 1 })).toBeCloseTo(3);
    expect(valueAt(ok('r = cos(3θ)', [], 'polar'), 0, {})).toBeCloseTo(1);
    expect(compileLayer({ kind: 'cartesian', expression: 'k x' }, []).ok).toBe(false);
    expect(compileLayer({ kind: 'cartesian', expression: 'cos(θ)' }, [])).toMatchObject({ ok: false });
    expect(compileLayer({ kind: 'cartesian', expression: '∫ x dx' }, [])).toMatchObject({ ok: false });
    expect(compileLayer({ kind: 'cartesian', expression: 'sinh(x)' }, [], ['sin', 'cos'])).toMatchObject({
      ok: false,
      error: 'sinh is not available in this studio.',
    });
  });

  test('never executes code: script-like input is rejected or read as maths', () => {
    for (const attack of ['alert(1)', 'constructor', 'process.exit()', 'x; y', '`x`', 'this', 'window']) {
      expect(compileLayer({ kind: 'cartesian', expression: attack }, []).ok).toBe(false);
    }
  });

  test('restriction and slider fields accept numbers and π only', () => {
    expect(parseNumber('2')).toBe(2);
    expect(parseNumber('-1.5')).toBe(-1.5);
    expect(parseNumber('pi/2')).toBeCloseTo(Math.PI / 2);
    expect(parseNumber('2π')).toBeCloseTo(2 * Math.PI);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('x')).toBeNull();
    expect(parseNumber('alert(1)')).toBeNull();
  });

  test('domain and range restrictions limit the drawn curve', () => {
    const layer = {
      ...newLayer('cartesian', 'x^2', 'Parabola'),
      domain: { start: -1, end: 2 },
      range: { min: null, max: 3 },
    };
    const view = emptyProject().view;
    const points = sampleLayer(layer, ok('x^2'), {}, view).flat();
    expect(Math.min(...points.map((p) => p.x))).toBeGreaterThanOrEqual(-1);
    expect(Math.max(...points.map((p) => p.x))).toBeLessThanOrEqual(2);
    expect(Math.max(...points.map((p) => p.y))).toBeLessThanOrEqual(3);
    expect(describeRestriction(layer)).toBe('−1 ≤ x ≤ 2, y ≤ 3');
  });

  test('discontinuities break the curve instead of joining across them', () => {
    const layer = newLayer('cartesian', 'tan(x)', 'Tangent');
    expect(sampleLayer(layer, ok('tan(x)'), {}, emptyProject().view).length).toBeGreaterThan(2);
  });

  test('polar repeats and cartesian mirrors', () => {
    const view = emptyProject().view;
    const petal = { ...newLayer('polar', 'cos(θ)', 'Petal'), repeat: 4 };
    expect(sampleLayer(petal, ok('cos(θ)', [], 'polar'), {}, view)).toHaveLength(4);
    const half = { ...newLayer('cartesian', 'x', 'Line'), domain: { start: 0, end: 2 }, mirror: true };
    const points = sampleLayer(half, ok('x'), {}, view).flat();
    expect(points.some((p) => p.x < 0)).toBe(true);
  });

  test('parameters: create with min, max and step; live values snap; invalid ranges are refused', () => {
    let p = emptyProject();
    p = projectReducer(p, { type: 'addParameter', parameter: { name: 'a', value: 1, min: 0, max: 5, step: 0.5 } });
    p = projectReducer(p, { type: 'addParameter', parameter: { name: 'a', value: 9, min: 0, max: 9, step: 1 } });
    expect(p.parameters).toHaveLength(1);
    p = projectReducer(p, { type: 'setParameterValue', name: 'a', value: 2.26 });
    expect(parameterValues(p.parameters)).toEqual({ a: 2.5 });
    p = projectReducer(p, { type: 'setParameterValue', name: 'a', value: 99 });
    expect(p.parameters[0]?.value).toBe(5);
    expect(projectReducer(p, { type: 'updateParameter', name: 'a', change: { min: 6 } })).toEqual(p);
    p = projectReducer(p, { type: 'updateParameter', name: 'a', change: { max: 3 } });
    expect(p.parameters[0]).toMatchObject({ max: 3, value: 3 });
    p = projectReducer(p, { type: 'deleteParameter', name: 'a' });
    expect(p.parameters).toEqual([]);
  });

  test('layer operations: add, edit, rename, duplicate, reorder, show/hide, delete', () => {
    let p = emptyProject();
    const a = newLayer('cartesian', 'x', 'A');
    const b = newLayer('cartesian', 'x^2', 'B');
    p = projectReducer(p, { type: 'addLayer', layer: a });
    p = projectReducer(p, { type: 'addLayer', layer: b });
    p = projectReducer(p, { type: 'updateLayer', id: a.id, change: { expression: '2x', name: 'Line' } });
    expect(p.layers[0]).toMatchObject({ expression: '2x', name: 'Line' });
    p = projectReducer(p, { type: 'duplicateLayer', id: a.id });
    expect(p.layers.map((l) => l.name)).toEqual(['Line', 'Line (copy)', 'B']);
    expect(p.layers[1]?.id).not.toBe(a.id);
    p = projectReducer(p, { type: 'moveLayer', id: b.id, direction: -1 });
    expect(p.layers.map((l) => l.name)).toEqual(['Line', 'B', 'Line (copy)']);
    expect(projectReducer(p, { type: 'moveLayer', id: a.id, direction: -1 })).toBe(p);
    p = projectReducer(p, { type: 'toggleLayer', id: b.id });
    expect(p.layers[1]?.visible).toBe(false);
    p = projectReducer(p, { type: 'deleteLayer', id: a.id });
    expect(p.layers.map((l) => l.name)).toEqual(['B', 'Line (copy)']);
  });

  test('zoom, pan and reset change the view', () => {
    let p = emptyProject();
    p = projectReducer(p, { type: 'zoom', factor: 0.5 });
    expect(p.view.xMax - p.view.xMin).toBeCloseTo(6);
    p = projectReducer(p, { type: 'pan', dx: 1, dy: 0 });
    expect(p.view.xMin).toBeCloseTo(-2);
    p = projectReducer(p, { type: 'resetView' });
    expect(p.view).toEqual(emptyProject().view);
  });

  test('undo and redo cover structural edits but not slider moves', () => {
    let h = startHistory(emptyProject());
    h = historyReducer(h, { type: 'addParameter', parameter: { name: 'a', value: 1, min: 0, max: 5, step: 1 } });
    h = historyReducer(h, { type: 'addLayer', layer: newLayer('cartesian', 'a x', 'L') });
    h = historyReducer(h, { type: 'setParameterValue', name: 'a', value: 3 });
    expect(h.past).toHaveLength(2);
    h = historyReducer(h, { type: 'undo' });
    expect(h.present.layers).toHaveLength(0);
    h = historyReducer(h, { type: 'redo' });
    expect(h.present.layers).toHaveLength(1);
    expect(historyReducer(startHistory(emptyProject()), { type: 'undo' }).past).toEqual([]);
  });

  test('every studio starter and preset compiles with its own functions', () => {
    for (const [id, config] of Object.entries(STUDIO_CONFIGS)) {
      const projects = [config.starter(), ...config.presets.map((preset) => preset.project)];
      for (const project of projects) {
        const names = project.parameters.map((p) => p.name);
        for (const layer of project.layers) {
          const compiled = compileLayer(layer, names, config.functions);
          if (!compiled.ok) throw new Error(`${id}: ${layer.expression}: ${compiled.error}`);
        }
      }
      expect(config.questions.length).toBeGreaterThan(0);
    }
  });

  test('every starter and preset actually draws: each layer has visible points in its view', () => {
    for (const [id, config] of Object.entries(STUDIO_CONFIGS)) {
      for (const project of [config.starter(), ...config.presets.map((p) => p.project)]) {
        const values = parameterValues(project.parameters);
        expect(project.layers.length).toBeGreaterThan(0);
        for (const layer of project.layers) {
          const compiled = compileLayer(layer, Object.keys(values), config.functions);
          if (!compiled.ok) throw new Error(compiled.error);
          const points = sampleLayer(layer, compiled, values, project.view).flat();
          const inView = points.filter(
            (p) =>
              p.x >= project.view.xMin &&
              p.x <= project.view.xMax &&
              p.y >= project.view.yMin &&
              p.y <= project.view.yMax,
          );
          if (inView.length < 10) throw new Error(`${id} / ${project.title} / ${layer.name} draws nothing visible`);
        }
      }
    }
  });

  test('the main art studios have several starters, sliders, layers and restricted pieces', () => {
    for (const id of [
      'equation-art-studio',
      'dynamic-pattern-studio',
      'antiderivative-curve-art',
      'transformation-art',
    ]) {
      const config = STUDIO_CONFIGS[id]!;
      expect(config.presets.length).toBeGreaterThanOrEqual(2);
      const starter = config.starter();
      expect(starter.layers.length).toBeGreaterThan(1);
      expect(starter.parameters.length).toBeGreaterThan(0);
    }
    const restricted = Object.values(STUDIO_CONFIGS)
      .flatMap((c) => c.presets)
      .flatMap((p) => p.project.layers)
      .filter((l) => l.domain.start !== null || l.range.max !== null);
    expect(restricted.length).toBeGreaterThan(5);
    expect(STUDIO_CONFIGS['equation-art-studio']?.equalScale).toBe(true);
    expect(STUDIO_CONFIGS['transformation-art']?.transform?.operations.length).toBeGreaterThanOrEqual(4);
    expect(STUDIO_CONFIGS['antiderivative-curve-art']?.stamp).toBeDefined();
  });
});

describe('art quality pass', () => {
  const rose = (placement?: { h: number; k: number; scale: number; rotation: number }) => {
    const layer = { ...newLayer('polar', 'cos(4θ)', 'Rose'), ...(placement ? { placement } : {}) };
    const c = compileLayer(layer, []);
    if (!c.ok) throw new Error(c.error);
    return sampleLayer(layer, c, {}, emptyProject().view).flat();
  };
  const centre = (points: { x: number; y: number }[]) => ({
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  });

  test('polar layers can be moved, scaled and turned without changing r(θ)', () => {
    const base = rose();
    const moved = rose({ h: 2, k: -1, scale: 0.5, rotation: 45 });
    expect(centre(base).x).toBeCloseTo(0, 2);
    expect(centre(moved).x).toBeCloseTo(2, 2);
    expect(centre(moved).y).toBeCloseTo(-1, 2);
    const radius = (pts: { x: number; y: number }[], c: { x: number; y: number }) =>
      Math.max(...pts.map((p) => Math.hypot(p.x - c.x, p.y - c.y)));
    expect(radius(moved, { x: 2, y: -1 })).toBeCloseTo(radius(base, { x: 0, y: 0 }) / 2, 6);
    const layer = {
      ...newLayer('polar', 'cos(4θ)', 'Rose'),
      placement: { h: 2, k: -1, scale: 0.5, rotation: 45 },
    };
    expect(describeRestriction(layer)).toBe('rotated 45°, scaled by 0.5, centred at (2, −1)');
    expect(describeRestriction({ ...layer, placement: { h: 0, k: 0, scale: 1, rotation: 0 } })).toBe('');
  });

  test('a lower density draws fewer points (used while animating)', () => {
    const layer = newLayer('cartesian', 'sin(x)', 'Wave');
    const c = compileLayer(layer, []);
    if (!c.ok) throw new Error(c.error);
    const full = sampleLayer(layer, c, {}, emptyProject().view).flat().length;
    const half = sampleLayer(layer, c, {}, emptyProject().view, 0.5).flat().length;
    expect(half).toBeLessThan(full);
    expect(half).toBeGreaterThan(full / 3);
  });

  test('animation steps the chosen parameter up, down or back and forth; integer steps never stall', () => {
    const params = [
      { name: 'a', value: 0, min: 0, max: 1, step: 0.01 },
      { name: 'p', value: 1, min: 1, max: 9, step: 1 },
    ];
    const run = (target: string, direction: 'up' | 'down' | 'bounce', steps: number, fraction = 0.25) => {
      const phases = new Map<string, { phase: number; sign: 1 | -1 }>();
      let current = params.map((p) => ({ ...p }));
      const seen: Record<string, number[]> = {};
      for (let i = 0; i < steps; i++) {
        for (const u of advanceParameters(current, target, direction, fraction, phases)) {
          (seen[u.name] ??= []).push(Number(u.value.toFixed(6)));
          current = current.map((p) => (p.name === u.name ? { ...p, value: u.value } : p));
        }
      }
      return seen;
    };
    expect(run('a', 'up', 5).a).toEqual([0.25, 0.5, 0.75, 1, 0]);
    expect(run('a', 'down', 2).a).toEqual([1, 0.75]);
    expect(run('a', 'bounce', 6).a).toEqual([0.25, 0.5, 0.75, 1, 0.75, 0.5]);
    expect(run('p', 'up', 2, 0.001).p).toEqual([2, 3]);
    const all = run(ALL_PARAMETERS, 'up', 1);
    expect(Object.keys(all).sort()).toEqual(['a', 'p']);
  });

  test('empty and broken canvases are explained, never silent', () => {
    const view = emptyProject().view;
    const check = (
      layers: ReturnType<typeof newLayer>[],
      parameters: { name: string; value: number; min: number; max: number; step: number }[] = [],
    ) => {
      const project = { ...emptyProject(), layers, parameters };
      const compiled = new Map(
        layers.map((l) => [
          l.id,
          compileLayer(
            l,
            parameters.map((p) => p.name),
          ),
        ]),
      );
      return diagnose(project, compiled, parameterValues(parameters), view).map((i) => i.kind);
    };
    expect(check([])).toEqual(['noLayers']);
    expect(check([{ ...newLayer('cartesian', 'x', 'L'), visible: false }])).toEqual(['allHidden']);
    expect(check([{ ...newLayer('cartesian', 'x', 'L'), domain: { start: 2, end: 1 } }])).toContain('invalidDomain');
    expect(check([{ ...newLayer('cartesian', 'x', 'L'), range: { min: 100, max: null } }])).toContain(
      'restrictionHidesAll',
    );
    expect(check([newLayer('cartesian', 'x + 50', 'Far')])).toContain('offView');
    expect(
      check([newLayer('cartesian', 'x + a', 'L')], [{ name: 'a', value: 40, min: -40, max: 40, step: 1 }]),
    ).toContain('parameterAtLimit');
    const heavy = Array.from({ length: 4 }, () => ({ ...newLayer('polar', 'cos(θ)', 'P'), repeat: 8 }));
    expect(check(heavy)).toContain('heavy');
    const many = Array.from({ length: MAX_LAYERS }, (_, i) => newLayer('cartesian', `${i / 10}`, `L${i}`));
    expect(check(many)).toContain('tooManyLayers');
    expect(check([newLayer('cartesian', 'sin(x)', 'Fine')])).toEqual([]);
  });

  test('starters are labelled course-aligned or creative extension, and every studio opens on a course-aligned one', () => {
    for (const [id, config] of Object.entries(STUDIO_CONFIGS)) {
      const starter = config.starter();
      const fromPreset = config.presets.find((p) => p.project === starter);
      expect({ id, category: fromPreset?.category }).toEqual({ id, category: 'course' });
      expect(config.presets.some((p) => p.category === 'course')).toBe(true);
    }
    const categoryOf = (studio: string, preset: string) =>
      STUDIO_CONFIGS[studio]?.presets.find((p) => p.id === preset)?.category;
    for (const [studio, preset] of [
      ['equation-art-studio', 'flower'],
      ['equation-art-studio', 'flower-garden'],
      ['equation-art-studio', 'heart'],
      ['dynamic-pattern-studio', 'mandala'],
      ['dynamic-pattern-studio', 'product-rose'],
      ['trig-pattern-studio', 'rose'],
      ['transformation-art', 'bell-mountains'],
    ] as const) {
      expect(categoryOf(studio, preset)).toBe('extension');
    }
    for (const [studio, preset] of [
      ['equation-art-studio', 'arches'],
      ['dynamic-pattern-studio', 'wave-lattice'],
      ['dynamic-pattern-studio', 'power-integrands'],
      ['trig-pattern-studio', 'sine-cosine-layers'],
      ['antiderivative-curve-art', 'sine-ribbon'],
    ] as const) {
      expect(categoryOf(studio, preset)).toBe('course');
    }
  });

  test('Function Curve Composer has at least three course-aligned power-rule starters', () => {
    const composer = STUDIO_CONFIGS['function-curve-composer']!;
    expect(composer.presets.map((p) => p.id)).toEqual(['power-fan', 'parabola-bloom', 'butterfly']);
    for (const p of composer.presets) {
      expect(p.category).toBe('course');
      expect(p.project.layers.length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('expression rewriting (art tools)', () => {
  const same = (
    a: string,
    b: string,
    kind: 'cartesian' | 'polar' = 'cartesian',
    params: Record<string, number> = {},
  ) => {
    const ca = compileLayer({ kind, expression: a }, Object.keys(params));
    const cb = compileLayer({ kind, expression: b }, Object.keys(params));
    if (!ca.ok || !cb.ok) throw new Error(`could not compile ${a} or ${b}`);
    for (const t of [-1.3, 0.4, 0.9, 1.7]) {
      const va = valueAt(ca, t, params);
      const vb = valueAt(cb, t, params);
      if (Number.isFinite(va) || Number.isFinite(vb)) expect(vb).toBeCloseTo(va, 9);
    }
  };

  test.each([
    'a sin(x) + c',
    'x^2/2 - 3',
    '-x^2 + 1',
    '1 - (x - 2)^2',
    'sqrt(1 - (|x| - 1)^2)',
    'e^(-(2x - 8)^2)',
    'cos(a x)/a',
    'x^(-1) * 2',
    'sin(x)^2 cos(x)',
    '-(x^4/4 - x^2)',
  ])('prints %s back to the same function', (expression) => {
    const printed = printExpr(layerNode(expression));
    same(expression, printed, 'cartesian', { a: 1.7, c: 0.4 });
  });

  test('freezing parameters keeps "c" in cos and "n" in sin untouched', () => {
    const frozen = freezeParameters('c cos(n x) + sin(x)', { c: 2, n: 3 });
    expect(frozen).not.toMatch(/\b[cn]\b/);
    same('2 cos(3x) + sin(x)', frozen);
    expect(freezeParameters('x^2 + C', { C: -1.5 })).toBe('x^2 + (-1.5)');
  });

  test('substitutions build f(ax + b), k·f and reflections', () => {
    const t = (inner?: string, outer?: string) => ({ id: 't', label: 't', effect: '', inner, outer, parameters: [] });
    same(transformExpression('sin(x)', 'cartesian', t('a x + b')), 'sin(a x + b)', 'cartesian', { a: 2, b: 1 });
    same(transformExpression('x^2', 'cartesian', t('-x')), 'x^2');
    same(transformExpression('x^3', 'cartesian', t('-x')), '-x^3');
    same(transformExpression('cos(x)', 'cartesian', t(undefined, 'k f + c')), 'k cos(x) + c', 'cartesian', {
      k: 2,
      c: 1,
    });
    same(transformExpression('cos(θ)', 'polar', t('a x')), 'cos(a θ)', 'polar', { a: 3 });
  });

  test('detects parameters as symbols only', () => {
    expect(usesSymbols('sin(x) + C', ['C'])).toBe(true);
    expect(usesSymbols('cos(x)', ['c'])).toBe(false);
    expect(usesSymbols('not (valid', ['a'])).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// Structure maps and solution flows
// -----------------------------------------------------------------------------

describe('flow composer', () => {
  test('checks the order and explains the first misplaced stage', () => {
    for (const config of Object.values(FLOW_CONFIGS)) {
      for (const example of config.examples) {
        const ids = example.nodes.map((n) => n.id);
        expect(checkFlowOrder(example, ids).correct).toBe(true);
        expect(checkFlowOrder(example, ids.slice(0, -1)).message).toMatch(/Place all/);
        const swapped = [ids[1]!, ids[0]!, ...ids.slice(2)];
        expect(checkFlowOrder(example, swapped).message).toMatch(/^Stage 1 should be/);
      }
      expect(newFlowProject(config, 'Mine').placed).toEqual([]);
    }
  });
});

// -----------------------------------------------------------------------------
// Explore tool logic
// -----------------------------------------------------------------------------

describe('explore tools', () => {
  test('Substitution Highlighter examples have one right u and one right du', () => {
    for (const e of HIGHLIGHT_EXAMPLES) {
      expect(e.inner.filter((o) => o.correct)).toHaveLength(1);
      expect(e.du.filter((o) => o.correct)).toHaveLength(1);
      expect(e.stages.map((s) => s.label)).toEqual([
        'Original integral',
        'Substitution',
        'Transformed integral',
        'Integrated',
        'Back substitution',
      ]);
    }
  });

  test('Fraction Decomposer explains repeated factors and builds the template', () => {
    const repeated = { tex: 'x+1', kind: 'linear' as const, multiplicity: 2 };
    expect(factorFeedback(repeated, { numerator: 'constant', powers: 1 })).toBe(
      'Because $x+1$ repeats to the second power, both first and second powers must appear.',
    );
    expect(factorFeedback(repeated, { numerator: 'constant', powers: 2 })).toBeNull();
    expect(
      factorFeedback({ tex: 'x^{2}+1', kind: 'quadratic', multiplicity: 1 }, { numerator: 'constant', powers: 1 }),
    ).toMatch(/linear, such as \$Bx \+ C\$/);
    const example = DECOMPOSER_EXAMPLES.find((e) => e.id === 'repeated')!;
    expect(templateTex(example.factors)).toBe('\\frac{A}{x} + \\frac{B}{x+1} + \\frac{C}{(x+1)^{2}}');
    expect(templateTex(DECOMPOSER_EXAMPLES.find((e) => e.id === 'quadratic')!.factors)).toBe(
      '\\frac{A}{x} + \\frac{Bx + C}{x^{2}+1}',
    );
    expect(DECOMPOSER_EXAMPLES.find((e) => e.id === 'improper')?.division?.options.some((o) => o.correct)).toBe(true);
  });

  test('Choose U Lab says a harder choice is valid but harder', () => {
    const harder = PARTS_EXAMPLES.flatMap((e) => e.choices).filter((c) => c.verdict === 'harder');
    expect(harder.length).toBeGreaterThan(0);
    for (const c of harder) expect(c.why).toMatch(/^This choice is valid, but/);
    for (const e of PARTS_EXAMPLES) expect(e.choices.filter((c) => c.verdict === 'useful')).toHaveLength(1);
  });

  test('Pattern Explorer: parity strategy for sinᵐx cosⁿx', () => {
    expect(powerStrategy(3, 2).case).toBe('mOdd');
    expect(powerStrategy(3, 2).steps[2]?.tex).toBe('-\\int (1 - u^{2}) u^{2}\\,du');
    expect(powerStrategy(4, 3).case).toBe('nOdd');
    expect(powerStrategy(4, 3).steps[2]?.tex).toBe('\\int u^{4} (1 - u^{2})\\,du');
    expect(powerStrategy(2, 2).case).toBe('bothEven');
    expect(powerStrategy(0, 4).case).toBe('bothEven');
    expect(powerStrategy(0, 0).case).toBe('trivial');
  });

  test('Pattern Explorer: product-to-sum identities hold numerically', () => {
    for (const kind of ['sincos', 'sinsin', 'coscos'] as const) {
      for (const [p, q] of [
        [8, 6],
        [2, 4],
        [3, 3],
      ] as const) {
        const { productPlain, sumPlain } = productToSum(kind, p, q);
        const product = compileLayer({ kind: 'cartesian', expression: productPlain }, []);
        const sum = compileLayer({ kind: 'cartesian', expression: sumPlain }, []);
        if (!product.ok || !sum.ok) throw new Error('did not compile');
        for (const x of [0.3, 1.1, 2.7]) expect(valueAt(product, x, {})).toBeCloseTo(valueAt(sum, x, {}), 10);
      }
    }
  });

  test('Reduction chains: I_n → I_(n−2) for sinⁿx and I_n → I_(n−1) for xⁿeˣ', () => {
    expect(sinReductionChain(4).steps.map((s) => s.n)).toEqual([4, 2]);
    expect(sinReductionChain(4).end.n).toBe(0);
    expect(sinReductionChain(5).end.n).toBe(1);
    expect(sinReductionChain(5).applications).toBe(2);
    expect(expReductionChain(3).steps.map((s) => s.n)).toEqual([3, 2, 1]);
  });

  test('§1.14 structure: the course example has p = 1, q = 1, r = −1', () => {
    expect(solveStructure({ a: 1, b: -3, c: 1 }, { A: 2, B: -1, C: 2 })).toEqual({ p: 1, q: 1, r: -1 });
    const simple = solveStructure({ a: 1, b: 0, c: 0 }, { A: 1, B: 1, C: 0 })!;
    expect([fractionTex(simple.p), fractionTex(simple.q), fractionTex(simple.r)]).toEqual([
      '\\tfrac{1}{2}',
      '\\tfrac{1}{2}',
      '0',
    ]);
    expect(solveStructure({ a: 1, b: 1, c: 1 }, { A: 0, B: 0, C: 1 })).toBeNull();
  });
});

// -----------------------------------------------------------------------------
// Review uses only real history
// -----------------------------------------------------------------------------

describe('review', () => {
  const unitId = UNITS[2]!;
  const allItems = integrationTopic.practiceItems ?? [];
  const items = allItems.filter((i) => i.unitId === unitId && !i.withheldFromLearners);
  const [first, second] = items;
  const attempt = (
    id: string,
    questionId: string,
    isCorrect: boolean,
    at: string,
    extra: Partial<QuestionAttemptRecord> = {},
  ) =>
    ({
      id,
      topicId: 'integration',
      unitId,
      questionId,
      retryOfId: null,
      learnerAnswer: null,
      isCorrect,
      hintsUsed: 0,
      hintLevelsViewed: [],
      viewedSteps: false,
      viewedAnswer: false,
      answeredAt: at,
      reviewResolvedAt: null,
      ...extra,
    }) satisfies QuestionAttemptRecord;

  const empty: LearningHistory = { attempts: [], games: [], art: [], activity: [] };

  test('with no history there is nothing to review (no invented data)', () => {
    const review = buildUnitReview(unitId, empty, allItems, integrationTopic.activities);
    expect(review.isEmpty).toBe(true);
    expect(review.mistakes).toEqual([]);
  });

  test('mistakes, retries, hints, last attempts, weak techniques, games, art, explore and reflections', () => {
    const history: LearningHistory = {
      attempts: [
        attempt('a1', first!.id, false, '2026-10-10T10:00:00Z', { hintsUsed: 2 }),
        attempt('a2', second!.id, false, '2026-10-10T10:01:00Z'),
        attempt('a3', second!.id, true, '2026-10-10T10:02:00Z', { retryOfId: 'a2' }),
      ],
      games: [
        {
          id: 'g1',
          topicId: 'integration',
          gameId: 'spot-the-substitution',
          levelReached: 2,
          score: 40,
          xpEarned: 8,
          hintsUsed: 1,
          completed: true,
          events: { retries: 3 },
          startedAt: '2026-10-10T09:00:00Z',
          endedAt: '2026-10-10T09:05:00Z',
        },
      ],
      art: [
        {
          id: 'p1',
          topicId: 'integration',
          activityId: 'transformation-art',
          title: 'My map',
          composition: {},
          isCompleted: false,
          createdAt: '2026-10-10T08:00:00Z',
          updatedAt: '2026-10-10T08:00:00Z',
        },
      ],
      activity: [
        {
          id: 'e1',
          type: 'explore',
          refId: 'substitution-highlighter',
          topicId: 'integration',
          summary: null,
          xp: 5,
          metadata: {},
          occurredAt: '2026-10-10T07:00:00Z',
        },
        {
          id: 'r1',
          type: 'reflection',
          refId: unitId,
          topicId: 'integration',
          summary: null,
          xp: 5,
          metadata: {},
          occurredAt: '2026-10-10T07:30:00Z',
        },
      ],
    };
    const review = buildUnitReview(unitId, history, allItems, integrationTopic.activities);
    expect(review.isEmpty).toBe(false);
    expect(review.mistakes.map((q) => q.item.id)).toEqual([first!.id]);
    expect(review.completed.map((q) => q.item.id)).toEqual([second!.id]);
    expect(review.retried.map((q) => q.item.id)).toEqual([second!.id]);
    expect(review.totalHints).toBe(2);
    expect(review.lastAttempts[0]?.attempt.id).toBe('a3');
    expect(review.weakTechniques.length).toBeGreaterThan(0);
    expect(review.games[0]).toMatchObject({ bestScore: 40, retries: 3, hintsUsed: 1 });
    expect(review.art.map((a) => a.project.title)).toEqual(['My map']);
    expect(review.explored.map((a) => a.id)).toEqual(['substitution-highlighter']);
    expect(review.reflections).toBe(1);
    const similar = similarQuestion(first!, allItems, review);
    if (similar) {
      expect(similar.technique).toBe(first!.technique);
      expect(similar.withheldFromLearners).toBeFalsy();
    }
  });

  test('a resolved mistake is no longer open', () => {
    const history: LearningHistory = {
      ...empty,
      attempts: [attempt('a1', first!.id, false, '2026-10-10T10:00:00Z', { reviewResolvedAt: '2026-10-10T11:00:00Z' })],
    };
    expect(buildUnitReview(unitId, history, allItems, []).mistakes).toEqual([]);
  });
});

// -----------------------------------------------------------------------------
// No unsafe code execution anywhere in the app
// -----------------------------------------------------------------------------

describe('no unsafe code', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name: string) => {
      const path = `${dir}/${name}`;
      return statSync(path).isDirectory() ? files(path) : /\.(ts|tsx)$/.test(name) ? [path] : [];
    });

  test('no eval, new Function or string timers in app code', () => {
    for (const dir of ['app', 'components', 'features', 'lib', 'services', 'content', 'hooks', 'theme', 'config']) {
      for (const file of files(dir)) {
        const source = readFileSync(file, 'utf8');
        expect({
          file,
          unsafe: /\beval\s*\(|new\s+Function\s*\(|set(Timeout|Interval)\s*\(\s*['"`]/.test(source),
        }).toEqual({
          file,
          unsafe: false,
        });
      }
    }
  });
});
