/**
 * The shared Slider (every Explore lab, Create studio and graph game) on touch devices:
 * native responder events only (no DOM or mouse events), page scrolling locked while a finger
 * drags the track and restored on release or cancel, quick repeated − / + taps that build on
 * each other, and the release position always applied.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ScrollLockContext } from '@/components/graph/ScrollLock';
import { Slider } from '@/components/ui/Slider';
import { ThemeProvider } from '@/theme/ThemeProvider';

/** Touch events as React Native delivers them on iOS and Android. */
const touch = (locationX: number, pageX: number) => ({
  nativeEvent: { locationX, pageX, touches: [], changedTouches: [] },
});

async function setup(value = 2) {
  const onChange = jest.fn();
  const lock = jest.fn();
  await render(
    <ThemeProvider>
      <ScrollLockContext.Provider value={lock}>
        <Slider
          label="Zoom"
          value={value}
          min={0}
          max={10}
          step={0.5}
          onChange={onChange}
          valueText={`Zoom ${value}`}
        />
      </ScrollLockContext.Provider>
    </ThemeProvider>,
  );
  const track = screen.getByRole('adjustable', { name: 'Zoom' });
  // The track is 200 wide, so each 20 px is one unit.
  await fireEvent(track, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 44 } } });
  return { onChange, lock, track };
}

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(async () => {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test('− and + respond to every tap, and quick repeated taps build on each other', async () => {
  const { onChange } = await setup(2);
  const plus = screen.getByRole('button', { name: 'Increase Zoom' });
  const minus = screen.getByRole('button', { name: 'Decrease Zoom' });
  // The parent has not re-rendered between taps (value prop still 2).
  await fireEvent.press(plus);
  await fireEvent.press(plus);
  await fireEvent.press(plus);
  expect(onChange.mock.calls.map((c) => c[0])).toEqual([2.5, 3, 3.5]);
  await fireEvent.press(minus);
  expect(onChange).toHaveBeenLastCalledWith(3);
});

test('− and + stop at the ends of the range', async () => {
  const { onChange } = await setup(10);
  await fireEvent.press(screen.getByRole('button', { name: 'Increase Zoom' }));
  expect(onChange).toHaveBeenLastCalledWith(10);
});

test('dragging the track updates the value continuously and locks page scrolling until release', async () => {
  const { onChange, lock, track } = await setup(2);
  expect(track.props.onStartShouldSetResponder()).toBe(true);
  // A scroll view asking to take over the gesture is refused while dragging.
  expect(track.props.onResponderTerminationRequest()).toBe(false);

  await fireEvent(track, 'responderGrant', touch(40, 140));
  expect(lock).toHaveBeenLastCalledWith(true);
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
  expect(onChange).toHaveBeenLastCalledWith(2);

  await fireEvent(track, 'responderMove', touch(0, 200));
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
  expect(onChange).toHaveBeenLastCalledWith(5);

  await fireEvent(track, 'responderMove', touch(0, 240));
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
  expect(onChange).toHaveBeenLastCalledWith(7);

  await fireEvent(track, 'responderRelease', touch(0, 240));
  expect(lock).toHaveBeenLastCalledWith(false);
});

test('the release position is applied even if the finger lifts before the next frame', async () => {
  const { onChange, track } = await setup(2);
  await fireEvent(track, 'responderGrant', touch(40, 140));
  await fireEvent(track, 'responderMove', touch(0, 280));
  // No frame has run yet: releasing must still apply x = 40 + 140 = 180 → 9.
  await fireEvent(track, 'responderRelease', touch(0, 280));
  expect(onChange).toHaveBeenLastCalledWith(9);
});

test('if the system cancels the drag, page scrolling is restored', async () => {
  const { lock, track } = await setup(2);
  await fireEvent(track, 'responderGrant', touch(40, 140));
  await fireEvent(track, 'responderTerminate', touch(40, 140));
  expect(lock.mock.calls.map((c) => c[0])).toEqual([true, false]);
});

test('screen readers can adjust the slider', async () => {
  const { onChange, track } = await setup(2);
  expect(track.props.accessibilityValue).toMatchObject({ min: 0, max: 10, now: 2, text: 'Zoom 2' });
  await fireEvent(track, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
  expect(onChange).toHaveBeenLastCalledWith(2.5);
});
