import { useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { parseProjectionsCsv } from '../../utils/csv'

export default function ImportSection() {
  const importProjections = useStore((s) => s.importProjections)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    try {
      const text = await file.text()
      const rows = parseProjectionsCsv(text)
      const { matched, created } = importProjections(rows)
      setMessage(
        `Import fertig: ${rows.length} Zeilen gelesen, ${matched} Spieler aktualisiert, ${created} neue Spieler angelegt.`,
      )
    } catch (err) {
      setMessage(`Fehler beim Import: ${(err as Error).message}`)
    }
  }

  return (
    <section className="card">
      <h2>Projections per CSV importieren</h2>
      <p className="hint">
        Spalten: <code>name,position,source,passYards,passTD,passTwoPt,rushYards,rushTD,rushTwoPt,receptions,recYards,recTD,recTwoPt,patMade,fg0_19,fg20_29,fg30_39,fg40_49,fg50_59,fg60plus</code>
        <br />
        Nicht benötigte Spalten je Position können leer bleiben. Ein Import pro (Name, Position, Quelle) ersetzt
        die vorherigen Werte dieser Quelle für diesen Spieler; unbekannte Namen werden neu angelegt.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }}
      />
      {message && <p className="import-message">{message}</p>}
    </section>
  )
}
