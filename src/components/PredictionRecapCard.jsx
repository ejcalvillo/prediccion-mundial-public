import { CheckCircle, User, Phone, Trophy } from 'lucide-react'

export default function PredictionRecapCard({ prediction }) {
  const { customer_name, customer_phone, mexico_goals, south_africa_goals, scorers } = prediction

  return (
    <div className="w-full max-w-sm mx-auto bg-pitch-dark rounded-3xl overflow-hidden shadow-gold">
      {/* Header stripe */}
      <div className="h-2 bg-gradient-to-r from-mexico-green via-white to-mexico-red" />

      <div className="p-6">
        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center animate-bounce-in">
            <CheckCircle size={32} className="text-gold" />
          </div>
        </div>

        <h3 className="font-syncopate font-bold text-white text-center text-lg mb-1">
          ¡Predicción enviada!
        </h3>
        <p className="text-gray-300 text-center text-sm font-sans mb-1">
          Espera el resultado el 11 de junio
        </p>
        <p className="text-gray-300 text-center text-xs font-sans mb-6 leading-relaxed px-2">
          Si ganas, te contactaremos ese mismo día por teléfono o correo electrónico.
        </p>

        {/* Participant */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <User size={16} className="text-gold flex-shrink-0" />
            <span className="text-white text-sm font-sans truncate">{customer_name}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <Phone size={16} className="text-gold flex-shrink-0" />
            <span className="text-white text-sm font-sans">{customer_phone}</span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-4 bg-white/5 rounded-2xl py-5 mb-5">
          <div className="text-center">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-mexico-green mb-1">
              México
            </div>
            <div className="text-5xl font-syncopate font-bold text-white tabular-nums">
              {mexico_goals}
            </div>
          </div>
          <div className="text-2xl font-syncopate font-bold text-gold">–</div>
          <div className="text-center">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-sa-gold mb-1">
              Sudáfrica
            </div>
            <div className="text-5xl font-syncopate font-bold text-white tabular-nums">
              {south_africa_goals}
            </div>
          </div>
        </div>

        {/* Scorers */}
        {scorers && scorers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-gold" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                Goleadores
              </span>
            </div>
            <div className="space-y-1.5">
              {scorers.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold ${
                        s.team === 'Mexico' ? 'text-mexico-green' : 'text-sa-gold'
                      }`}
                    >
                      {s.team === 'Mexico' ? 'MX' : 'SA'}
                    </span>
                    <span className="text-white text-sm font-sans">{s.player_name}</span>
                  </div>
                  <span className="text-xs text-gray-300 font-mono">{s.half}T</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer stripe */}
      <div className="h-1 bg-gold/40" />
    </div>
  )
}
