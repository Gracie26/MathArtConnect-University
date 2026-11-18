import { router } from 'expo-router';
import { Image } from 'lucide-react-native';
import { StyleSheet, Switch, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppearanceSelector } from '@/components/settings/AppearanceSelector';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { ListRow, ListSection } from '@/components/ui/ListRow';
import { setDisplayPreference, useDisplayPreferences } from '@/features/preferences/displayPreferences';
import { useAppTheme } from '@/hooks/useAppTheme';

function SwitchRow({
  title,
  text,
  value,
  onChange,
}: {
  title: string;
  text: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={[styles.row, { gap: theme.spacing.md, paddingVertical: theme.spacing.sm }]}>
      <View style={styles.grow}>
        <AppText variant="title">{title}</AppText>
        <AppText variant="small" color="textSecondary">
          {text}
        </AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={title}
        trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );
}

/** Profile › Appearance & Motion: theme, the app's own Reduce motion switch, and ambient art. */
export default function SettingsScreen() {
  const theme = useAppTheme();
  const display = useDisplayPreferences();

  return (
    <Screen>
      <AppearanceSelector />

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.xs }]}>
        <AppText variant="title" accessibilityRole="header">
          Motion and background
        </AppText>
        <SwitchRow
          title="Reduce motion"
          text="Keeps decorative motion still and makes transitions instant. Your phone’s own Reduce Motion setting is always respected too."
          value={display.reduceMotion}
          onChange={(v) => setDisplayPreference('reduceMotion', v)}
        />
        <SwitchRow
          title="Ambient mathematical art"
          text="Faint moving curves on sign in, onboarding, the top of Home and some empty screens. Never shown behind lessons or practice."
          value={display.ambientArt}
          onChange={(v) => setDisplayPreference('ambientArt', v)}
        />
      </View>

      <ListSection title="Home background">
        <ListRow
          first
          icon={Image}
          label="Choose a Home backdrop"
          description="Curves, Lissajous figure, contour lines or vector field (unlocked by badges)"
          onPress={() => router.push('/rewards')}
        />
      </ListSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1, gap: 2 },
});
