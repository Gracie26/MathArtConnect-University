-- =============================================================================
-- MathArt Connect: register Topic 2, Integration as a Process of Finding the
-- Area Under the Graph (UNAM S3512MC Calculus II, Chapter 2)
-- -----------------------------------------------------------------------------
-- Why this migration is needed: learner progress (lesson_progress.unit_id)
-- and practice attempts (question_attempts.topic_id / unit_id) reference
-- learning_topics and learning_units by foreign key, so Topic 2's progress
-- cannot be saved until its catalogue rows exist.
--
-- Content catalogue rows only. Non-destructive and safe to run more than once:
--   * inserts the topic and its eight learning units (upsert of catalogue
--     metadata on re-run; ids never change once learners have progress)
--   * does NOT change which topic is active: Integration stays the active
--     topic; the app lists every bundled topic from its own registry
--   * no tables, columns, grants or RLS policies are changed
--
-- Unit ids and step keys must match content/topics/area (checked by
-- __tests__/area-content.test.ts).
-- =============================================================================

insert into public.learning_topics (id, family, title, subtitle, description, content_version, is_demo, sort_order)
values (
  'integration-area',
  'integration',
  'Integration as a Process of Finding the Area Under the Graph',
  'Calculus II',
  'Definite integrals as limits of Riemann sums, their properties, the Fundamental Theorem of Calculus, the Mean Value Theorem for Integrals and improper integrals.',
  '1.0.0',
  false,
  2
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
  ('area-riemann-sums', 'integration-area', 'Area Under a Graph and Riemann Sums',
   'The area problem, and approximating an area by rectangles: right endpoints, left endpoints and sample points.', 1,
   array['concept','see-it','explore','practise','play','create','reflect','review'], 25, false),
  ('area-definite-integral', 'integration-area', 'The Definite Integral',
   'The definite integral as a limit of Riemann sums, evaluated with sums of powers, and the Mid-point Rule.', 2,
   array['concept','worked-example','try-it','midpoint-rule','explore','practise','play','create','reflect','review'], 35, false),
  ('area-properties', 'integration-area', 'Properties of the Definite Integral',
   'Equal limits, reversed limits, constant multiples, sums, splitting the interval, the dummy variable and comparisons.', 3,
   array['concept','see-it','worked-example','explore','practise','play','create','reflect','review'], 20, false),
  ('area-fundamental-theorem', 'integration-area', 'The Fundamental Theorem of Calculus',
   'Evaluate definite integrals with anti-derivatives, and differentiate an integral with a variable upper limit.', 4,
   array['concept','worked-example','second-fundamental-theorem','sftc-examples','explore','practise','play','create','reflect','review'], 30, false),
  ('area-mean-value-theorem', 'integration-area', 'The Mean Value Theorem for Integrals',
   'A rectangle between the inscribed and circumscribed ones has exactly the area under the curve: the average value.', 5,
   array['concept','explore','play','create','reflect','review'], 15, false),
  ('area-improper-infinite-intervals', 'integration-area', 'Improper Integrals: Infinite Intervals',
   'Type I improper integrals: integrate up to t, let t → ∞, and decide whether the integral converges or diverges.', 6,
   array['concept','type-one','worked-example','explore','practise','play','create','reflect','review'], 30, false),
  ('area-improper-discontinuous', 'integration-area', 'Improper Integrals: Discontinuous Integrands',
   'Type II improper integrals: an integrand with a vertical asymptote at an endpoint or inside the interval.', 7,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 30, false),
  ('area-comparison-test', 'integration-area', 'Comparison Test for Improper Integrals',
   'Decide convergence without the exact value, by comparing with a simpler function.', 8,
   array['concept','worked-example','explore','practise','play','create','reflect','review'], 25, false)
on conflict (id) do update set
  topic_id          = excluded.topic_id,
  title             = excluded.title,
  summary           = excluded.summary,
  sort_order        = excluded.sort_order,
  sections          = excluded.sections,
  estimated_minutes = excluded.estimated_minutes,
  is_demo           = excluded.is_demo;
