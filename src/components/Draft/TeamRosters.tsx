import { useMemo } from 'react'
import { useStore } from '../../store/useStore'

export default function TeamRosters() {
  const teams = useStore((s) => s.teams)
  const players = useStore((s) => s.players)
  const picks = useStore((s) => s.picks)

  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players])

  return (
    <div className="team-rosters">
      {teams.map((team) => {
        const draftedForTeam = picks
          .filter((pick) => pick.teamId === team.id)
          .map((pick) => playerById.get(pick.playerId))
          .filter(Boolean)
        const keepers = team.keeperPlayerIds.map((id) => playerById.get(id)).filter(Boolean)
        return (
          <div key={team.id} className="team-roster-card">
            <h3>{team.name}</h3>
            {keepers.length > 0 && (
              <>
                <p className="roster-subhead">Keeper</p>
                <ul>
                  {keepers.map((p) => (
                    <li key={p!.id}>
                      {p!.name} <span className="pos-badge">{p!.position}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="roster-subhead">Draft-Picks ({draftedForTeam.length})</p>
            <ul>
              {draftedForTeam.map((p) => (
                <li key={p!.id}>
                  {p!.name} <span className="pos-badge">{p!.position}</span>
                </li>
              ))}
            </ul>
            {draftedForTeam.length === 0 && keepers.length === 0 && <p className="hint">Noch keine Spieler.</p>}
          </div>
        )
      })}
    </div>
  )
}
