# Source material: Topic 3 Differential Calculus in ℝⁿ

Topic 3 is adapted from University of Namibia course material. **The PDFs are not stored in this repository or bundled with the app.** This page traces app content back to them.

## Documents

| ID in code                    | File name                                         | Contents                                                                                          |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `unam-s3512mc-ch3-notes-2026` | `S3512MC___CALCULUS II_CHAPTER 3__NOTES_2026.pdf` | Chapter 3 notes "Differential Calculus in ℝⁿ" (Dr J. Mushanyu), pp. 43–54                         |
| `unam-s3512mc-tut3-2026`      | `S3512MC___CALCULUS II_TUT 3_2026.pdf`            | Tutorial 3 "Differential Calculus in ℝⁿ Part 1", 24 August 2026. Questions only, no answer key    |
| `unam-s3512mc-tut4-2026`      | `S3512MC___CALCULUS II_TUT 4_2026.pdf`            | Tutorial 4 "Differential Calculus in ℝⁿ Part 2", 07 September 2026. Questions only, no answer key |

Every page was read as text and as a page image; the images were used wherever text extraction garbled the mathematics.

## Locked counts (approved specification)

| Item                     | Count | Where in the app                                                  |
| ------------------------ | ----: | ----------------------------------------------------------------- |
| Subtopics                |     9 | `content/topics/differential/units/`                              |
| Printed section headings |     7 | Section pages (`sections.ts`); §3.4 is one page for subtopics 6–9 |
| Numbered worked examples |    14 | Worked-example cards                                              |
| Printed figures          |     2 | Figures 3.1 and 3.2 (static), plus interactive Explore versions   |
| Tutorial 3 parts         |   125 | `tutorial3.ts`                                                    |
| Tutorial 4 parts         |    41 | `tutorial4.ts`                                                    |
| App practice (§3.3)      |     3 | `appPractice.ts`, labelled APP PRACTICE                           |
| Practice total           |   169 | `allPractice.ts`; locked by `__tests__/rn-practice.test.ts`       |

Subtopics 6–9 all come from printed §3.4; no §3.4.x numbers are invented. Review retrieval questions (one per subtopic) are written for the app, labelled, and kept out of these counts.

## Practice placement

- **Tutorial 3:** Q1–Q2 → §3.1; Q3–Q6, Q8(i)(ii), Q17 → §3.2.1; Q9, Q10–Q16 (i)–(iii), Q19 → §3.2.2; Q7, Q8(iii), Q10–Q16 (iv)–(xii), Q18 → §3.2.3.
- **Tutorial 4:** Q1, Q2, Q6, Q8(c) → §3.2.3; Q7, Q8(a)(b) → §3.2.1 (Advanced tutorial practice); Q11–Q16 → Chain Rule: One Independent Variable; Q3–Q5, Q9, Q10, Q17–Q23 → Chain Rule: Two or More Independent Variables; Q35 → Changing Variables with Differentials; Q24–Q34, Q36, Q37 → Second-Order Chain Rule and Coordinate Changes.

Every practice card shows its source (for example "Tutorial 3 · Q10(iv)" or "APP PRACTICE").

## Grading

| Type    | Count | Meaning                                                                                         |
| ------- | ----: | ----------------------------------------------------------------------------------------------- |
| auto    |   118 | The final answer is checked at several points from the question itself (`lib/math/partial.ts`). |
| partial |    23 | The final answer is checked; the method (limit working or a verification) is written.           |
| written |    28 | Not auto-graded: "show that" identities, domains, and parts whose intent is under review.       |

Mixed partials follow the notes' convention: f_xy = ∂/∂y(∂f/∂x) = ∂²f/∂y∂x (MR3-03). The checker never uses `eval`; first partial derivatives are exact, second derivatives use a central difference of the exact first derivative, and an answer must agree at every sample point.

## Solutions

The tutorials have no answer key (MR3-T8). Every walkthrough is app guidance, stored as `pendingLecturerReview`, and never presented as an official, lecturer or UNAM solution. Every suggested answer is run through the learner checker in the tests.

## Manual review register (internal)

`content/topics/differential/manualReview.ts` holds 15 open items (MR3-01 to MR3-06 and MR3-T1 to MR3-T9). None blocks learner use; the source is shown exactly as printed, and no flag text is shown to learners. Items that need the lecturer's decision include:

- MR3-02, Theorem 3.2.1's hypothesis;
- MR3-06, the Example 3.4.6 verification denominator;
- MR3-T1 (Q8 ∂f versus z);
- MR3-T2 (Q19(i) k(z, z));
- MR3-T9 (Q17(v): the integral diverges at t = 0).

## Interactive activities

See `docs/topic3-phase-d-evidence.md` for Play and Create. Explore has one lab per subtopic (`components/explore/rn/RnLabs.tsx`), each opening on its worked example's printed numbers.
