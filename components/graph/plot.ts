import type { AppTheme } from '@/theme';
import { compileLayer, type GraphLayer, type GraphView, sampleLayer } from '@/lib/graph/sample';

import type { CanvasCurve } from './GraphCanvas';

/** Curve colours from the theme's graph roles (light and dark), in layer order. */
export function curvePalette(theme: AppTheme): string[] {
  const g = theme.colors.graph;
  return [g.curvePrimary, g.curveSecondary, g.curveTertiary, g.curveQuaternary, g.derivativePositive, g.point];
}

export const CURVE_COLOR_NAMES = ['Blue', 'Teal', 'Coral', 'Amber', 'Green', 'Deep blue'];

export interface PlotSpec {
  id: string;
  expression: string;
  kind?: 'cartesian' | 'polar';
  color: number;
  width?: number;
  dashed?: boolean;
  domain?: { start: number | null; end: number | null };
}

/** Plots simple expressions (Explore tools) through the same safe sampler as the Studio. */
export function plotExpressions(
  specs: readonly PlotSpec[],
  parameters: Record<string, number>,
  view: GraphView,
  theme: AppTheme,
): CanvasCurve[] {
  const colors = curvePalette(theme);
  return specs.flatMap((spec) => {
    const layer: GraphLayer = {
      id: spec.id,
      name: spec.id,
      kind: spec.kind ?? 'cartesian',
      expression: spec.expression,
      visible: true,
      color: spec.color,
      width: spec.width ?? 2.5,
      domain: spec.domain ?? { start: null, end: null },
      range: { min: null, max: null },
      repeat: 1,
      mirror: false,
    };
    const compiled = compileLayer(layer, Object.keys(parameters));
    if (!compiled.ok) return [];
    return [
      {
        id: spec.id,
        segments: sampleLayer(layer, compiled, parameters, view),
        color: colors[spec.color % colors.length] as string,
        width: layer.width,
        ...(spec.dashed ? { dashed: true } : {}),
      },
    ];
  });
}
