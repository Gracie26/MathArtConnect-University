-- =============================================================================
-- Topic 1 Integration: interactive phase step lists
--
-- Content-metadata update only. Three subtopics gain a lesson step for this
-- phase (Partial Fractions: Create; Algebraic and Trigonometric Substitution:
-- Play; Integration by Parts: Create), so their `sections` arrays (the lesson
-- step keys) are brought in line with the app.
--
-- Non-destructive: no table is created, altered or dropped; no learner data is
-- touched; RLS and grants are unchanged. Safe to run more than once (rows that
-- already match are left as they are).
-- =============================================================================

update public.learning_units
set sections = array['concept', 'see-it', 'explore', 'try-it', 'worked-example', 'practise', 'play', 'create', 'reflect', 'review']
where id in ('integration-partial-fractions', 'integration-algebraic-trig-substitution', 'integration-by-parts')
  and sections is distinct from array['concept', 'see-it', 'explore', 'try-it', 'worked-example', 'practise', 'play', 'create', 'reflect', 'review'];
