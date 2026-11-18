# Source material: Topic 1 Integration

The Integration topic is adapted from University of Namibia course material. **The PDFs are not stored in this repository or bundled with the app.** Keep them in the course's own storage, and use this page to trace app content back to them.

## Documents

| ID in code                    | File name                                         | Contents                                                                                              |
| ----------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `unam-s3512mc-ch1-notes-2026` | `S3512MC___CALCULUS II_CHAPTER 1__NOTES_2026.pdf` | S3512MC Calculus II, Chapter 1 notes "Integration" (Dr J. Mushanyu), 22 printed pages                 |
| `unam-s3512mc-tut1-2026`      | `S3512MC___CALCULUS II_TUT 1_2026.pdf`            | S3512MC Calculus II, Tutorial 1 "Integration (Part 1)", 03 August 2026. Questions only, no answer key |

Course: S3512MC Calculus II, University of Namibia, 2026.

## What the app contains

The app contains the complete readable content of both documents. Every page was read in text and as a page image; the page images were used wherever text extraction garbled the mathematics.

| Source item                                                                                                             | Count | Where in the app                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------- |
| Chapter 1 inventory items (all types)                                                                                   |   115 | `content/topics/integration/inventory.ts`                                                                                           |
| Chapter 1 worked examples                                                                                               |    36 | Worked-example cards (step by step, in See it and Worked example)                                                                   |
| Chapter 1 "You Try It" items and exercises                                                                              |    13 | `chapterPractice.ts`, shown in each subtopic's Try it step                                                                          |
| Tutorial 1 parts                                                                                                        |    84 | `tutorial1.ts`, shown in each subtopic's Practise step, grouped by technique                                                        |
| Teaching items: 4 definitions, 4 theorems, 1 proof, 20 formulas, 10 table rows, 4 derivations, 21 explanations, 2 notes |    66 | Concept and See it cards: definition, theorem (with expandable proof), formula, formula list, table, expandable derivation, callout |

### Chapter 1 sections by subtopic

| Subtopic                                    | Sections                      |
| ------------------------------------------- | ----------------------------- |
| 1. Understanding Integration                | 1.1, 1.2                      |
| 2. Basic Integration Rules                  | 1.3, 1.4                      |
| 3. Substitution                             | 1.5                           |
| 4. Partial Fractions                        | 1.6, 1.6.1, 1.6.2, 1.6.3, 1.7 |
| 5. Algebraic and Trigonometric Substitution | 1.8, 1.8.1, 1.9               |
| 6. Integration by Parts                     | 1.10, 1.11                    |
| 7. Advanced Integration Patterns            | 1.12, 1.13, 1.14              |

### Tutorial 1 parts by subtopic

| Subtopic                                    |             Parts |
| ------------------------------------------- | ----------------: |
| 1. Understanding Integration                |                 0 |
| 2. Basic Integration Rules                  |                 1 |
| 3. Substitution                             |                20 |
| 4. Partial Fractions                        |                20 |
| 5. Algebraic and Trigonometric Substitution |                16 |
| 6. Integration by Parts                     |                 8 |
| 7. Advanced Integration Patterns            | 19 (includes Q12) |

Each tutorial part stores: source question and sub-question, problem, technique, subtopic, difficulty, recommended practice mode, whether it supports hints and step validation, manual-review status and solution status. `filterPracticeItems()` in `practice.ts` filters them by subtopic, technique or source type.

## Learner access by section

Every Chapter 1 section, and Table 1.1, is its own page in the app, nested in its subtopic. Learners reach each page in two ways:

- from the "In the course notes" chips under the lesson header
- from the previous/next links on each section page

Each page shows the heading as printed, every note, definition, theorem, formula, table and derivation from that section, all its worked examples, its "You Try It" items and exercises, and the tutorial questions that practise its method.

| Section   | Learner route                          | Subtopic                                 | Worked examples | Try it / exercises | Tutorial questions | Hidden for review |
| --------- | -------------------------------------- | ---------------------------------------- | --------------: | -----------------: | -----------------: | ----------------: |
| 1.1       | `/topic/integration/section/1-1`       | Understanding Integration                |               3 |                  0 |                  0 |                 0 |
| 1.2       | `/topic/integration/section/1-2`       | Understanding Integration                |               0 |                  0 |                  0 |                 0 |
| 1.3       | `/topic/integration/section/1-3`       | Basic Integration Rules                  |               5 |                  0 |                  1 |                 0 |
| 1.4       | `/topic/integration/section/1-4`       | Basic Integration Rules                  |               1 |                  0 |                  0 |                 0 |
| 1.5       | `/topic/integration/section/1-5`       | Substitution                             |               3 |                  2 |                 20 |                 1 |
| 1.6       | `/topic/integration/section/1-6`       | Partial Fractions                        |               1 |                  1 |                  4 |                 0 |
| 1.6.1     | `/topic/integration/section/1-6-1`     | Partial Fractions                        |               1 |                  1 |                  3 |                 0 |
| 1.6.2     | `/topic/integration/section/1-6-2`     | Partial Fractions                        |               1 |                  1 |                  6 |                 0 |
| 1.6.3     | `/topic/integration/section/1-6-3`     | Partial Fractions                        |               3 |                  1 |                  5 |                 0 |
| 1.7       | `/topic/integration/section/1-7`       | Partial Fractions                        |               1 |                  0 |                  2 |                 1 |
| 1.8       | `/topic/integration/section/1-8`       | Algebraic and Trigonometric Substitution |               2 |                  1 |                  4 |                 1 |
| Table 1.1 | `/topic/integration/section/table-1-1` | Algebraic and Trigonometric Substitution |               0 |                  0 |                  4 |                 1 |
| 1.8.1     | `/topic/integration/section/1-8-1`     | Algebraic and Trigonometric Substitution |               1 |                  0 |                  3 |                 0 |
| 1.9       | `/topic/integration/section/1-9`       | Algebraic and Trigonometric Substitution |               2 |                  1 |                  5 |                 1 |
| 1.10      | `/topic/integration/section/1-10`      | Integration by Parts                     |               3 |                  1 |                  4 |                 0 |
| 1.11      | `/topic/integration/section/1-11`      | Integration by Parts                     |               1 |                  0 |                  4 |                 1 |
| 1.12      | `/topic/integration/section/1-12`      | Advanced Integration Patterns            |               3 |                  0 |                  0 |                 0 |
| 1.13      | `/topic/integration/section/1-13`      | Advanced Integration Patterns            |               5 |                  3 |                 16 |                 0 |
| 1.14      | `/topic/integration/section/1-14`      | Advanced Integration Patterns            |               0 |                  1 |                  3 |                 0 |

Totals: 36 worked examples, 13 "You Try It" items and exercises, and 84 tutorial questions. Six questions are hidden for manual review (see below). `__tests__/source-to-screen.test.tsx` renders every page and fails if any of these is not on screen. Run it with `PRINT_AUDIT=1` to print this table.

## Practice: My working

Every "You Try It" item, chapter exercise and tutorial question has a **My working** area:

- **Steps:** each step is typed as a line of maths, with a symbol keypad and a live preview. Steps can be added, edited and deleted.
- **Check Step:** each step is checked against the integral, with feedback.
- **Final Answer** and **Check Answer.**
- **Help in stages:** Hint 1 (conceptual clue), Hint 2 (method clue), Hint 3 (next mathematical action), then Show Next Step, Show Another Step and Show Full Walkthrough.

Hints and walkthroughs are labelled **App guidance** ("written for this app, not an official UNAM or lecturer solution"). Their review status stays `pendingLecturerReview` until a lecturer approves them. Questions withheld for manual review are not shown.

Practice is reached from:

- each subtopic's Try it and Practise steps
- each section page
- the Guided, Independent and Challenge modes on the topic page, which list every visible question and can be filtered by subtopic

## Traceability

Every content item links to its source through `source` (document, section, printed page, and the inventory id). Section numbers and headings (1.1 to 1.14 and Table 1.1) are shown to learners, as the course structure. Tutorial and exercise numbers (such as Q3(v)) stay internal; questions are labelled "Try it", "Exercise", "Practice", "Guided Practice", "Independent Practice" and "Challenge".

## Completeness audit

`npm run audit:content` runs:

- `__tests__/integration-source-audit.test.ts`, which fails if any Chapter 1 inventory item or Tutorial 1 part has no mapped content, if content points at an unknown source item, or if an item is in the wrong subtopic.
- `__tests__/integration-solutions.test.ts`, which differentiates every stored answer numerically and compares it with the integrand. This covers the 28 printed worked-example results that are anti-derivatives and all 97 practice solutions.

## Solution status

| Status                  | Meaning                                          | Shown to learners                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unamSource`            | The worked solution is printed in the notes      | Yes                                                                                                                                                                                             |
| `lecturerApproved`      | An app-authored solution a lecturer has approved | Yes                                                                                                                                                                                             |
| `pendingLecturerReview` | An app-authored solution not yet reviewed        | Only as hints and walkthroughs labelled "App guidance", for questions not withheld for review. Withheld questions appear only in reviewer mode (`__DEV__` and `EXPO_PUBLIC_REVIEWER_MODE=true`) |

Neither the tutorial nor the chapter's "You Try It" items have printed solutions, so all 97 practice solutions are app-authored and `pendingLecturerReview`, even though each one passes the differentiation check. App-authored solutions must never be presented as official UNAM, lecturer or model answers. "Why this step?" notes in worked examples are app-written explanations, shown only on request.

## Manual review

Source ambiguities are listed in `content/topics/integration/manualReview.ts` (MR-01 to MR-16). They are never silently corrected:

- **Shown as printed:** lesson material under review appears exactly as printed, with the note "Shown as printed in the course notes · awaiting lecturer review".
- **Withheld:** practice items blocked by a review item are withheld from learners until it is resolved. Reviewer mode shows them.

| ID    | Location                                   | Issue                                             | Current handling                          |
| ----- | ------------------------------------------ | ------------------------------------------------- | ----------------------------------------- |
| MR-01 | Tutorial Q10                               | "In" printed where ln is likely meant             | Stored as printed; withheld from practice |
| MR-02 | Notes Exercise 1.8.1                       | `dx` printed twice                                | Stored as printed; withheld from practice |
| MR-03 | Notes §1.12, xⁿeˣ reduction formula        | `du` without `dx`; `+ C` on the reduction formula | Shown as printed, with review note        |
| MR-04 | Notes §1.12, sinⁿx reduction formula       | `dv = sin x` without `dx`; missing ∫ in one line  | Shown as printed, with review note        |
| MR-05 | Notes §1.13, ∫sin⁴x cos³x dx               | Missing ∫                                         | Shown as printed, with review note        |
| MR-06 | Notes §1.8.1                               | `a` used for two things; undefined `y`            | Shown as printed, with review note        |
| MR-07 | Notes Table 1.1, row 5                     | Uncertain expression                              | Shown as printed, with review note        |
| MR-08 | Notes §1.13, definite integral example     | Definite integrals not yet defined                | Shown as printed, with review note        |
| MR-09 | Notes §1.8, t = √(4x+1) example            | "2t = 4 dx" (missing dt)                          | Shown as printed, with review note        |
| MR-10 | Notes §1.7                                 | Formula without a constant of integration         | Shown as printed, with review note        |
| MR-11 | Notes §1.6.1                               | C used as coefficient and constant                | Shown as printed, with review note        |
| MR-12 | Ten tutorial parts                         | Need methods beyond the notes                     | Labelled "Extension"                      |
| MR-13 | Four tutorial parts with general constants | Need stated assumptions                           | Withheld from practice                    |
| MR-14 | Tutorial 1; chapter "You Try It" items     | No printed solutions                              | All solutions `pendingLecturerReview`     |
| MR-15 | Notes §1.4, formula 2                      | `dx` missing on the left-hand side                | Shown as printed, with review note        |
| MR-16 | Notes §1.8.1, Solution 1.8.2               | Intermediate tan⁻¹ argument should include 2/√3   | Shown as printed, with review note        |

Withheld from learner practice until resolved: Exercise 1.8.1 (MR-02), Q10 (MR-01), and Q1(iv), Q6, Q7(xviii), Q11(iv) (MR-13). All items are **open**. To resolve one, record the lecturer's decision, update the content, then set `status: 'resolved'`.

## Interactive activities

Explore tools, games and Create activities (`explore.ts`, `games.ts`, `create.ts`) use examples from the Chapter 1 notes and Tutorial 1: the same integrals, the Table 1.1 rows, the four partial-fraction cases, the integration-by-parts choices, the reduction formulas and the §1.13–1.14 patterns. Their explanations and feedback are app guidance, not official UNAM or lecturer solutions. No withheld item (MR-01, MR-02, MR-13) is used.

Material beyond the notes is labelled in the app:

- Repeated-Parts Flow: ∫ eˣ sin x dx, where the integral returns, is marked "Extension".
- Equation Art and pattern studios: decorative curve families (roses, limaçons, polar petals) are labelled as patterns for art, not course content. The mathematics they illustrate (restricted functions, Table 1.1 roots as arcs, product-to-sum identities) is from the notes.
