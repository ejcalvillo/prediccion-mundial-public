-- ============================================================
-- Predicción Mundial — Synthetic Demo Seed Data
-- ============================================================
-- All customers, tokens, and predictions in this file are
-- entirely fictional. No real pharmacy customers are represented.
--
-- Run this AFTER all migrations (001–006) are applied.
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING.
--
-- To reset and re-run cleanly:
--   DELETE FROM predictions
--     WHERE token_id IN (SELECT id FROM tokens WHERE code LIKE 'FDN-DEMO%');
--   DELETE FROM tokens WHERE code LIKE 'FDN-DEMO%';
--   DELETE FROM match_result WHERE id = 1;
--
-- What this data demonstrates
-- ───────────────────────────
-- Fictional match result: México 2 – Sudáfrica 1
--   Scorers: Raúl Jiménez (MX, 1st half), Henry Martín (MX, 2nd half),
--            Percy Tau (SA, 1st half)
--
-- 18 predictions covering the full score range (0 – 22 pts):
--   • Clear winner with a perfect prediction          (22 pts)
--   • Exact score but varying scorer accuracy         (10 – 18 pts)
--   • Correct result (W) but wrong goals              (3 – 15 pts)
--   • Wrong result (draw or SA win) with partial hits (0 – 9 pts)
--
-- Two tiebreaker scenarios:
--   • 12-pt tie → broken by TB4: exact Mexico goals
--   • 5-pt tie  → broken by TB5: exact South Africa goals
--   • 10-pt tie → broken by TB6: earlier submission timestamp
--
-- One customer (Carlos Rodríguez) has two separate tokens, both
-- used — each prediction appears as its own leaderboard entry,
-- demonstrating that the contest enforces one-prediction-per-token,
-- not one-prediction-per-person.
--
-- Two tokens (FDN-DEMO0019, FDN-DEMO0020) left unused — shows that
-- not every distributed token was redeemed.
-- ============================================================


-- ── 1. TOKENS ────────────────────────────────────────────────
-- 20 clearly fictional tokens issued on the same date.
-- Tokens 1–18 are marked used (predictions inserted below).
-- Tokens 19–20 were never scanned.

INSERT INTO tokens (code, used, created_at) VALUES
  ('FDN-DEMO0001', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0002', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0003', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0004', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0005', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0006', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0007', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0008', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0009', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0010', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0011', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0012', true,  '2026-05-20 10:00:00+00'),  -- Carlos Rodríguez: 2nd token
  ('FDN-DEMO0013', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0014', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0015', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0016', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0017', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0018', true,  '2026-05-20 10:00:00+00'),
  ('FDN-DEMO0019', false, '2026-05-20 10:00:00+00'),  -- never redeemed
  ('FDN-DEMO0020', false, '2026-05-20 10:00:00+00')   -- never redeemed
ON CONFLICT (code) DO NOTHING;


-- ── 2. PREDICTIONS ───────────────────────────────────────────
-- All submissions are before the June 10 23:59 CDT deadline
-- (2026-06-11 05:00:00 UTC).
-- Expected points are listed per entry for easy verification.

-- ── Tier 1: Exact score ──────────────────────────────────────

-- FDN-DEMO0001 · Sofía Ramírez
-- Predicted: MX 2-1 SA  |  All 3 scorers + correct halves
-- eff_mx=2  eff_sa=1  result+2  exact+5  scorers: 4+4+4
-- Expected: 22 pts  →  RANK 1
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0001'),
  'Sofía Ramírez',
  '+52 8771234501',
  'sofia.ramirez@ejemplo.com',
  2, 1,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1},
    {"player_name":"Henry Martín","team":"Mexico","half":2},
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-01 14:32:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0002 · Carlos Rodríguez  (first of two entries)
-- Predicted: MX 2-1 SA  |  2 scorers with correct halves
-- eff_mx=2  eff_sa=1  result+2  exact+5  scorers: 4+4
-- Expected: 18 pts  →  RANK 2
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0002'),
  'Carlos Rodríguez',
  '+52 8771234502',
  'carlos.rodriguez@ejemplo.com',
  2, 1,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1},
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-01 16:05:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0003 · Valentina Cruz
-- Predicted: MX 2-1 SA  |  2 correct scorers but wrong halves
-- eff_mx=2  eff_sa=1  result+2  exact+5  scorers: 3+3 (name+team only, pass 2)
-- Expected: 16 pts  →  RANK 3
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0003'),
  'Valentina Cruz',
  '+52 8771234503',
  'valentina.cruz@ejemplo.com',
  2, 1,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":2},
    {"player_name":"Henry Martín","team":"Mexico","half":1}
  ]'::jsonb,
  '2026-06-01 18:47:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0004 · Miguel Flores
-- Predicted: MX 2-1 SA  |  1 scorer correct with half, 1 wrong player
-- eff_mx=2  eff_sa=1  result+2  exact+5  scorers: 4+0
-- Expected: 14 pts  →  RANK 5
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0004'),
  'Miguel Flores',
  '+52 8771234504',
  'miguel.flores@ejemplo.com',
  2, 1,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1},
    {"player_name":"Hirving Lozano","team":"Mexico","half":2}
  ]'::jsonb,
  '2026-06-02 09:11:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0005 · Isabel Vargas
-- Predicted: MX 2-1 SA  |  0 correct scorers (wrong players)
-- eff_mx=2  eff_sa=1  result+2  exact+5
-- Expected: 10 pts  →  RANK 8 (tiebreak vs Carmen: earlier timestamp)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0005'),
  'Isabel Vargas',
  '+52 8771234505',
  'isabel.vargas@ejemplo.com',
  2, 1,
  '[
    {"player_name":"Hirving Lozano","team":"Mexico","half":1},
    {"player_name":"Alexis Vega","team":"Mexico","half":2},
    {"player_name":"Bongani Zungu","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-02 09:15:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- ── Tier 2: Correct result (México wins), wrong goals ────────

-- FDN-DEMO0006 · Elena Jiménez
-- Predicted: MX 3-2 SA  |  All 3 correct scorers + halves
-- eff_mx=eff(3,2)=1  eff_sa=eff(2,1)=0  result+2  no exact bonus
-- scorers: 4+4+4
-- Expected: 15 pts  →  RANK 4
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0006'),
  'Elena Jiménez',
  '+52 8771234506',
  'elena.jimenez@ejemplo.com',
  3, 2,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1},
    {"player_name":"Henry Martín","team":"Mexico","half":2},
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-02 11:30:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0007 · Fernando Reyes
-- Predicted: MX 2-0 SA  |  2 correct scorers + halves
-- eff_mx=eff(2,2)=2  eff_sa=eff(0,1)=0  result+2  no exact (SA goals differ)
-- scorers: 4+4
-- Expected: 12 pts  →  RANK 6 (tiebreak TB4: hasExactMexicoScore=TRUE beats Ricardo)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0007'),
  'Fernando Reyes',
  '+52 8771234507',
  'fernando.reyes@ejemplo.com',
  2, 0,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1},
    {"player_name":"Henry Martín","team":"Mexico","half":2}
  ]'::jsonb,
  '2026-06-03 08:22:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0008 · Ricardo Morales
-- Predicted: MX 3-1 SA  |  2 correct scorers + halves
-- eff_mx=eff(3,2)=1  eff_sa=eff(1,1)=1  result+2  no exact (MX goals differ)
-- scorers: 4+4
-- Expected: 12 pts  →  RANK 7 (tiebreak TB4: hasExactMexicoScore=FALSE, loses to Fernando)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0008'),
  'Ricardo Morales',
  '+52 8771234508',
  'ricardo.morales@ejemplo.com',
  3, 1,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1},
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-03 10:44:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0009 · Martina Soto
-- Predicted: MX 3-1 SA  |  1 correct scorer + half
-- eff_mx=1  eff_sa=1  result+2  no exact  scorer: 4
-- Expected: 8 pts  →  RANK 11
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0009'),
  'Martina Soto',
  '+52 8771234509',
  'martina.soto@ejemplo.com',
  3, 1,
  '[
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-04 14:08:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0010 · Gabriela Castro
-- Predicted: MX 1-0 SA  |  1 correct scorer + half
-- eff_mx=eff(1,2)=1  eff_sa=eff(0,1)=0  result+2  no exact  scorer: 4
-- Expected: 7 pts  →  RANK 12
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0010'),
  'Gabriela Castro',
  '+52 8771234510',
  'gabriela.castro@ejemplo.com',
  1, 0,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1}
  ]'::jsonb,
  '2026-06-04 17:55:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0011 · Héctor Mendoza
-- Predicted: MX 4-2 SA  |  1 correct scorer + half (right goals off by 2 each)
-- eff_mx=eff(4,2)=0  eff_sa=eff(2,1)=0  result+2  no exact  scorer: 4
-- Expected: 6 pts  →  RANK 13 (tiebreak TB2: hasCorrectResult=TRUE beats Lucía)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0011'),
  'Héctor Mendoza',
  '+52 8771234511',
  'hector.mendoza@ejemplo.com',
  4, 2,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1}
  ]'::jsonb,
  '2026-06-05 09:03:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0012 · Carlos Rodríguez  (second of two entries — same customer!)
-- This token was also given to Carlos, demonstrating one entry per TOKEN.
-- Predicted: MX 3-0 SA  |  0 correct scorers (wrong player)
-- eff_mx=1  eff_sa=0  result+2  no exact  scorer: 0
-- Expected: 3 pts  →  RANK 17
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0012'),
  'Carlos Rodríguez',
  '+52 8771234502',
  'carlos.rodriguez@ejemplo.com',
  3, 0,
  '[
    {"player_name":"Hirving Lozano","team":"Mexico","half":1}
  ]'::jsonb,
  '2026-06-07 12:19:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- ── Tier 3: Wrong result (predicted draw) ────────────────────

-- FDN-DEMO0013 · Lucía Pérez
-- Predicted: MX 1-1 SA  |  1 correct scorer + half
-- eff_mx=eff(1,2)=1  eff_sa=eff(1,1)=1  wrong result (draw)  no exact  scorer: 4
-- Expected: 6 pts  →  RANK 14 (tiebreak TB2: hasCorrectResult=FALSE, loses to Héctor)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0013'),
  'Lucía Pérez',
  '+52 8771234513',
  'lucia.perez@ejemplo.com',
  1, 1,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1}
  ]'::jsonb,
  '2026-06-05 15:41:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0014 · Jorge Alvarado
-- Predicted: MX 2-2 SA  |  1 scorer correct+half, 1 scorer wrong half
-- eff_mx=eff(2,2)=2  eff_sa=eff(2,1)=0  wrong result (draw)  no exact
-- Jiménez: wrong half → 3 pts (pass 2)  |  Tau: correct+half → 4 pts
-- Expected: 9 pts  →  RANK 10
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0014'),
  'Jorge Alvarado',
  '+52 8771234514',
  'jorge.alvarado@ejemplo.com',
  2, 2,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":2},
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-03 20:00:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0015 · Roberto Díaz
-- Predicted: MX 0-0 SA  |  No scorers
-- eff_mx=0  eff_sa=0  wrong result (draw)  no exact  scorers: 0
-- Expected: 0 pts  →  RANK 18
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0015'),
  'Roberto Díaz',
  '+52 8771234515',
  'roberto.diaz@ejemplo.com',
  0, 0,
  '[]'::jsonb,
  '2026-06-07 19:25:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- ── Tier 4: Wrong result (predicted SA win) ──────────────────

-- FDN-DEMO0016 · Patricia Ruiz
-- Predicted: MX 0-1 SA  |  1 scorer correct + half
-- eff_mx=0  eff_sa=eff(1,1)=1  wrong result (SA win)  no exact  scorer: 4
-- Expected: 5 pts  →  RANK 15 (tiebreak TB5: hasExactSAScore=TRUE beats Daniel)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0016'),
  'Patricia Ruiz',
  '+52 8771234516',
  'patricia.ruiz@ejemplo.com',
  0, 1,
  '[
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-06 11:20:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0017 · Daniel Gutiérrez
-- Predicted: MX 1-2 SA  |  1 scorer correct + half
-- eff_mx=eff(1,2)=1  eff_sa=eff(2,1)=0  wrong result (SA win)  no exact  scorer: 4
-- Expected: 5 pts  →  RANK 16 (tiebreak TB5: hasExactSAScore=FALSE, loses to Patricia)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0017'),
  'Daniel Gutiérrez',
  '+52 8771234517',
  'daniel.gutierrez@ejemplo.com',
  1, 2,
  '[
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-06 16:55:00+00'
) ON CONFLICT (token_id) DO NOTHING;

-- FDN-DEMO0018 · Carmen López
-- Predicted: MX 2-1 SA  |  0 correct scorers (wrong players)
-- eff_mx=2  eff_sa=1  result+2  exact+5
-- Expected: 10 pts  →  RANK 9 (tiebreak TB6: later timestamp, loses to Isabel)
INSERT INTO predictions (token_id, customer_name, customer_phone, customer_email, mexico_goals, south_africa_goals, scorers, submitted_at)
VALUES (
  (SELECT id FROM tokens WHERE code = 'FDN-DEMO0018'),
  'Carmen López',
  '+52 8771234518',
  'carmen.lopez@ejemplo.com',
  2, 1,
  '[
    {"player_name":"Alexis Vega","team":"Mexico","half":1},
    {"player_name":"Edson Álvarez","team":"Mexico","half":2},
    {"player_name":"Bongani Zungu","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-03 18:45:00+00'
) ON CONFLICT (token_id) DO NOTHING;


-- ── 3. MATCH RESULT ──────────────────────────────────────────
-- The fictional final result entered by the admin after the match.
-- Once this row exists, the leaderboard populates in the admin panel.

INSERT INTO match_result (id, mexico_goals, south_africa_goals, scorers, entered_at)
VALUES (
  1,
  2,
  1,
  '[
    {"player_name":"Raúl Jiménez","team":"Mexico","half":1},
    {"player_name":"Henry Martín","team":"Mexico","half":2},
    {"player_name":"Percy Tau","team":"South Africa","half":1}
  ]'::jsonb,
  '2026-06-11 22:00:00+00'
) ON CONFLICT (id) DO UPDATE SET
  mexico_goals       = EXCLUDED.mexico_goals,
  south_africa_goals = EXCLUDED.south_africa_goals,
  scorers            = EXCLUDED.scorers,
  entered_at         = EXCLUDED.entered_at;


-- ── Expected leaderboard after running this seed ─────────────
--
--  Rank  │ Name                 │ Pts │ Note
--  ──────┼──────────────────────┼─────┼────────────────────────────────────────
--    1   │ Sofía Ramírez        │ 22  │ Perfect prediction
--    2   │ Carlos Rodríguez     │ 18  │ (FDN-DEMO0002)
--    3   │ Valentina Cruz       │ 16  │ Exact score, wrong scorer halves
--    4   │ Elena Jiménez        │ 15  │ Correct result, all 3 scorers right
--    5   │ Miguel Flores        │ 14  │ Exact score, 1 scorer right
--    6   │ Fernando Reyes       │ 12  │ TB4 win: exact Mexico goals
--    7   │ Ricardo Morales      │ 12  │ TB4 loss: Mexico goals off by 1
--    8   │ Isabel Vargas        │ 10  │ TB6 win: earlier timestamp
--    9   │ Carmen López         │ 10  │ TB6 loss: later timestamp
--   10   │ Jorge Alvarado       │  9  │ Predicted draw, 1 scorer wrong half
--   11   │ Martina Soto         │  8  │
--   12   │ Gabriela Castro      │  7  │
--   13   │ Héctor Mendoza       │  6  │ TB2 win: correct result (MX win)
--   14   │ Lucía Pérez          │  6  │ TB2 loss: predicted draw
--   15   │ Patricia Ruiz        │  5  │ TB5 win: exact SA goals
--   16   │ Daniel Gutiérrez     │  5  │ TB5 loss: SA goals off by 1
--   17   │ Carlos Rodríguez     │  3  │ (FDN-DEMO0012) same customer, 2nd token
--   18   │ Roberto Díaz         │  0  │ Predicted 0–0
-- ============================================================
