export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-ag-bg-base font-sans">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      {children}
    </div>
  );
}
