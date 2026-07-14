import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search } from 'lucide-react'
import { sortPlayers } from '../lib/players'

export default function GoalScorerSlot({
  index,
  scorer,
  onChange,
  error,
  mexicoPlayers = [],
  saPlayers = [],
}) {
  const [searchText, setSearchText] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState({})

  const triggerRef = useRef(null)
  const portalRef = useRef(null)
  const containerRef = useRef(null)

  const rawPlayers = scorer.team === 'Mexico' ? mexicoPlayers : saPlayers
  const players = sortPlayers(rawPlayers)

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (p.number && String(p.number).includes(searchText)) ||
      (p.position && p.position.toLowerCase().includes(searchText.toLowerCase()))
  )

  // Click outside both trigger container and portal
  useEffect(() => {
    if (!dropdownOpen) return
    function onMouseDown(e) {
      const inTrigger = containerRef.current?.contains(e.target)
      const inPortal = portalRef.current?.contains(e.target)
      if (!inTrigger && !inPortal) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [dropdownOpen])

  function openDropdown() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const DROPDOWN_H = 340  // search bar ~52px + ~10 items × 44px = ~492px, cap at 340
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8
    const openUp = spaceBelow < DROPDOWN_H && spaceAbove > spaceBelow

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      // Clamp height to the actual available space in the chosen direction
      maxHeight: `${Math.min(openUp ? spaceAbove : spaceBelow, DROPDOWN_H)}px`,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
    setDropdownOpen(true)
    setSearchText('')
  }

  function handlePlayerSelect(player) {
    onChange({ ...scorer, player_name: player.name })
    setDropdownOpen(false)
  }

  const isMexico = scorer.team === 'Mexico'

  return (
    <div
      className={`
        p-4 rounded-2xl border-2 transition-all duration-300 animate-slide-up
        ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-pitch-dark flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-mono font-bold text-gold">{index + 1}</span>
        </div>
        <span className="text-sm font-semibold text-gray-600">Gol #{index + 1}</span>
      </div>

      {/* Team label — read-only, determined by goal count */}
      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border ${isMexico ? 'bg-green-50 border-mexico-green/30' : 'bg-amber-50 border-sa-gold/40'}`}>
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isMexico ? 'bg-mexico-green' : 'bg-sa-gold'}`} />
        <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isMexico ? 'text-mexico-green' : 'text-amber-700'}`}>
          {isMexico ? 'México' : 'Sudáfrica'}
        </span>
      </div>

      {/* Player selector */}
      <div className="relative mb-3" ref={containerRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (dropdownOpen ? setDropdownOpen(false) : openDropdown())}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-xl border-2
            text-sm font-sans text-left transition-all duration-200 cursor-pointer
            ${scorer.player_name ? 'border-gray-300 text-gray-800 bg-white' : 'border-gray-200 text-gray-400 bg-gray-50'}
            ${error && !scorer.player_name ? 'border-red-400' : ''}
          `}
        >
          <span className="truncate">{scorer.player_name || 'Seleccionar jugador…'}</span>
          <ChevronDown
            size={16}
            className={`flex-shrink-0 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && createPortal(
          <div
            ref={portalRef}
            style={dropdownStyle}
            className="bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Nombre, número o posición…"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
            <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">
              {filteredPlayers.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-400 italic">Sin resultados</p>
              )}
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handlePlayerSelect(player)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-800 font-sans">{player.name}</span>
                  {(player.number || player.position) && (
                    <span className="ml-2 text-xs text-gray-400 font-mono">
                      {[player.number && `#${player.number}`, player.position].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Half selector */}
      <div className="flex gap-2">
        {[1, 2].map((half) => (
          <button
            key={half}
            type="button"
            onClick={() => onChange({ ...scorer, half })}
            className={`
              flex-1 py-2 rounded-xl border-2 text-xs font-bold font-mono uppercase tracking-wide
              transition-all duration-200 cursor-pointer
              ${scorer.half === half
                ? 'border-pitch-DEFAULT bg-pitch-dark text-white'
                : 'border-gray-200 text-gray-500 bg-white hover:border-pitch-light'}
            `}
          >
            {half === 1 ? '1° Tiempo' : '2° Tiempo'}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500 font-sans">Completa los datos de este goleador</p>
      )}
    </div>
  )
}
