import type { ActivityProps } from '@/components/activities/ActivityHost';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PDA_GAMES } from '@/content/topics/applications/games';
import { AREA_GAMES } from '@/content/topics/area/games';
import { RN_GAMES } from '@/content/topics/differential/games';
import { gameById } from '@/content/topics/integration/games';

import { GameShell } from './GameShell';

/** Any game activity: its content runs in the shared game shell. */
export function GameActivity({ activity }: ActivityProps) {
  const game =
    gameById(activity.id) ??
    AREA_GAMES.find((g) => g.id === activity.id) ??
    RN_GAMES.find((g) => g.id === activity.id) ??
    PDA_GAMES.find((g) => g.id === activity.id);
  if (!game) {
    return (
      <Screen>
        <AppText variant="h2">This game is not available.</AppText>
      </Screen>
    );
  }
  return <GameShell game={game} />;
}
