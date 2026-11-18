/**
 * Every Explore tool in the Visual Calculus Lab tells the student what to do: a goal, the controls to use
 * and what to look for ("How to use this lab", content/labGuides.ts).
 */
import { LAB_GUIDES } from '@/content/labGuides';
import { listLearnerTopics } from '@/content/registry';
import { parseTex, splitInlineMath } from '@/lib/math/tex';

const labs = listLearnerTopics()
  .flatMap((topic) =>
    topic.units.flatMap((unit) =>
      unit.steps.flatMap((step) =>
        step.blocks.flatMap((block) => (block.type === 'activities' ? block.activities : [])),
      ),
    ),
  )
  .filter((activity) => activity.kind === 'lab');

describe('How to use this lab', () => {
  test('every learner-visible Explore lab has a guide', () => {
    expect(labs.length).toBeGreaterThanOrEqual(31);
    const missing = [...new Set(labs.map((a) => a.id))].filter((id) => !LAB_GUIDES[id]);
    expect(missing).toEqual([]);
  });

  test('no guide is left over for a lab that does not exist', () => {
    const ids = new Set(labs.map((a) => a.id));
    expect(Object.keys(LAB_GUIDES).filter((id) => !ids.has(id))).toEqual([]);
  });

  test('each guide is short and its maths can be displayed', () => {
    for (const [id, guide] of Object.entries(LAB_GUIDES)) {
      for (const text of [guide.goal, guide.steps, guide.look]) {
        expect({ id, length: text.length <= 200 }).toEqual({ id, length: true });
        for (const part of splitInlineMath(text)) {
          if (part.type === 'math') expect(() => parseTex(part.value)).not.toThrow();
        }
      }
    }
  });
});
