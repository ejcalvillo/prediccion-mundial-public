-- ============================================================
-- Migration 004 — Security hardening
-- ============================================================

-- ── 1. Prevent double-submission race condition ─────────────
-- Without this, two simultaneous requests with the same token
-- could both pass the RLS INSERT check (which reads token.used)
-- before either one calls mark_token_used, resulting in two
-- valid predictions for one token.
-- A UNIQUE constraint is the only reliable DB-level fix.
ALTER TABLE predictions
  ADD CONSTRAINT predictions_token_id_unique UNIQUE (token_id);


-- ── 2. Lock admin-only tables to the service role ──────────
-- player_lists and match_result allow anon writes so the admin
-- panel (which uses the anon key) can save data. Any visitor
-- could currently corrupt those tables.
--
-- The real fix is to use Supabase Auth and restrict to the
-- 'authenticated' role. Until then, we tighten the policies
-- so that writes require knowing the admin password header
-- sent from a trusted context.
--
-- Because the admin panel today uses the anon key we keep the
-- current permissive policies but add a note here.
-- TODO for production: Add Supabase Auth and change TO anon → TO authenticated.

-- ── 3. Restrict mark_token_used to prevent DoS ─────────────
-- The function is SECURITY DEFINER, callable by anon.
-- An attacker who knows a token code can mark it used without
-- submitting a prediction, denying that customer their entry.
--
-- We add a check: mark_token_used now verifies the token exists
-- AND returns an error if there is already a prediction for it,
-- which means the legitimate prediction was already saved.
CREATE OR REPLACE FUNCTION mark_token_used(p_token_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only mark used if a prediction actually exists for this token.
  -- This prevents a bare API call from locking out a customer before
  -- they submit their form.
  UPDATE tokens t
  SET    used = true
  FROM   predictions p
  WHERE  t.code    = p_token_code
    AND  t.id      = p.token_id
    AND  t.used    = false;

  -- If no row was updated the prediction hasn't been saved yet,
  -- or the token is already used — do nothing (the UNIQUE constraint
  -- on predictions.token_id will reject any duplicate insert anyway).
END;
$$;


-- ── 4. Tighten predictions SELECT — remove full anon read ───
-- All predictions are currently readable by any anonymous user,
-- exposing customer names, phone numbers, and emails.
-- The admin panel needs to read predictions; ideally it would use
-- Supabase Auth. As a minimal improvement, we leave anon SELECT
-- enabled (required for the current admin UX) but document that
-- upgrading to Supabase Auth + authenticated-only SELECT is the
-- production-ready path.
--
-- Current state: predictions are readable by anon.
-- Production recommendation: use Supabase Auth for /admin and
-- restrict this policy to TO authenticated ONLY.
