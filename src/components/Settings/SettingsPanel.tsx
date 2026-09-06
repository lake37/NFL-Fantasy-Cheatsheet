import { useState } from 'react'
import TeamsSection from './TeamsSection'
import DraftOrderSection from './DraftOrderSection'
import KeeperSection from './KeeperSection'
import ScoringSection from './ScoringSection'
import ImportSection from './ImportSection'

type SubTab = 'teams' | 'order' | 'keepers' | 'scoring' | 'import'

export default function SettingsPanel() {
  const [sub, setSub] = useState<SubTab>('teams')

  return (
    <div className="settings-panel">
      <nav className="subtabs">
        <button className={sub === 'teams' ? 'active' : ''} onClick={() => setSub('teams')}>
          Teams
        </button>
        <button className={sub === 'order' ? 'active' : ''} onClick={() => setSub('order')}>
          Draftreihenfolge
        </button>
        <button className={sub === 'keepers' ? 'active' : ''} onClick={() => setSub('keepers')}>
          Keepers
        </button>
        <button className={sub === 'scoring' ? 'active' : ''} onClick={() => setSub('scoring')}>
          Scoring
        </button>
        <button className={sub === 'import' ? 'active' : ''} onClick={() => setSub('import')}>
          Projections importieren
        </button>
      </nav>
      {sub === 'teams' && <TeamsSection />}
      {sub === 'order' && <DraftOrderSection />}
      {sub === 'keepers' && <KeeperSection />}
      {sub === 'scoring' && <ScoringSection />}
      {sub === 'import' && <ImportSection />}
    </div>
  )
}
