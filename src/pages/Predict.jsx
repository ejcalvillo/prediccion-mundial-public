import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fetchPlayerLists, DEFAULT_MEXICO_PLAYERS, DEFAULT_SA_PLAYERS } from '../lib/players'
import PhoneInput from '../components/PhoneInput'
import { syncScorers } from '../lib/scoring'
import Stepper from '../components/Stepper'
import ScorelinePreview from '../components/ScorelinePreview'
import GoalScorerSlot from '../components/GoalScorerSlot'
import PredictionRecapCard from '../components/PredictionRecapCard'

// ── Token validation states ──────────────────────────────────
const STATES = {
  LOADING: 'loading',
  INVALID: 'invalid',
  USED: 'used',
  EXPIRED: 'expired',   // after June 10 deadline
  FORM: 'form',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
}

// Deadline: June 10, 2026 23:59:59 CDT = June 11 2026 05:00:00 UTC
const DEADLINE = new Date('2026-06-11T05:00:00.000Z')

function isPastDeadline() {
  return new Date() >= DEADLINE
}

function fireMexicoConfetti() {
  const colors = ['#006847', '#FFFFFF', '#CE1126', '#D4AF37']
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    zIndex: 9999,
  })
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
    })
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
    })
  }, 300)
}

// ── Section wrapper ──────────────────────────────────────────
function Section({ number, title, children }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-full bg-pitch-dark flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-mono font-bold text-gold">{number}</span>
        </div>
        <h2 className="font-syncopate font-bold text-pitch-dark text-sm uppercase tracking-wide">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Input field ───────────────────────────────────────────────
function Field({ label, id, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold font-mono uppercase tracking-widest text-gray-500 mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500 font-sans">{error}</p>}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────
export default function Predict() {
  const [searchParams] = useSearchParams()
  const tokenCode = searchParams.get('token')?.trim().toUpperCase() || ''

  const [state, setState] = useState(STATES.LOADING)
  const [tokenId, setTokenId] = useState(null)
  const [submittedPrediction, setSubmittedPrediction] = useState(null)

  // Player rosters (fetched from Supabase, fallback to defaults)
  const [mexicoPlayers, setMexicoPlayers] = useState(DEFAULT_MEXICO_PLAYERS)
  const [saPlayers, setSaPlayers] = useState(DEFAULT_SA_PLAYERS)

  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [mexicoGoals, setMexicoGoals] = useState(0)
  const [saGoals, setSaGoals] = useState(0)
  const [scorers, setScorers] = useState([])
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  // Validate token and load player lists in parallel on mount
  useEffect(() => {
    if (!tokenCode) {
      setState(STATES.INVALID)
      return
    }

    async function initialize() {
      if (isPastDeadline()) {
        setState(STATES.EXPIRED)
        return
      }

      const [tokenRes, playersRes] = await Promise.allSettled([
        supabase.from('tokens').select('id, used').eq('code', tokenCode).maybeSingle(),
        fetchPlayerLists(),
      ])

      // Player lists are non-critical — apply if available
      if (playersRes.status === 'fulfilled') {
        setMexicoPlayers(playersRes.value.mexico)
        setSaPlayers(playersRes.value.sa)
      }

      // Token validation is critical
      if (tokenRes.status === 'rejected') {
        setState(STATES.ERROR)
        return
      }
      const { data, error } = tokenRes.value
      if (error) { console.error('[Token error]', error); setState(STATES.ERROR); return }
      if (!data) { setState(STATES.INVALID); return }
      if (data.used) { setState(STATES.USED); return }
      setTokenId(data.id)
      setState(STATES.FORM)
    }

    initialize()
  }, [tokenCode])

  // Sync scorer slots when goals change
  useEffect(() => {
    setScorers((prev) => syncScorers(prev, mexicoGoals, saGoals))
  }, [mexicoGoals, saGoals])

  const updateScorer = useCallback((idx, updated) => {
    setScorers((prev) => {
      const next = [...prev]
      next[idx] = updated
      return next
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`scorer_${idx}`]
      return next
    })
  }, [])

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'El nombre es requerido'
    // phone = "+52 5512345678" — local part is everything after the first space
    const localDigits = phone.split(' ').slice(1).join('').replace(/\D/g, '')
    if (!localDigits) errs.phone = 'El número de teléfono es requerido'
    else if (localDigits.length !== 10) errs.phone = 'El número debe tener exactamente 10 dígitos'
    if (!email.trim()) errs.email = 'El correo electrónico es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Ingresa un correo electrónico válido'
    }
    scorers.forEach((s, i) => {
      if (!s.player_name.trim()) errs[`scorer_${i}`] = true
    })
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      const firstErr = document.querySelector('[data-error]')
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setState(STATES.SUBMITTING)
    setSubmitError('')

    try {
      // Insert prediction
      const { error: insertError } = await supabase.from('predictions').insert({
        token_id: tokenId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
        mexico_goals: mexicoGoals,
        south_africa_goals: saGoals,
        scorers,
      })

      if (insertError) throw insertError

      // Mark token as used
      const { error: rpcError } = await supabase.rpc('mark_token_used', {
        p_token_code: tokenCode,
      })

      if (rpcError) throw rpcError

      const prediction = {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
        mexico_goals: mexicoGoals,
        south_africa_goals: saGoals,
        scorers,
      }
      setSubmittedPrediction(prediction)
      setState(STATES.SUCCESS)
      setTimeout(fireMexicoConfetti, 200)
    } catch (err) {
      console.error(err)
      setSubmitError(
        'Hubo un error al enviar tu predicción. Verifica tu conexión e intenta de nuevo.'
      )
      setState(STATES.FORM)
    }
  }

  // ── Render states ──────────────────────────────────────────

  if (state === STATES.LOADING) {
    return (
      <FullScreenMessage>
        <Loader2 size={40} className="text-mexico-green animate-spin mb-4" />
        <p className="font-syncopate font-bold text-pitch-dark text-lg">Verificando código…</p>
      </FullScreenMessage>
    )
  }

  if (state === STATES.INVALID) {
    return (
      <FullScreenMessage accent="red">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-mexico-red" />
        </div>
        <p className="font-syncopate font-bold text-pitch-dark text-xl mb-2">Código inválido</p>
        <p className="text-gray-500 text-sm font-sans text-center leading-relaxed max-w-xs">
          {tokenCode
            ? `El código "${tokenCode}" no existe. Revisa el QR o el ticket de tu compra.`
            : 'No se encontró un código de participación. Escanea el QR en tu ticket de compra.'}
        </p>
      </FullScreenMessage>
    )
  }

  if (state === STATES.USED) {
    return (
      <FullScreenMessage accent="amber">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-amber-500" />
        </div>
        <p className="font-syncopate font-bold text-pitch-dark text-xl mb-2">
          Este código ya fue usado
        </p>
        <p className="text-gray-500 text-sm font-sans text-center leading-relaxed max-w-xs">
          El código <span className="font-mono font-bold text-pitch-dark">{tokenCode}</span> ya fue
          utilizado para enviar una predicción. Cada código es válido una sola vez.
        </p>
      </FullScreenMessage>
    )
  }

  if (state === STATES.EXPIRED) {
    return (
      <FullScreenMessage>
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-gray-400" />
        </div>
        <p className="font-syncopate font-bold text-pitch-dark text-xl mb-2">
          Convocatoria cerrada
        </p>
        <p className="text-gray-500 text-sm font-sans text-center leading-relaxed max-w-xs">
          Las predicciones cerraron el <strong className="text-pitch-dark">10 de junio a las 11:59 pm</strong>.
          El partido se juega el 11 de junio. ¡Gracias por participar!
        </p>
      </FullScreenMessage>
    )
  }

  if (state === STATES.ERROR) {
    return (
      <FullScreenMessage>
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-mexico-red" />
        </div>
        <p className="font-syncopate font-bold text-pitch-dark text-xl mb-2">
          Error de conexión
        </p>
        <p className="text-gray-500 text-sm font-sans text-center leading-relaxed max-w-xs mb-6">
          No pudimos verificar tu código. Revisa tu conexión a internet e intenta de nuevo.
          Si el problema persiste, contacta a la farmacia.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pitch-dark text-white text-sm font-mono font-bold hover:bg-pitch-light active:scale-95 transition-all duration-200 cursor-pointer"
        >
          Reintentar
        </button>
      </FullScreenMessage>
    )
  }

  if (state === STATES.SUCCESS) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <PredictionRecapCard prediction={submittedPrediction} />
          <p className="text-center text-gray-500 text-xs font-sans mt-6 leading-relaxed">
            Guarda esta pantalla. El resultado se anunciará el 11 de junio de 2026 en tienda.
          </p>
        </div>
      </div>
    )
  }

  const totalGoals = mexicoGoals + saGoals
  const isSubmitting = state === STATES.SUBMITTING

  // ── Form render ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pitch-dark sticky top-0 z-20">
        <div className="flex h-1">
          <div className="flex-1 bg-mexico-green" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-mexico-red" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
          <div>
            <p className="font-syncopate font-bold text-white text-sm leading-tight">
              Farmacia Del Niño
            </p>
            <p className="text-xs font-mono text-gold">Copa 2026</p>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-1.5">
            <span className="text-white text-xs font-mono font-bold">{tokenCode}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-5" noValidate>
        {/* Deadline notice */}
        <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs font-sans text-amber-700">
            Predicciones válidas hasta el <strong>10 de junio, 11:59 pm</strong>
          </p>
        </div>

        {/* Hero scoreline */}
        <div className="text-center py-2">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
            México vs Sudáfrica · 11 Jun 2026
          </p>
          <ScorelinePreview mexicoGoals={mexicoGoals} saGoals={saGoals} />
        </div>

        {/* Section A: Personal info */}
        <Section number="A" title="Tus datos">
          <div className="space-y-4">
            <Field label="Nombre completo" id="name" error={errors.name}>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
                placeholder="Ej: María García López"
                autoComplete="name"
                data-error={errors.name ? true : undefined}
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 text-sm font-sans text-gray-800
                  outline-none transition-all duration-200 bg-white placeholder-gray-300
                  ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-mexico-green'}
                `}
              />
            </Field>

            <Field label="Teléfono" id="phone" error={errors.phone}>
              <div data-error={errors.phone ? true : undefined}>
                <PhoneInput
                  value={phone}
                  onChange={(v) => { setPhone(v); setErrors((p) => ({ ...p, phone: undefined })) }}
                  error={!!errors.phone}
                />
              </div>
            </Field>

            <Field label="Correo electrónico" id="email" error={errors.email}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
                placeholder="tu@correo.com"
                autoComplete="email"
                className={`
                  w-full px-4 py-3.5 rounded-xl border-2 text-sm font-sans text-gray-800
                  outline-none transition-all duration-200 bg-white placeholder-gray-300
                  ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-mexico-green'}
                `}
              />
            </Field>
          </div>
        </Section>

        {/* Section B: Score prediction */}
        <Section number="B" title="Marcador final">
          <div className="space-y-6">
            {/* Mexico stepper */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-mexico-green" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-mexico-green">
                  México
                </span>
              </div>
              <Stepper
                value={mexicoGoals}
                onChange={setMexicoGoals}
                accentClass="border-mexico-green text-mexico-green hover:bg-green-50"
                label=""
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
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-600">
                  Sudáfrica
                </span>
              </div>
              <Stepper
                value={saGoals}
                onChange={setSaGoals}
                accentClass="border-sa-gold text-amber-600 hover:bg-amber-50"
                label=""
              />
            </div>
          </div>
        </Section>

        {/* Section C: Scorers */}
        <Section number="C" title="Goleadores">
          {totalGoals === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm font-sans leading-relaxed">
                ¡Sin goles! Esperamos que no sea empate sin goles.
              </p>
              <p className="text-gray-400 text-xs font-mono mt-1">
                Ajusta el marcador para agregar goleadores
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-sans text-gray-500 mb-4 leading-relaxed">
                Indica quién anota cada gol. En total hay{' '}
                <strong className="text-pitch-dark">{totalGoals} {totalGoals === 1 ? 'gol' : 'goles'}</strong>{' '}
                que predecir.
              </p>
              {scorers.map((scorer, idx) => (
                <GoalScorerSlot
                  key={idx}
                  index={idx}
                  scorer={scorer}
                  onChange={(updated) => updateScorer(idx, updated)}
                  error={errors[`scorer_${idx}`]}
                  mexicoPlayers={mexicoPlayers}
                  saPlayers={saPlayers}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Submit error */}
        {submitError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-sans leading-relaxed">{submitError}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full flex items-center justify-center gap-2.5
            py-5 rounded-2xl text-white font-syncopate font-bold text-sm uppercase tracking-wide
            transition-all duration-200 cursor-pointer
            ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-mexico-green hover:bg-mexico-green-light active:scale-95 shadow-mexico'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Enviando…</span>
            </>
          ) : (
            <span>Enviar mi predicción</span>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 font-sans pb-8">
          Al enviar aceptas los términos y condiciones de la promoción.
        </p>
      </form>
    </div>
  )
}

// ── Helper: full-screen message wrapper ─────────────────────
function FullScreenMessage({ children, accent = 'green' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 text-center">
      <div className="mb-4">
        <p className="font-syncopate font-bold text-pitch-dark text-base opacity-50">
          Farmacia Del Niño
        </p>
      </div>
      {children}
    </div>
  )
}
