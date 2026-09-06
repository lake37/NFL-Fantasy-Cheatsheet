export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST'

export interface StatLine {
  passYards?: number
  passTD?: number
  passTwoPt?: number
  rushYards?: number
  rushTD?: number
  rushTwoPt?: number
  receptions?: number
  recYards?: number
  recTD?: number
  recTwoPt?: number
  patMade?: number
  fg0_19?: number
  fg20_29?: number
  fg30_39?: number
  fg40_49?: number
  fg50_59?: number
  fg60plus?: number
}

export const STAT_FIELDS: { key: keyof StatLine; label: string; positions: Position[] }[] = [
  { key: 'passYards', label: 'Pass Yds', positions: ['QB'] },
  { key: 'passTD', label: 'Pass TD', positions: ['QB'] },
  { key: 'passTwoPt', label: 'Pass 2PT', positions: ['QB'] },
  { key: 'rushYards', label: 'Rush Yds', positions: ['QB', 'RB'] },
  { key: 'rushTD', label: 'Rush TD', positions: ['QB', 'RB'] },
  { key: 'rushTwoPt', label: 'Rush 2PT', positions: ['QB', 'RB'] },
  { key: 'receptions', label: 'Rec', positions: ['WR', 'TE'] },
  { key: 'recYards', label: 'Rec Yds', positions: ['WR', 'TE'] },
  { key: 'recTD', label: 'Rec TD', positions: ['WR', 'TE'] },
  { key: 'recTwoPt', label: 'Rec 2PT', positions: ['WR', 'TE'] },
  { key: 'patMade', label: 'PAT', positions: ['K'] },
  { key: 'fg0_19', label: 'FG 0-19', positions: ['K'] },
  { key: 'fg20_29', label: 'FG 20-29', positions: ['K'] },
  { key: 'fg30_39', label: 'FG 30-39', positions: ['K'] },
  { key: 'fg40_49', label: 'FG 40-49', positions: ['K'] },
  { key: 'fg50_59', label: 'FG 50-59', positions: ['K'] },
  { key: 'fg60plus', label: 'FG 60+', positions: ['K'] },
]

export interface ProjectionSource {
  source: string
  stats: StatLine
}

export interface Player {
  id: string
  name: string
  nflTeam: string
  position: Position
  projections: ProjectionSource[]
}

export interface CategorySettings {
  yardsPerPoint: number
  td: number
  twoPt: number
}

export interface ReceivingSettings extends CategorySettings {
  reception: number
}

export interface KickingSettings {
  patMade: number
  fg0_19: number
  fg20_29: number
  fg30_39: number
  fg40_49: number
  fg50_59: number
  fg60plus: number
}

export interface ScoringSettings {
  passing: CategorySettings
  rushing: CategorySettings
  receiving: ReceivingSettings
  kicking: KickingSettings
}

export interface Team {
  id: string
  name: string
  keeperSlots: number
  keeperPlayerIds: string[]
}

export interface DraftPick {
  pickNumber: number
  teamId: string
  playerId: string
}

export interface DraftSettings {
  snake: boolean
  order: string[] // team ids, round-1 order
}

export interface DraftState {
  active: boolean
  picks: DraftPick[]
}
