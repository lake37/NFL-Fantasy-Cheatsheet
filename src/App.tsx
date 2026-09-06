import { useState } from 'react'
import SettingsPanel from './components/Settings/SettingsPanel'
import DraftView from './components/Draft/DraftView'

type Tab = 'settings' | 'draft'

export default function App() {
  const [tab, setTab] = useState<Tab>('settings')

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏈 NFL Fantasy Draft Tool</h1>
        <nav className="tabs">
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
            Einstellungen
          </button>
          <button className={tab === 'draft' ? 'active' : ''} onClick={() => setTab('draft')}>
            Draft &amp; Spielerliste
          </button>
        </nav>
      </header>
      <main>{tab === 'settings' ? <SettingsPanel /> : <DraftView />}</main>
    </div>
  )
}
