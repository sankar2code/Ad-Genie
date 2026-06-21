/**
 * GenieLamp — animated SVG genie lamp icon
 * Props: size (px, default 48), className
 */
export default function GenieLamp({ size = 48, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Smoke wisps */}
      <g opacity="0.7">
        <ellipse cx="32" cy="10" rx="3" ry="5" fill="url(#smokeGrad)" className="origin-bottom" style={{ animation: 'agSmoke 2.2s ease-out 0s infinite' }} />
        <ellipse cx="27" cy="8"  rx="2" ry="4" fill="url(#smokeGrad)" style={{ animation: 'agSmoke 2.2s ease-out 0.4s infinite' }} />
        <ellipse cx="37" cy="9"  rx="2" ry="4" fill="url(#smokeGrad)" style={{ animation: 'agSmoke 2.2s ease-out 0.8s infinite' }} />
      </g>

      {/* Lamp body */}
      <path
        d="M10 42 C10 35 18 30 32 30 C46 30 54 35 54 42 L52 46 C50 50 44 52 32 52 C20 52 14 50 12 46 Z"
        fill="url(#lampBodyGrad)"
        stroke="url(#lampStroke)"
        strokeWidth="1.5"
      />

      {/* Lamp neck */}
      <path
        d="M26 30 C26 26 28 22 32 20 C36 22 38 26 38 30"
        fill="url(#neckGrad)"
        stroke="url(#lampStroke)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Spout */}
      <path
        d="M52 38 C56 36 62 35 62 38 C62 41 56 42 52 42 Z"
        fill="url(#spoutGrad)"
        stroke="url(#lampStroke)"
        strokeWidth="1"
      />

      {/* Handle */}
      <path
        d="M12 38 C8 36 4 34 4 38 C4 43 8 45 12 44"
        fill="none"
        stroke="url(#lampStroke)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Flame / magic glow at spout */}
      <ellipse cx="62" cy="37" rx="3" ry="4" fill="url(#flameGrad)" style={{ animation: 'agPulseGlow 1.4s ease-in-out infinite' }} />

      {/* Decorative band on lamp */}
      <path
        d="M14 44 C18 46 24 47 32 47 C40 47 46 46 50 44"
        fill="none"
        stroke="rgba(251,191,36,0.5)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Shine highlight */}
      <ellipse cx="22" cy="36" rx="5" ry="3" fill="rgba(255,255,255,0.12)" transform="rotate(-20 22 36)" />

      {/* Star sparkles */}
      <g style={{ animation: 'agSparkle 1.8s ease-in-out 0.2s infinite' }}>
        <path d="M20 20 L21 18 L22 20 L24 21 L22 22 L21 24 L20 22 L18 21 Z" fill="#FBBF24" />
      </g>
      <g style={{ animation: 'agSparkle 1.8s ease-in-out 0.9s infinite' }}>
        <path d="M43 16 L44 14 L45 16 L47 17 L45 18 L44 20 L43 18 L41 17 Z" fill="#A78BFA" />
      </g>
      <g style={{ animation: 'agSparkle 1.8s ease-in-out 1.5s infinite' }}>
        <path d="M12 28 L13 27 L14 28 L15 29 L14 30 L13 31 L12 30 L11 29 Z" fill="#14B8A6" />
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="lampBodyGrad" x1="10" y1="30" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#8B5CF6" />
          <stop offset="50%"  stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="neckGrad" x1="26" y1="20" x2="38" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="spoutGrad" x1="52" y1="35" x2="62" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="lampStroke" x1="4" y1="20" x2="64" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FBBF24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="59" y1="33" x2="65" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <radialGradient id="smokeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#A78BFA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
