import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DraftPick, DraftSettings, Player, ScoringSettings, Team } from '../types'
import { DEFAULT_SCORING_SETTINGS } from '../utils/scoring'
import { SEED_PLAYERS } from '../data/players'

function makeDefaultTeams(count: number): Team[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `Team ${i + 1}`,
    keeperSlots: 0,
    keeperPlayerIds: [],
  }))
}

interface StoreState {
  teams: Team[]
  draftSettings: DraftSettings
  scoring: ScoringSettings
  players: Player[]
  draftActive: boolean
  picks: DraftPick[]

  setTeamCount: (count: number) => void
  renameTeam: (teamId: string, name: string) => void
  setKeeperSlots: (teamId: string, slots: number) => void
  toggleKeeper: (teamId: string, playerId: string) => void

  setDraftOrder: (order: string[]) => void
  setSnake: (snake: boolean) => void

  setScoring: (scoring: ScoringSettings) => void

  setDraftActive: (active: boolean) => void
  draftPlayer: (playerId: string) => void
  undoLastPick: () => void
  resetDraft: () => void

  importProjections: (
    updates: { name: string; position: string; source: string; stats: Record<string, number> }[],
  ) => { matched: number; created: number }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      teams: makeDefaultTeams(10),
      draftSettings: { snake: true, order: makeDefaultTeams(10).map((t) => t.id) },
      scoring: DEFAULT_SCORING_SETTINGS,
      players: SEED_PLAYERS,
      draftActive: false,
      picks: [],

      setTeamCount: (count) =>
        set((state) => {
          const teams = makeDefaultTeams(count).map((t, i) => state.teams[i] ?? t)
          const order = teams.map((t) => t.id)
          return { teams, draftSettings: { ...state.draftSettings, order } }
        }),

      renameTeam: (teamId, name) =>
        set((state) => ({
          teams: state.teams.map((t) => (t.id === teamId ? { ...t, name } : t)),
        })),

      setKeeperSlots: (teamId, slots) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId
              ? { ...t, keeperSlots: slots, keeperPlayerIds: t.keeperPlayerIds.slice(0, slots) }
              : t,
          ),
        })),

      toggleKeeper: (teamId, playerId) =>
        set((state) => ({
          teams: state.teams.map((t) => {
            if (t.id !== teamId) return t
            const has = t.keeperPlayerIds.includes(playerId)
            if (has) return { ...t, keeperPlayerIds: t.keeperPlayerIds.filter((id) => id !== playerId) }
            if (t.keeperPlayerIds.length >= t.keeperSlots) return t
            return { ...t, keeperPlayerIds: [...t.keeperPlayerIds, playerId] }
          }),
        })),

      setDraftOrder: (order) =>
        set((state) => ({ draftSettings: { ...state.draftSettings, order } })),

      setSnake: (snake) =>
        set((state) => ({ draftSettings: { ...state.draftSettings, snake } })),

      setScoring: (scoring) => set({ scoring }),

      setDraftActive: (active) => set({ draftActive: active }),

      draftPlayer: (playerId) =>
        set((state) => {
          const teamOnClock = getTeamOnClock(state)
          if (!teamOnClock) return state
          const pickNumber = state.picks.length + 1
          return {
            picks: [...state.picks, { pickNumber, teamId: teamOnClock.id, playerId }],
          }
        }),

      undoLastPick: () =>
        set((state) => ({ picks: state.picks.slice(0, -1) })),

      resetDraft: () => set({ picks: [], draftActive: false }),

      importProjections: (updates) => {
        let matched = 0
        let created = 0
        set((state) => {
          const players = [...state.players]
          for (const u of updates) {
            const idx = players.findIndex(
              (p) => p.name.toLowerCase() === u.name.toLowerCase() && p.position === u.position,
            )
            if (idx >= 0) {
              const player = players[idx]
              const projections = player.projections.filter((s) => s.source !== u.source)
              projections.push({ source: u.source, stats: u.stats })
              players[idx] = { ...player, projections }
              matched++
            } else {
              players.push({
                id: `custom-${u.name.toLowerCase().replace(/\s+/g, '-')}-${u.position}`,
                name: u.name,
                nflTeam: 'FA',
                position: u.position as Player['position'],
                projections: [{ source: u.source, stats: u.stats }],
              })
              created++
            }
          }
          return { players }
        })
        return { matched, created }
      },
    }),
    { name: 'nfl-fantasy-draft-tool' },
  ),
)

export function getTeamOnClock(state: Pick<StoreState, 'teams' | 'draftSettings' | 'picks'>): Team | null {
  const { order, snake } = state.draftSettings
  const numTeams = order.length
  if (numTeams === 0) return null
  const pickIndex = state.picks.length
  const round = Math.floor(pickIndex / numTeams)
  const indexInRound = pickIndex % numTeams
  const slot = snake && round % 2 === 1 ? numTeams - 1 - indexInRound : indexInRound
  const teamId = order[slot]
  return state.teams.find((t) => t.id === teamId) ?? null
}

export function draftedPlayerIds(state: Pick<StoreState, 'teams' | 'picks'>): Set<string> {
  const ids = new Set<string>()
  for (const team of state.teams) {
    for (const id of team.keeperPlayerIds) ids.add(id)
  }
  for (const pick of state.picks) ids.add(pick.playerId)
  return ids
}
