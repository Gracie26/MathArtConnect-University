import type { CanvasCurve } from '@/components/graph/GraphCanvas';
import type { ArtProject } from '@/lib/graph/project';
import { type CompiledLayer, compileLayer, type GraphView, parameterValues, sampleLayer } from '@/lib/graph/sample';
import type { FunctionName } from '@/lib/math/input/parse';

/** Compiles every layer of a project once (parameter names are allowed symbols). */
export function compileProject(project: ArtProject, functions?: readonly FunctionName[]): Map<string, CompiledLayer> {
  const names = project.parameters.map((p) => p.name);
  return new Map(project.layers.map((layer) => [layer.id, compileLayer(layer, names, functions)]));
}

/**
 * Samples the visible, valid layers for the view actually drawn. A layer that
 * cannot be evaluated is skipped (its error is shown in the layer list), so
 * one bad equation never blanks or crashes the whole canvas.
 */
export function projectCurves(
  project: ArtProject,
  compiled: ReadonlyMap<string, CompiledLayer>,
  view: GraphView,
  colors: readonly string[],
  values: Record<string, number> = parameterValues(project.parameters),
  density = 1,
): CanvasCurve[] {
  return project.layers.flatMap((layer) => {
    const c = compiled.get(layer.id);
    if (!layer.visible || !c?.ok) return [];
    let segments;
    try {
      segments = sampleLayer(layer, c, values, view, density);
    } catch {
      return [];
    }
    return [
      {
        id: layer.id,
        segments,
        color: colors[layer.color % colors.length] as string,
        width: layer.width,
        ...(layer.dashed ? { dashed: true } : {}),
      },
    ];
  });
}
