-- Add templates for panic-call category
INSERT INTO public.dont_panic_templates (id, title, description, icon, color, points, points_icon, point_unit, notification_text, is_active, category_id) 
VALUES
  ('call-over-soon', 'The call will end soon', 'Hang in there, it will be over before you know it 💪', '📞', '#EF4444', 2, '⛑️⛑️', 'calm', 'Your partner knows the call is stressful.', true, 'panic-call'),
  ('mute-breathe', 'Mute and breathe', 'Take a moment to mute and breathe deeply 🌬️', '🔇', '#EF4444', 3, '⛑️⛑️⛑️', 'calm', 'Your partner suggests taking a breathing break.', true, 'panic-call'),
  ('you-got-this-call', 'You can handle this', 'You''ve handled tough calls before, you''ve got this! 💯', '💪', '#EF4444', 4, '⛑️⛑️⛑️⛑️', 'calm', 'Your partner believes in you.', true, 'panic-call');

-- Add templates for panic-work category  
INSERT INTO public.dont_panic_templates (id, title, description, icon, color, points, points_icon, point_unit, notification_text, is_active, category_id)
VALUES
  ('work-not-life', 'Work is not your life', 'Remember, this is just a job. You are so much more ✨', '💼', '#8B5CF6', 3, '⛑️⛑️⛑️', 'calm', 'Your partner reminds you of perspective.', true, 'panic-work'),
  ('proud-of-you-work', 'I''m proud of you', 'You work so hard and I''m incredibly proud of you 🌟', '🏆', '#8B5CF6', 2, '⛑️⛑️', 'calm', 'Your partner is proud of your efforts.', true, 'panic-work'),
  ('leave-work-stress', 'Leave work at work', 'Close your laptop, the work will be there tomorrow 🏠', '🚪', '#8B5CF6', 4, '⛑️⛑️⛑️⛑️', 'calm', 'Your partner encourages work-life balance.', true, 'panic-work');

-- Add templates for panic-health category
INSERT INTO public.dont_panic_templates (id, title, description, icon, color, points, points_icon, point_unit, notification_text, is_active, category_id)
VALUES  
  ('health-together', 'We''ll face this together', 'Whatever happens, we''ll handle it together ❤️', '🤝', '#EC4899', 3, '⛑️⛑️⛑️', 'calm', 'Your partner is with you through this.', true, 'panic-health'),
  ('body-is-strong', 'Your body is strong', 'Your body has carried you this far, trust it 💪', '💗', '#EC4899', 2, '⛑️⛑️', 'calm', 'Your partner believes in your strength.', true, 'panic-health'),
  ('one-step-time', 'One step at a time', 'Don''t think too far ahead, just focus on now 🦶', '👣', '#EC4899', 4, '⛑️⛑️⛑️⛑️', 'calm', 'Your partner encourages taking it slow.', true, 'panic-health');

-- Verify distribution
SELECT category_id, COUNT(*) as template_count 
FROM dont_panic_templates 
WHERE is_active = true
GROUP BY category_id
ORDER BY category_id;