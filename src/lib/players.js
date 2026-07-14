import { supabase } from './supabase'

// Default rosters — used as fallback if Supabase fetch fails
export const DEFAULT_MEXICO_PLAYERS = [
  { id: 'mx-1',  number: '1',  position: 'POR', name: 'Guillermo Ochoa' },
  { id: 'mx-2',  number: '6',  position: 'MED', name: 'Edson Álvarez' },
  { id: 'mx-3',  number: '22', position: 'DEL', name: 'Hirving (Chucky) Lozano' },
  { id: 'mx-4',  number: '9',  position: 'DEL', name: 'Raúl Jiménez' },
  { id: 'mx-5',  number: '11', position: 'DEL', name: 'Henry Martín' },
  { id: 'mx-6',  number: '10', position: 'DEL', name: 'Alexis Vega' },
  { id: 'mx-7',  number: '7',  position: 'MED', name: 'Roberto Alvarado' },
  { id: 'mx-8',  number: '14', position: 'MED', name: 'Orbelín Pineda' },
  { id: 'mx-9',  number: '4',  position: 'DEF', name: 'Johan Vásquez' },
  { id: 'mx-10', number: '3',  position: 'DEF', name: 'César Montes' },
  { id: 'mx-11', number: '21', position: 'DEF', name: 'Jesús Gallardo' },
]

export const DEFAULT_SA_PLAYERS = [
  { id: 'sa-1',  number: '16', position: 'POR', name: 'Ronwen Williams' },
  { id: 'sa-2',  number: '11', position: 'DEL', name: 'Percy Tau' },
  { id: 'sa-3',  number: '10', position: 'DEL', name: 'Themba Zwane' },
  { id: 'sa-4',  number: '8',  position: 'MED', name: 'Bongani Zungu' },
  { id: 'sa-5',  number: '9',  position: 'DEL', name: 'Evidence Makgopa' },
  { id: 'sa-6',  number: '7',  position: 'DEL', name: 'Lyle Foster' },
  { id: 'sa-7',  number: '17', position: 'MED', name: 'Yusuf Maart' },
  { id: 'sa-8',  number: '5',  position: 'DEF', name: 'Siyanda Xulu' },
  { id: 'sa-9',  number: '13', position: 'MED', name: 'Teboho Mokoena' },
  { id: 'sa-10', number: '19', position: 'DEL', name: 'Ethan Ntagungira' },
]

export const OTHER_PLAYER = 'Otro jugador'

// Fetch both rosters from Supabase in one query.
// Returns { mexico, sa } — always resolves (falls back to defaults on error).
export async function fetchPlayerLists() {
  try {
    const { data, error } = await supabase
      .from('player_lists')
      .select('team, players')

    if (error || !data) throw error

    const mexico = data.find((r) => r.team === 'Mexico')?.players ?? DEFAULT_MEXICO_PLAYERS
    const sa     = data.find((r) => r.team === 'South Africa')?.players ?? DEFAULT_SA_PLAYERS
    return { mexico, sa }
  } catch {
    return { mexico: DEFAULT_MEXICO_PLAYERS, sa: DEFAULT_SA_PLAYERS }
  }
}

// Persist both rosters back to Supabase.
export async function savePlayerLists(mexico, sa) {
  const { error } = await supabase.from('player_lists').upsert([
    { team: 'Mexico',       players: mexico, updated_at: new Date().toISOString() },
    { team: 'South Africa', players: sa,     updated_at: new Date().toISOString() },
  ])
  if (error) throw error
}

const POSITION_ORDER = { DEL: 0, MED: 1, DEF: 2, POR: 3 }

// DEL → MED → DEF → POR, then ascending jersey number
export function sortPlayers(players) {
  return [...players].sort((a, b) => {
    const po = (POSITION_ORDER[a.position] ?? 99) - (POSITION_ORDER[b.position] ?? 99)
    if (po !== 0) return po
    return (parseInt(a.number) || 99) - (parseInt(b.number) || 99)
  })
}

// Returns "#22 DEL · Hirving (Chucky) Lozano"  (omits empty fields)
export function formatPlayerDisplay(player) {
  const tag = [player.number && `#${player.number}`, player.position]
    .filter(Boolean)
    .join(' ')
  return tag ? `${tag} · ${player.name}` : player.name
}
