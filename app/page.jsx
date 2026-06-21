'use client';

import Link from 'next/link';
import { Ticket, QrCode, Wand2, Hash, MapPin, LayoutDashboard, Sparkles, Zap, Shield } from 'lucide-react';
import GenieLamp from '@/components/icons/GenieLamp';
import MagicStars from '@/components/icons/MagicStars';

const features = [
  {
    icon: MapPin,
    title: 'Location-Aware Deals',
    desc: 'Surface offers from Target, Walmart, CVS and more near you — instantly.',
    color: '#14B8A6',
    glow: 'rgba(20,184,166,0.2)',
  },
  {
    icon: Ticket,
    title: 'Online Coupon Codes',
    desc: 'One-click copy for codes that work at checkout. No hunting required.',
    color: '#FBBF24',
    glow: 'rgba(251,191,36,0.2)',
  },
  {
    icon: QrCode,
    title: 'In-Store QR Codes',
    desc: 'Show your screen at the register. Instant savings, zero printing.',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.2)',
  },
  {
    icon: Wand2,
    title: 'AI Ad Poster',
    desc: 'Generate a personalised poster with your face and the deal in seconds.',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.2)',
  },
  {
    icon: Hash,
    title: 'Auto Hashtags',
    desc: '15–20 Instagram-ready hashtags conjured per offer, copy with one click.',
    color: '#14B8A6',
    glow: 'rgba(20,184,166,0.2)',
  },
  {
    icon: LayoutDashboard,
    title: 'Savings Dashboard',
    desc: 'Track every dollar saved, coupons used, and your personal streak.',
    color: '#FBBF24',
    glow: 'rgba(251,191,36,0.2)',
  },
];

const retailers = [
  { name: 'Target',      color: '#EF4444' },
  { name: 'Walmart',     color: '#3B82F6' },
  { name: 'CVS',         color: '#EF4444' },
  { name: 'Macy\'s',    color: '#EC4899' },
  { name: 'Best Buy',    color: '#FBBF24' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-ag-bg-base text-ag-fg-base font-sans overflow-x-hidden">

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', animation: 'agOrb 10s ease-in-out infinite' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)', animation: 'agOrb 13s ease-in-out 3s infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <GenieLamp size={36} />
          <span className="font-display text-xl font-semibold tracking-wide ag-gradient-text">
            Ad-Genie
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm font-medium text-ag-fg-subtle hover:text-ag-fg-base transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup"
            className="ag-btn-gold ag-shimmer inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl">
            <Sparkles className="w-4 h-4" /> Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        <MagicStars count={16} className="opacity-40" />

        {/* Genie lamp hero */}
        <div className="relative mb-8 ag-float">
          {/* Glow rings */}
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'scale(1.8)' }} />
          <div className="relative">
            <GenieLamp size={120} className="drop-shadow-[0_0_40px_rgba(139,92,246,0.6)]" />
          </div>
          {/* Orbiting star */}
          <div className="absolute top-0 right-0 w-5 h-5"
            style={{ animation: 'agRotateSlow 4s linear infinite', transformOrigin: '-30px 30px' }}>
            <svg viewBox="0 0 20 20" className="w-full h-full">
              <path d="M10 0 L12 7 L19 7 L13 12 L15 19 L10 15 L5 19 L7 12 L1 7 L8 7 Z" fill="#FBBF24" />
            </svg>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ag-border-glow bg-ag-magic-subtle mb-6">
          <span className="w-2 h-2 rounded-full bg-ag-magic" style={{ animation: 'agPulseGlow 1.5s ease-in-out infinite' }} />
          <span className="text-ag-magic text-xs font-semibold uppercase tracking-widest">Your wish for savings is granted</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="text-ag-fg-base">Discover deals.</span>
          <br />
          <span className="ag-gradient-text">Save like magic.</span>
        </h1>

        <p className="text-ag-fg-subtle text-lg leading-relaxed max-w-2xl mb-10">
          Ad-Genie surfaces location-aware discounts from your favourite retailers, generates
          AI-powered ad posters, and conjures perfect hashtags — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/signup"
            className="ag-btn-gold ag-shimmer inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold">
            <Zap className="w-5 h-5" /> Start saving for free
          </Link>
          <Link href="/offers"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-ag-border text-ag-fg-base text-base font-semibold hover:border-ag-border-strong hover:bg-ag-bg-surface transition-all">
            Browse offers →
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex items-center gap-6 text-ag-fg-muted text-sm">
          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-ag-genie" /> No credit card</span>
          <span className="w-1 h-1 rounded-full bg-ag-fg-muted" />
          <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-ag-magic" /> AI-powered</span>
          <span className="w-1 h-1 rounded-full bg-ag-fg-muted" />
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-ag-accent" /> Instant results</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-ag-magic text-xs font-bold uppercase tracking-widest mb-3">What the Genie grants</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ag-fg-base">
            Six wishes, one platform
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, glow }, i) => (
            <div
              key={title}
              className="ag-fade-in ag-glass rounded-2xl p-6 group cursor-default transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${i * 60}ms`,
                '--hover-glow': glow,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${glow}, 0 0 0 1px ${color}22`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
              {/* Icon circle */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-ag-fg-base text-base mb-2">{title}</h3>
              <p className="text-sm text-ag-fg-subtle leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Retailer Strip ── */}
      <section className="relative z-10 py-14 px-6 border-y border-ag-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-ag-fg-muted text-xs font-bold uppercase tracking-widest mb-8">
            Deals conjured from
          </p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {retailers.map(({ name, color }) => (
              <span key={name} className="font-display text-xl font-bold transition-all hover:scale-110 cursor-default"
                style={{ color, textShadow: `0 0 20px ${color}50` }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-ag-genie text-xs font-bold uppercase tracking-widest mb-3">Simple as 3 wishes</p>
          <h2 className="font-display text-3xl font-semibold text-ag-fg-base">How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Find your deal', desc: 'Browse location-aware offers from top retailers near you.', color: '#FBBF24' },
            { step: '02', title: 'Let the Genie work', desc: 'AI crafts a personalised poster and perfect hashtags instantly.', color: '#8B5CF6' },
            { step: '03', title: 'Save & share', desc: 'Download your poster, copy the hashtags, redeem in-store or online.', color: '#14B8A6' },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center font-display font-bold text-lg"
                style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                {step}
              </div>
              <h3 className="font-semibold text-ag-fg-base mb-2">{title}</h3>
              <p className="text-sm text-ag-fg-subtle leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto relative">
          {/* Glow backdrop */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />

          <div className="relative ag-glass rounded-3xl p-12 border border-ag-border-glow">
            <GenieLamp size={64} className="mx-auto mb-6 ag-float" />
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ag-fg-base mb-4">
              Ready to make your wish?
            </h2>
            <p className="text-ag-fg-subtle mb-8 text-lg">
              Free forever to start. Your first savings are one click away.
            </p>
            <Link href="/signup"
              className="ag-btn-gold ag-shimmer inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-base font-bold">
              <Sparkles className="w-5 h-5" /> Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-ag-border py-8 px-6 text-center text-ag-fg-muted text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GenieLamp size={18} />
          <span className="font-display text-ag-fg-subtle">Ad-Genie</span>
        </div>
        © {new Date().getFullYear()} Ad-Genie. All rights reserved.
      </footer>
    </main>
  );
}
