import { useStore } from '../../store/useStore'
import type { ScoringSettings } from '../../types'

function NumberField({
  label,
  value,
  onChange,
  step = 0.5,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <label className="field">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export default function ScoringSection() {
  const scoring = useStore((s) => s.scoring)
  const setScoring = useStore((s) => s.setScoring)

  function update(patch: Partial<ScoringSettings>) {
    setScoring({ ...scoring, ...patch })
  }

  return (
    <section className="card">
      <h2>Scoring Settings</h2>

      <div className="scoring-category">
        <h3>Passing</h3>
        <div className="scoring-grid">
          <NumberField
            label="Yards pro Punkt"
            value={scoring.passing.yardsPerPoint}
            onChange={(v) => update({ passing: { ...scoring.passing, yardsPerPoint: v } })}
          />
          <NumberField
            label="Punkte pro Passing TD"
            value={scoring.passing.td}
            onChange={(v) => update({ passing: { ...scoring.passing, td: v } })}
          />
          <NumberField
            label="Punkte pro 2-PT Conversion"
            value={scoring.passing.twoPt}
            onChange={(v) => update({ passing: { ...scoring.passing, twoPt: v } })}
          />
        </div>
      </div>

      <div className="scoring-category">
        <h3>Rushing</h3>
        <div className="scoring-grid">
          <NumberField
            label="Yards pro Punkt"
            value={scoring.rushing.yardsPerPoint}
            onChange={(v) => update({ rushing: { ...scoring.rushing, yardsPerPoint: v } })}
          />
          <NumberField
            label="Punkte pro Rushing TD"
            value={scoring.rushing.td}
            onChange={(v) => update({ rushing: { ...scoring.rushing, td: v } })}
          />
          <NumberField
            label="Punkte pro 2-PT Conversion"
            value={scoring.rushing.twoPt}
            onChange={(v) => update({ rushing: { ...scoring.rushing, twoPt: v } })}
          />
        </div>
      </div>

      <div className="scoring-category">
        <h3>Receiving</h3>
        <div className="scoring-grid">
          <NumberField
            label="Punkte pro Reception"
            value={scoring.receiving.reception}
            onChange={(v) => update({ receiving: { ...scoring.receiving, reception: v } })}
          />
          <NumberField
            label="Yards pro Punkt"
            value={scoring.receiving.yardsPerPoint}
            onChange={(v) => update({ receiving: { ...scoring.receiving, yardsPerPoint: v } })}
          />
          <NumberField
            label="Punkte pro Receiving TD"
            value={scoring.receiving.td}
            onChange={(v) => update({ receiving: { ...scoring.receiving, td: v } })}
          />
          <NumberField
            label="Punkte pro 2-PT Conversion"
            value={scoring.receiving.twoPt}
            onChange={(v) => update({ receiving: { ...scoring.receiving, twoPt: v } })}
          />
        </div>
      </div>

      <div className="scoring-category">
        <h3>Kicking</h3>
        <div className="scoring-grid">
          <NumberField
            label="PAT Made"
            value={scoring.kicking.patMade}
            onChange={(v) => update({ kicking: { ...scoring.kicking, patMade: v } })}
          />
          <NumberField
            label="FG 0-19 Yards"
            value={scoring.kicking.fg0_19}
            onChange={(v) => update({ kicking: { ...scoring.kicking, fg0_19: v } })}
          />
          <NumberField
            label="FG 20-29 Yards"
            value={scoring.kicking.fg20_29}
            onChange={(v) => update({ kicking: { ...scoring.kicking, fg20_29: v } })}
          />
          <NumberField
            label="FG 30-39 Yards"
            value={scoring.kicking.fg30_39}
            onChange={(v) => update({ kicking: { ...scoring.kicking, fg30_39: v } })}
          />
          <NumberField
            label="FG 40-49 Yards"
            value={scoring.kicking.fg40_49}
            onChange={(v) => update({ kicking: { ...scoring.kicking, fg40_49: v } })}
          />
          <NumberField
            label="FG 50-59 Yards"
            value={scoring.kicking.fg50_59}
            onChange={(v) => update({ kicking: { ...scoring.kicking, fg50_59: v } })}
          />
          <NumberField
            label="FG 60+ Yards"
            value={scoring.kicking.fg60plus}
            onChange={(v) => update({ kicking: { ...scoring.kicking, fg60plus: v } })}
          />
        </div>
      </div>
    </section>
  )
}
