/**
 * Learning-content model.
 *
 * Screens never hard-code mathematics. A topic is a TopicDefinition
 * registered in content/registry.ts; its subtopics (learning units) are
 * ordered lesson steps made of typed content blocks. Content lives in
 * content/topics/<id>/ and is rendered by reusable components, so adding or
 * correcting material never means editing a screen.
 *
 * Every block that comes from course material carries a SourceRef for
 * traceability. Source references are for authors and reviewers; they are
 * never shown to learners as the main label.
 */
import type { AreaStudioConfig } from '@/lib/art/areaArt';
import type { MiStudioConfig } from '@/lib/art/miArt';
import type { PaStudioConfig } from '@/lib/art/paArt';
import type { RnStudioConfig } from '@/lib/art/rnArt';
import type { FlowConfig } from '@/lib/graph/flow';
import type { StudioConfig } from '@/lib/graph/studio';
import type { FigureSpec } from '@/lib/figures/scene';
import type { ExtremaSpec, SurfaceSpec } from '@/lib/math/applications';
import type { DefiniteSpec } from '@/lib/math/definite';
import type { MultipleSpec } from '@/lib/math/multiple';
import type { PartialSpec } from '@/lib/math/partial';

/** Topic families (database check constraint on learning_topics.family). */
export type TopicFamily =
  | 'limits'
  | 'continuity'
  | 'derivatives'
  | 'applications-of-derivatives'
  | 'integration'
  | 'functions-and-graphs'
  | 'demo';

/** The learner journey every topic follows. */
export const LEARNER_JOURNEY = [
  'learn',
  'see',
  'manipulate',
  'create',
  'play',
  'practise',
  'reflect',
  'review',
] as const;
export type JourneyStage = (typeof LEARNER_JOURNEY)[number];

/**
 * The standard lesson flow. A subtopic uses the steps that make sense for
 * it, in this order; no step is added just to fill the template.
 */
export const LESSON_STEP_KINDS = [
  'concept',
  'see-it',
  'explore',
  'try-it',
  'worked-example',
  'practise',
  'play',
  'create',
  'reflect',
  'review',
] as const;
export type LessonStepKind = (typeof LESSON_STEP_KINDS)[number];

export const LESSON_STEP_LABELS: Record<LessonStepKind, string> = {
  concept: 'Concept',
  'see-it': 'See it',
  explore: 'Explore',
  'try-it': 'Try it',
  'worked-example': 'Worked example',
  practise: 'Practise',
  play: 'Play',
  create: 'Create',
  reflect: 'Reflect',
  review: 'Review',
};

export const LESSON_STEP_STAGE: Record<LessonStepKind, JourneyStage> = {
  concept: 'learn',
  'see-it': 'see',
  explore: 'manipulate',
  'try-it': 'practise',
  'worked-example': 'see',
  practise: 'practise',
  play: 'play',
  create: 'create',
  reflect: 'reflect',
  review: 'review',
};

// -----------------------------------------------------------------------------
// Source traceability
// -----------------------------------------------------------------------------

export type SourceDocumentId =
  | 'unam-s3512mc-ch1-notes-2026'
  | 'unam-s3512mc-tut1-2026'
  | 'unam-s3512mc-ch2-notes-2026'
  | 'unam-s3512mc-tut2-2026'
  | 'unam-s3512mc-ch3-notes-2026'
  | 'unam-s3512mc-tut3-2026'
  | 'unam-s3512mc-tut4-2026'
  | 'unam-s3512mc-ch4-notes-2026'
  | 'unam-s3512mc-tut5-2026'
  | 'unam-s3512mc-ch5-notes-2026'
  | 'unam-s3512mc-tut6-2026';

export interface SourceRef {
  document: SourceDocumentId;
  /** Section as numbered in the source, e.g. "1.6.1". Internal only. */
  section?: string;
  /** Item within the section, e.g. "Example 1.7.1" or "Q3(v)". Internal only. */
  item?: string;
  /** Printed page number in the source. */
  page?: number;
  /** Id of the item in the topic's source inventory (completeness audit). */
  inventoryId?: string;
}

/** Kind of source item, used by the source inventory and practice data. */
export type SourceItemType =
  | 'explanation'
  | 'definition'
  | 'theorem'
  | 'proof'
  | 'formula'
  | 'table-row'
  | 'derivation'
  | 'note'
  | 'worked-example'
  | 'worked-solution'
  | 'remark'
  | 'figure'
  | 'you-try-it'
  | 'chapter-exercise'
  | 'tutorial-question';

/**
 * Where a piece of content comes from.
 *   unamSource         mathematics taken from the UNAM material as written
 *   unamSourceAdapted  same mathematics, presentation rewritten for the app
 *   appAuthored        written for the app (never presented as UNAM material)
 */
export type ContentOrigin = 'unamSource' | 'unamSourceAdapted' | 'appAuthored';

/**
 * Review status of a solution or hint ladder.
 *   unamSource              the solution is printed in the UNAM notes
 *   pendingLecturerReview   app-authored; hidden from learners until approved
 *   lecturerApproved        app-authored and approved by the lecturer
 * Automatic verification (e.g. by differentiation) never changes this status.
 */
export type SolutionStatus = 'unamSource' | 'pendingLecturerReview' | 'lecturerApproved';

// -----------------------------------------------------------------------------
// Lesson content blocks
// -----------------------------------------------------------------------------

/**
 * Mathematics is written in the small LaTeX subset understood by
 * lib/math/tex (\frac, ^, _, \sqrt, \int, trig/ln, Greek letters …).
 * Inside paragraph text, inline mathematics is delimited by $…$.
 */
export interface WorkedStep {
  explanation: string;
  tex?: string;
  /** Optional app-written "Why this step?" note, shown on request. Never presented as lecturer text. */
  why?: string;
  /** Manual-review items that apply to this line (shown as printed, with a review note). */
  reviewIds?: string[];
}

/**
 * Fields every block may carry. `source` links the block to the course
 * material (and to the source inventory); `reviewIds` marks material shown
 * exactly as printed while a manual-review item is open, so learners see a
 * short "awaiting lecturer review" note under it.
 */
interface BlockMeta {
  source?: SourceRef;
  /** Further source-inventory items presented in this block (e.g. a proof inside a theorem card). */
  covers?: string[];
  reviewIds?: string[];
}

export interface FormulaItem {
  tex: string;
  note?: string;
  source?: SourceRef;
  reviewIds?: string[];
}

/** One row of a two-column table such as a table of substitutions. Text may contain $…$ maths. */
export interface TableRow {
  left: string;
  right: string;
  source?: SourceRef;
  reviewIds?: string[];
}

export type ContentBlock = BlockMeta &
  (
    | { type: 'paragraph'; text: string }
    | { type: 'math'; tex: string }
    /** A figure from the notes (or an app illustration), redrawn to scale with the screen. */
    | { type: 'figure'; figure: FigureSpec }
    | { type: 'definition'; term: string; text: string; tex?: string }
    | {
        type: 'theorem';
        label: string;
        title?: string;
        text: string;
        tex?: string;
        /** Words printed after the formula (wraps on narrow screens). */
        textAfter?: string;
        proof?: WorkedStep[];
      }
    | { type: 'formula'; title: string; tex: string; note?: string }
    | { type: 'formulaList'; title: string; items: FormulaItem[] }
    | { type: 'table'; title: string; columns: [string, string]; rows: TableRow[]; note?: string }
    | { type: 'callout'; tone: 'insight' | 'caution'; title: string; text: string; tex?: string }
    /** A derivation the learner expands on request; collapsed by default. */
    | { type: 'derivation'; title: string; intro?: string; steps: WorkedStep[]; resultTex?: string }
    | { type: 'summary'; title: string; points: string[] }
    | {
        type: 'workedExample';
        title: string;
        /** The question in words, with $…$ maths (wraps on narrow screens); problemTex then holds only the mathematics. */
        prompt?: string;
        problemTex: string;
        /** Short name of the method, e.g. "Substitution". */
        method?: string;
        steps: WorkedStep[];
        resultTex: string;
        source: SourceRef;
        origin: ContentOrigin;
        solutionStatus: SolutionStatus;
        /** A drawing shown with the calculation (e.g. the region whose area is found). */
        figure?: FigureSpec;
      }
    /** Practice items (chapter "You Try It", chapter exercises, tutorial questions). */
    | { type: 'practiceGroup'; title: string; text?: string; items: PracticeItem[] }
    /**
     * Short recognition questions written for the app (always labelled "App practice"):
     * choose an answer, get feedback on that choice, retry, and ask for a hint.
     */
    | { type: 'quickCheck'; title: string; text?: string; questions: QuickCheckQuestion[] }
    /** Explore tools, games or Create activities for this step, each opening its own screen. */
    | { type: 'activities'; activities: TopicActivity[] }
    /** Short reflection saved to the learner's history (not a test). */
    | { type: 'reflect'; topicId: string; unitId: string; question: string; difficulties: string[] }
    /** The learner's own history for this subtopic, with actions. */
    | { type: 'review'; topicId: string; unitId: string }
  );

/** One choice in a quick check: the text (with $…$ maths) and the feedback when it is chosen. */
export interface QuickCheckOption {
  text: string;
  feedback: string;
}

/** An App practice recognition question (never a source question). */
export interface QuickCheckQuestion {
  id: string;
  /** The question, with $…$ maths. */
  prompt: string;
  /** Displayed maths shown under the prompt. */
  tex?: string;
  options: QuickCheckOption[];
  correctIndex: number;
  /** App guidance shown on request; never gives the answer away. */
  hint: string;
}

export type StepAvailability =
  | { status: 'available' }
  /** Built in a later development phase; shown honestly as not yet available. */
  | { status: 'planned'; phase: number; preview: string };

export interface LessonStepDefinition {
  /** Unique within the subtopic; stored as lesson_progress.section_key. */
  key: string;
  kind: LessonStepKind;
  title: string;
  /** Required steps count towards subtopic completion. */
  required: boolean;
  availability: StepAvailability;
  blocks: ContentBlock[];
  /** Activities (labs, games, studios) launched from this step. */
  activityIds?: string[];
  source?: SourceRef[];
}

/** A subtopic. Its id is the learning_units row id. */
export interface LearningUnitDefinition {
  id: string;
  /** URL segment. */
  slug: string;
  title: string;
  summary: string;
  // Study time is calculated from the content itself (content/estimate.ts), never typed in by hand.
  /** Illustration used on dashboard cards (components/art/ActivityGlyph). */
  glyph: 'tangent' | 'function-art' | 'match' | 'limits' | 'wave' | 'practice';
  tone: 'blue' | 'coral' | 'teal' | 'amber';
  /** Source sections covered (internal). */
  source: SourceRef[];
  steps: LessonStepDefinition[];
}

// -----------------------------------------------------------------------------
// Activities, practice and questions
// -----------------------------------------------------------------------------

export type ActivityKind = 'lab' | 'game' | 'studio';

/**
 * What a Create activity makes: graph art from equations, a visual map of a
 * method's structure, or a solution-flow diagram. Partial fractions and
 * integration by parts deliberately use structure/flow, not graph art.
 */
export type CreateType = 'graphArt' | 'structure' | 'flow' | 'areaArt' | 'rnArt' | 'paArt' | 'miArt';

/** A published source behind an activity's design (internal documentation; not shown to learners). */
export interface EvidenceSource {
  id: string;
  citation: string;
  doi: string;
  /** What the source supports (and, implicitly, nothing more). */
  supports: string;
}

/**
 * Why an activity is designed the way it is. Design informed by prior
 * research; the cited literature does not establish the effectiveness of the
 * specific MathArt Connect activity.
 */
export interface EvidenceBasis {
  type: 'game-based-learning' | 'visualisation' | 'art-integration';
  sourceId: string;
  citation: string;
  principle: string;
}

export interface TopicActivity {
  id: string;
  topicId: string;
  kind: ActivityKind;
  title: string;
  summary: string;
  /** Subtopic the activity belongs to (unit id). */
  unitId: string;
  /** Course-notes sections (navigator ids) whose mathematics it teaches. */
  sections: string[];
  /** Create activities only. */
  createType?: CreateType;
  availability: StepAvailability;
  /** Internal research traceability (docs, thesis); never shown in the learner interface. */
  evidenceBasis?: EvidenceBasis[];
  /** Course-aligned mathematics, or a creative extension built on it. */
  alignment?: 'course' | 'creative';
}

export type PracticeModeId = 'guided' | 'independent' | 'challenge';

/** Learner-facing practice labels (Decision 3). Source numbering is never shown. */
export const PRACTICE_MODE_LABELS: Record<PracticeModeId, string> = {
  guided: 'Guided Practice',
  independent: 'Independent Practice',
  challenge: 'Challenge',
};

/** An app-authored solution. Hidden from learners until its status is lecturerApproved. */
export interface PracticeSolution {
  status: SolutionStatus;
  method: string;
  steps: WorkedStep[];
  answerTex: string;
  /** How the answer was checked; checking never changes `status`. */
  verification: 'numericDerivative' | 'notVerified';
  /**
   * Topic 4 labelling: hints and step-by-step help are shown as APP GUIDANCE and the full worked
   * answer as APP-GENERATED SOLUTION (pending lecturer review). Other topics keep "App guidance".
   */
  appGenerated?: boolean;
}

/**
 * A practice question taken from the course material: a chapter "You Try It",
 * a chapter exercise or a tutorial question. Source numbering stays internal.
 */
export interface PracticeItem {
  /** Stable id, e.g. "tut1-q3-v" or "ch1-1.6.1-yti". */
  id: string;
  topicId: string;
  /** 'app-practice': written for the app (e.g. Review retrieval), labelled "App practice", never a source question. */
  sourceType: 'you-try-it' | 'chapter-exercise' | 'tutorial-question' | 'app-practice';
  source: SourceRef;
  /** Question number as printed, e.g. "Q3" (internal). */
  sourceQuestion?: string;
  /** Sub-question label as printed, e.g. "v" (internal). */
  sourceSubquestion?: string;
  /** Instruction shown to the learner, e.g. "Evaluate". */
  instruction: string;
  problemTex: string;
  /** Extra condition printed with the question, with $…$ maths, e.g. "where $a > b > 0$". */
  condition?: string;
  /** Technique id (topic-specific) and its learner-facing label. */
  technique: string;
  techniqueLabel: string;
  /** Subtopic (unit id) where the item is practised. */
  unitId: string;
  difficulty: 1 | 2 | 3;
  recommendedPracticeMode: PracticeModeId;
  supportsHints: boolean;
  supportsStepValidation: boolean;
  /** True while a manual-review item applies to the question itself. */
  needsManualReview: boolean;
  reviewIds: string[];
  /** Withheld from learners until the review items are resolved. */
  withheldFromLearners: boolean;
  /** Goes beyond the methods developed in the course notes. */
  isExtension: boolean;
  /** Source section (navigator id, e.g. "1.6.1" or "table-1.1") whose method this item practises. */
  sourceSection: string;
  /**
   * How answers are checked: the main variable, sample points inside the
   * domain, values for general constants, and (rarely) the integral to check
   * against when the question is not a plain "∫ … dx".
   */
  check: {
    variable: string;
    points: number[];
    constants: Record<string, number>;
    integrandTex?: string;
    /** A "show that" reduction formula: the final answer may keep an integral. */
    answerMayContainIntegral?: boolean;
  };
  /**
   * Definite and improper integrals (Topic 2): the integrand, limits and the
   * kind of answer expected. When present, My Working uses the definite checker.
   */
  definite?: DefiniteSpec;
  /**
   * Topic 3 (Differential Calculus in ℝⁿ): the variables, sample points and the quantities the
   * final answer must give. When present, My Working uses the multivariable checker.
   */
  partial?: PartialSpec;
  /** Topic 4 tangent planes and normal lines (§4.2.1): the surface F = 0, the point and what is asked. */
  surface?: SurfaceSpec;
  /** Topic 4 critical points and their classification (§4.3.1). */
  extrema?: ExtremaSpec;
  /** Topic 5 iterated integrals, reversed limits and changes of variables (lib/math/multiple). */
  multiple?: MultipleSpec;
  /**
   * How the answer is assessed (default 'auto'): 'auto' checks the final answer; 'partial' checks
   * the mathematical result but the reasoning stays written work; 'written' is not auto-graded
   * (proofs, show-that with an unspecified function, or a question whose intent is under review).
   */
  grading?: 'auto' | 'partial' | 'written';
  /** Shown as "Advanced tutorial practice" (still the tutorial's own question). */
  advanced?: boolean;
  /** A method from another topic that the question relies on (a short note and a link). */
  prerequisite?: { topicId: string; unitId: string; note: string };
  /** Hint ladder: conceptual clue, method clue, next mathematical action. App guidance. */
  hints: [string, string, string];
  solution?: PracticeSolution;
}

export interface PracticeMode {
  id: PracticeModeId;
  title: string;
  summary: string;
  availability: StepAvailability;
}

/** Progressive hint ladder (never reveal the answer first). */
export interface HintLadder {
  conceptual: string;
  visual: string;
  partialWorking: string;
  steps: string[];
  answer: string;
}

export type AnswerSpec =
  | { kind: 'numeric'; value: number; tolerance?: number }
  | { kind: 'expression'; equivalentTo: string }
  | { kind: 'choice'; options: string[]; correctIndex: number };

export interface QuestionDefinition {
  id: string;
  prompt: string;
  answer: AnswerSpec;
  hints: HintLadder;
  explanation: string;
  difficulty: 1 | 2 | 3;
  solutionStatus: SolutionStatus;
  source?: SourceRef;
}

/** One practice source learners can filter by. An item belongs to it by document or by source type. */
export interface PracticeSourceOption {
  /** URL value of ?source=, e.g. "tutorial-3". */
  id: string;
  /** Learner-facing label, e.g. "Tutorial 3". */
  label: string;
  /** One line for the Practice hub, e.g. "Every Tutorial 3 question for this topic". */
  description?: string;
  documents?: SourceDocumentId[];
  sourceTypes?: PracticeItem['sourceType'][];
}

export interface TopicDefinition {
  id: string;
  family: TopicFamily;
  title: string;
  /** A short name for compact controls such as topic switchers (defaults to the title). */
  shortTitle?: string;
  subtitle: string;
  description: string;
  /** Course context, e.g. UNAM S3512MC Calculus II. */
  course?: { code: string; title: string; institution: string };
  contentVersion: string;
  /** Development/demo content must be visibly labelled in the UI. */
  isDemo: boolean;
  units: LearningUnitDefinition[];
  practiceModes: PracticeMode[];
  activities: TopicActivity[];
  questions: QuestionDefinition[];
  /** All practice items from the course material, filterable by subtopic and technique. */
  practiceItems?: PracticeItem[];
  /**
   * App practice used for retrieval in Review: written for the app, labelled so, and kept out of the
   * course practice lists and counts. Attempts still appear in the learner's history.
   */
  retrievalItems?: PracticeItem[];
  /** The course notes' own sections, each openable by learners inside its subtopic. */
  sections?: SourceSection[];
  /** Create activities on the Equation Art Studio, by activity id. */
  studios?: Readonly<Record<string, StudioConfig>>;
  /** Create activities on the Flow Composer (structure maps and solution flows), by activity id. */
  flows?: Readonly<Record<string, FlowConfig>>;
  /** Create activities on the Topic 2 area studios (Riemann Mosaic, Accumulation Art), by activity id. */
  areaStudios?: Readonly<Record<string, AreaStudioConfig>>;
  /** Topic 3 Create studios (Domain Region, Surface Slice, Chain Network, Coordinate Grid) by activity id. */
  rnStudios?: Readonly<Record<string, RnStudioConfig>>;
  /** Topic 4 Create studios (Gradient Field Art, Faceted Surface, Landscape Designer) by activity id. */
  paStudios?: Readonly<Record<string, PaStudioConfig>>;
  /** Topic 5 Create studios (Strip Region Studio, Jacobian Grid Studio) by activity id. */
  miStudios?: Readonly<Record<string, MiStudioConfig>>;
  /** Learner-facing names of the practice sources, e.g. Chapter practice and Tutorial 2 practice. */
  practiceSources?: { chapter: string; tutorial: string };
  /**
   * The practice sources learners filter by, when a topic has more than one tutorial (e.g. Topic 3:
   * Tutorial 3, Tutorial 4 and App practice). Without it, the chapter / tutorial pair above is used.
   */
  practiceSourceList?: PracticeSourceOption[];
}

/**
 * One section of the course notes as learners can open it: its heading as
 * printed, every note, example and formula from that section, and the
 * practice questions that belong to it.
 */
export interface SourceSection {
  /** URL-safe id, e.g. "1-6-1" or "table-1-1". */
  id: string;
  /** Number or name as printed, e.g. "1.6.1" or "Table 1.1". */
  label: string;
  /** Heading as printed (words). */
  heading: string;
  /** Mathematical part of the heading, if any, e.g. ∫ (Ax + B)/(ax² + bx + c) dx. */
  headingTex?: string;
  /** The same mathematical part as plain text, for compact labels and screen readers. */
  headingPlain?: string;
  /** Rest of the heading, with $…$ maths, e.g. "where a, b, c, A, B are constants and b² < 4ac". */
  headingCondition?: string;
  /** Subtopic (unit id) the section belongs to. */
  unitId: string;
  /** Every lesson block taken from this section, in lesson order. */
  blocks: ContentBlock[];
  /** "You Try It" items and exercises printed in this section. */
  tryIt: PracticeItem[];
  /** Tutorial questions that practise this section's method. */
  tutorial: PracticeItem[];
}
