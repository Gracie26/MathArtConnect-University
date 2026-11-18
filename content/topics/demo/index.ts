/**
 * ⚠ DEVELOPMENT / DEMO CONTENT ONLY ⚠
 *
 * Placeholder topic that exercises the learning architecture (every lesson
 * step kind) without real teaching material. Kept as reusable test
 * infrastructure; it is never the default topic and is hidden from learners.
 */
import { LESSON_STEP_KINDS, LESSON_STEP_LABELS, type TopicDefinition } from '../../types';

const PLACEHOLDER = 'Development placeholder. Contains no teaching material.';

export const demoTopic: TopicDefinition = {
  id: 'demo-calculus-focus',
  family: 'demo',
  title: 'Calculus Focus Topic',
  subtitle: 'Development placeholder',
  description: PLACEHOLDER,
  contentVersion: '0.0.0-demo',
  isDemo: true,
  units: [
    {
      id: 'demo-unit-1',
      slug: 'demo-unit',
      title: 'Demo unit',
      summary: PLACEHOLDER,
      glyph: 'wave',
      tone: 'blue',
      source: [],
      steps: LESSON_STEP_KINDS.map((kind) => ({
        key: kind,
        kind,
        title: LESSON_STEP_LABELS[kind],
        required: false,
        availability: { status: 'available' as const },
        blocks: [{ type: 'paragraph' as const, text: PLACEHOLDER }],
      })),
    },
  ],
  practiceModes: [],
  activities: [],
  questions: [],
};
