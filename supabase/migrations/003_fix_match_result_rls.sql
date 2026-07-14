-- ============================================================
-- Migration 003 — Fix match_result write access
--
-- The admin panel uses the anon key (client-side password auth).
-- The original policy only allowed the 'authenticated' role to
-- write to match_result, so the admin could never save the result.
-- ============================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "match_result_admin_upsert" ON match_result;

-- Recreate allowing both anon and authenticated
CREATE POLICY "match_result_upsert"
  ON match_result FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
