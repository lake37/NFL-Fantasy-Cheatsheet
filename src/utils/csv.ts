import { STAT_FIELDS } from '../types'

const STAT_KEYS = STAT_FIELDS.map((f) => f.key as string)

export interface ParsedProjectionRow {
  name: string
  position: string
  source: string
  stats: Record<string, number>
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map((c) => c.trim())
}

/**
 * Erwartet eine CSV mit Header-Spalten: name,position,source,<statFelder...>
 * Erlaubte Stat-Felder: passYards, passTD, passTwoPt, rushYards, rushTD, rushTwoPt,
 * receptions, recYards, recTD, recTwoPt, patMade, fg0_19, fg20_29, fg30_39, fg40_49, fg50_59, fg60plus
 */
export function parseProjectionsCsv(text: string): ParsedProjectionRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []
  const header = splitCsvLine(lines[0]).map((h) => h.trim())
  const nameIdx = header.indexOf('name')
  const positionIdx = header.indexOf('position')
  const sourceIdx = header.indexOf('source')
  if (nameIdx === -1 || positionIdx === -1 || sourceIdx === -1) {
    throw new Error('CSV benötigt mindestens die Spalten: name, position, source')
  }
  const statColumns = header
    .map((h, idx) => ({ h, idx }))
    .filter(({ h }) => STAT_KEYS.includes(h))

  const rows: ParsedProjectionRow[] = []
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line)
    const name = cells[nameIdx]
    const position = cells[positionIdx]?.toUpperCase()
    const source = cells[sourceIdx]
    if (!name || !position || !source) continue
    const stats: Record<string, number> = {}
    for (const { h, idx } of statColumns) {
      const raw = cells[idx]
      if (raw === undefined || raw === '') continue
      const num = Number(raw)
      if (!Number.isNaN(num)) stats[h] = num
    }
    rows.push({ name, position, source, stats })
  }
  return rows
}
