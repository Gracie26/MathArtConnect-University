import { readEnv } from '@/config/env';
import { resolveActiveTopic } from '@/content/activeTopic';
import { listLearnerTopics } from '@/content/registry';
import { LESSON_STEP_KINDS, LESSON_STEP_LABELS, LESSON_STEP_STAGE } from '@/content/types';
import { isActiveResearchParticipant, NOT_PARTICIPATING } from '@/types/research';

describe('readEnv', () => {
  test('missing Supabase values → not configured (app still runs)', () => {
    expect(readEnv({}).isSupabaseConfigured).toBe(false);
    expect(readEnv({ EXPO_PUBLIC_SUPABASE_URL: '  ', EXPO_PUBLIC_SUPABASE_ANON_KEY: '' }).isSupabaseConfigured).toBe(
      false,
    );
  });

  test('invalid URL → not configured', () => {
    expect(
      readEnv({ EXPO_PUBLIC_SUPABASE_URL: 'not a url', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'key' }).isSupabaseConfigured,
    ).toBe(false);
  });

  test('valid values → configured', () => {
    const env = readEnv({
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key',
    });
    expect(env.isSupabaseConfigured).toBe(true);
  });
});

describe('resolveActiveTopic', () => {
  test('defaults to Integration, the first real topic', () => {
    const topic = resolveActiveTopic();
    expect(topic.id).toBe('integration');
    expect(topic.isDemo).toBe(false);
  });

  test('ignores unknown topic ids instead of crashing', () => {
    expect(resolveActiveTopic({ remoteActiveTopicId: 'limits-not-shipped' }).id).toBe('integration');
  });

  test('the demo topic stays available as infrastructure but is never listed for learners', () => {
    expect(resolveActiveTopic({ envOverride: 'demo-calculus-focus' }).isDemo).toBe(true);
    expect(listLearnerTopics().some((t) => t.isDemo)).toBe(false);
  });

  test('every lesson step kind has a label and a learner-journey stage', () => {
    for (const kind of LESSON_STEP_KINDS) {
      expect(LESSON_STEP_LABELS[kind]).toBeTruthy();
      expect(LESSON_STEP_STAGE[kind]).toBeDefined();
    }
  });
});

describe('research participation', () => {
  test('a normal account is not a research participant', () => {
    expect(isActiveResearchParticipant(NOT_PARTICIPATING)).toBe(false);
  });

  test('requires recorded consent version and date, and no withdrawal', () => {
    const consented = {
      researchParticipant: true,
      researchConsentGiven: true,
      researchConsentVersion: 'v-test',
      researchConsentDate: '2026-01-01T00:00:00Z',
      researchWithdrawnAt: null,
    };
    expect(isActiveResearchParticipant(consented)).toBe(true);
    expect(isActiveResearchParticipant({ ...consented, researchConsentVersion: null })).toBe(false);
    expect(isActiveResearchParticipant({ ...consented, researchWithdrawnAt: '2026-02-01T00:00:00Z' })).toBe(false);
  });
});
