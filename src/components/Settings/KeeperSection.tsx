import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'

export default function KeeperSection() {
  const teams = useStore((s) => s.teams)
  const players = useStore((s) => s.players)
  const setKeeperSlots = useStore((s) => s.setKeeperSlots)
  const toggleKeeper = useStore((s) => s.toggleKeeper)
  const [search, setSearch] = useState<Record<string, string>>({})

  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players])

  return (
    <section className="card">
      <h2>Keepers</h2>
      <p className="hint">Lege pro Team fest, wie viele Spieler saisonübergreifend gehalten werden dürfen, und wähle die Keeper aus.</p>
      <div className="keeper-grid">
        {teams.map((team) => {
          const query = (search[team.id] ?? '').toLowerCase()
          const suggestions =
            query.length > 0
              ? players
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(query) &&
                      !team.keeperPlayerIds.includes(p.id) &&
                      team.keeperPlayerIds.length < team.keeperSlots,
                  )
                  .slice(0, 8)
              : []
          return (
            <div key={team.id} className="keeper-team">
              <div className="keeper-team-header">
                <strong>{team.name}</strong>
                <label className="field inline">
                  Keeper-Slots
                  <input
                    type="number"
                    min={0}
                    max={15}
                    value={team.keeperSlots}
                    onChange={(e) => setKeeperSlots(team.id, Math.max(0, Number(e.target.value)))}
                  />
                </label>
              </div>
              <ul className="keeper-list">
                {team.keeperPlayerIds.map((id) => {
                  const p = playerById.get(id)
                  if (!p) return null
                  return (
                    <li key={id}>
                      {p.name} <span className="pos-badge">{p.position}</span>
                      <button className="link-button" onClick={() => toggleKeeper(team.id, id)}>
                        entfernen
                      </button>
                    </li>
                  )
                })}
              </ul>
              {team.keeperPlayerIds.length < team.keeperSlots && (
                <div className="keeper-search">
                  <input
                    type="text"
                    placeholder="Spieler suchen…"
                    value={search[team.id] ?? ''}
                    onChange={(e) => setSearch({ ...search, [team.id]: e.target.value })}
                  />
                  {suggestions.length > 0 && (
                    <ul className="suggestions">
                      {suggestions.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => {
                              toggleKeeper(team.id, p.id)
                              setSearch({ ...search, [team.id]: '' })
                            }}
                          >
                            {p.name} <span className="pos-badge">{p.position}</span> · {p.nflTeam}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
