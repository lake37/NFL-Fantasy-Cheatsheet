import { useState } from 'react'
import { useStore } from '../../store/useStore'
import PlayerList from '../Players/PlayerList'
import TeamRosters from './TeamRosters'

export default function DraftView() {
  const draftActive = useStore((s) => s.draftActive)
  const setDraftActive = useStore((s) => s.setDraftActive)
  const undoLastPick = useStore((s) => s.undoLastPick)
  const resetDraft = useStore((s) => s.resetDraft)
  const picks = useStore((s) => s.picks)
  const [showRosters, setShowRosters] = useState(true)

  return (
    <div className="draft-view">
      <div className="draft-controls">
        <label className="checkbox-field">
          <input type="checkbox" checked={draftActive} onChange={(e) => setDraftActive(e.target.checked)} />
          Draft-Modus aktivieren
        </label>
        <button onClick={undoLastPick} disabled={picks.length === 0}>
          Letzten Pick zurücknehmen
        </button>
        <button
          onClick={() => {
            if (confirm('Draft wirklich komplett zurücksetzen? Alle Picks gehen verloren.')) resetDraft()
          }}
          disabled={picks.length === 0}
        >
          Draft zurücksetzen
        </button>
        <button onClick={() => setShowRosters(!showRosters)}>
          {showRosters ? 'Teamkader ausblenden' : 'Teamkader anzeigen'}
        </button>
      </div>

      <div className={showRosters ? 'draft-layout with-rosters' : 'draft-layout'}>
        <PlayerList />
        {showRosters && <TeamRosters />}
      </div>
    </div>
  )
}
