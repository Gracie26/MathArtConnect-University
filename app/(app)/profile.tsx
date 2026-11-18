import { router } from 'expo-router';
import {
  Bell,
  CircleHelp,
  FileText,
  History,
  Info,
  KeyRound,
  LogOut,
  Palette,
  PlayCircle,
  RotateCcw,
  Shield,
  ShieldCheck,
  Trophy,
  UserPen,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { APP_INSTITUTION } from '@/config/app';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { ListRow, ListSection } from '@/components/ui/ListRow';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSignOutDialog } from '@/features/auth/useSignOutDialog';
import { useAppTheme } from '@/hooks/useAppTheme';

const ordinal = (year: number) => (year >= 5 ? '5th year or later' : `${['1st', '2nd', '3rd', '4th'][year - 1]} year`);

/** One labelled fact in the header; the value wraps instead of being cut off. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View accessible accessibilityLabel={`${label}, ${value}`} style={styles.detail}>
      <AppText variant="small" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="small" style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

/**
 * Profile: a compact header (avatar, name, email, learning details in full),
 * then grouped settings. Every row opens a working screen; Sign Out is kept
 * apart at the bottom.
 */
export default function ProfileScreen() {
  const theme = useAppTheme();
  const { profile, user } = useAuth();
  const signOut = useSignOutDialog();
  const name = profile?.displayName ?? null;

  return (
    <Screen>
      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <View style={[styles.identity, { gap: theme.spacing.md }]}>
          <ProfileAvatar name={name} imageUrl={profile?.avatarUrl} size={56} />
          <View style={styles.grow}>
            <AppText variant="h3" accessibilityRole="header">
              {name ?? 'Your profile'}
            </AppText>
            {user?.email ? (
              <AppText variant="small" color="textSecondary">
                {user.email}
              </AppText>
            ) : null}
          </View>
        </View>
        <View
          style={[
            styles.details,
            { gap: theme.spacing.sm, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md },
          ]}
        >
          {/* Fixed for MathArt Connect (University of Namibia students), whatever an older profile stored. */}
          <Detail label="Institution" value={APP_INSTITUTION} />
          <Detail label="Programme / Course" value={profile?.programme ?? 'Not set'} />
          <Detail label="Year of study" value={profile?.yearOfStudy ? ordinal(profile.yearOfStudy) : 'Not set'} />
        </View>
      </View>

      <ListSection title="Account">
        <ListRow first icon={UserPen} label="Edit Profile" onPress={() => router.push('/edit-profile')} />
        <ListRow
          icon={ShieldCheck}
          label="Account & Security"
          description="Email and sign-in methods"
          onPress={() => router.push('/account')}
        />
        <ListRow icon={KeyRound} label="Change Password" onPress={() => router.push('/change-password')} />
      </ListSection>

      <ListSection title="Learning">
        <ListRow
          first
          icon={History}
          label="My Work"
          description="Learning history, attempts and saved creations"
          onPress={() => router.push('/my-work')}
        />
        <ListRow icon={RotateCcw} label="Review Mistakes" onPress={() => router.push('/mistakes')} />
        <ListRow
          icon={Trophy}
          label="Rewards & Weekly Goals"
          description="Badges, personal bests and this week’s goals"
          onPress={() => router.push('/rewards')}
        />
        <ListRow icon={Bell} label="Notifications" onPress={() => router.push('/notifications')} />
      </ListSection>

      <ListSection title="Preferences">
        <ListRow
          first
          icon={Palette}
          label="Appearance & Motion"
          description="Light or dark, reduce motion, ambient mathematical art"
          onPress={() => router.push('/settings')}
        />
      </ListSection>

      <ListSection title="Support & Information">
        <ListRow first icon={Info} label="About MathArt Connect" onPress={() => router.push('/about')} />
        <ListRow icon={CircleHelp} label="Help" onPress={() => router.push('/help')} />
        <ListRow
          icon={PlayCircle}
          label="Replay Introduction"
          onPress={() => router.push({ pathname: '/onboarding', params: { replay: '1' } })}
        />
        <ListRow icon={FileText} label="Terms of Use" onPress={() => router.push('/terms')} />
        <ListRow icon={Shield} label="Privacy Policy" onPress={() => router.push('/privacy')} />
      </ListSection>

      <View style={{ marginTop: theme.spacing.md }}>
        <ListSection>
          <ListRow first icon={LogOut} label="Sign Out" destructive onPress={signOut.open} />
        </ListSection>
      </View>
      {signOut.dialog}
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1, minWidth: 0, gap: 2 },
  details: { borderTopWidth: StyleSheet.hairlineWidth },
  detail: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailValue: { flex: 1, textAlign: 'right', flexShrink: 1 },
});
