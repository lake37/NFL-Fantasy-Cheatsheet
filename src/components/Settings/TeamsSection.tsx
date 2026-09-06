import { useStore } from '../../store/useStore'

export default function TeamsSection() {
  const teams = useStore((s) => s.teams)
  const setTeamCount = useStore((s) => s.setTeamCount)
  const renameTeam = useStore((s) => s.renameTeam)

  return (
    <section className="card">
      <h2>Teams</h2>
      <label className="field">
        Anzahl Teams
        <input
          type="number"
          min={2}
          max={20}
          value={teams.length}
          onChange={(e) => setTeamCount(Math.max(2, Math.min(20, Number(e.target.value))))}
        />
      </label>
      <div className="team-name-grid">
        {teams.map((team) => (
          <label key={team.id} className="field">
            {team.id}
            <input
              type="text"
              value={team.name}
              onChange={(e) => renameTeam(team.id, e.target.value)}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
