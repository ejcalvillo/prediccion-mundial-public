# Predicción Mundial

A full-stack fan engagement web app built for the FIFA World Cup 2026 opening match (México vs. South Africa, June 11 2026). Customers at a local pharmacy earned a unique QR-coded entry token with each qualifying purchase. Scanning the token opened a mobile prediction form where they could forecast the final score, goal scorers, and which half each goal was scored in. The best prediction won a prize, with a multi-criteria tiebreaker system to handle ties.

Built as a volunteer project for **Farmacia Del Niño** in Ciudad Acuña, Coahuila, México. Developed with [Claude Code](https://claude.ai/code).

[Live demo →](https://prediccion-mundial-public.vercel.app/)

> **Note on data privacy:** This repository contains no real customer data. All predictions, phone numbers, emails, and QR token values from the live promotion have been excluded. The `supabase/seed.sql` file populates the database with entirely fictional data so the app can be explored and demonstrated locally.

---

## Key Features

**Token-based entry with database-enforced single-use validation**
Each QR code maps to a row in the `tokens` table. A `UNIQUE` constraint on `predictions.token_id` plus a Postgres RLS policy prevent any token from being used more than once, even under concurrent submissions. The `mark_token_used` function only fires after a prediction is successfully inserted, closing the race condition window.

**Server-time deadline enforcement**
The prediction deadline is enforced in a Postgres RLS policy using `now()`, not in the client. This prevents device-clock manipulation or direct API calls from bypassing the cutoff. The client-side check is a UX convenience only — the database is the authoritative gate.

**Automated scoring and leaderboard**
Predictions are scored client-side against the admin-entered match result using a symmetric goal-accuracy formula, with bonuses for exact scores, correct outcome (W/D/L), and named goal scorers with correct halves. A multi-criteria tiebreaker (exact score → correct result → scorer count → exact Mexico goals → exact SA goals → submission timestamp) always resolves to a unique rank.

**Admin dashboard**
Password-protected via Supabase Auth. Tabs for browsing and searching all predictions, entering the official match result, viewing the ranked leaderboard, and editing the player rosters used in the prediction form. CSV export for both predictions and the final leaderboard.

**Print-ready promotional card**
The token generator script (`scripts/generate-tokens.js`) outputs a `tokens.csv` with one row per token: the code and its full prediction URL. The CSV is designed for direct import into bulk QR code generators so tokens can be printed and distributed in-store.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6 |
| Styles | Tailwind CSS 3 |
| Database / Auth / RLS | Supabase (PostgreSQL) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Confetti | canvas-confetti |
| Hosting | Vercel |

---

## Project Structure

```
├── public/                     Static assets
├── src/
│   ├── components/
│   │   ├── GoalScorerSlot.jsx  Scorer picker widget (player + half)
│   │   ├── PhoneInput.jsx      Mexican phone number input with country code
│   │   ├── PredictionRecapCard.jsx  Success screen summary card
│   │   ├── ScorelinePreview.jsx    Live score display during form entry
│   │   └── Stepper.jsx         +/− goal counter
│   ├── lib/
│   │   ├── scoring.js          Scoring engine and leaderboard builder
│   │   ├── players.js          Player roster management (Supabase + fallback)
│   │   ├── csv.js              CSV download utility
│   │   └── supabase.js         Supabase client (reads from env vars)
│   └── pages/
│       ├── Landing.jsx         Public landing page with scoring rules
│       ├── Predict.jsx         /predict?token=FDN-XXXXXXXX — prediction form
│       └── Admin.jsx           /admin — protected dashboard
├── supabase/
│   ├── migrations/             Schema, RLS policies, and functions (run in order)
│   └── seed.sql                Synthetic demo data (18 fictional predictions)
└── scripts/
    └── generate-tokens.js      CLI to generate token batches as SQL + CSV
```

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a new project.
2. In **Settings → API**, copy your **Project URL** and **anon public key**.

### 2. Run database migrations

Open the **SQL Editor** in your Supabase dashboard and run each migration file in order:

```
supabase/migrations/001_init.sql
supabase/migrations/002_player_lists_and_email.sql
supabase/migrations/003_fix_match_result_rls.sql
supabase/migrations/004_security_fixes.sql
supabase/migrations/005_auth_rls.sql
supabase/migrations/006_server_deadline.sql
```

### 3. Create an admin user

In **Supabase Dashboard → Authentication → Users**, click **Add user → Create new user** and enter an email and password. These credentials are what you use to log in at `/admin`.

### 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. Load synthetic demo data (optional)

To see a populated leaderboard without running a real promotion, paste the contents of `supabase/seed.sql` into the Supabase SQL Editor and run it. This inserts 20 fictional tokens, 18 fictional predictions with a range of accuracy levels, and a fictional match result.

To remove the demo data later:
```sql
DELETE FROM predictions WHERE token_id IN (SELECT id FROM tokens WHERE code LIKE 'FDN-DEMO%');
DELETE FROM tokens WHERE code LIKE 'FDN-DEMO%';
DELETE FROM match_result WHERE id = 1;
```

### 6. Install and run

```bash
npm install
npm run dev
```

The app is available at [http://localhost:5173](http://localhost:5173).

---

## Generating tokens for a real promotion

```bash
# Generate 500 tokens — prints SQL to stdout and writes tokens.csv
BASE_URL=https://your-app.vercel.app node scripts/generate-tokens.js 500
```

Paste the SQL output into the Supabase SQL Editor to insert the tokens. Import `tokens.csv` into a bulk QR generator (e.g. [qrcode-monkey.com/bulk](https://www.qrcode-monkey.com/bulk/)) to produce one QR code per token for printing.

---

## Scoring system

| Event | Points |
|---|---|
| Goals predicted correctly per team | +1 per effective goal |
| Correct match outcome (win / draw / loss) | +2 |
| Exact final score bonus | +5 |
| Correct goal scorer (name + team) | +3 |
| Correct scorer + correct half | +4 (instead of 3) |

**Effective goals** use a symmetric formula: `max(0, actual − |predicted − actual|)`. Being off by N in either direction reduces your score by N, so over-predicting and under-predicting are penalized equally.

**Tiebreaker order** (applied only when total points are equal):
1. Exact score
2. Correct outcome (W/D/L)
3. Number of correct scorers
4. Exact México goal count
5. Exact South Africa goal count
6. Earlier submission timestamp

---

## Deployment

Push to GitHub and import into [Vercel](https://vercel.com). Vercel auto-detects Vite. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project Settings → Environment Variables** and redeploy.
