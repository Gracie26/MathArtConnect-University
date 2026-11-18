/**
 * Practice sources shared by the Practice hub, the topic Practice screen and
 * the practice cards, for every topic.
 *
 * Topics 1 and 2 keep their two sources (chapter practice and one tutorial).
 * A topic with several tutorials lists its own (Topic 3: Tutorial 3,
 * Tutorial 4 and App practice).
 */
import type { PracticeItem, PracticeSourceOption, SourceDocumentId, TopicDefinition } from './types';

/** The sources a learner can filter a topic's practice by, in display order. */
export function practiceSourceOptions(topic: TopicDefinition): PracticeSourceOption[] {
  if (topic.practiceSourceList) return topic.practiceSourceList;
  const labels = topic.practiceSources ?? { chapter: 'Chapter practice', tutorial: 'Tutorial practice' };
  return [
    {
      id: 'chapter',
      label: labels.chapter,
      description: 'The “You Try It” questions and exercises from the course notes',
      sourceTypes: ['you-try-it', 'chapter-exercise', 'app-practice'],
    },
    {
      id: 'tutorial',
      label: labels.tutorial,
      description: 'Every tutorial question for this topic, filterable by subtopic and method',
      sourceTypes: ['tutorial-question'],
    },
  ];
}

/** True if the item belongs to the source (every item belongs to "no source"). */
export function matchesPracticeSource(item: PracticeItem, option: PracticeSourceOption | undefined): boolean {
  if (!option) return true;
  if (option.documents && !option.documents.includes(item.source.document)) return false;
  if (option.sourceTypes && !option.sourceTypes.includes(item.sourceType)) return false;
  return true;
}

/**
 * Documents whose name and question number are shown on each practice card
 * (Topics 3 to 5: "every question shows its source"). Topics 1 and 2 keep source
 * question numbers internal, so their documents are not listed.
 */
const SHOWN_SOURCES: Partial<Record<SourceDocumentId, string>> = {
  'unam-s3512mc-tut3-2026': 'Tutorial 3',
  'unam-s3512mc-tut4-2026': 'Tutorial 4',
  'unam-s3512mc-tut5-2026': 'Tutorial 5',
  'unam-s3512mc-tut6-2026': 'Tutorial 6',
};

/** The learner-facing source of a practice item ("Tutorial 3 · Q10(iv)"), or null if it is not shown. */
export function practiceSourceLabel(item: PracticeItem): string | null {
  if (item.sourceType === 'app-practice') return null; // already labelled APP PRACTICE on the card
  const name = SHOWN_SOURCES[item.source.document];
  if (!name) return null;
  return item.source.item ? `${name} · ${item.source.item}` : name;
}
