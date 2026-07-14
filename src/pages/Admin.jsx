import { useState, useEffect, useCallback } from 'react'
import {
  LogIn,
  LogOut,
  Users,
  Trophy,
  Search,
  Download,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Medal,
  Phone,
  Mail,
  Clock,
  Trash2,
  RefreshCw,
  Pencil,
  Plus,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { buildLeaderboard, syncScorers } from '../lib/scoring'
import { downloadCSV } from '../lib/csv'
import {
  fetchPlayerLists,
  savePlayerLists,
  DEFAULT_MEXICO_PLAYERS,
  DEFAULT_SA_PLAYERS,
} from '../lib/players'
import Stepper from '../components/Stepper'
import GoalScorerSlot from '../components/GoalScorerSlot'

// ── Auth screen ──────────────────────────────────────────────
function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError('Correo o contraseña incorrectos')
    setLoading(false)
    // On success, onAuthStateChange in Admin fires automatically — no manual state update needed
  }

  return (
    <div className="min-h-screen bg-pitch-dark flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-syncopate font-bold text-white text-xl mb-1">Farmacia Del Niño</p>
          <p className="text-gold text-sm font-mono">Panel de Administración</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-gold">
          <h1 className="font-syncopate font-bold text-pitch-dark text-lg mb-6 text-center">
            Acceso Admin
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-2">
                Correo electrónico
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="admin@example.com"
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl border-2 text-sm font-sans text-gray-800 outline-none transition-all duration-200 bg-white placeholder-gray-300 border-gray-200 focus:border-mexico-green"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-2">
                Contraseña
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 text-sm font-sans text-gray-800
                  outline-none transition-all duration-200 bg-white placeholder-gray-300
                  ${error ? 'border-red-400' : 'border-gray-200 focus:border-mexico-green'}
                `}
              />
              {error && <p className="mt-1.5 text-xs text-red-500 font-sans">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-pitch-dark text-white font-syncopate font-bold text-sm uppercase tracking-wide hover:bg-pitch-light active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              <span>{loading ? 'Verificando…' : 'Ingresar'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Predictions tab ──────────────────────────────────────────
function PredictionsTab({ predictions, loading, onRefresh }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const filtered = predictions.filter((p) =>
    p.customer_name.toLowerCase().includes(search.toLowerCase())
  )

  function handleExport() {
    const rows = predictions.map((p) => ({
      nombre: p.customer_name,
      whatsapp: p.customer_phone,
      email: p.customer_email || '',
      mexico_goles: p.mexico_goals,
      sudafrica_goles: p.south_africa_goals,
      goleadores: JSON.stringify(p.scorers),
      enviado: new Date(p.submitted_at).toLocaleString('es-MX'),
    }))
    downloadCSV(`predicciones_copa2026_${Date.now()}.csv`, rows)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="text-mexico-green animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-sans text-gray-800 outline-none focus:border-mexico-green transition-colors duration-200 bg-white placeholder-gray-400"
          />
        </div>
        <button
          onClick={onRefresh}
          className="p-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-mexico-green hover:text-mexico-green transition-all duration-200 cursor-pointer"
          aria-label="Actualizar"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={handleExport}
          disabled={!predictions.length}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-pitch-dark text-white text-sm font-mono font-bold hover:bg-pitch-light active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          <span className="hidden sm:inline">CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border-2 border-gray-100 px-4 py-3">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Total</p>
          <p className="font-syncopate font-bold text-pitch-dark text-2xl">{predictions.length}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-100 px-4 py-3">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Filtrados</p>
          <p className="font-syncopate font-bold text-pitch-dark text-2xl">{filtered.length}</p>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-sans text-sm">
          {search ? 'Sin resultados para tu búsqueda' : 'No hay predicciones todavía'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-pitch-dark flex items-center justify-center flex-shrink-0">
                    <span className="text-gold text-xs font-mono font-bold">
                      {p.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-pitch-dark font-sans truncate">{p.customer_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                  <div className="text-right hidden sm:block">
                    <span className="font-syncopate font-bold text-pitch-dark">
                      {p.mexico_goals}–{p.south_africa_goals}
                    </span>
                    <p className="text-xs text-gray-400 font-mono">
                      {p.scorers?.length || 0} goleador{p.scorers?.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                  {expanded === p.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {expanded === p.id && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 animate-fade-in">
                  <div className="flex flex-wrap gap-3 text-xs font-sans text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(p.submitted_at).toLocaleString('es-MX')}</span>
                    <span className="flex items-center gap-1"><Phone size={12} />{p.customer_phone}</span>
                    {p.customer_email && (
                      <span className="flex items-center gap-1"><Mail size={12} />{p.customer_email}</span>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 block mb-1">Predicción</span>
                    <span className="font-syncopate font-bold text-pitch-dark text-2xl">
                      México {p.mexico_goals} – {p.south_africa_goals} Sudáfrica
                    </span>
                  </div>
                  {p.scorers?.length > 0 && (
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 block mb-2">Goleadores</span>
                      <div className="space-y-1.5">
                        {p.scorers.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm font-sans text-gray-700">
                            <span className={`text-xs font-mono font-bold ${s.team === 'Mexico' ? 'text-mexico-green' : 'text-amber-600'}`}>
                              {s.team === 'Mexico' ? 'MX' : 'SA'}
                            </span>
                            <span>{s.player_name}</span>
                            <span className="text-gray-400 text-xs">({s.half}T)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Results & Ranking tab ────────────────────────────────────
function ResultsTab({ predictions, result, onResultSaved, mexicoPlayers, saPlayers }) {
  const [mexicoGoals, setMexicoGoals] = useState(result?.mexico_goals ?? 0)
  const [saGoals, setSaGoals]         = useState(result?.south_africa_goals ?? 0)
  const [scorers, setScorers]         = useState(result?.scorers ?? [])
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [savedResult, setSavedResult] = useState(result)
  const [lbPage, setLbPage]           = useState(1)
  const [expandedLb, setExpandedLb]   = useState(null)

  const LB_PAGE_SIZE = 25
  const leaderboard  = savedResult ? buildLeaderboard(predictions, savedResult) : []
  const lbTotalPages = Math.max(1, Math.ceil(leaderboard.length / LB_PAGE_SIZE))
  const lbStart      = (lbPage - 1) * LB_PAGE_SIZE
  const lbSlice      = leaderboard.slice(lbStart, lbStart + LB_PAGE_SIZE)

  // Keep state in sync if parent loads result from DB
  useEffect(() => {
    if (result) {
      setMexicoGoals(result.mexico_goals ?? 0)
      setSaGoals(result.south_africa_goals ?? 0)
      setScorers(result.scorers ?? [])
      setSavedResult(result)
      setLbPage(1)
    }
  }, [result])

  // Auto-sync scorer slots when goals change (same as prediction form)
  useEffect(() => {
    setScorers((prev) => syncScorers(prev, mexicoGoals, saGoals))
  }, [mexicoGoals, saGoals])

  const updateScorer = useCallback((idx, updated) => {
    setScorers((prev) => {
      const next = [...prev]
      next[idx] = updated
      return next
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const { error } = await supabase.from('match_result').upsert({
        id: 1,
        mexico_goals: mexicoGoals,
        south_africa_goals: saGoals,
        scorers,
        entered_at: new Date().toISOString(),
      })
      if (error) throw error
      const saved = { id: 1, mexico_goals: mexicoGoals, south_africa_goals: saGoals, scorers }
      setSavedResult(saved)
      onResultSaved(saved)
    } catch (err) {
      console.error(err)
      setSaveError('Error al guardar el resultado. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  function handleExportLeaderboard() {
    const rows = leaderboard.map((entry) => ({
      posicion: entry.rank,
      nombre: entry.customer_name,
      telefono: entry.customer_phone,
      email: entry.customer_email || '',
      puntos: entry.points,
      marcador: `${entry.mexico_goals}-${entry.south_africa_goals}`,
      marcador_exacto: entry.hasExactScore ? 'Sí' : 'No',
      resultado_correcto: entry.hasCorrectResult ? 'Sí' : 'No',
      goleadores_acertados: entry.correctScorers,
      goles_mexico_exacto: entry.hasExactMexicoScore ? 'Sí' : 'No',
      goles_sudafrica_exacto: entry.hasExactSAScore ? 'Sí' : 'No',
      enviado: entry.submitted_at ? new Date(entry.submitted_at).toLocaleString('es-MX') : '',
      tiempos_acertados: entry.correctHalves,
      desempate: entry.tiebreakerLabel ?? '',
      desglose: entry.breakdown.map((b) => `${b.label} (${b.pts}pts)`).join(' | '),
    }))
    downloadCSV(`ranking_copa2026_${Date.now()}.csv`, rows)
  }

  const medalColors = {
    1: 'bg-yellow-400 text-yellow-900',
    2: 'bg-gray-300 text-gray-700',
    3: 'bg-amber-600 text-amber-100',
  }

  const totalGoals = mexicoGoals + saGoals

  return (
    <div className="space-y-6">
      {/* Result entry card */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <Trophy size={18} className="text-gold" />
          <h2 className="font-syncopate font-bold text-pitch-dark text-sm uppercase tracking-wide">
            Resultado Real
          </h2>
        </div>
        <div className="p-5 space-y-6">
          {/* Mexico stepper */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-mexico-green" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-mexico-green">México</span>
            </div>
            <Stepper
              value={mexicoGoals}
              onChange={setMexicoGoals}
              max={20}
              accentClass="border-mexico-green text-mexico-green hover:bg-green-50"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">vs</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* South Africa stepper */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-sa-gold" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600">Sudáfrica</span>
            </div>
            <Stepper
              value={saGoals}
              onChange={setSaGoals}
              max={20}
              accentClass="border-sa-gold text-amber-600 hover:bg-amber-50"
            />
          </div>

          {/* Scorer slots — auto-generated, same as prediction form */}
          {totalGoals === 0 ? (
            <p className="text-center text-gray-400 text-sm font-sans py-2">
              Ajusta el marcador para registrar goleadores
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                Goleadores ({totalGoals} {totalGoals === 1 ? 'gol' : 'goles'})
              </p>
              {scorers.map((scorer, idx) => (
                <GoalScorerSlot
                  key={idx}
                  index={idx}
                  scorer={scorer}
                  onChange={(updated) => updateScorer(idx, updated)}
                  mexicoPlayers={mexicoPlayers}
                  saPlayers={saPlayers}
                />
              ))}
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-sans">{saveError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-mexico-green text-white font-syncopate font-bold text-sm uppercase tracking-wide hover:bg-mexico-green-light active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-mexico"
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /><span>Guardando…</span></>
            ) : (
              <><Save size={18} /><span>Guardar resultado</span></>
            )}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {savedResult && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <Medal size={18} className="text-gold" />
              <h2 className="font-syncopate font-bold text-pitch-dark text-sm uppercase tracking-wide">Ranking</h2>
            </div>
            <button
              onClick={handleExportLeaderboard}
              disabled={!leaderboard.length}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pitch-dark text-white text-xs font-mono font-bold hover:bg-pitch-light transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              <Download size={13} />CSV
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-sans text-sm">No hay predicciones para rankear</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lbSlice.map((entry, sliceIdx) => {
                const idx = lbStart + sliceIdx  // absolute index in full leaderboard
                const isWinner   = idx === 0
                const isRunnerUp = idx >= 1 && idx <= 10   // next 10 in case winner can't be reached
                const runnerUpN  = idx                      // suplente #1 … #10
                const isTopZone  = isWinner || isRunnerUp

                return (
                  <div key={entry.id}>
                    {/* Divider after the 11th entry (winner + 10 runner-ups) */}
                    {idx === 11 && (
                      <div className="flex items-center gap-3 px-5 py-2 bg-gray-50">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          Participantes restantes
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}

                    <div className={`transition-colors duration-150 ${isWinner ? 'bg-gold/8' : isRunnerUp ? 'bg-gray-50/60' : 'bg-white'}`}>
                      {/* Clickable summary row */}
                      <button
                        type="button"
                        onClick={() => setExpandedLb(expandedLb === entry.id ? null : entry.id)}
                        className="w-full flex items-start gap-3 px-5 py-4 hover:bg-black/[0.02] transition-colors duration-150 cursor-pointer text-left"
                      >
                        {/* Rank badge */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-mono font-bold mt-0.5 ${medalColors[entry.rank] || (isRunnerUp ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400')}`}>
                          {entry.rank <= 3 ? <Medal size={16} /> : entry.rank}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <p className={`text-sm font-semibold font-sans ${isTopZone ? 'text-pitch-dark' : 'text-gray-400'}`}>
                              {entry.customer_name}
                            </p>
                            {isWinner && (
                              <span className="text-xs bg-gold text-pitch-dark rounded-full px-2 py-0.5 font-mono font-bold">GANADOR</span>
                            )}
                            {isRunnerUp && (
                              <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 font-mono">Suplente #{runnerUpN}</span>
                            )}
                            {entry.tiedOnPoints && !entry.tiebreakerUsed && (
                              <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-mono font-bold">EMPATE</span>
                            )}
                            {entry.tiedOnPoints && entry.tiebreakerUsed && (
                              <span className="text-xs bg-pitch-dark/10 text-pitch-dark rounded-full px-2 py-0.5 font-mono">⚡ {entry.tiebreakerLabel}</span>
                            )}
                          </div>
                          <p className={`text-xs font-mono ${isTopZone ? 'text-gray-400' : 'text-gray-300'}`}>
                            {entry.mexico_goals}–{entry.south_africa_goals}
                            {entry.hasExactScore && <span className="ml-1 text-mexico-green font-bold">✓ exacto</span>}
                            {!entry.hasExactScore && entry.hasCorrectResult && <span className="ml-1 text-blue-500">✓ G/E/P</span>}
                            {!entry.hasExactScore && entry.hasExactMexicoScore && <span className="ml-1 text-emerald-500">✓ MX</span>}
                            {!entry.hasExactScore && entry.hasExactSAScore && <span className="ml-1 text-amber-500">✓ SA</span>}
                            {entry.correctScorers > 0 && <span className="ml-1">&middot; {entry.correctScorers} goleador{entry.correctScorers !== 1 ? 'es' : ''}</span>}
                          </p>
                        </div>

                        {/* Points + chevron */}
                        <div className="flex flex-col items-end flex-shrink-0 gap-1">
                          <span className={`font-syncopate font-bold text-xl ${isWinner ? 'text-gold' : entry.rank === 2 ? 'text-gray-400' : entry.rank === 3 ? 'text-amber-600' : isRunnerUp ? 'text-pitch-dark' : 'text-gray-300'}`}>
                            {entry.points}
                          </span>
                          <p className="text-xs text-gray-400 font-mono">pts</p>
                          {expandedLb === entry.id
                            ? <ChevronUp size={14} className="text-gray-400" />
                            : <ChevronDown size={14} className="text-gray-300" />
                          }
                        </div>
                      </button>

                      {/* Expanded contact + prediction detail */}
                      {expandedLb === entry.id && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4 animate-fade-in">
                          {/* Contact info */}
                          <div>
                            <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-2">Contacto</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm font-sans text-gray-700">
                                <Phone size={13} className="text-gray-400 flex-shrink-0" />
                                <span>{entry.customer_phone}</span>
                              </div>
                              {entry.customer_email && (
                                <div className="flex items-center gap-2 text-sm font-sans text-gray-700">
                                  <Mail size={13} className="text-gray-400 flex-shrink-0" />
                                  <span>{entry.customer_email}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Points breakdown */}
                          {entry.breakdown?.length > 0 && (
                            <div>
                              <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-2">Desglose de puntos</p>
                              <div className="space-y-1">
                                {entry.breakdown.map((b, bi) => (
                                  <div key={bi} className="flex items-center justify-between text-sm font-sans text-gray-600">
                                    <span>{b.label}</span>
                                    <span className="font-mono font-bold text-pitch-dark">+{b.pts}</span>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between text-sm font-mono font-bold text-pitch-dark border-t border-gray-200 pt-1 mt-1">
                                  <span>Total</span>
                                  <span>{entry.points} pts</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Predicted scorers */}
                          {entry.scorers?.length > 0 && (
                            <div>
                              <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-2">Goleadores predichos</p>
                              <div className="space-y-1">
                                {entry.scorers.map((s, si) => (
                                  <div key={si} className="flex items-center gap-2 text-sm font-sans text-gray-600">
                                    <span className={`text-xs font-mono font-bold ${s.team === 'Mexico' ? 'text-mexico-green' : 'text-amber-600'}`}>
                                      {s.team === 'Mexico' ? 'MX' : 'SA'}
                                    </span>
                                    <span>{s.player_name}</span>
                                    <span className="text-gray-400 text-xs ml-auto">{s.half}T</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination controls */}
          {lbTotalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setLbPage((p) => Math.max(1, p - 1))}
                disabled={lbPage === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-600 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
              >
                ← Anterior
              </button>
              <span className="text-xs font-mono text-gray-500 tabular-nums">
                {lbStart + 1}–{Math.min(lbStart + LB_PAGE_SIZE, leaderboard.length)} de {leaderboard.length}
              </span>
              <button
                type="button"
                onClick={() => setLbPage((p) => Math.min(lbTotalPages, p + 1))}
                disabled={lbPage === lbTotalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-600 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Player editor row ────────────────────────────────────────
function PlayerRow({ player, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(player)

  function handleSave() {
    if (!draft.name.trim()) return
    onSave(draft)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-150">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {(draft.number || draft.position) && (
            <span className="text-xs font-mono font-bold text-gray-400 flex-shrink-0">
              {[draft.number && `#${draft.number}`, draft.position].filter(Boolean).join(' ')}
            </span>
          )}
          <span className="text-sm font-sans text-gray-800 truncate">{draft.name}</span>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setDraft(player); setEditing(true) }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-pitch-dark hover:bg-gray-100 transition-all duration-150 cursor-pointer"
            aria-label="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(player.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-mexico-red hover:bg-red-50 transition-all duration-150 cursor-pointer"
            aria-label="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 bg-gray-50 rounded-xl border-2 border-mexico-green space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={draft.number}
          onChange={(e) => setDraft((d) => ({ ...d, number: e.target.value }))}
          placeholder="Número"
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-sans text-gray-800 outline-none focus:border-mexico-green bg-white"
        />
        <input
          type="text"
          value={draft.position}
          onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value.toUpperCase() }))}
          placeholder="Posición"
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-sans text-gray-800 outline-none focus:border-mexico-green bg-white uppercase"
        />
      </div>
      <input
        type="text"
        value={draft.name}
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        placeholder="Nombre (puede incluir apodo, ej: Armando (Hormiga) González)"
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-sans text-gray-800 outline-none focus:border-mexico-green bg-white"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-2 rounded-lg bg-mexico-green text-white text-xs font-mono font-bold hover:bg-mexico-green-light transition-colors duration-200 cursor-pointer"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-mono hover:border-gray-400 transition-colors duration-200 cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Plantillas tab ───────────────────────────────────────────
function PlantillasTab({ mexicoPlayers, saPlayers, onPlayersChange }) {
  const [activeTeam, setActiveTeam] = useState('Mexico')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [savedOk, setSavedOk] = useState(false)
  const [newPlayer, setNewPlayer] = useState({ number: '', position: '', name: '' })

  const players = activeTeam === 'Mexico' ? mexicoPlayers : saPlayers

  function updateList(updated) {
    if (activeTeam === 'Mexico') onPlayersChange(updated, saPlayers)
    else onPlayersChange(mexicoPlayers, updated)
  }

  function handleSavePlayer(updatedPlayer) {
    updateList(players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)))
  }

  function handleDeletePlayer(id) {
    updateList(players.filter((p) => p.id !== id))
  }

  function handleAddPlayer() {
    if (!newPlayer.name.trim()) return
    const entry = {
      id: `${activeTeam === 'Mexico' ? 'mx' : 'sa'}-${Date.now()}`,
      number: newPlayer.number.trim(),
      position: newPlayer.position.trim().toUpperCase(),
      name: newPlayer.name.trim(),
    }
    updateList([...players, entry])
    setNewPlayer({ number: '', position: '', name: '' })
  }

  function handleResetTeam() {
    const defaults = activeTeam === 'Mexico' ? DEFAULT_MEXICO_PLAYERS : DEFAULT_SA_PLAYERS
    updateList(defaults)
  }

  async function handleSaveToCloud() {
    setSaving(true)
    setSaveError('')
    setSavedOk(false)
    try {
      await savePlayerLists(mexicoPlayers, saPlayers)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch (err) {
      console.error(err)
      setSaveError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Team toggle */}
      <div className="flex gap-2 bg-white rounded-2xl border-2 border-gray-100 p-1.5">
        {['Mexico', 'South Africa'].map((team) => (
          <button
            key={team}
            onClick={() => setActiveTeam(team)}
            className={`
              flex-1 py-2.5 rounded-xl text-sm font-mono font-bold transition-all duration-200 cursor-pointer
              ${activeTeam === team
                ? team === 'Mexico'
                  ? 'bg-mexico-green text-white'
                  : 'bg-sa-gold text-pitch-dark'
                : 'text-gray-500 hover:text-pitch-dark'
              }
            `}
          >
            {team === 'Mexico' ? 'México' : 'Sudáfrica'}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 font-sans leading-relaxed">
        Formato del nombre: <span className="font-mono text-pitch-dark">Armando (Hormiga) González</span> — el apodo va entre paréntesis.
        Los cambios se guardan en la nube y aplican a todos los formularios.
      </p>

      {/* Player list */}
      <div className="space-y-2">
        {players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onSave={handleSavePlayer}
            onDelete={handleDeletePlayer}
          />
        ))}
      </div>

      {/* Add player form */}
      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-4 space-y-2">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
          Agregar jugador
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newPlayer.number}
            onChange={(e) => setNewPlayer((d) => ({ ...d, number: e.target.value }))}
            placeholder="Número"
            className="px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-sans text-gray-800 outline-none focus:border-mexico-green bg-white transition-colors"
          />
          <input
            type="text"
            value={newPlayer.position}
            onChange={(e) => setNewPlayer((d) => ({ ...d, position: e.target.value.toUpperCase() }))}
            placeholder="Pos. (POR / DEF…)"
            className="px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-sans text-gray-800 outline-none focus:border-mexico-green bg-white transition-colors uppercase"
          />
        </div>
        <input
          type="text"
          value={newPlayer.name}
          onChange={(e) => setNewPlayer((d) => ({ ...d, name: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
          placeholder="Nombre completo (con apodo si aplica)"
          className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-sans text-gray-800 outline-none focus:border-mexico-green bg-white transition-colors"
        />
        <button
          type="button"
          onClick={handleAddPlayer}
          disabled={!newPlayer.name.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pitch-dark text-white text-sm font-mono font-bold hover:bg-pitch-light active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />Agregar jugador
        </button>
      </div>

      {/* Save to cloud + reset */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSaveToCloud}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-mexico-green text-white font-syncopate font-bold text-xs uppercase tracking-wide hover:bg-mexico-green-light active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-mexico"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /><span>Guardando…</span></>
          ) : savedOk ? (
            <><ShieldCheck size={16} /><span>¡Guardado!</span></>
          ) : (
            <><Save size={16} /><span>Guardar en nube</span></>
          )}
        </button>
        <button
          type="button"
          onClick={handleResetTeam}
          className="px-4 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500 hover:border-gray-400 text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          title="Restablecer lista predeterminada"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {saveError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-sans">{saveError}</p>
        </div>
      )}
    </div>
  )
}

// ── Main Admin component ─────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed]         = useState(false)
  const [authReady, setAuthReady]   = useState(false)   // false while checking stored session
  const [activeTab, setActiveTab]   = useState('predictions')
  const [predictions, setPredictions] = useState([])
  const [matchResult, setMatchResult] = useState(null)
  const [mexicoPlayers, setMexicoPlayers] = useState(DEFAULT_MEXICO_PLAYERS)
  const [saPlayers, setSaPlayers]   = useState(DEFAULT_SA_PLAYERS)
  const [loading, setLoading]       = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthed(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadData = useCallback(async () => {
    if (!authed) return
    setLoading(true)
    setFetchError('')

    try {
      const [predRes, resultRes, playersResult] = await Promise.all([
        supabase.from('predictions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('match_result').select('*').eq('id', 1).maybeSingle(),
        fetchPlayerLists(),
      ])

      if (predRes.error) throw predRes.error
      setPredictions(predRes.data || [])
      if (!resultRes.error && resultRes.data) setMatchResult(resultRes.data)
      setMexicoPlayers(playersResult.mexico)
      setSaPlayers(playersResult.sa)
    } catch (err) {
      console.error(err)
      setFetchError('Error al cargar datos. Verifica que las variables de entorno estén configuradas.')
    } finally {
      setLoading(false)
    }
  }, [authed])

  useEffect(() => { loadData() }, [loadData])

  // Show nothing while checking stored session (avoids flash of login screen)
  if (!authReady) {
    return (
      <div className="min-h-screen bg-pitch-dark flex items-center justify-center">
        <Loader2 size={32} className="text-gold animate-spin" />
      </div>
    )
  }

  if (!authed) return <LoginScreen />

  const TABS = [
    { id: 'predictions', label: 'Predicciones', icon: Users },
    { id: 'results',     label: 'Resultados',   icon: Trophy },
    { id: 'plantillas',  label: 'Plantillas',   icon: Pencil },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-pitch-dark sticky top-0 z-20">
        <div className="flex h-1">
          <div className="flex-1 bg-mexico-green" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-mexico-red" />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 max-w-2xl mx-auto">
          <div>
            <p className="font-syncopate font-bold text-white text-sm">Admin Panel</p>
            <p className="text-xs font-mono text-gold">Copa 2026</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer font-mono"
          >
            <LogOut size={14} />Salir
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {fetchError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-4 mb-5">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-sans leading-relaxed">{fetchError}</p>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1.5 bg-white rounded-2xl border-2 border-gray-100 p-1.5 mb-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-mono font-bold
                transition-all duration-200 cursor-pointer
                ${activeTab === tab.id ? 'bg-pitch-dark text-white shadow-sm' : 'text-gray-500 hover:text-pitch-dark'}
              `}
            >
              <tab.icon size={14} />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'predictions' && (
          <PredictionsTab predictions={predictions} loading={loading} onRefresh={loadData} />
        )}
        {activeTab === 'results' && (
          <ResultsTab
            predictions={predictions}
            result={matchResult}
            onResultSaved={setMatchResult}
            mexicoPlayers={mexicoPlayers}
            saPlayers={saPlayers}
          />
        )}
        {activeTab === 'plantillas' && (
          <PlantillasTab
            mexicoPlayers={mexicoPlayers}
            saPlayers={saPlayers}
            onPlayersChange={(mx, sa) => { setMexicoPlayers(mx); setSaPlayers(sa) }}
          />
        )}
      </div>
    </div>
  )
}
