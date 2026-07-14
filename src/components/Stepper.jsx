import { Minus, Plus } from 'lucide-react'

export default function Stepper({ value, onChange, min = 0, max = 10, accentClass = '', label = '' }) {
  const canDecrement = value > min
  const canIncrement = value < max

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 font-mono">
          {label}
        </span>
      )}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          aria-label="Disminuir"
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            border-2 transition-all duration-200 cursor-pointer
            ${canDecrement
              ? `${accentClass} hover:scale-110 active:scale-95`
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>

        <span
          className={`
            font-syncopate font-bold text-6xl w-20 text-center tabular-nums
            transition-all duration-200 select-none
            ${accentClass.includes('mexico') ? 'text-mexico-green' : 'text-sa-gold'}
          `}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          aria-label="Aumentar"
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            border-2 transition-all duration-200 cursor-pointer
            ${canIncrement
              ? `${accentClass} hover:scale-110 active:scale-95`
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
