import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '@/components/forms/AuthTextField';
import { CURVE_COLOR_NAMES, curvePalette } from '@/components/graph/plot';
import { MathPreview } from '@/components/practice/MathInput';
import { AppText } from '@/components/ui/AppText';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { compileLayer, DEFAULT_PLACEMENT, fmt, type GraphLayer, isPlaced } from '@/lib/graph/sample';
import { parseNumber, type StudioConfig } from '@/lib/graph/studio';

const numberText = (value: number | null) => (value === null ? '' : fmt(value).replace('−', '-'));

/** Examples shown when an equation cannot be drawn. */
const SUPPORTED = {
  cartesian: ['sin(x)', 'a*cos(2x) + c', 'x^2/2 - 1', 'sqrt(4 - x^2)', 'e^(-x^2)'],
  polar: ['cos(3θ)', 'a*sin(2θ)', '1 + cos(θ)', '0.5'],
} as const;

function Toggle({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.toggle,
        {
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          minHeight: theme.touchTarget.min,
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

/**
 * Bottom-sheet editor for one equation layer: name, equation, domain and range
 * restrictions, position for polar curves, repetition or mirroring, colour and
 * line width. The equation is validated live with the same safe parser that
 * draws it. Save and Cancel stay visible above the keyboard.
 */
export function LayerEditor({
  layer,
  parameterNames,
  config,
  onSave,
  onCancel,
}: {
  layer: GraphLayer;
  parameterNames: string[];
  config: StudioConfig;
  onSave: (layer: GraphLayer) => void;
  onCancel: () => void;
}) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const colors = curvePalette(theme);
  const [draft, setDraft] = useState(layer);
  const [domainStart, setDomainStart] = useState(numberText(layer.domain.start));
  const [domainEnd, setDomainEnd] = useState(numberText(layer.domain.end));
  const [rangeMin, setRangeMin] = useState(numberText(layer.range.min));
  const [rangeMax, setRangeMax] = useState(numberText(layer.range.max));
  const placement = layer.placement ?? DEFAULT_PLACEMENT;
  const [placeH, setPlaceH] = useState(numberText(placement.h));
  const [placeK, setPlaceK] = useState(numberText(placement.k));
  const [placeScale, setPlaceScale] = useState(numberText(placement.scale));
  const [placeRotation, setPlaceRotation] = useState(numberText(placement.rotation));
  const compiled = compileLayer(draft, parameterNames, config.functions);
  const variable = draft.kind === 'polar' ? 'θ' : 'x';

  const fieldError = (text: string) =>
    text.trim() !== '' && parseNumber(text) === null ? 'Enter a number, such as 2, -1.5 or pi/2.' : null;
  const start = parseNumber(domainStart);
  const end = parseNumber(domainEnd);
  const min = parseNumber(rangeMin);
  const max = parseNumber(rangeMax);
  const scale = parseNumber(placeScale);
  const orderError =
    start !== null && end !== null && !(end > start)
      ? `End ${variable} must be greater than start ${variable}.`
      : min !== null && max !== null && !(max > min)
        ? 'The largest y must be greater than the smallest y.'
        : draft.kind === 'polar' && scale !== null && !(scale > 0)
          ? 'The scale must be greater than 0.'
          : null;
  const numberFields =
    draft.kind === 'polar'
      ? [domainStart, domainEnd, placeH, placeK, placeScale, placeRotation]
      : [domainStart, domainEnd, rangeMin, rangeMax];
  const invalid =
    !compiled.ok || draft.name.trim() === '' || numberFields.some((t) => fieldError(t) !== null) || orderError !== null;

  const save = () => {
    const next: GraphLayer = {
      ...draft,
      name: draft.name.trim().slice(0, 40),
      domain: { start, end },
      range: draft.kind === 'cartesian' ? { min, max } : { min: null, max: null },
    };
    if (draft.kind === 'polar') {
      const p = {
        h: parseNumber(placeH) ?? 0,
        k: parseNumber(placeK) ?? 0,
        scale: scale ?? 1,
        rotation: parseNumber(placeRotation) ?? 0,
      };
      if (isPlaced(p)) next.placement = p;
      else delete next.placement;
    } else delete next.placement;
    onSave(next);
  };

  const numberField = (label: string, value: string, onChange: (t: string) => void, helper?: string) => (
    <View style={styles.half}>
      <AuthTextField
        label={label}
        value={value}
        onChangeText={onChange}
        error={fieldError(value)}
        helper={helper}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
      />
    </View>
  );

  return (
    <Modal transparent animationType="slide" onRequestClose={onCancel} visible statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.lg,
              borderTopRightRadius: theme.radius.lg,
            },
          ]}
          accessibilityViewIsModal
        >
          <ScrollView
            contentContainerStyle={{ padding: theme.layout.screenGutter, gap: theme.spacing.md }}
            keyboardShouldPersistTaps="handled"
          >
            <AppText variant="h2">Equation layer</AppText>
            <AuthTextField
              label="Layer name"
              value={draft.name}
              onChangeText={(name) => setDraft({ ...draft, name })}
            />
            {config.layerKinds.length > 1 ? (
              <View style={[styles.row, { gap: theme.spacing.sm }]} accessibilityRole="radiogroup">
                <Toggle
                  label="y = f(x)"
                  selected={draft.kind === 'cartesian'}
                  onPress={() => setDraft({ ...draft, kind: 'cartesian' })}
                />
                <Toggle
                  label="Polar r = f(θ)"
                  selected={draft.kind === 'polar'}
                  onPress={() => setDraft({ ...draft, kind: 'polar' })}
                />
              </View>
            ) : null}
            <AuthTextField
              label={draft.kind === 'polar' ? 'r =' : 'y ='}
              value={draft.expression}
              onChangeText={(expression) => setDraft({ ...draft, expression })}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={draft.kind === 'polar' ? 'e.g. cos(a θ)' : 'e.g. a sin(x) + c'}
              helper={`Use ${variable}${parameterNames.length ? `, the parameters ${parameterNames.join(', ')}` : ''}, e and π. You can type theta for θ.`}
            />
            {compiled.ok ? (
              <MathPreview text={`${draft.kind === 'polar' ? 'r' : 'y'} = ${draft.expression}`} />
            ) : (
              <View
                accessibilityLiveRegion="polite"
                style={[
                  styles.notice,
                  { backgroundColor: theme.colors.achievementSoft, borderRadius: theme.radius.sm, gap: 4 },
                ]}
              >
                <AppText variant="caption" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  We couldn’t graph this expression yet.
                </AppText>
                <AppText variant="small">{compiled.error}</AppText>
                <AppText variant="small" color="textSecondary">
                  {`Equations like these work: ${SUPPORTED[draft.kind].join(', ')}. Only mathematics is read: functions such as sin, cos, sqrt and ln, numbers, ${variable}, your parameters, e and π. Code is never run.`}
                </AppText>
              </View>
            )}

            <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              {`Restrict ${variable} (leave blank for no restriction)`}
            </AppText>
            <View style={[styles.row, { gap: theme.spacing.sm }]}>
              {numberField(`Start ${variable}`, domainStart, setDomainStart)}
              {numberField(`End ${variable}`, domainEnd, setDomainEnd)}
            </View>
            {draft.kind === 'cartesian' ? (
              <View style={[styles.row, { gap: theme.spacing.sm }]}>
                {numberField('Smallest y', rangeMin, setRangeMin)}
                {numberField('Largest y', rangeMax, setRangeMax)}
              </View>
            ) : (
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  Position on the canvas
                </AppText>
                <AppText variant="small" color="textSecondary">
                  Drawn at x = h + s·r(θ)cos(θ + φ), y = k + s·r(θ)sin(θ + φ). The equation r(θ) stays the same.
                </AppText>
                <View style={[styles.row, { gap: theme.spacing.sm }]}>
                  {numberField('Horizontal offset h', placeH, setPlaceH)}
                  {numberField('Vertical offset k', placeK, setPlaceK)}
                </View>
                <View style={[styles.row, { gap: theme.spacing.sm }]}>
                  {numberField('Scale s', placeScale, setPlaceScale)}
                  {numberField('Rotation φ (degrees)', placeRotation, setPlaceRotation)}
                </View>
              </View>
            )}
            {orderError ? (
              <AppText variant="small" color="error">
                {orderError}
              </AppText>
            ) : null}

            {config.mode === 'full' ? (
              draft.kind === 'polar' ? (
                <View style={{ gap: theme.spacing.xs }}>
                  <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                    Rotated copies (symmetry)
                  </AppText>
                  <View style={[styles.row, { gap: theme.spacing.sm }]}>
                    {[1, 2, 3, 4, 6, 8].map((n) => (
                      <Toggle
                        key={n}
                        label={n === 1 ? 'None' : `${n}`}
                        selected={draft.repeat === n}
                        onPress={() => setDraft({ ...draft, repeat: n })}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <Toggle
                  label="Mirror in the y-axis"
                  selected={draft.mirror}
                  onPress={() => setDraft({ ...draft, mirror: !draft.mirror })}
                />
              )
            ) : null}
            <Toggle
              label="Dashed line"
              selected={draft.dashed === true}
              onPress={() => setDraft({ ...draft, dashed: !draft.dashed })}
            />

            <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              Colour
            </AppText>
            <View style={[styles.row, { gap: theme.spacing.sm }]} accessibilityRole="radiogroup">
              {colors.map((color, index) => (
                <Pressable
                  key={CURVE_COLOR_NAMES[index]}
                  onPress={() => setDraft({ ...draft, color: index })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: draft.color === index }}
                  accessibilityLabel={`${CURVE_COLOR_NAMES[index]} line`}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: color,
                      borderColor: draft.color === index ? theme.colors.textPrimary : theme.colors.surface,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={[styles.row, { gap: theme.spacing.sm }]} accessibilityRole="radiogroup">
              {[
                ['Thin', 1.5],
                ['Medium', 2.5],
                ['Bold', 4],
              ].map(([label, width]) => (
                <Toggle
                  key={label as string}
                  label={label as string}
                  selected={draft.width === width}
                  onPress={() => setDraft({ ...draft, width: width as number })}
                />
              ))}
            </View>
          </ScrollView>
          <View
            style={[
              styles.footer,
              {
                gap: theme.spacing.sm,
                padding: theme.spacing.md,
                paddingBottom: theme.spacing.md + insets.bottom,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <LoadingButton variant="secondary" label="Cancel" onPress={onCancel} style={styles.grow} />
            <LoadingButton label="Save layer" onPress={save} disabled={invalid} style={styles.grow} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  half: { flex: 1, minWidth: 140 },
  grow: { flexGrow: 1, flexBasis: 0 },
  toggle: { paddingHorizontal: 12, justifyContent: 'center' },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3 },
  notice: { padding: 12 },
  footer: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
});
