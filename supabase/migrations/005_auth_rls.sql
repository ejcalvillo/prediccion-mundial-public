-- ============================================================
-- Migration 005 — Lock admin tables to Supabase Auth JWT
--
-- After this migration the admin panel MUST log in with
-- supabase.auth.signInWithPassword() to perform any write.
-- Anonymous users (public form) retain the minimum they need:
--   • tokens         — SELECT  (validate token on form load)
--   • predictions    — INSERT  (submit prediction)
--   • player_lists   — SELECT  (load player roster on form)
--   • match_result   — SELECT  (display result publicly if desired)
-- ============================================================

-- ── predictions: authenticated-only SELECT ──────────────────
-- Previously readable by anon, exposing names/phones/emails.
DROP POLICY IF EXISTS "predictions_select_all"           ON predictions;
DROP POLICY IF EXISTS "predictions_admin_select"         ON predictions;
DROP POLICY IF EXISTS "predictions_anon_select"          ON predictions;

CREATE POLICY "predictions_authenticated_select"
  ON predictions FOR SELECT
  TO authenticated
  USING (true);

-- ── match_result: authenticated-only writes ─────────────────
-- Previously anon could overwrite the official result.
DROP POLICY IF EXISTS "match_result_upsert"              ON match_result;
DROP POLICY IF EXISTS "match_result_admin_upsert"        ON match_result;

CREATE POLICY "match_result_authenticated_write"
  ON match_result FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
-- Public SELECT ("match_result_public_select") stays — anyone can
-- read the final score for display purposes.

-- ── player_lists: authenticated-only writes ─────────────────
-- Previously anon could corrupt the player rosters.
DROP POLICY IF EXISTS "player_lists_upsert"              ON player_lists;

CREATE POLICY "player_lists_authenticated_write"
  ON player_lists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
-- Public SELECT ("player_lists_public_select") stays — prediction
-- form needs to read rosters without being logged in.

-- ============================================================
-- How to create the admin user in Supabase
-- ============================================================
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter your email and a strong password
-- 4. That email+password is what you type at /admin
--
-- You can also run this SQL to create a user programmatically
-- (replace placeholders, then delete this comment):
--
-- SELECT auth.create_user(
--   '{"email":"admin@example.com","password":"your-strong-password","email_confirm":true}'
-- );
-- ============================================================
