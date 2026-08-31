type Props = {
  value: number
  label: string
}

export function ProximityMeter({ value, label }: Props) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)

  return (
    <div className="meter" aria-label={label}>
      <div className="meter-label">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
