import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Smartphone, Trophy, ArrowRight, MapPin, Calendar, Clock } from 'lucide-react'

const STEPS = [
  {
    icon: ShoppingBag,
    number: '01',
    title: 'Compra',
    description: 'Realiza una compra en Farmacia Del Niño y recibe tu código único de participación.',
  },
  {
    icon: Smartphone,
    number: '02',
    title: 'Escanea el QR',
    description: 'Escanea el código QR con tu celular o ingresa el código manualmente.',
  },
  {
    icon: Trophy,
    number: '03',
    title: 'Haz tu predicción',
    description: 'Predice el marcador y los goleadores del partido. ¡El mejor pronóstico gana!',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [tokenInput, setTokenInput] = useState('')
  const [inputError, setInputError] = useState('')

  function handleTokenSubmit(e) {
    e.preventDefault()
    const code = tokenInput.trim().toUpperCase()
    if (!code) {
      setInputError('Ingresa tu código de participación')
      return
    }
    if (!/^FDN-[A-Z0-9]{8}$/.test(code)) {
      setInputError('Formato inválido. Debe ser FDN- seguido de 8 caracteres (ej: FDN-A3K9M2X7)')
      return
    }
    setInputError('')
    navigate(`/predict?token=${code}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-pitch-dark">
        {/* Decorative pitch lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white" />
          <div className="absolute top-0 left-0 right-0 h-px bg-white mt-20" />
        </div>

        {/* Mexican flag stripe at top */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-mexico-green" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-mexico-red" />
        </div>

        <div className="relative max-w-2xl mx-auto px-5 pt-16 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-mono font-bold uppercase tracking-widest">
              FIFA World Cup 2026
            </span>
          </div>

          <h1 className="font-syncopate font-bold text-white leading-tight mb-4">
            <span className="block text-3xl sm:text-5xl">¡Predice el</span>
            <span className="block text-3xl sm:text-5xl text-gold mt-1">partido inaugural!</span>
          </h1>

          <p className="text-gray-300 font-sans text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Participa con tu código exclusivo y demuestra que sabes de fútbol. El pronóstico más
            acertado gana el gran premio.
          </p>

          {/* Match details card */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 mb-10">
            <div className="text-center">
              <div className="font-syncopate font-bold text-white text-xl">México</div>
              <div className="text-xs font-mono text-emerald-300 uppercase tracking-widest mt-0.5">El Tri</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-syncopate font-bold text-gold text-3xl">vs</span>
            </div>
            <div className="text-center">
              <div className="font-syncopate font-bold text-white text-xl">Sudáfrica</div>
              <div className="text-xs font-mono text-sa-gold uppercase tracking-widest mt-0.5">Bafana Bafana</div>
            </div>
          </div>

          {/* Match metadata */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-gray-400 font-sans">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gold" />
              <span>11 de junio, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gold" />
              <span>Estadio Azteca, CDMX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gold" />
              <span>Partido inaugural</span>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 40L1440 0C1440 0 1080 40 720 20C360 0 0 0 0 0L0 40Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-mexico-green mb-2">
            Cómo funciona
          </p>
          <h2 className="font-syncopate font-bold text-pitch-dark text-2xl sm:text-3xl">
            3 pasos para participar
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="relative flex sm:flex-col gap-4 sm:gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-mexico-green hover:shadow-mexico transition-all duration-300 cursor-default"
            >
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pitch-dark flex items-center justify-center">
                <step.icon size={22} className="text-gold" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-gray-400 mb-0.5">{step.number}</div>
                <h3 className="font-syncopate font-bold text-pitch-dark text-sm mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm font-sans leading-relaxed">{step.description}</p>
              </div>
              {/* Connector arrow on desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center">
                    <ArrowRight size={12} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── PARTICIPAR AHORA ─────────────────────────────────── */}
      <section className="max-w-md mx-auto px-5 pb-10 text-center">
        <a
          href="#participar"
          className="
            inline-flex items-center gap-2 px-8 py-4 rounded-2xl
            bg-mexico-green text-white font-syncopate font-bold text-sm uppercase tracking-wide
            hover:bg-mexico-green-light active:scale-95 transition-all duration-200 shadow-mexico
          "
        >
          <span>Participar ahora</span>
          <ArrowRight size={18} />
        </a>
        <p className="text-xs text-gray-400 font-sans mt-3">
          Válido hasta el <strong className="text-gray-600">31 de diciembre, 11:59 pm</strong>
        </p>
      </section>

      {/* ── SCORING BREAKDOWN ───────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-5 py-14 border-t border-gray-100">
        <div className="text-center mb-8">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-mexico-green mb-2">
            Sistema de puntos
          </p>
          <h2 className="font-syncopate font-bold text-pitch-dark text-xl sm:text-2xl">
            ¿Cómo se calculan los puntos?
          </h2>
        </div>

        {/* Points table */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden mb-4">
          {[
            {
              pts: '1×gol',
              label: 'Precisión de goles por equipo',
              sub: 'Por cada gol que acertaste (hasta el total real).',
            },
            {
              pts: '+2',
              label: 'Resultado correcto (G/E/P)',
              sub: 'Acertaste si México ganó, empató o perdió. Se otorga siempre, incluso si también acertaste el marcador exacto.',
            },
            {
              pts: '+5',
              label: 'Bonus: marcador exacto',
              sub: 'Bonus adicional por acertar el marcador completo de ambos equipos con exactitud.',
            },
            {
              pts: '+3',
              label: 'Goleador correcto',
              sub: 'Nombre del jugador y equipo coinciden con un gol real del partido.',
            },
            {
              pts: '+1',
              label: 'Tiempo correcto del gol',
              sub: 'Bonus extra por cada goleador donde también acertaste si marcó en 1° o 2° tiempo.',
            },
          ].map((row, i, arr) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="w-14 h-10 rounded-xl bg-pitch-dark flex items-center justify-center flex-shrink-0">
                <span className="font-syncopate font-bold text-gold text-xs text-center leading-tight">{row.pts}</span>
              </div>
              <div>
                <p className="text-sm font-semibold font-sans text-pitch-dark">{row.label}</p>
                <p className="text-xs font-sans text-gray-400 leading-snug">{row.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tiebreakers */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 px-5 py-4 mb-5">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-3">
            Desempates (si hay empate en puntos)
          </p>
          <ol className="space-y-1.5">
            {[
              'Marcador exacto (resultado completo)',
              'Resultado correcto (G/E/P)',
              'Mayor número de goleadores acertados',
              'Goles de México exactos',
              'Goles de Sudáfrica exactos',
              'Predicción enviada primero (fecha y hora)',
            ].map((tb, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm font-sans text-gray-600">
                <span className="w-5 h-5 rounded-full bg-pitch-dark text-gold text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {tb}
              </li>
            ))}
          </ol>
        </div>

        {/* Winner contact notice */}
        <div className="bg-mexico-green/8 border border-mexico-green/25 rounded-2xl px-5 py-4 text-center">
          <p className="text-sm font-sans text-gray-700 leading-relaxed">
            El ganador será contactado el{' '}
            <strong className="text-pitch-dark">día del partido (11 de junio)</strong>{' '}
            por teléfono o correo electrónico.
          </p>
        </div>
      </section>

      {/* ── CTA / TOKEN INPUT ────────────────────────────────── */}
      <section id="participar" className="bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-16 text-center">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-mexico-green mb-2">
            ¿Ya tienes tu código?
          </p>
          <h2 className="font-syncopate font-bold text-pitch-dark text-xl sm:text-2xl mb-3">
            Ingresa tu código aquí
          </h2>
          <p className="text-gray-500 text-sm font-sans mb-2 leading-relaxed">
            Encuentra el código en tu ticket de compra o escanea el QR impreso.
            El formato es <strong className="text-pitch-dark font-mono">FDN-XXXXXXXX</strong>.
          </p>
          <p className="text-amber-600 text-xs font-sans font-semibold mb-8">
            Válido hasta el 31 de diciembre de 2026 a las 11:59 pm
          </p>

          <form onSubmit={handleTokenSubmit} className="flex flex-col gap-3">
            <div>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value.toUpperCase())
                  setInputError('')
                }}
                placeholder="FDN-A3K9M2X7"
                maxLength={12}
                aria-label="Código de participación"
                className={`
                  w-full px-5 py-4 rounded-2xl border-2 text-center text-xl font-mono font-bold
                  uppercase tracking-widest outline-none transition-all duration-200
                  placeholder-gray-300 text-pitch-dark
                  ${inputError
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-gray-200 bg-white focus:border-mexico-green'
                  }
                `}
              />
              {inputError && (
                <p className="mt-2 text-sm text-red-500 font-sans text-left">{inputError}</p>
              )}
            </div>

            <button
              type="submit"
              className="
                w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                bg-mexico-green text-white font-syncopate font-bold text-sm uppercase tracking-wide
                hover:bg-mexico-green-light active:scale-95
                transition-all duration-200 cursor-pointer shadow-mexico
              "
            >
              <span>Ir a mi predicción</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-pitch-dark">
        <div className="flex h-1">
          <div className="flex-1 bg-mexico-green" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-mexico-red" />
        </div>
        <div className="max-w-2xl mx-auto px-5 py-8 text-center">
          <p className="font-syncopate font-bold text-white text-lg mb-1">
            Farmacia Del Niño
          </p>
          <p className="text-gray-300 text-xs font-sans">
            Promoción válida del 1 al 11 de junio de 2026. Sujeto a términos y condiciones.
          </p>
          <p className="text-gray-400 text-xs font-mono mt-4">
            © 2026 Farmacia Del Niño
          </p>
        </div>
      </footer>
    </div>
  )
}
