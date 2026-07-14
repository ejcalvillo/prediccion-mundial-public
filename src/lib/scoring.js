/**
 * Leaderboard scoring system
 *
 * SCORE PREDICTION — cumulative, all that apply are awarded:
 *  effectiveGoals(predicted, actual) = max(0, actual − |predicted − actual|)
 *  This is symmetric: being off by N reduces your score by N regardless of
 *  whether you over- or under-predicted.
 *
 *  • Mexico effective goals:   +1 pt each   (0 → actual_mx max)
 *  • SA effective goals:       +1 pt each   (0 → actual_sa max)
 *  • Correct W/D/L result:     +2 pts       (always awarded)
 *  • Exact complete score:     +5 pts bonus (on top of above)
 *
 *  Example — exact 3-1, 0 scorers:  3 + 1 + 2 + 5 = 11 pts
 *  Example — close 2-1 (correct result):  2 + 1 + 2 = 5 pts
 *  Example — far 0-2 (wrong result):      0 + 1      = 1 pt
 *
 * SCORERS (unchanged):
 *  • Each correct scorer (name + team): +3 pts
 *  • Correct half for that scorer:      +1 bonus
 *
 * NOTE on absolute goal difference:
 *  total_eff = total_actual_goals − total_abs_diff  (proven mathematically).
 *  So goal difference is already embedded in the per-goal accuracy points;
 *  adding it as a separate tiebreaker would be redundant.
 *
 * Tiebreaker order (only when total points are equal):
 *  TB1 — Exact score                        (gets +5 bonus; can still tie via scorers)
 *  TB2 — Correct match result (W/D/L)       (gets +2 bonus)
 *  TB3 — Most correctly predicted scorers
 *  TB4 — Exact Mexico goal count
 *  TB5 — Exact South Africa goal count
 *  TB6 — Earlier submission timestamp       (always resolves; unique per entry)
 */

function eff(predicted, actual) {
  return Math.max(0, actual - Math.abs(predicted - actual))
}

function normalizeName(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function calculateScore(prediction, result) {
  let points = 0
  const breakdown = []

  const pMx = prediction.mexico_goals
  const pSa = prediction.south_africa_goals
  const rMx = result.mexico_goals
  const rSa = result.south_africa_goals

  const effMx = eff(pMx, rMx)
  const effSa = eff(pSa, rSa)

  const hasExactScore        = pMx === rMx && pSa === rSa
  const hasExactMexicoScore  = pMx === rMx
  const hasExactSAScore      = pSa === rSa
  const pOutcome             = Math.sign(pMx - pSa)
  const rOutcome             = Math.sign(rMx - rSa)
  const hasCorrectResult     = pOutcome === rOutcome

  // Per-goal accuracy (symmetric formula, never rewards over-prediction)
  if (effMx > 0) {
    points += effMx
    breakdown.push({
      label: `Goles México ${hasExactMexicoScore ? '(exacto)' : `(${effMx} de ${rMx})`}`,
      pts: effMx,
    })
  }
  if (effSa > 0) {
    points += effSa
    breakdown.push({
      label: `Goles Sudáfrica ${hasExactSAScore ? '(exacto)' : `(${effSa} de ${rSa})`}`,
      pts: effSa,
    })
  }

  // Correct match outcome
  if (hasCorrectResult) {
    points += 2
    breakdown.push({ label: 'Resultado correcto (G/E/P)', pts: 2 })
  }

  // Exact complete score bonus
  if (hasExactScore) {
    points += 5
    breakdown.push({ label: 'Bonus marcador exacto', pts: 5 })
  }

  // Scorer matching — two-pass greedy to maximise half bonuses:
  // pass 1 claims slots where name+team+half all match (4 pts each),
  // pass 2 claims leftover slots by name+team only (3 pts each).
  const resultScorers = Array.isArray(result.scorers) ? result.scorers : []
  const predScorers   = Array.isArray(prediction.scorers) ? prediction.scorers : []

  let correctScorers = 0
  let correctHalves  = 0
  const remaining = [...resultScorers]
  const matched   = new Array(predScorers.length).fill(false)

  // Pass 1: exact name + team + half
  for (let i = 0; i < predScorers.length; i++) {
    const ps = predScorers[i]
    if (!ps.player_name?.trim()) continue

    const idx = remaining.findIndex(
      (rs) =>
        normalizeName(rs.player_name) === normalizeName(ps.player_name) &&
        rs.team === ps.team &&
        ps.half != null && rs.half != null &&
        Number(rs.half) === Number(ps.half)
    )
    if (idx !== -1) {
      matched[i] = true
      correctScorers++
      correctHalves++
      points += 4
      breakdown.push({ label: `Goleador: ${ps.player_name}`, pts: 4 })
      remaining.splice(idx, 1)
    }
  }

  // Pass 2: name + team only (no half bonus)
  for (let i = 0; i < predScorers.length; i++) {
    if (matched[i]) continue
    const ps = predScorers[i]
    if (!ps.player_name?.trim()) continue

    const idx = remaining.findIndex(
      (rs) =>
        normalizeName(rs.player_name) === normalizeName(ps.player_name) &&
        rs.team === ps.team
    )
    if (idx !== -1) {
      correctScorers++
      points += 3
      breakdown.push({ label: `Goleador: ${ps.player_name}`, pts: 3 })
      remaining.splice(idx, 1)
    }
  }

  return {
    points,
    breakdown,
    effMx,
    effSa,
    hasExactScore,
    hasCorrectResult,
    correctScorers,
    hasExactMexicoScore,
    hasExactSAScore,
    correctHalves,
  }
}

// Sync scorer slots to match mxGoals + saGoals total.
export function syncScorers(prev, mxGoals, saGoals) {
  if (mxGoals + saGoals === 0) return []

  const prevMx = prev.filter((s) => s.team === 'Mexico')
  const prevSa = prev.filter((s) => s.team === 'South Africa')

  return [
    ...Array.from({ length: mxGoals }, (_, i) => prevMx[i] ?? { team: 'Mexico',       player_name: '', half: 1 }),
    ...Array.from({ length: saGoals }, (_, i) => prevSa[i] ?? { team: 'South Africa', player_name: '', half: 1 }),
  ]
}

const TB_LABELS = {
  score:        'marcador exacto',
  result:       'resultado correcto',
  scorers:      'más goleadores acertados',
  mexico_score: 'goles de México exactos',
  sa_score:     'goles de Sudáfrica exactos',
  timestamp:    'predicción más temprana',
}

function flag(bool) { return bool ? 1 : 0 }

export function buildLeaderboard(predictions, result) {
  const scored = predictions.map((p) => ({ ...p, ...calculateScore(p, result) }))

  scored.sort((a, b) => {
    if (b.points !== a.points)                                       return b.points - a.points
    if (flag(b.hasExactScore) !== flag(a.hasExactScore))             return flag(b.hasExactScore) - flag(a.hasExactScore)
    if (flag(b.hasCorrectResult) !== flag(a.hasCorrectResult))       return flag(b.hasCorrectResult) - flag(a.hasCorrectResult)
    if (b.correctScorers !== a.correctScorers)                       return b.correctScorers - a.correctScorers
    if (flag(b.hasExactMexicoScore) !== flag(a.hasExactMexicoScore)) return flag(b.hasExactMexicoScore) - flag(a.hasExactMexicoScore)
    if (flag(b.hasExactSAScore) !== flag(a.hasExactSAScore))         return flag(b.hasExactSAScore) - flag(a.hasExactSAScore)
    const tA = a.submitted_at ? new Date(a.submitted_at).getTime() : Infinity
    const tB = b.submitted_at ? new Date(b.submitted_at).getTime() : Infinity
    return tA - tB
  })

  const out = []
  for (let i = 0; i < scored.length; i++) {
    const entry = scored[i]

    if (i === 0) {
      out.push({ ...entry, rank: 1, tiedOnPoints: false, tiebreakerUsed: null, tiebreakerLabel: null })
      continue
    }

    const prev         = scored[i - 1]
    const prevOut      = out[i - 1]
    const tiedOnPoints = entry.points === prev.points

    let tiebreakerUsed = null
    if (tiedOnPoints) {
      if (entry.hasExactScore !== prev.hasExactScore)                   tiebreakerUsed = 'score'
      else if (entry.hasCorrectResult !== prev.hasCorrectResult)        tiebreakerUsed = 'result'
      else if (entry.correctScorers !== prev.correctScorers)            tiebreakerUsed = 'scorers'
      else if (entry.hasExactMexicoScore !== prev.hasExactMexicoScore)  tiebreakerUsed = 'mexico_score'
      else if (entry.hasExactSAScore !== prev.hasExactSAScore)          tiebreakerUsed = 'sa_score'
      else {
        const tEntry = entry.submitted_at ? new Date(entry.submitted_at).getTime() : Infinity
        const tPrev  = prev.submitted_at  ? new Date(prev.submitted_at).getTime()  : Infinity
        if (tEntry !== tPrev) tiebreakerUsed = 'timestamp'
      }
    }

    const trulyTied = tiedOnPoints && tiebreakerUsed === null
    const rank = trulyTied ? prevOut.rank : i + 1

    out.push({ ...entry, rank, tiedOnPoints, tiebreakerUsed,
      tiebreakerLabel: tiebreakerUsed ? TB_LABELS[tiebreakerUsed] : null })
  }
  return out
}
