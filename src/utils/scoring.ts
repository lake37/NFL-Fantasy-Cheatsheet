import type { Player, ScoringSettings, StatLine } from '../types'

/** Average a player's per-source projections into one consensus stat line. */
export function consensusStats(player: Player): StatLine {
  const sources = player.projections
  if (sources.length === 0) return {}
  const sums: Record<string, number> = {}
  const counts: Record<string, number> = {}
  for (const { stats } of sources) {
    for (const [key, value] of Object.entries(stats)) {
      if (value === undefined) continue
      sums[key] = (sums[key] ?? 0) + value
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  const result: StatLine = {}
  for (const key of Object.keys(sums)) {
    ;(result as Record<string, number>)[key] = sums[key] / counts[key]
  }
  return result
}

/** Compute fantasy points for a single stat line under the given scoring settings. */
export function pointsForStats(stats: StatLine, settings: ScoringSettings): number {
  const { passing, rushing, receiving, kicking } = settings
  let points = 0

  if (stats.passYards) points += stats.passYards / passing.yardsPerPoint
  if (stats.passTD) points += stats.passTD * passing.td
  if (stats.passTwoPt) points += stats.passTwoPt * passing.twoPt

  if (stats.rushYards) points += stats.rushYards / rushing.yardsPerPoint
  if (stats.rushTD) points += stats.rushTD * rushing.td
  if (stats.rushTwoPt) points += stats.rushTwoPt * rushing.twoPt

  if (stats.receptions) points += stats.receptions * receiving.reception
  if (stats.recYards) points += stats.recYards / receiving.yardsPerPoint
  if (stats.recTD) points += stats.recTD * receiving.td
  if (stats.recTwoPt) points += stats.recTwoPt * receiving.twoPt

  if (stats.patMade) points += stats.patMade * kicking.patMade
  if (stats.fg0_19) points += stats.fg0_19 * kicking.fg0_19
  if (stats.fg20_29) points += stats.fg20_29 * kicking.fg20_29
  if (stats.fg30_39) points += stats.fg30_39 * kicking.fg30_39
  if (stats.fg40_49) points += stats.fg40_49 * kicking.fg40_49
  if (stats.fg50_59) points += stats.fg50_59 * kicking.fg50_59
  if (stats.fg60plus) points += stats.fg60plus * kicking.fg60plus

  return points
}

/** Consensus projected fantasy points for a player under the given scoring settings. */
export function projectedPoints(player: Player, settings: ScoringSettings): number {
  if (player.position === 'DST') return 0
  return pointsForStats(consensusStats(player), settings)
}

export const DEFAULT_SCORING_SETTINGS: ScoringSettings = {
  passing: { yardsPerPoint: 25, td: 4, twoPt: 2 },
  rushing: { yardsPerPoint: 10, td: 6, twoPt: 2 },
  receiving: { reception: 1, yardsPerPoint: 10, td: 6, twoPt: 2 },
  kicking: {
    patMade: 1,
    fg0_19: 3,
    fg20_29: 3,
    fg30_39: 3,
    fg40_49: 4,
    fg50_59: 5,
    fg60plus: 6,
  },
}
