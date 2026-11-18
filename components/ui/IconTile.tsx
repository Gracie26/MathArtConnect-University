import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { AccentTone } from '@/types/dashboard';

import { toneColors } from './tones';

interface IconTileProps {
  icon: LucideIcon;
  tone: AccentTone;
  size?: number;
}

/** Tinted rounded square holding a single line icon. Decorative. */
export function IconTile({ icon: Icon, tone, size = 40 }: IconTileProps) {
  const theme = useAppTheme();
  const { soft, strong } = toneColors(theme, tone);

  return (
    <View
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        backgroundColor: soft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={Math.round(size * 0.5)} color={strong} strokeWidth={2.2} />
    </View>
  );
}
