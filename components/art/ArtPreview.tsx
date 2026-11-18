import { memo, useCallback, useMemo } from 'react';

import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { curvePalette } from '@/components/graph/plot';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ArtProject } from '@/lib/graph/project';
import type { GraphView } from '@/lib/graph/sample';
import type { FunctionName } from '@/lib/math/input/parse';

import { compileProject, projectCurves } from './artCurves';

/** A small, fixed rendering of an equation artwork (template galleries and Create cards). */
export const ArtPreview = memo(function ArtPreview({
  project,
  functions,
  height = 140,
  summary,
}: {
  project: ArtProject;
  functions?: readonly FunctionName[];
  height?: number;
  summary: string;
}) {
  const theme = useAppTheme();
  const colors = useMemo(() => curvePalette(theme), [theme]);
  const compiled = useMemo(() => compileProject(project, functions), [project, functions]);
  // Thumbnails stay clean: no axes, labels or grid.
  const view = useMemo(() => ({ ...project.view, axes: false, grid: false }), [project.view]);
  const curves = useCallback(
    (drawn: GraphView) => projectCurves(project, compiled, drawn, colors),
    [project, compiled, colors],
  );
  return <GraphCanvas view={view} curves={curves} summary={summary} height={height} equalScale />;
});
