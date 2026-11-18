-- =============================================================================
-- DEVELOPMENT SEED ONLY: applied by `supabase db reset` on a local stack.
-- Do not run against production. All content here is demo/placeholder data
-- and is replaced after the student needs assessment selects the topic.
-- =============================================================================

insert into public.app_config (key, value, description) values
  ('streak_timezone', '"Africa/Windhoek"', 'Timezone used to compute daily streaks.')
on conflict (key) do nothing;

insert into public.learning_topics (id, family, title, subtitle, is_active, is_demo, sort_order) values
  ('demo-calculus-focus', 'demo', '[DEMO] Calculus Focus Topic',
   'Development placeholder: replaced after the needs assessment', true, true, 0)
on conflict (id) do nothing;

insert into public.learning_units (id, topic_id, title, summary, sort_order, sections, estimated_minutes, is_demo) values
  ('demo-unit-1', 'demo-calculus-focus', '[DEMO] Unit 1', 'Development placeholder unit for testing components.', 1,
   array['introduction','why-it-matters','key-vocabulary','visual-explanation','worked-example',
         'interactive-exploration','guided-practice','game','creative-activity','mini-quiz','reflection','review'],
   20, true)
on conflict (id) do nothing;
