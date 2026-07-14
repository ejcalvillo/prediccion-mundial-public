import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search } from 'lucide-react'

const COUNTRY_CODES = [
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+1',  flag: '🇺🇸', name: 'Estados Unidos / Canadá' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+506',flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+593',flag: '🇪🇨', name: 'Ecuador' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+33', flag: '🇫🇷', name: 'Francia' },
  { code: '+502',flag: '🇬🇹', name: 'Guatemala' },
  { code: '+504',flag: '🇭🇳', name: 'Honduras' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+49', flag: '🇩🇪', name: 'Alemania' },
  { code: '+39', flag: '🇮🇹', name: 'Italia' },
  { code: '+81', flag: '🇯🇵', name: 'Japón' },
  { code: '+505',flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+507',flag: '🇵🇦', name: 'Panamá' },
  { code: '+595',flag: '🇵🇾', name: 'Paraguay' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+1787',flag:'🇵🇷', name: 'Puerto Rico' },
  { code: '+598',flag: '🇺🇾', name: 'Uruguay' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
]

export default function PhoneInput({ value, onChange, error }) {
  const [countryCode, setCountryCode] = useState('+52')
  const [localNumber, setLocalNumber] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState({})

  const triggerRef = useRef(null)
  const portalRef = useRef(null)
  const containerRef = useRef(null)

  // Notify parent whenever either part changes
  useEffect(() => {
    onChange(`${countryCode} ${localNumber}`)
  }, [countryCode, localNumber]) // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside both trigger and portal
  useEffect(() => {
    if (!open) return
    function onMouseDown(e) {
      const inTrigger = containerRef.current?.contains(e.target)
      const inPortal = portalRef.current?.contains(e.target)
      if (!inTrigger && !inPortal) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  function openDropdown() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const DROPDOWN_H = 300
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8
    const openUp = spaceBelow < DROPDOWN_H && spaceAbove > spaceBelow
    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      maxHeight: `${Math.min(openUp ? spaceAbove : spaceBelow, DROPDOWN_H)}px`,
      ...(openUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    })
    setOpen(true)
    setSearch('')
  }

  function selectCountry(c) {
    setCountryCode(c.code)
    setOpen(false)
  }

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  )

  const selected = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0]

  return (
    <div className="flex gap-2" ref={containerRef}>
      {/* Country code selector */}
      <div className="relative flex-shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? setOpen(false) : openDropdown())}
          className={`
            h-full min-h-[52px] flex items-center gap-1.5 px-3 rounded-xl border-2 bg-white
            text-sm font-mono font-bold transition-all duration-200 cursor-pointer
            ${error ? 'border-red-400' : 'border-gray-200 hover:border-mexico-green focus:border-mexico-green'}
          `}
        >
          <span>{selected.flag}</span>
          <span className="text-gray-700">{selected.code}</span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && createPortal(
          <div
            ref={portalRef}
            style={dropdownStyle}
            className="bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
          >
            {/* Search bar — fixed height, never shrinks */}
            <div className="p-2 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Search size={13} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar país…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
            {/* Country list — flex:1 + min-h-0 lets it shrink to the portal's maxHeight and scroll */}
            <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">
              {filtered.map((c) => (
                <button
                  key={c.code + c.name}
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                    hover:bg-gray-50 transition-colors duration-150 cursor-pointer
                    ${c.code === countryCode ? 'bg-green-50 text-mexico-green font-semibold' : 'text-gray-700'}
                  `}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="font-mono font-bold text-xs text-gray-500 w-10 flex-shrink-0">{c.code}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-400 italic">Sin resultados</p>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Local number input — digits only, exactly 10 */}
      <div className="flex-1 relative">
        <input
          type="tel"
          inputMode="numeric"
          value={localNumber}
          onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="5512345678"
          maxLength={10}
          className={`
            w-full px-4 py-3.5 rounded-xl border-2 text-sm font-sans text-gray-800
            outline-none transition-all duration-200 bg-white placeholder-gray-300
            ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-mexico-green'}
          `}
        />
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums pointer-events-none ${localNumber.length === 10 ? 'text-mexico-green' : 'text-gray-300'}`}>
          {localNumber.length}/10
        </span>
      </div>
    </div>
  )
}
