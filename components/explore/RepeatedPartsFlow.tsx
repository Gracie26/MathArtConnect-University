import { useState } from 'react';

import type { ActivityProps } from '@/components/activities/ActivityHost';
import { AppText } from '@/components/ui/AppText';
import { PARTS_TIMELINES } from '@/content/topics/integration/explore';

import { ChipButton, ChipRow, ExploreScaffold, useExploreCompletion } from './ExploreScaffold';
import { StageStepper } from './ExploreParts';

/** A timeline of repeated integration by parts: each application simplifies what is left. */
export function RepeatedPartsFlow({ activity }: ActivityProps) {
  const { explored, error, complete } = useExploreCompletion(activity);
  const [id, setId] = useState(PARTS_TIMELINES[0]!.id);
  const [finished, setFinished] = useState<string[]>([]);
  const timeline = PARTS_TIMELINES.find((t) => t.id === id) ?? PARTS_TIMELINES[0]!;

  return (
    <ExploreScaffold
      activity={activity}
      intro="Follow integration by parts applied more than once. Each application lowers the power of $x$, until no product is left, or the original integral comes back."
      explored={explored}
      error={error}
    >
      <ChipRow>
        {PARTS_TIMELINES.map((t) => (
          <ChipButton
            key={t.id}
            label={`${t.title}${t.extension ? ' (extension)' : ''}`}
            selected={t.id === timeline.id}
            onPress={() => setId(t.id)}
          />
        ))}
      </ChipRow>
      {timeline.extension ? (
        <AppText variant="small" color="textSecondary">
          Extension: this pattern goes beyond the examples in the notes.
        </AppText>
      ) : null}
      <StageStepper
        key={timeline.id}
        stages={timeline.nodes}
        onFinished={() => {
          const next = finished.includes(timeline.id) ? finished : [...finished, timeline.id];
          setFinished(next);
          if (next.length >= 2) void complete({ timelines: next.length });
        }}
      />
    </ExploreScaffold>
  );
}
