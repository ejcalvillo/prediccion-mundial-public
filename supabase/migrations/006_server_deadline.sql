-- ============================================================
-- Migration 006 — Server-side deadline enforcement
--
-- The client-side check (isPastDeadline()) can be bypassed by:
--   • Changing the device clock
--   • Editing the compiled JS bundle in DevTools
--   • Calling the Supabase REST API directly
--
-- This migration moves the authoritative deadline into Postgres
-- so that now() (server UTC time) is the only clock that matters.
--
-- Deadline: December 31, 2026 23:59:59 CST = 2027-01-01 06:00:00 UTC
-- ============================================================

-- ── 1. Replace the predictions INSERT policy ───────────────
DROP POLICY IF EXISTS "predictions_insert_if_token_valid" ON predictions;

CREATE POLICY "predictions_insert_before_deadline"
  ON predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Server-side clock — cannot be spoofed from the client
    now() < TIMESTAMPTZ '2027-01-01 06:00:00+00'
    AND
    EXISTS (
      SELECT 1 FROM tokens
      WHERE tokens.id  = predictions.token_id
        AND tokens.used = false
    )
  );

-- ── 2. Update mark_token_used RPC to enforce deadline ─────
-- Without this, a caller who knows a token code could invoke
-- the function directly after the deadline to lock a token
-- (denial-of-service against the customer).
CREATE OR REPLACE FUNCTION mark_token_used(p_token_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Block any call after the deadline regardless of client clock
  IF now() >= TIMESTAMPTZ '2027-01-01 06:00:00+00' THEN
    RAISE EXCEPTION 'El período de predicciones ha cerrado';
  END IF;

  -- Only mark used if a matching prediction was already inserted.
  -- This prevents a bare API call from locking a token before
  -- the customer has submitted their form.
  UPDATE tokens t
  SET    used = true
  FROM   predictions p
  WHERE  t.code    = p_token_code
    AND  t.id      = p.token_id
    AND  t.used    = false;
END;
$$;

-- Grant still needed after CREATE OR REPLACE
GRANT EXECUTE ON FUNCTION mark_token_used(text) TO anon;
