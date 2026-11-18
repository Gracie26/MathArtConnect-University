import { GraduationCap } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, type TextInputInstance, View } from 'react-native';

import { AuthTextField } from '@/components/forms/AuthTextField';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormError } from '@/components/forms/FormError';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import { APP_INSTITUTION } from '@/config/app';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { validateDisplayName, validateOptionalText } from '@/lib/validation/auth';
import type { ProfileInput } from '@/services/profile';

import { pickAvatar } from './pickAvatar';

const YEARS = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: 5, label: '5th+', accessibilityLabel: '5th year or later' },
];

interface ProfileFormProps {
  initial: ProfileInput;
  submitLabel: string;
  /** Marks first-run setup as complete when saving. */
  markComplete?: boolean;
  onSaved?: () => void;
}

/**
 * Minimal learner profile: full name, programme, year and an optional photo.
 * The institution is fixed (MathArt Connect is for University of Namibia
 * students), so it is shown but never asked for. No ID numbers, student
 * numbers, birth dates, phone numbers or addresses are requested.
 */
export function ProfileForm({ initial, submitLabel, markComplete = false, onSaved }: ProfileFormProps) {
  const theme = useAppTheme();
  const auth = useAuth();
  const programmeRef = useRef<TextInputInstance>(null);

  const [displayName, setDisplayName] = useState(initial.displayName);
  const [programme, setProgramme] = useState(initial.programme ?? '');
  const [year, setYear] = useState<number | null>(initial.yearOfStudy);
  const [errors, setErrors] = useState<{
    displayName?: string | null;
    programme?: string | null;
  }>({});
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'success' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const changeAvatar = async () => {
    setMessage(null);
    const picked = await pickAvatar();
    if (!picked.ok) return setMessage({ tone: 'error', text: picked.error.message });
    if (!picked.data) return;
    setAvatarBusy(true);
    const result = await auth.setAvatar(picked.data);
    setAvatarBusy(false);
    if (!result.ok) setMessage({ tone: 'error', text: result.error.message });
  };

  const removeAvatar = async () => {
    setAvatarBusy(true);
    const result = await auth.removeAvatar();
    setAvatarBusy(false);
    if (!result.ok) setMessage({ tone: 'error', text: result.error.message });
  };

  const submit = async () => {
    const next = {
      displayName: validateDisplayName(displayName),
      programme: validateOptionalText(programme, 'Programme'),
    };
    setErrors(next);
    setMessage(null);
    if (Object.values(next).some(Boolean)) return;

    setSaving(true);
    const result = await auth.saveProfile(
      { displayName, programme: programme || null, yearOfStudy: year },
      { markComplete },
    );
    setSaving(false);
    if (!result.ok) return setMessage({ tone: 'error', text: result.error.message });
    onSaved?.();
  };

  const avatarUrl = auth.profile?.avatarUrl ?? null;

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={[styles.avatarRow, { gap: theme.spacing.lg }]}>
        <Pressable
          onPress={() => void changeAvatar()}
          disabled={avatarBusy}
          accessibilityRole="button"
          accessibilityLabel={avatarUrl ? 'Change profile picture' : 'Add a profile picture (optional)'}
          accessibilityState={{ busy: avatarBusy }}
          style={({ pressed }) => ({ opacity: pressed || avatarBusy ? 0.6 : 1 })}
        >
          <ProfileAvatar name={displayName || null} imageUrl={avatarUrl} size={72} editable />
        </Pressable>
        <View style={styles.avatarText}>
          <AppText variant="title">Profile picture</AppText>
          <AppText variant="small" color="textSecondary">
            Optional. Tap the picture to {avatarUrl ? 'change it' : 'add one'}.
          </AppText>
          {avatarUrl ? (
            <SecondaryTextButton
              label="Remove picture"
              color="textSecondary"
              disabled={avatarBusy}
              onPress={() => void removeAvatar()}
            />
          ) : null}
        </View>
      </View>

      <AuthTextField
        label="Full name"
        value={displayName}
        onChangeText={(t) => {
          setDisplayName(t);
          if (errors.displayName) setErrors((e) => ({ ...e, displayName: null }));
        }}
        error={errors.displayName}
        helper="How MathArt Connect greets you."
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => programmeRef.current?.focus()}
        submitBehavior="submit"
      />
      <View
        accessible
        accessibilityLabel={`Institution, ${APP_INSTITUTION}`}
        style={[
          styles.fixed,
          {
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md - 2,
            backgroundColor: theme.colors.surfaceMuted,
          },
        ]}
      >
        <GraduationCap size={18} color={theme.colors.primary} />
        <View style={styles.avatarText}>
          <AppText variant="small" color="textSecondary">
            Institution
          </AppText>
          <AppText variant="title">{APP_INSTITUTION}</AppText>
        </View>
      </View>
      <AuthTextField
        ref={programmeRef}
        label="Programme / Course"
        value={programme}
        onChangeText={setProgramme}
        error={errors.programme}
        placeholder="e.g. Bachelor of Science"
        helper="Optional."
        autoCapitalize="sentences"
        returnKeyType="done"
      />
      <ChoiceChips label="Year of study" options={YEARS} value={year} onChange={setYear} helper="Optional." />

      <FormError message={message?.text} tone={message?.tone} />
      <PrimaryButton label={submitLabel} loadingLabel="Saving profile" loading={saving} onPress={() => void submit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarText: { flex: 1, gap: 2, alignItems: 'flex-start' },
  fixed: { flexDirection: 'row', alignItems: 'center' },
});
