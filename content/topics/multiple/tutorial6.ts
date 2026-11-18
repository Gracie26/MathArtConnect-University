/**
 * Every Tutorial 6 item (66: questions 1–34 and their printed parts), in the
 * printed order. See tutorial6a.ts (Q1–Q17) and tutorial6b.ts (Q18–Q34).
 */
import type { PracticeItem } from '../../types';

import { TUTORIAL6_PART_A } from './tutorial6a';
import { TUTORIAL6_PART_B } from './tutorial6b';

const SUBS = ['', 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
const order = (item: PracticeItem) =>
  Number(item.sourceQuestion!.slice(1)) * 100 + SUBS.indexOf(item.sourceSubquestion ?? '');

export const TUTORIAL6_ITEMS: PracticeItem[] = [...TUTORIAL6_PART_A, ...TUTORIAL6_PART_B].sort(
  (a, b) => order(a) - order(b),
);
