type Props = {
  width?: number
  className?: string
}

export function Needle({ width = 64, className = '' }: Props) {
  const height = Math.round(width * 0.28)

  return (
    <svg
      className={`sprite-needle ${className}`.trim()}
      width={width}
      height={height}
      viewBox="0 0 64 16"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="4" fill="none" stroke="#c5cad3" strokeWidth="1.8" />
      <path d="M12 8 H60" stroke="#dfe3ea" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 7.2 H58" stroke="#f4f6f8" strokeWidth="0.6" strokeLinecap="round" />
    </svg>
  )
}
