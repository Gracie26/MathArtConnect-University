# How MathArt Connect checks answers

This page describes what the code in `lib/math/` actually does, for examiners, reviewers and future developers. It is a description, not a claim that the app improves performance.

## The principle

Answers are **not** compared as strings, and in most cases they are not compared with a typed answer key either. Each checker computes the mathematics from the question and compares numbers:

- The learner's input is parsed into an expression tree (`lib/math/input/parse.ts`). Only an allow-list of functions and the question's own variables are accepted. Nothing the learner types is ever run as code (no `eval`, no `new Function`).
- The tree is evaluated at several sample points inside the question's domain. Derivatives are exact: they use dual numbers (`lib/math/input/evaluate.ts`), not finite differences.
- Two expressions count as equal when they agree at every sample point, to a relative tolerance of about 10⁻⁶. At least three valid points are needed. Otherwise the result is **cannot check**, never **incorrect**.

This is why any mathematically equivalent form is accepted: `(x²+1)⁴/4 + C` and its expansion, `ln|x|` and `ln x` for x > 0, or `sin²x/2`, `−cos²x/2` and `−cos 2x/4` (which differ by constants).

## Final answers, by question type

| Question type                                                      | How the answer is judged                                                                                                                                                                                                                                                                                                                                   | Code                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Indefinite integral (Topic 1)                                      | Differentiate the learner's answer exactly and compare it with the integrand at the sample points. If `+ C` is missing, the answer is marked "correct anti-derivative, remember + C" (saved as a mistake, so it shows in Review).                                                                                                                          | `check.ts`                              |
| Definite and improper integrals, Riemann sums (Topic 2)            | Compare with the value of the integral or the sum, computed from the question. Exact forms (`9/2`, `2sqrt(3)`, `pi/4`) are accepted, and so are decimals correct to 4 decimal places (with a note that an exact form is better). "Diverges" or "converges" is read from words. The ith term of a Riemann sum is compared with f(xᵢ)Δx for several n and i. | `definite.ts`                           |
| Partial derivatives, total differentials, chain rule (Topics 3, 4) | Compute the reference from the function: first partials exactly with dual numbers, second partials by a central difference of the exact first partial. Compare at several points. A value at a point may be exact (`3e^2`) or a decimal to 4 decimal places.                                                                                               | `partial.ts`                            |
| Tangent planes and normal lines (Topic 4)                          | A plane is accepted if (left − right) is a non-zero multiple of ∇F(P)·(X − P), so any equivalent equation of the plane counts. A normal line must pass through P in the direction ∇F(P).                                                                                                                                                                   | `applications.ts`                       |
| Critical points and the Second Partials Test (Topic 4)             | Compared as a set, in any order, with the complete list for the function. Each list was written for the app and is verified independently in the tests (each point is critical, no point is missing in a wide numerical search, and each type follows d = f_xx f_yy − f_xy²). Exact forms or decimals to 4 decimal places.                                 | `applications.ts`                       |
| Written questions (28 in Topic 3, 1 in Topic 4)                    | Not graded. The learner compares their answer with the app guidance.                                                                                                                                                                                                                                                                                       | `checkProblem.ts`                       |
| Quick checks and game choice rounds                                | Multiple choice with one marked answer (or a set of answers), and feedback written for each option. Game input rounds use the checkers above.                                                                                                                                                                                                              | `QuickCheck.tsx`, `lib/games/engine.ts` |

Formatting variations that are accepted: spaces, `**` or `^`, `x³`, `(1/3)x^3`, `1/3 x^3`, `x^3/3`, `y = …` or `F(x) = …` in front of the answer, `log` for `ln`, `sinx`, `Sin x`, `SIN(x)`, and a lower-case `+ c` or `+ k` as the constant of integration.

## My Working (step-by-step)

The learner writes any number of lines. Each line is checked when the learner taps "Check step", together with the substitutions defined in the lines above it. A line is judged by what it is:

- **A substitution** such as `u = 3x + 5` is recorded ("Noted") and used to check later lines.
- **A differential** such as `du = 3 dx` is checked against the derivative of the recorded substitution.
- **An expression with an integral sign** (`∫ u^5 du`, `1/3 ∫ u^5 du`) is correct if it equals the original integral, up to a constant. Its derivative is compared with the integrand, through the substitution.
- **An expression without an integral** is correct if it is a rewrite of the integrand (the same values, e.g. after partial fractions) or an anti-derivative (the same derivative). An anti-derivative still in u gets "Now write it in terms of x".
- **An equation** `A = B` (or `A = B = C`) is correct if the sides are equal. With an integral on either side, they must be equal up to a constant.
- Topics 2 to 4 recognise the lines of their methods in the same way: Δx, xᵢ, Riemann-sum terms and closed forms, values of F at the limits, limits as t → ∞, partial derivatives, values at a point, f_x = 0, ∇F(P), and so on.

Because each line is checked for mathematical truth, **different valid methods are accepted**. For example, expanding `2x(x²+1)³` first and integrating term by term passes just as the substitution `u = x² + 1` does.

Feedback says why a line is wrong where the checker knows: "This differential does not match the substitution", "Your answer still contains an integral", "Write your final answer in terms of x", or "the two sides are not equal". Help comes in stages and does not reveal the answer at once: Hint 1 (think about it), Hint 2 (method), Hint 3 (next action), then the walkthrough one step at a time, then the full answer. In Challenge mode, help unlocks only after the first answer check. All hints and walkthroughs are labelled app guidance, not official UNAM or lecturer solutions.

## How the stored answers and content are verified

The automated tests (`npm test`, more than 3,000 tests) check the content as well as the code. A few examples:

- Every Topic 1 anti-derivative and printed worked-example result is differentiated numerically and compared with its integrand, using a separate, test-only TeX evaluator (`test-utils/texEval.ts`), not the learner checker (`integration-solutions.test.ts`, `integration-mathematics.test.ts`).
- Topic 2 values, approximations and convergence results are recomputed by independent quadrature (`area-solutions.test.ts`).
- In Topics 3 and 4, every suggested answer must be accepted by the checker, and a wrong answer must be rejected for every graded item, so there are no false positives. Every derivative written in a walkthrough is recomputed, and no critical point is missing (`rn-practice.test.ts`, `pda-practice.test.ts`).
- `answer-equivalence.test.ts` covers correct answers, equivalent forms, formatting variations, sign errors, common mistakes, decimals against exact forms, and the constant of integration.

Where the printed notes contain a slip, the app does not silently correct it. It shows the material as printed, with an "awaiting lecturer review" note, and records it in the manual-review register (`content/topics/*/manualReview.ts`).

## Limitations

- **This is not a computer algebra system.** It decides equality numerically at sample points. In principle, two different expressions that agree at every sample point would both be accepted. Each question uses three to five points spread across its domain, mostly not whole numbers, which makes this very unlikely. Still, it is a numerical check, not a proof.
- **It does not judge form or method quality.** An unsimplified but correct answer is accepted, and so is a correct line that the learner did not justify. Each line is checked for being true, not for following from the line before by a named rule.
- **Some steps cannot be checked automatically.** Inverse substitutions such as `x = 2 sin θ` are noted, and the steps in θ are reported as "cannot check, compare with the hints or walkthrough". The same applies to anything the parser cannot read and to symbols it does not know. Nothing is marked wrong just because it cannot be checked.
- **Notation is read in one fixed way.** For example, `e^3x` is read as e³·x, so write `e^(3x)`. The live preview under each input shows exactly how a line was read.
- **Decimals in an indefinite integral are not accepted** (`0.3333x^3` for `x^3/3`): coefficients must be exact. Decimals are accepted for numeric answers (values, points), to 4 decimal places.
- **Written explanations, sketches and conclusions are not graded.**
- **Critical-point lists and a few fixed numbers are app-authored.** They are verified by the tests, but they are still marked as pending lecturer review, like every app-generated solution.
