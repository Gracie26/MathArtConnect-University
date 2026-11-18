import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { estimateTopicMinutes, formatStudyTime } from '@/content/estimate';
import { integrationTopic } from '@/content/topics/integration';
import { devLessonProgress } from '@/services/repositories/lessonProgress/devLessonProgress';
import { seedSignedInLearner } from '@/test-utils/auth';

// Full-router renders compile the whole app on a cold cache.
jest.setTimeout(240_000);

let learnerId = '';

beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

const SUBTOPICS = [
  'Understanding Integration',
  'Basic Integration Rules',
  'Substitution',
  'Partial Fractions',
  'Algebraic and Trigonometric Substitution',
  'Integration by Parts',
  'Advanced Integration Patterns',
];

describe('Integration in Learn', () => {
  test('Learn lists Integration as a real topic with real progress', async () => {
    await renderRouter('./app', { initialUrl: '/learn' });
    expect(await screen.findByText('Integration')).toBeOnTheScreen();
    // Study time is calculated from the content, never typed in.
    expect(
      screen.getByText(`7 subtopics · About ${formatStudyTime(estimateTopicMinutes(integrationTopic))}`),
    ).toBeOnTheScreen();
    // The topic to work on now is the one full card with the primary action; the others are compact rows.
    expect(await screen.findByText('0% complete')).toBeOnTheScreen();
    expect(screen.getByText('All topics')).toBeOnTheScreen();
    expect(screen.getByText('Integration as a Process of Finding the Area Under the Graph')).toBeOnTheScreen();
    expect(screen.queryByText('Calculus Focus Topic')).toBeNull(); // demo content never listed
  });
});

describe('Integration topic page', () => {
  test('shows the approved structure: header, progress, continue, 7 subtopics, practice, activities', async () => {
    await renderRouter('./app', { initialUrl: '/topic/integration' });

    expect(
      await screen.findByText(
        'Understand integration as reversing differentiation and learn how to recognise and apply appropriate integration techniques.',
      ),
    ).toBeOnTheScreen();
    expect(await screen.findByText('Topic progress')).toBeOnTheScreen();
    expect(screen.getByText('0 of 7 subtopics completed')).toBeOnTheScreen();
    expect(screen.getByText('START LEARNING')).toBeOnTheScreen();
    expect(
      screen.getByText(`About ${formatStudyTime(estimateTopicMinutes(integrationTopic))} in total`),
    ).toBeOnTheScreen();
    for (const [index, title] of SUBTOPICS.entries()) {
      expect(screen.getByLabelText(new RegExp(`^Subtopic ${index + 1}: ${title}\\.`))).toBeOnTheScreen();
    }
    // Only the current subtopic is open on the learning path.
    expect(screen.getByLabelText(/^Subtopic 1: Understanding Integration\./)).toBeExpanded();
    expect(screen.getByLabelText(/^Subtopic 2: Basic Integration Rules\./)).toBeCollapsed();
    // Practice modes are one tap away, folded until asked for.
    expect(screen.queryByText('Guided Practice')).toBeNull();
    await userEvent.setup().press(screen.getByRole('button', { name: /^Practice\./ }));
    expect(await screen.findByText('Guided Practice')).toBeOnTheScreen();
    expect(screen.getByText('Independent Practice')).toBeOnTheScreen();
    expect(screen.getByText('Challenge Mode')).toBeOnTheScreen();
    expect(screen.getByText('Explore')).toBeOnTheScreen();
    expect(screen.getByText('Play')).toBeOnTheScreen();
    expect(screen.getByText('Create')).toBeOnTheScreen();
    // No source numbering as labels.
    expect(screen.queryByText(/Chapter 1|Exercise 1\.|Tutorial 1/)).toBeNull();
  });

  test.each(SUBTOPICS.map((title, index) => [index + 1, title]))(
    'subtopic %i (%s) opens its lesson',
    async (index, title) => {
      const user = userEvent.setup();
      await renderRouter('./app', { initialUrl: '/topic/integration' });
      const row = await screen.findByLabelText(new RegExp(`^Subtopic ${index}: ${title}\\.`));
      // Later subtopics open on tap; the current one is open already.
      if (index > 1) await user.press(row);
      await user.press(await screen.findByRole('button', { name: `Start ${title}` }));
      expect(await screen.findByText(`INTEGRATION · SUBTOPIC ${index} OF 7`)).toBeOnTheScreen();
      expect(screen.getByText('CONCEPT')).toBeOnTheScreen();
    },
  );
});

describe('lesson shell and saved progress', () => {
  test('continuing saves real progress, which Home and the topic page then show', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/understanding-integration' });

    expect(await screen.findByText('What does integration undo?')).toBeOnTheScreen();
    expect(screen.getByText('Anti-derivative')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('One derivative, many functions')).toBeOnTheScreen();
    expect(screen.getByText('Why +C appears')).toBeOnTheScreen();
    expect(screen.getByLabelText(/Step 1 of 9: Concept, completed/)).toBeOnTheScreen();

    // The Explore step opens its real tool.
    await user.press(screen.getByLabelText(/Step 3 of 9: Explore/));
    expect(await screen.findByLabelText(/^Open Family of Curves\. Explore tool\./)).toBeOnTheScreen();
    expect(screen.queryByText('Coming in a later update')).toBeNull();

    // Try it is real App practice now: feedback on the chosen answer, Try again, then Correct.
    await user.press(screen.getByLabelText(/Step 4 of 9: Try it/));
    expect(await screen.findByText('Recognise an anti-derivative')).toBeOnTheScreen();
    expect(screen.queryByText('Coming in a later update')).toBeNull();
    expect(screen.getAllByText(/^APP PRACTICE/).length).toBeGreaterThan(0);
    await user.press(screen.getAllByRole('radio')[1]!);
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText('Not quite')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    await user.press(screen.getAllByRole('radio')[0]!);
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText('Correct')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Next question' })).toBeOnTheScreen();

    // Saved progress: exactly the one step the learner worked through.
    const saved = await devLessonProgress.listForUnits(learnerId, ['integration-understanding']);
    expect(saved.ok && saved.data.map((e) => e.sectionKey)).toEqual(['concept']);
  });

  test('a worked example reveals one step at a time', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/basic-integration-rules?step=worked-example' });

    // All three printed examples of this subtopic are present.
    expect(await screen.findByText('A sum of two powers')).toBeOnTheScreen();
    expect(screen.getByText('Several rules at once')).toBeOnTheScreen();
    expect(screen.getByText('A logarithm and a root')).toBeOnTheScreen();
    expect(screen.queryByText('RESULT')).toBeNull();

    // Second example: "Several rules at once".
    await user.press(screen.getAllByRole('button', { name: 'Show the first step' })[1]!);
    expect(screen.getByText('Integrate term by term and take the constants outside.')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Show the full solution' })[1]!);
    expect(await screen.findByText('RESULT')).toBeOnTheScreen();
  });

  test('"Why this step?" explains a step on request', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/substitution?step=see-it' });
    await user.press(await screen.findByRole('button', { name: 'Show the full solution' }));
    const why = screen.getByRole('button', { name: 'Why this step?' });
    expect(why).toBeCollapsed();
    await user.press(why);
    expect(screen.getByRole('button', { name: 'Hide the reason' })).toBeExpanded();
  });

  test('a returning learner resumes at their next unfinished step, and the topic shows it', async () => {
    await devLessonProgress.completeSection(learnerId, 'integration-understanding', 'concept');
    await devLessonProgress.completeSection(learnerId, 'integration-understanding', 'see-it');

    await renderRouter('./app', { initialUrl: '/topic/integration' });
    expect(await screen.findByText('CONTINUE LEARNING')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Subtopic 1: Understanding Integration\. in progress, \d+ percent\./)).toBeExpanded();
    expect(screen.getByRole('button', { name: 'Continue Understanding Integration' })).toBeOnTheScreen();
  });

  test('opening a subtopic without a step resumes where the learner left off', async () => {
    await devLessonProgress.completeSection(learnerId, 'integration-understanding', 'concept');
    await devLessonProgress.completeSection(learnerId, 'integration-understanding', 'see-it');
    await renderRouter('./app', { initialUrl: '/topic/integration/understanding-integration' });
    // The next step in lesson order is Explore.
    expect(await screen.findByLabelText(/^Open Family of Curves\. Explore tool\./)).toBeOnTheScreen();
  });
});

describe('source practice in lessons', () => {
  test('Try it: write and check working, check the answer, and get help in stages', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/substitution?step=try-it' });
    expect(await screen.findByText('Try these')).toBeOnTheScreen();
    expect(screen.getByText('2 questions')).toBeOnTheScreen();
    expect(screen.queryByText(/on paper/)).toBeNull();

    // Second question: ∫ sec²(1 − 4x) dx.
    await user.press(screen.getAllByRole('button', { name: 'Start working' })[1]!);
    expect(screen.getByText('MY WORKING')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Step 1'), 'u = 1 - 4x');
    await user.press(screen.getByRole('button', { name: 'Check step 1' }));
    expect(await screen.findByText(/^Noted: u = 1 - 4x\./)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByLabelText('Step 2'), 'du = 4 dx');
    await user.press(screen.getByRole('button', { name: 'Check step 2' }));
    expect(await screen.findByText(/differential does not match/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Edit step 2' }));
    await user.clear(screen.getByLabelText('Step 2'));
    await user.type(screen.getByLabelText('Step 2'), 'du = -4 dx');
    await user.press(screen.getByRole('button', { name: 'Check step 2' }));
    expect(await screen.findByText('Correct: the differentials match.')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Final answer'), '-1/4 tan(1-4x)');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText(/Remember to add the constant of integration/)).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Final answer'), ' + C');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText(/^Correct!/)).toBeOnTheScreen();

    // Help: three hints, then the walkthrough, all labelled as app guidance.
    for (let i = 0; i < 3; i++) await user.press(screen.getByRole('button', { name: 'Hint' }));
    expect(
      screen.getByText(/App guidance · written for this app, not an official UNAM or lecturer solution/),
    ).toBeOnTheScreen();
    expect(screen.getByText('Hint 1 · Think about it')).toBeOnTheScreen();
    expect(screen.getByText('Hint 3 · Next action')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: "I'm stuck" }));
    expect(screen.getByRole('button', { name: 'Show Full Walkthrough' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Show Full Walkthrough' }));
    expect(await screen.findByText('Answer (app guidance)')).toBeOnTheScreen();
  });

  test('Practice modes open every question from the Practice section of the topic page', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration' });
    await user.press(await screen.findByRole('button', { name: /^Practice\./ }));
    await user.press(await screen.findByRole('button', { name: /^Challenge Mode\./ }));
    expect(
      await screen.findByText(
        'Hardest questions first. Hints unlock after your first answer check. No penalties for mistakes.',
      ),
    ).toBeOnTheScreen();
    // 97 questions plus Tutorial 2 Question 1(a)–(g), minus the 6 withheld for review.
    expect(screen.getByText('98 questions')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Show 6. Integration by Parts' }));
    expect(await screen.findByText('9 questions')).toBeOnTheScreen();
  });

  test('Basic Integration Rules: Try it is App practice with a quick check and My Working questions', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/basic-integration-rules?step=try-it' });
    expect(await screen.findByText('Choose the rule')).toBeOnTheScreen();
    expect(screen.getByText('Apply the rules')).toBeOnTheScreen();
    expect(screen.getByText('6 questions')).toBeOnTheScreen();
    expect(screen.queryByText('Coming in a later update')).toBeNull();
    // The hint is app guidance, on request.
    await user.press(screen.getByRole('button', { name: 'Show hint' }));
    expect(screen.getByText('APP GUIDANCE')).toBeOnTheScreen();
    // Every question is labelled App practice, with no source numbering.
    expect(screen.getAllByText(/^APP PRACTICE/).length).toBeGreaterThanOrEqual(6);
    // ("Question 1 of 3" is the quick check's own counter, so only source labels are ruled out here.)
    expect(screen.queryByText(/Q\d|Tutorial 1/)).toBeNull();
  });

  test('an exercise withheld for review is not listed to learners', async () => {
    await renderRouter('./app', {
      initialUrl: '/topic/integration/algebraic-and-trigonometric-substitution?step=try-it',
    });
    expect(await screen.findByText('1 question · 1 more after lecturer review')).toBeOnTheScreen();
  });

  test('Practise lists every tutorial question for the subtopic, grouped by method, without source numbers', async () => {
    await renderRouter('./app', { initialUrl: '/topic/integration/integration-by-parts?step=practise' });
    expect(await screen.findByText('Integration by parts')).toBeOnTheScreen();
    expect(screen.getByText('Integration by parts, more than once')).toBeOnTheScreen();
    // 8 Tutorial 1 parts (one needs its assumptions confirmed first) and Tutorial 2 Question 1(a).
    expect(screen.getAllByText(/^PRACTICE \d+$/)).toHaveLength(8);
    expect(screen.getAllByText('Extension').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Q\d|Tutorial 1|Question \d/)).toBeNull();
  });

  test('the table of substitutions shows every row', async () => {
    await renderRouter('./app', {
      initialUrl: '/topic/integration/algebraic-and-trigonometric-substitution?step=concept',
    });
    // The table card, and the course-notes chip for Table 1.1, both carry this title.
    expect((await screen.findAllByText('Suggested substitutions')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText(/^Type of integrand: /)).toHaveLength(10);
    expect(screen.getAllByText(/awaiting lecturer review/).length).toBeGreaterThan(0);
  });
});
