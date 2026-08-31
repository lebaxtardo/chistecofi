type Props = {
  width?: number
  className?: string
  variant?: 0 | 1 | 2 | 3
}

const COLORS = ['#e6c14a', '#d4a017', '#c4922a', '#f0d36a']

export function Straw({ width = 56, className = '', variant = 0 }: Props) {
  const height = Math.round(width * 0.28)
  const color = COLORS[variant] ?? COLORS[0]
  const id = `straw-${variant}`

  return (
    <svg
      className={`sprite-straw ${className}`.trim()}
      width={width}
      height={height}
      viewBox="0 0 56 16"
      aria-hidden="true"
    >
      <path
        d="M3 9 C18 3 38 3 53 9"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M6 10.5 C20 6 36 6.5 50 10"
        fill="none"
        stroke="#f0d36a"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <title>{id}</title>
    </svg>
  )
}
