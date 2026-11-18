-- =============================================================================
-- MathArt Connect: register Topic 4, Applications of Partial Derivatives
-- (UNAM S3512MC Calculus II, Chapter 4 and Tutorial 5)
-- -----------------------------------------------------------------------------
-- Why this migration is needed: learner progress (lesson_progress.unit_id)
-- and practice attempts (question_attempts.topic_id / unit_id) reference
-- learning_topics and learning_units by foreign key, so Topic 4's progress
-- cannot be saved until its catalogue rows exist.
--
-- Content catalogue rows only. Non-destructive and safe to run more than once:
--   * inserts the topic and its four learning units (upsert of catalogue
--     metadata on re-run; ids never change once learners have progress)
--   * does NOT change which topic is active: Integration stays the active
--     topic; the app lists every bundled topic from its own registry
--   * no tables, columns, grants or RLS policies are changed; no rows are
--     removed; existing learner data is untouched
--   * family 'applications-of-derivatives' is one of the values allowed by
--     the existing check constraint
--
-- Unit ids and step keys must match content/topics/applications (checked by
-- __tests__/pda-content.test.ts).
-- =============================================================================

insert into public.learning_topics (id, family, title, subtitle, description, content_version, is_demo, sort_order)
values (
  'partial-derivative-applications',
  'applications-of-derivatives',
  'Applications of Partial Derivatives',
  'Calculus II',
  'The gradient, tangent planes and normal lines to surfaces, critical points and relative extrema, and the Second Partials Test.',
  '1.0.0',
  false,
  4
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
  ('pda-gradient', 'partial-derivative-applications', 'The Gradient',
   'The gradient ∇f(x, y) = fx i + fy j: a vector built from the first partial derivatives.', 1,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 20, false),
  ('pda-tangent-planes-normal-lines', 'partial-derivative-applications', 'Tangent Planes and Normal Lines',
   'The tangent plane and normal line to a surface F(x, y, z) = 0, both found from ∇F at the point.', 2,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 30, false),
  ('pda-critical-points-relative-extrema', 'partial-derivative-applications', 'Critical Points and Relative Extrema',
   'Relative minima and maxima, and where to look for them: the critical points of f.', 3,
   array['concept','worked-example','explore','practise','play','reflect','review'], 25, false),
  ('pda-second-partials-test', 'partial-derivative-applications', 'The Second Partials Test',
   'Classify a critical point as a relative minimum, relative maximum or saddle point using d.', 4,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 30, false)
on conflict (id) do update set
  topic_id          = excluded.topic_id,
  title             = excluded.title,
  summary           = excluded.summary,
  sort_order        = excluded.sort_order,
  sections          = excluded.sections,
  estimated_minutes = excluded.estimated_minutes,
  is_demo           = excluded.is_demo;
