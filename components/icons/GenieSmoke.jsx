/** Animated smoke wisps — used in loading states */
export default function GenieSmoke({ className = '' }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className={className} aria-hidden="true">
      <g style={{ animation: 'agSmoke 2s ease-out 0s infinite' }}>
        <ellipse cx="30" cy="45" rx="4" ry="6" fill="url(#sg1)" />
      </g>
      <g style={{ animation: 'agSmoke 2s ease-out 0.5s infinite' }}>
        <ellipse cx="24" cy="43" rx="3" ry="5" fill="url(#sg2)" />
      </g>
      <g style={{ animation: 'agSmoke 2s ease-out 1s infinite' }}>
        <ellipse cx="36" cy="43" rx="3" ry="5" fill="url(#sg2)" />
      </g>
      <defs>
        <radialGradient id="sg1"><stop stopColor="#8B5CF6" stopOpacity="0.8"/><stop offset="1" stopColor="#8B5CF6" stopOpacity="0"/></radialGradient>
        <radialGradient id="sg2"><stop stopColor="#A78BFA" stopOpacity="0.6"/><stop offset="1" stopColor="#A78BFA" stopOpacity="0"/></radialGradient>
      </defs>
    </svg>
  );
}
