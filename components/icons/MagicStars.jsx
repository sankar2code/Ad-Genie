/** Scattered sparkle stars — decorative background element */
export default function MagicStars({ count = 12, className = '' }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    x:     (i * 137.5) % 100,
    y:     (i * 91.3 + 20) % 100,
    size:  i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
    delay: (i * 0.3) % 2,
    dur:   1.5 + (i % 3) * 0.5,
    color: i % 3 === 0 ? '#FBBF24' : i % 3 === 1 ? '#A78BFA' : '#14B8A6',
  }));

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <g key={i} transform={`translate(${s.x},${s.y})`}>
          <path
            d={`M0 -${s.size} L${s.size*0.3} -${s.size*0.3} L${s.size} 0 L${s.size*0.3} ${s.size*0.3} L0 ${s.size} L-${s.size*0.3} ${s.size*0.3} L-${s.size} 0 L-${s.size*0.3} -${s.size*0.3} Z`}
            fill={s.color}
            style={{
              animation: `agSparkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        </g>
      ))}
    </svg>
  );
}
