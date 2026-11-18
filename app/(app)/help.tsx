import { View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';

const HELP: { q: string; a: string }[] = [
  {
    q: 'How is my working checked?',
    a: 'In My Working, write each step and press Check step. The app compares your expressions with the question’s mathematics at several points, so any equivalent form is accepted. Check answer marks your final answer and saves the attempt.',
  },
  {
    q: 'What do APP GUIDANCE and APP-GENERATED SOLUTION mean?',
    a: 'They are written for this app, not by your lecturer, and are pending lecturer review. Official worked examples from the notes are shown as printed.',
  },
  {
    q: 'How do streaks and XP work?',
    a: 'A study day counts when you check practice, complete a lesson step, explore, play, create or reflect. Days follow Namibia time. XP is earned once a day for each Explore tool, game, reflection or written response, so repeating something the same day does not add more.',
  },
  {
    q: 'How do I earn badges and weekly goals?',
    a: 'Badges and weekly goals come from your saved learning, never from opening a page. Open Rewards & Weekly Goals from Profile to see exactly what each one needs.',
  },
  {
    q: 'How do I read a graph in Explore or Create?',
    a: 'Use Math view to show axes, a light grid and numbers, and tap a vector, facet or point to read its coordinates. Art view hides the coordinate structure for a cleaner picture; switch back at any time.',
  },
  {
    q: 'Where is my saved work?',
    a: 'Open My Work from Profile for your attempts, mistakes, games and saved creations. Saved Create projects also appear under My saved projects in each studio.',
  },
];

/** Help: short answers to common questions, accurate for this version of the app. */
export default function HelpScreen() {
  const theme = useAppTheme();
  return (
    <Screen>
      {HELP.map((item) => (
        <View key={item.q} style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.xs }]}>
          <AppText variant="title" accessibilityRole="header">
            {item.q}
          </AppText>
          <AppText variant="small" color="textSecondary">
            {item.a}
          </AppText>
        </View>
      ))}
    </Screen>
  );
}
