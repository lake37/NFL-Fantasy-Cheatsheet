import { useStore } from '../../store/useStore'

export default function DraftOrderSection() {
  const teams = useStore((s) => s.teams)
  const draftSettings = useStore((s) => s.draftSettings)
  const setDraftOrder = useStore((s) => s.setDraftOrder)
  const setSnake = useStore((s) => s.setSnake)

  const order = draftSettings.order
  const teamById = new Map(teams.map((t) => [t.id, t]))

  function move(index: number, dir: -1 | 1) {
    const next = [...order]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setDraftOrder(next)
  }

  return (
    <section className="card">
      <h2>Draftreihenfolge</h2>
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={draftSettings.snake}
          onChange={(e) => setSnake(e.target.checked)}
        />
        Snake-Draft (Reihenfolge kehrt sich jede Runde um)
      </label>
      <ol className="draft-order-list">
        {order.map((teamId, i) => {
          const team = teamById.get(teamId)
          if (!team) return null
          return (
            <li key={teamId}>
              <span className="pick-slot">{i + 1}.</span>
              <span className="team-name">{team.name}</span>
              <div className="order-buttons">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="nach oben">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="nach unten">
                  ↓
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
