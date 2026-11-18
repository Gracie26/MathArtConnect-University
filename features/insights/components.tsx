import { CircleAlert, CircleCheck, CircleDashed, type LucideIcon, TrendingUp } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AmbientMathArt, type AmbientVariant } from '@/components/art/AmbientMathArt';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';

import type { Standing } from './progressReport';

/** "12 Oct" (or "Today"/"Yesterday"), with the time when asked. */
export function formatWhen(iso: string | null, withTime = false, now: Date = new Date()): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / (24 * 60 * 60 * 1000));
  const date =
    diff === 0
      ? 'Today'
      : diff === 1
        ? 'Yesterday'
        : d.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
          });
  if (!withTime) return date;
  return `${date}, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
}

export const percent = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`);

/** A titled card section. */
export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ gap: 2 }}>
        <AppText variant="h3" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, onPress, label }: { children: ReactNode; onPress?: () => void; label?: string }) {
  const theme = useAppTheme();
  const style = [cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }];
  if (!onPress) return <View style={style}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [...style, { opacity: pressed ? 0.85 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

/** A number with its meaning in words (one accessible element). */
export function StatTile({ value, label, hint }: { value: string | number; label: string; hint?: string }) {
  const theme = useAppTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}${hint ? `. ${hint}` : ''}`}
      style={[cardStyle(theme), styles.tile, { padding: theme.spacing.md, gap: 2 }]}
    >
      <AppText variant="h2">{String(value)}</AppText>
      <AppText variant="small" color="textSecondary">
        {label}
      </AppText>
      {hint ? (
        <AppText variant="small" color="textSecondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return <View style={[styles.grid, { gap: theme.spacing.sm }]}>{children}</View>;
}

const STANDING: Record<Standing, { label: string; icon: LucideIcon }> = {
  notStarted: { label: 'Not started', icon: CircleDashed },
  needsAttention: { label: 'Needs attention', icon: CircleAlert },
  onTrack: { label: 'On track', icon: TrendingUp },
  strong: { label: 'Strong', icon: CircleCheck },
};

/** Standing as an icon and a word (never colour alone). */
export function StandingBadge({ standing }: { standing: Standing }) {
  const theme = useAppTheme();
  const { label, icon: Icon } = STANDING[standing];
  const tone =
    standing === 'strong'
      ? { bg: theme.colors.successSoft, fg: theme.colors.success }
      : standing === 'needsAttention'
        ? { bg: theme.colors.achievementSoft, fg: theme.colors.achievementStrong }
        : standing === 'onTrack'
          ? { bg: theme.colors.primarySoft, fg: theme.colors.primary }
          : { bg: theme.colors.surfaceMuted, fg: theme.colors.textSecondary };
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg, borderRadius: theme.radius.pill }]}>
      <Icon size={14} color={tone.fg} strokeWidth={2.4} />
      <AppText variant="small" color="textPrimary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {label}
      </AppText>
    </View>
  );
}

export const standingLabel = (s: Standing) => STANDING[s].label;

/** A friendly message where a list would otherwise be empty. */
export function EmptyNote({
  title,
  text,
  children,
  art,
}: {
  title: string;
  text: string;
  children?: ReactNode;
  /** Faint ambient mathematical art behind this empty state (decorative). */
  art?: AmbientVariant;
}) {
  const theme = useAppTheme();
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm, overflow: 'hidden' }]}>
      {art ? <AmbientMathArt variant={art} height={160} strength="faint" /> : null}
      <AppText variant="title">{title}</AppText>
      <AppText variant="small" color="textSecondary">
        {text}
      </AppText>
      {children}
    </View>
  );
}

/** Small selectable chip used for tabs and filters. */
export function FilterChip({
  label,
  selected,
  onPress,
  a11y,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  a11y?: string;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={a11y ?? label}
      style={[
        styles.chip,
        {
          borderRadius: theme.radius.pill,
          minHeight: theme.touchTarget.min,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
        },
      ]}
    >
      <AppText
        variant="caption"
        color={selected ? 'primary' : 'textPrimary'}
        style={{ fontFamily: theme.fontFamilies.semibold }}
      >
        {selected ? `✓ ${label}` : label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { flexGrow: 1, flexBasis: 140, minWidth: 0 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  chip: { paddingHorizontal: 14, justifyContent: 'center' },
});
