-- =============================================================================
-- MathArt Connect: register Topic 3, Differential Calculus in R^n
-- (UNAM S3512MC Calculus II, Chapter 3, Tutorial 3 and Tutorial 4)
-- -----------------------------------------------------------------------------
-- Why this migration is needed: learner progress (lesson_progress.unit_id)
-- and practice attempts (question_attempts.topic_id / unit_id) reference
-- learning_topics and learning_units by foreign key, so Topic 3's progress
-- cannot be saved until its catalogue rows exist.
--
-- Content catalogue rows only. Non-destructive and safe to run more than once:
--   * inserts the topic and its nine learning units (upsert of catalogue
--     metadata on re-run; ids never change once learners have progress)
--   * does NOT change which topic is active: Integration stays the active
--     topic; the app lists every bundled topic from its own registry
--   * no tables, columns, grants or RLS policies are changed
--   * family 'derivatives' is one of the values allowed by the existing check
--
-- Unit ids and step keys must match content/topics/differential (checked by
-- __tests__/rn-content.test.ts).
-- =============================================================================

insert into public.learning_topics (id, family, title, subtitle, description, content_version, is_demo, sort_order)
values (
  'differential-calculus-rn',
  'derivatives',
  'Differential Calculus in ℝⁿ',
  'Calculus II',
  'Functions of several variables, partial derivatives, higher-order partial derivatives, the total differential and chain rules for functions of several variables.',
  '1.0.0',
  false,
  3
)
on conflict (id) do update set
  family          = excluded.family,
  title           = excluded.title,
  subtitle        = excluded.subtitle,
  description     = excluded.description,
  content_version = excluded.content_version,
  is_demo         = excluded.is_demo,
  sort_order      = excluded.sort_order;

insert into public.learning_units (id, topic_id, title, summary, sort_order, sections, estimated_minutes, is_demo)
values
  ('rn-functions-of-several-variables', 'differential-calculus-rn', 'Functions of Several Variables',
   'Functions of two or more variables, their domain and range, and how such functions are combined.', 1,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 20, false),
  ('rn-partial-derivatives', 'differential-calculus-rn', 'Partial Derivatives',
   'The partial derivatives fx and fy as limits, their notation, and their values at a point.', 2,
   array['concept','worked-example','notation','evaluating','explore','practise','play','create','reflect','review'], 30, false),
  ('rn-partial-derivatives-three-variables', 'differential-calculus-rn', 'Partial Derivatives of Three or More Variables',
   'Partial derivatives of w = f(x, y, z) and beyond: hold every other variable constant.', 3,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 20, false),
  ('rn-higher-order-partials', 'differential-calculus-rn', 'Higher-Order Partial Derivatives and Clairaut’s Theorem',
   'Second and higher partial derivatives, mixed partials and when their order does not matter.', 4,
   array['concept','worked-example','clairaut','third-order','explore','practise','play','create','reflect','review'], 35, false),
  ('rn-total-differential', 'differential-calculus-rn', 'The Total Differential',
   'The differentials dx and dy, and the total differential dz = fx dx + fy dy.', 5,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 15, false),
  ('rn-chain-rule-one-variable', 'differential-calculus-rn', 'Chain Rule: One Independent Variable',
   'dw/dt when w = f(x, y) and x, y are functions of t, with the tree diagram of Figure 3.1.', 6,
   array['concept','worked-example','more-variables','explore','practise','play','create','reflect','review'], 25, false),
  ('rn-chain-rule-two-variables', 'differential-calculus-rn', 'Chain Rule: Two or More Independent Variables',
   '∂w/∂s and ∂w/∂t when the intermediate variables depend on s and t, with the tree diagram of Figure 3.2.', 7,
   array['concept','worked-example','theorem','chain-rule-example','three-variables','explore','practise','play','create','reflect','review'], 35, false),
  ('rn-changing-variables', 'differential-calculus-rn', 'Changing Variables with Differentials',
   'Find partial derivatives of x and y with respect to new variables by solving equations in differentials.', 8,
   array['worked-example','parabolic-coordinates','explore','practise','play','create','reflect','review'], 30, false),
  ('rn-second-order-chain-rule', 'differential-calculus-rn', 'Second-Order Chain Rule and Coordinate Changes',
   'Second derivatives through the Chain Rule, as in polar coordinates x = r cos θ, y = r sin θ.', 9,
   array['worked-example','explore','practise','play','create','reflect','review'], 30, false)
on conflict (id) do update set
  topic_id          = excluded.topic_id,
  title             = excluded.title,
  summary           = excluded.summary,
  sort_order        = excluded.sort_order,
  sections          = excluded.sections,
  estimated_minutes = excluded.estimated_minutes,
  is_demo           = excluded.is_demo;
