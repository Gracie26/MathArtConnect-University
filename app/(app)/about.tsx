import Constants from 'expo-constants';
import { router } from 'expo-router';
import { FileText, Shield } from 'lucide-react-native';
import { View } from 'react-native';

import { Wordmark } from '@/components/brand/Wordmark';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { ListRow, ListSection } from '@/components/ui/ListRow';
import { listLearnerTopics } from '@/content/registry';
import { useAppTheme } from '@/hooks/useAppTheme';

/** About MathArt Connect: what the app is, its course material, its version, and the legal pages. */
export default function AboutScreen() {
  const theme = useAppTheme();
  const version = Constants.expoConfig?.version ?? '';
  const topics = listLearnerTopics();

  return (
    <Screen>
      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <Wordmark size={28} />
        <AppText variant="body">
          MathArt Connect brings calculus to life through interactive graphs, games, creative mathematical art and
          practice with step-by-step checking. Designed to support Calculus learning.
        </AppText>
        <AppText variant="small" color="textSecondary">
          {`Version ${version}`}
        </AppText>
      </View>

      <ListSection title="Course material">
        {topics.map((t, i) => (
          <ListRow key={t.id} first={i === 0} label={`Topic ${i + 1}: ${t.title}`} value={t.course?.code ?? ''} />
        ))}
      </ListSection>
      <AppText variant="small" color="textSecondary">
        Lessons follow the University of Namibia S3512MC Calculus II notes and tutorials. Hints, walkthroughs and
        solutions written for the app are labelled as app guidance and are not official UNAM solutions.
      </AppText>

      <ListSection title="Legal">
        <ListRow first icon={FileText} label="Terms of Use" onPress={() => router.push('/terms')} />
        <ListRow icon={Shield} label="Privacy Policy" onPress={() => router.push('/privacy')} />
      </ListSection>
    </Screen>
  );
}
