# Source material: Topic 4 Applications of Partial Derivatives

Topic 4 is adapted from University of Namibia course material. **The PDFs are not stored in this repository or bundled with the app.** This page traces app content back to them.

## Documents

| ID in code                    | File name                                         | Contents                                                                                                                  |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `unam-s3512mc-ch4-notes-2026` | `S3512MC___CALCULUS II_CHAPTER 4__NOTES_2026.pdf` | Chapter 4 notes "Applications of the Partial Derivative" (Dr J. Mushanyu), pp. 55–61. No figures, exercises or You Try It |
| `unam-s3512mc-tut5-2026`      | `S3512MC___CALCULUS II_TUT 5_2026.pdf`            | Tutorial 5 "Gradient and Extrema of Functions of Two Variables", 21 September 2026. Questions only, no answer key         |

Every page was read as text and as a page image. Tutorial 6 (Multiple Integration) belongs to Chapter 5 and is not used.

## Locked counts (approved specification)

| Item                          |  Count | Where in the app                                                                       |
| ----------------------------- | -----: | -------------------------------------------------------------------------------------- |
| Subtopics                     |      4 | `content/topics/applications/units/`                                                   |
| Printed section headings      |      5 | 4.1, 4.2, 4.2.1, 4.3, 4.3.1 (`sections.ts`)                                            |
| Unnumbered headings in §4.3.1 |      3 | Definition of Relative Extrema, Definition of Critical Point, The Second Partials Test |
| Numbered theorems             |      5 | 4.2.1, 4.2.2, 4.3.1, 4.3.2, 4.3.3                                                      |
| Definitions                   |      3 | Gradient, relative extrema, critical point                                             |
| Numbered worked examples      |      8 | Worked-example cards, each with its printed solution                                   |
| Printed figures               |      0 | All visuals are app-created visualisations                                             |
| Tutorial 5 parts              |     35 | `tutorial5.ts` (Q1 8, Q2 4, Q3 5, Q4 5, Q5 13; 40 answer tasks)                        |
| App practice (§4.3.1)         |      4 | `appPractice.ts`, labelled APP PRACTICE                                                |
| Practice total                |     39 | `allPractice.ts`; locked by `__tests__/pda-practice.test.ts`                           |
| Auto-graded / written         | 38 / 1 | Q5(m) is a written self-check question (MR4-10)                                        |

Review retrieval questions (one per subtopic) are written for the app, labelled, and kept out of these counts.

## Source-to-subtopic mapping

| Subtopic                                | Sections                                    | Tutorial 5                                                                                 |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1. The Gradient                         | 4.1                                         | Q2(i)–(iv); Q1(i)–(viii) as "Review from §3.3: Total Differential and Gradient Components" |
| 2. Tangent Planes and Normal Lines      | 4.2, 4.2.1                                  | Q3(i)–(v), Q4(i)–(v)                                                                       |
| 3. Critical Points and Relative Extrema | 4.3, 4.3.1 up to "The Second Partials Test" | none (APP PRACTICE AP4-1 to AP4-4)                                                         |
| 4. The Second Partials Test             | 4.3.1, "The Second Partials Test"           | Q5(a)–(m)                                                                                  |

Tutorial 5 Q1 practises Chapter 3 §3.3. It stays in Topic 4 as prior knowledge revisited (the coefficients in dz are the gradient components); its source section is `3-3`, so it is not listed on a Chapter 4 section page. Topic 3 is not changed.

## Official content and app guidance

- Official UNAM content: all Chapter 4 text, theorems, definitions, the 8 worked examples and their printed solutions, and the 35 Tutorial 5 questions. Printed errors are shown as printed (see the flags below).
- APP GUIDANCE: hints, step-by-step help, the three callouts next to the notes (three-variable gradient, general symmetric equations, the value 59/27 in Example 4.3.3), and the common errors in Review.
- APP-GENERATED SOLUTION: every full Tutorial 5 walkthrough and answer, stored as `pendingLecturerReview` with `appGenerated: true`. Q5(m) has none (withheld).
- App-created visualisation: every contour map, surface, plane, vector field and landscape in Explore and Create.

## Lecturer-review flags (`manualReview.ts`)

| ID     | Issue                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------- |
| MR4-01 | Example 4.1.1 prints the second unit vector as **i** (should be **j**); answer 6i + 4j is right |
| MR4-02 | §4.1 defines the gradient for two variables; Example 4.1.2 and Q2(iv) use three                 |
| MR4-03 | "p = (x₀, y₀, z₀)" then "P"                                                                     |
| MR4-04 | Theorem 4.2.1 is titled "(Definition of …)"                                                     |
| MR4-05 | Theorem 4.2.2 omits ∇F ≠ 0                                                                      |
| MR4-06 | Critical point: "fx and fy does not exist" vs "either fx or fy is undefined"                    |
| MR4-07 | "relative extreme"; critical points described as ∇f = 0 only                                    |
| MR4-08 | Q5 "stationary points" vs "critical points"                                                     |
| MR4-09 | Extreme Value Theorem stated with no method, example or question                                |
| MR4-10 | Q5(m): a whole ellipse of critical points with d = 0; expected answer unclear                   |
| MR4-11 | Q5(i): irrational critical points; please confirm                                               |
| MR4-12 | May the app say the gradient points uphill / is perpendicular to level curves?                  |

All flags are internal: lesson blocks never carry `reviewIds`, and no source text is corrected.

## Explore, Play and Create

| Subtopic | Explore               | Game             | Create                            |
| -------- | --------------------- | ---------------- | --------------------------------- |
| 1        | Gradient Probe        | Gradient Builder | Gradient Field Art                |
| 2        | Tangent Plane Lab     | Plane Builder    | Faceted Surface                   |
| 3        | Critical Point Finder | Is It Critical?  | none (nothing meaningful to make) |
| 4        | Saddle or Not         | Classify It      | Landscape Designer                |

Design is informed by prior research (`evidence.ts`: Thomas et al. 2025, Schönherr et al. 2024, Sylviani et al. 2024). The cited literature supports the design principles; it does not establish the effectiveness of these MathArt Connect activities, which have not been evaluated. Games use app-made functions so that no Tutorial 5 answer is given away.

## Database

`supabase/migrations/20261018000000_partial_derivative_applications_topic.sql` inserts the topic and its four units (catalogue rows only, idempotent; no deletes, drops or alters). It is needed because lesson progress and practice attempts reference topic and unit rows by foreign key. It must be applied to the live project before Topic 4 progress can be saved there.
