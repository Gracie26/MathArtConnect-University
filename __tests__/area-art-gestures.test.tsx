/**
 * Pinch-to-zoom and drag-to-pan on the area art canvas: gestures change the
 * view live, stay within the zoom limits, and never fill the undo history.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { AreaArtCanvas } from '@/components/art/area/AreaArtCanvas';
import { type History, historyReducer } from '@/components/art/area/AreaArtStudio';
import { projectFromTemplate, templateById } from '@/lib/art/areaArt';
import { ThemeProvider } from '@/theme/ThemeProvider';

const project = projectFromTemplate(templateById('staircase-wave')!, 'Waves');

describe('studio view gestures', () => {
  test('a pinch zooms and a drag pans without adding undo steps', () => {
    const start = { past: [], present: project, future: [] };
    const zoomed = historyReducer(start, { type: 'gesture', zoomFactor: 2, panX: 0, panY: 0 });
    expect(zoomed.present.view.zoom).toBe(2);
    expect(zoomed.past).toHaveLength(0);
    const panned = historyReducer(zoomed, { type: 'gesture', zoomFactor: 1, panX: 0.2, panY: -0.1 });
    // A drag across a fifth of the canvas at zoom 2 moves a tenth of the fitted artwork.
    expect(panned.present.view.panX).toBeCloseTo(0.1, 9);
    expect(panned.present.view.panY).toBeCloseTo(-0.05, 9);
    expect(panned.past).toHaveLength(0);
    expect(panned.present.layers).toBe(project.layers);
  });

  test('zoom stays between 0.25 and 8', () => {
    let state: History = { past: [], present: project, future: [] };
    for (let i = 0; i < 10; i++) state = historyReducer(state, { type: 'gesture', zoomFactor: 3, panX: 0, panY: 0 });
    expect(state.present.view.zoom).toBe(8);
    for (let i = 0; i < 10; i++) state = historyReducer(state, { type: 'gesture', zoomFactor: 0.2, panX: 0, panY: 0 });
    expect(state.present.view.zoom).toBe(0.25);
  });

  test('two fingers moving apart on the canvas report a zoom in', async () => {
    const onGesture = jest.fn();
    await render(
      <ThemeProvider>
        <AreaArtCanvas project={project} height={240} onGesture={onGesture} />
      </ThemeProvider>,
    );
    const canvas = screen.getByLabelText(/^Waves: /);
    const touches = (gap: number) => ({
      touches: [
        { pageX: 100 - gap / 2, pageY: 100 },
        { pageX: 100 + gap / 2, pageY: 100 },
      ],
      changedTouches: [],
      identifier: 0,
      pageX: 100,
      pageY: 100,
      locationX: 100,
      locationY: 100,
      timestamp: Date.now(),
    });
    await fireEvent(canvas, 'responderGrant', { nativeEvent: touches(50), touchHistory: { touchBank: [] } });
    await fireEvent(canvas, 'responderMove', { nativeEvent: touches(100), touchHistory: { touchBank: [] } });
    await fireEvent(canvas, 'responderRelease', { nativeEvent: touches(100), touchHistory: { touchBank: [] } });
    expect(onGesture).toHaveBeenCalled();
    const [zoomFactor] = onGesture.mock.calls.at(-1) as [number, number, number];
    expect(zoomFactor).toBeCloseTo(2, 6);
  });
});
