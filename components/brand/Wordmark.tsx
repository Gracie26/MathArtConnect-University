import { StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/art/LogoMark';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

interface WordmarkProps {
  /** Logo tile size; text scales with it. */
  size?: number;
}

/** Logo mark + "MathArt Connect". A logo, not a heading: one label for screen readers. */
export function Wordmark({ size = 30 }: WordmarkProps) {
  const theme = useAppTheme();
  const fontSize = Math.round(size * 0.6);
  const textStyle = [
    styles.text,
    { fontSize, lineHeight: Math.round(fontSize * 1.33), fontFamily: theme.fontFamilies.bold },
  ];

  return (
    <View style={styles.row} accessible accessibilityLabel="MathArt Connect">
      <LogoMark size={size} />
      <AppText variant="title" style={textStyle}>
        MathArt
        <AppText variant="title" color="primary" style={textStyle}>
          {' Connect'}
        </AppText>
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { letterSpacing: -0.3 },
});
