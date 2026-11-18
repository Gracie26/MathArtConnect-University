import { buildTheme, contrastRatio, WCAG_AA } from '@/theme';
import { palette } from '@/theme/tokens/palette';

const schemes = ['light', 'dark'] as const;

describe.each(schemes)('%s theme contrast (WCAG AA)', (scheme) => {
  for (const highContrast of [false, true]) {
    const { colors } = buildTheme(scheme, highContrast);
    const label = highContrast ? 'high contrast' : 'standard';

    test(`${label}: body text on background and surface`, () => {
      expect(contrastRatio(colors.textPrimary, colors.background)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
      expect(contrastRatio(colors.textPrimary, colors.surface)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
      expect(contrastRatio(colors.textSecondary, colors.surface)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
      expect(contrastRatio(colors.textSecondary, colors.background)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
    });

    test(`${label}: text on filled roles`, () => {
      const pairs: [string, string][] = [
        [colors.onPrimary, colors.primary],
        [colors.onSecondary, colors.secondary],
        [colors.onAccent, colors.accent],
        [colors.onAchievement, colors.achievement],
        [colors.onSuccess, colors.success],
        [colors.onError, colors.error],
      ];
      for (const [fg, bg] of pairs) {
        expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
      }
    });

    test(`${label}: Continue Learning hero text and button`, () => {
      expect(contrastRatio(colors.onHero, colors.heroStart)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
      expect(contrastRatio(colors.onHero, colors.heroEnd)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
      expect(contrastRatio(colors.onHeroButton, colors.heroButton)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
    });

    test(`${label}: tab icons and links are distinguishable`, () => {
      expect(contrastRatio(colors.tabActive, colors.surface)).toBeGreaterThanOrEqual(WCAG_AA.uiComponent);
      expect(contrastRatio(colors.tabInactive, colors.surface)).toBeGreaterThanOrEqual(WCAG_AA.uiComponent);
      expect(contrastRatio(colors.link, colors.surface)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
    });
  }
});

describe('brand rules', () => {
  test('palette contains no purple / violet / indigo hues', () => {
    for (const [name, hex] of Object.entries(palette)) {
      expect(name).not.toMatch(/purple|violet|indigo/i);
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min < 24) continue; // neutral
      let hue = 0;
      if (max === r) hue = ((g - b) / (max - min)) * 60;
      else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
      else hue = (4 + (r - g) / (max - min)) * 60;
      if (hue < 0) hue += 360;
      // 235°–320° covers indigo through violet and purple.
      expect({ name, hue: Math.round(hue), purple: hue >= 235 && hue <= 320 }).toEqual(
        expect.objectContaining({ purple: false }),
      );
    }
  });
});
