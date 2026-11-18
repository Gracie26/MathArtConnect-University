-- =============================================================================
-- MathArt Connect: register Topic 1, Integration (UNAM S3512MC Calculus II)
-- -----------------------------------------------------------------------------
-- Content catalogue rows only. Non-destructive and safe to run more than once:
--   * inserts the topic and its seven learning units (upsert of catalogue
--     metadata on re-run; ids never change once learners have progress)
--   * makes Integration the active topic: the previously active topic (the
--     demo placeholder) is set inactive, not deleted
--   * no tables, columns, grants or RLS policies are changed
--
-- Unit ids and step keys must match content/topics/integration (checked by
-- __tests__/integration-content.test.ts).
-- =============================================================================

insert into public.learning_topics (id, family, title, subtitle, description, content_version, is_demo, sort_order)
values (
  'integration',
  'integration',
  'Integration',
  'Calculus II',
  'Understand integration as reversing differentiation and learn how to recognise and apply appropriate integration techniques.',
  '1.0.0',
  false,
  1
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
  ('integration-understanding', 'integration', 'Understanding Integration',
   'Integration as reversing differentiation, and why every answer carries a constant C.', 1,
   array['concept','see-it','explore','try-it','worked-example','play','create','reflect','review'], 15, false),
  ('integration-basic-rules', 'integration', 'Basic Integration Rules',
   'The power rule, its one exception, sums, constant multiples and the standard anti-derivatives.', 2,
   array['concept','see-it','explore','try-it','worked-example','practise','play','create','reflect','review'], 20, false),
  ('integration-substitution', 'integration', 'Substitution',
   'Recognise a function inside a function, together with its derivative, and simplify with u.', 3,
   array['concept','see-it','explore','try-it','worked-example','practise','play','create','reflect','review'], 25, false),
  ('integration-partial-fractions', 'integration', 'Partial Fractions',
   'Split rational functions into simpler fractions: recognise the form first, then find the coefficients.', 4,
   array['concept','see-it','explore','try-it','worked-example','practise','play','reflect','review'], 30, false),
  ('integration-algebraic-trig-substitution', 'integration', 'Algebraic and Trigonometric Substitution',
   'Substitutions that remove roots and turn sines and cosines into rational functions.', 5,
   array['concept','see-it','explore','try-it','worked-example','practise','create','reflect','review'], 30, false),
  ('integration-by-parts', 'integration', 'Integration by Parts',
   'Reverse the product rule, choose u and dv well, and repeat the method when needed.', 6,
   array['concept','see-it','explore','try-it','worked-example','practise','play','reflect','review'], 25, false),
  ('integration-advanced-patterns', 'integration', 'Advanced Integration Patterns',
   'Reduction formulas, powers of sine and cosine, and choosing a strategy before calculating.', 7,
   array['concept','see-it','explore','try-it','worked-example','practise','play','create','reflect','review'], 30, false)
on conflict (id) do update set
  topic_id          = excluded.topic_id,
  title             = excluded.title,
  summary           = excluded.summary,
  sort_order        = excluded.sort_order,
  sections          = excluded.sections,
  estimated_minutes = excluded.estimated_minutes,
  is_demo           = excluded.is_demo;

-- Exactly one topic may be active (unique partial index), so deactivate the
-- current active topic first, then activate Integration.
update public.learning_topics set is_active = false where is_active and id <> 'integration';
update public.learning_topics set is_active = true where id = 'integration' and not is_active;
