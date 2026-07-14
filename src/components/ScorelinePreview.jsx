export default function ScorelinePreview({ mexicoGoals, saGoals }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 px-6 bg-pitch-dark rounded-2xl">
      <div className="flex flex-col items-center min-w-[80px]">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-mexico-green mb-1">
          México
        </span>
        <div className="flex items-center gap-2">
          <span className="text-4xl font-syncopate font-bold text-white tabular-nums">
            {mexicoGoals}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-2xl font-syncopate font-bold text-gold">–</span>
      </div>

      <div className="flex flex-col items-center min-w-[80px]">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-sa-gold mb-1">
          Sudáfrica
        </span>
        <div className="flex items-center gap-2">
          <span className="text-4xl font-syncopate font-bold text-white tabular-nums">
            {saGoals}
          </span>
        </div>
      </div>
    </div>
  )
}
