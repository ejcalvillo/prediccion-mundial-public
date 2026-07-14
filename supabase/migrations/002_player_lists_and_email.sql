-- ============================================================
-- Migration 002 — Player lists + Email + Phone column cleanup
-- Safe to run regardless of whether migration 001's column was
-- ever renamed to customer_whatsapp in a prior run.
-- ============================================================

-- Add email column (idempotent)
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS customer_email text;

-- Rename customer_whatsapp → customer_phone only if the whatsapp
-- column exists (handles the case where an earlier migration 002
-- draft had renamed it away from customer_phone).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'predictions'
      AND column_name  = 'customer_whatsapp'
  ) THEN
    ALTER TABLE predictions RENAME COLUMN customer_whatsapp TO customer_phone;
  END IF;
END $$;

-- ============================================================
-- TABLE: player_lists
-- Editable roster per team, stored as JSONB.
-- Shape of each player object: { id, number, position, name }
-- ============================================================
CREATE TABLE IF NOT EXISTS player_lists (
  team        text PRIMARY KEY CHECK (team IN ('Mexico', 'South Africa')),
  players     jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE player_lists ENABLE ROW LEVEL SECURITY;

-- Public can read (needed by the prediction form on customers' phones)
CREATE POLICY "player_lists_public_select"
  ON player_lists FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow writes via anon key (admin uses client-side password, not Supabase Auth)
CREATE POLICY "player_lists_upsert"
  ON player_lists FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Seed default rosters
-- ON CONFLICT DO NOTHING so re-running the migration is safe.
-- ============================================================
INSERT INTO player_lists (team, players) VALUES
(
  'Mexico',
  '[
    {"id":"mx-1", "number":"1",  "position":"POR","name":"Guillermo Ochoa"},
    {"id":"mx-2", "number":"6",  "position":"MED","name":"Edson Álvarez"},
    {"id":"mx-3", "number":"22", "position":"DEL","name":"Hirving (Chucky) Lozano"},
    {"id":"mx-4", "number":"9",  "position":"DEL","name":"Raúl Jiménez"},
    {"id":"mx-5", "number":"11", "position":"DEL","name":"Henry Martín"},
    {"id":"mx-6", "number":"10", "position":"DEL","name":"Alexis Vega"},
    {"id":"mx-7", "number":"7",  "position":"MED","name":"Roberto Alvarado"},
    {"id":"mx-8", "number":"14", "position":"MED","name":"Orbelín Pineda"},
    {"id":"mx-9", "number":"4",  "position":"DEF","name":"Johan Vásquez"},
    {"id":"mx-10","number":"3",  "position":"DEF","name":"César Montes"},
    {"id":"mx-11","number":"21", "position":"DEF","name":"Jesús Gallardo"}
  ]'::jsonb
),
(
  'South Africa',
  '[
    {"id":"sa-1", "number":"16","position":"POR","name":"Ronwen Williams"},
    {"id":"sa-2", "number":"11","position":"DEL","name":"Percy Tau"},
    {"id":"sa-3", "number":"10","position":"DEL","name":"Themba Zwane"},
    {"id":"sa-4", "number":"8", "position":"MED","name":"Bongani Zungu"},
    {"id":"sa-5", "number":"9", "position":"DEL","name":"Evidence Makgopa"},
    {"id":"sa-6", "number":"7", "position":"DEL","name":"Lyle Foster"},
    {"id":"sa-7", "number":"17","position":"MED","name":"Yusuf Maart"},
    {"id":"sa-8", "number":"5", "position":"DEF","name":"Siyanda Xulu"},
    {"id":"sa-9", "number":"13","position":"MED","name":"Teboho Mokoena"},
    {"id":"sa-10","number":"19","position":"DEL","name":"Ethan Ntagungira"}
  ]'::jsonb
)
ON CONFLICT (team) DO NOTHING;
