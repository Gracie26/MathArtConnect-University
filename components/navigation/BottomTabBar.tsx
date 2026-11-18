import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * App tab bar: icon above label, teal selected state with a soft pill behind
 * the icon, grey inactive tabs. Respects the bottom safe-area inset and keeps
 * its items centred (max 560 dp) on tablet and desktop.
 */
export function BottomTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 6),
        },
      ]}
    >
      <View accessibilityRole="tablist" style={[styles.row, { height: theme.layout.tabBarHeight }]}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const { options } = descriptor;
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const color = focused ? theme.colors.tabActive : theme.colors.tabInactive;

          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}
            >
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: focused
                          ? theme.colors.tabIndicator
                          : pressed
                            ? theme.colors.surfacePressed
                            : 'transparent',
                      },
                    ]}
                  >
                    {options.tabBarIcon?.({ focused, color, size: 22 })}
                  </View>
                  <AppText
                    variant="small"
                    numberOfLines={1}
                    style={{
                      color,
                      fontFamily: focused ? theme.fontFamilies.semibold : theme.fontFamilies.medium,
                      fontSize: 11,
                    }}
                  >
                    {label}
                  </AppText>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', width: '100%', maxWidth: 560, alignSelf: 'center' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  indicator: { width: 52, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
