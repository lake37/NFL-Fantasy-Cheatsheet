import { Fragment, useMemo, useState } from 'react'
import { useStore, draftedPlayerIds, getTeamOnClock } from '../../store/useStore'
import { consensusStats, pointsForStats } from '../../utils/scoring'
import { STAT_FIELDS, type Position, type StatLine } from '../../types'

const POSITIONS: (Position | 'ALL')[] = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DST']

type SortKey = 'name' | 'nflTeam' | 'points' | keyof StatLine

export default function PlayerList() {
  const players = useStore((s) => s.players)
  const scoring = useStore((s) => s.scoring)
  const teams = useStore((s) => s.teams)
  const picks = useStore((s) => s.picks)
  const draftActive = useStore((s) => s.draftActive)
  const draftPlayer = useStore((s) => s.draftPlayer)

  const [positionFilter, setPositionFilter] = useState<Position | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('points')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expanded, setExpanded] = useState<string | null>(null)

  const drafted = useMemo(() => draftedPlayerIds({ teams, picks }), [teams, picks])
  const teamOnClock = useMemo(() => getTeamOnClock({ teams, draftSettings: useStore.getState().draftSettings, picks }), [teams, picks])

  const columns = useMemo(
    () => (positionFilter === 'ALL' ? [] : STAT_FIELDS.filter((f) => f.positions.includes(positionFilter))),
    [positionFilter],
  )

  const rows = useMemo(() => {
    const withData = players
      .filter((p) => !drafted.has(p.id))
      .filter((p) => positionFilter === 'ALL' || p.position === positionFilter)
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .map((p) => {
        const stats = consensusStats(p)
        const points = p.position === 'DST' ? 0 : pointsForStats(stats, scoring)
        return { player: p, stats, points }
      })

    withData.sort((a, b) => {
      let av: number | string
      let bv: number | string
      if (sortKey === 'name') {
        av = a.player.name
        bv = b.player.name
      } else if (sortKey === 'nflTeam') {
        av = a.player.nflTeam
        bv = b.player.nflTeam
      } else if (sortKey === 'points') {
        av = a.points
        bv = b.points
      } else {
        av = a.stats[sortKey] ?? 0
        bv = b.stats[sortKey] ?? 0
      }
      if (typeof av === 'string' || typeof bv === 'string') {
        const cmp = String(av).localeCompare(String(bv))
        return sortDir === 'asc' ? cmp : -cmp
      }
      const cmp = (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return withData
  }, [players, drafted, positionFilter, search, scoring, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="player-list">
      <div className="player-list-controls">
        <div className="position-filter">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              className={positionFilter === pos ? 'active' : ''}
              onClick={() => setPositionFilter(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
        <input
          className="search-box"
          type="text"
          placeholder="Spieler suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {draftActive && (
        <p className="on-the-clock">
          Am Zug: <strong>{teamOnClock ? teamOnClock.name : '—'}</strong> (Pick {picks.length + 1})
        </p>
      )}

      <div className="table-wrapper">
        <table className="player-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')}>Name</th>
              <th>Pos</th>
              <th onClick={() => toggleSort('nflTeam')}>Team</th>
              <th onClick={() => toggleSort('points')}>Punkte</th>
              {columns.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label}
                </th>
              ))}
              {draftActive && <th>Draften</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ player, stats, points }) => (
              <Fragment key={player.id}>
                <tr className="player-row" onClick={() => setExpanded(expanded === player.id ? null : player.id)}>
                  <td>{player.name}</td>
                  <td>
                    <span className="pos-badge">{player.position}</span>
                  </td>
                  <td>{player.nflTeam}</td>
                  <td className="points-cell">{points.toFixed(1)}</td>
                  {columns.map((c) => (
                    <td key={c.key}>{stats[c.key] !== undefined ? Number(stats[c.key]).toFixed(1) : '–'}</td>
                  ))}
                  {draftActive && (
                    <td>
                      <button
                        className="draft-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          draftPlayer(player.id)
                        }}
                      >
                        Draften
                      </button>
                    </td>
                  )}
                </tr>
                {expanded === player.id && player.projections.length > 0 && (
                  <tr className="projection-detail-row">
                    <td colSpan={4 + columns.length + (draftActive ? 1 : 0)}>
                      <div className="projection-detail">
                        <table className="source-table">
                          <thead>
                            <tr>
                              <th>Quelle</th>
                              {STAT_FIELDS.filter((f) => f.positions.includes(player.position)).map((f) => (
                                <th key={f.key}>{f.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {player.projections.map((proj) => (
                              <tr key={proj.source}>
                                <td>{proj.source}</td>
                                {STAT_FIELDS.filter((f) => f.positions.includes(player.position)).map((f) => (
                                  <td key={f.key}>{proj.stats[f.key] !== undefined ? proj.stats[f.key] : '–'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="hint">Keine Spieler gefunden.</p>}
      </div>
    </div>
  )
}
