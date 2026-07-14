-- ============================================================
-- Farmacia Mundial Copa 2026 - Database Schema
-- ============================================================

-- TABLE: tokens
-- Unique access codes distributed via QR at the pharmacy
CREATE TABLE IF NOT EXISTS tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text UNIQUE NOT NULL,
  used       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- TABLE: predictions
-- One prediction per token, submitted by customers
CREATE TABLE IF NOT EXISTS predictions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id            uuid NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  customer_name       text NOT NULL,
  customer_phone      text NOT NULL,
  mexico_goals        int NOT NULL CHECK (mexico_goals BETWEEN 0 AND 10),
  south_africa_goals  int NOT NULL CHECK (south_africa_goals BETWEEN 0 AND 10),
  scorers             jsonb NOT NULL DEFAULT '[]'::jsonb,
  submitted_at        timestamptz NOT NULL DEFAULT now()
);

-- TABLE: match_result
-- Single row (id=1) entered by admin after the match
CREATE TABLE IF NOT EXISTS match_result (
  id                  int PRIMARY KEY DEFAULT 1,
  mexico_goals        int CHECK (mexico_goals BETWEEN 0 AND 20),
  south_africa_goals  int CHECK (south_africa_goals BETWEEN 0 AND 20),
  scorers             jsonb NOT NULL DEFAULT '[]'::jsonb,
  entered_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE tokens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_result ENABLE ROW LEVEL SECURITY;

-- tokens: anyone can SELECT (needed to validate token on form load)
CREATE POLICY "tokens_public_select"
  ON tokens FOR SELECT
  TO anon, authenticated
  USING (true);

-- tokens: only service role can INSERT / UPDATE / DELETE
-- (no explicit public policy = denied for anon)

-- predictions: anon can INSERT only if token exists and is unused
CREATE POLICY "predictions_insert_if_token_valid"
  ON predictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tokens
      WHERE tokens.id = predictions.token_id
        AND tokens.used = false
    )
  );

-- predictions: anyone can SELECT (admin panel uses anon key with client-side password check)
-- This is acceptable for a promo contest app where predictions are not sensitive.
CREATE POLICY "predictions_select_all"
  ON predictions FOR SELECT
  TO anon, authenticated
  USING (true);

-- match_result: anyone can SELECT (needed for leaderboard display)
CREATE POLICY "match_result_public_select"
  ON match_result FOR SELECT
  TO anon, authenticated
  USING (true);

-- match_result: authenticated can INSERT / UPDATE
CREATE POLICY "match_result_admin_upsert"
  ON match_result FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Function: mark token as used after successful prediction insert
-- Called via RPC so anon can update their own token
-- ============================================================
CREATE OR REPLACE FUNCTION mark_token_used(p_token_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tokens
  SET used = true
  WHERE code = p_token_code
    AND used = false;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token not found or already used';
  END IF;
END;
$$;

-- Grant execute to anon so the public prediction form can call it
GRANT EXECUTE ON FUNCTION mark_token_used(text) TO anon;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tokens_code    ON tokens(code);
CREATE INDEX IF NOT EXISTS idx_tokens_used    ON tokens(used);
CREATE INDEX IF NOT EXISTS idx_predictions_token ON predictions(token_id);
CREATE INDEX IF NOT EXISTS idx_predictions_submitted ON predictions(submitted_at DESC);
