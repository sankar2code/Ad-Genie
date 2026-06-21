'use client';

import Link from 'next/link';
import { Ticket, QrCode, Wand2, Hash, MapPin, LayoutDashboard } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Location-Aware Deals',
    desc: 'Instantly surface offers from Target, Walmart, and CVS near you.',
    color: 'text-ag-accent',
    bg: 'bg-ag-accent-subtle',
    border: 'border-ag-border',
  },
  {
    icon: Ticket,
    title: 'Online Coupon Codes',
    desc: 'One-click copy for codes that work at checkout on any retailer site.',
    color: 'text-ag-genie',
    bg: 'bg-ag-genie-subtle',
    border: 'border-ag-border',
  },
  {
    icon: QrCode,
    title: 'In-Store QR Codes',
    desc: 'Show your screen at the register. No printing, no fuss.',
    color: 'text-ag-accent',
    bg: 'bg-ag-accent-subtle',
    border: 'border-ag-border',
  },
  {
    icon: Wand2,
    title: 'AI Ad Poster',
    desc: 'Generate a personalised poster featuring your face and the deal. Download in seconds.',
    color: 'text-ag-genie',
    bg: 'bg-ag-genie-subtle',
    border: 'border-ag-border',
  },
  {
    icon: Hash,
    title: 'Auto Hashtags',
    desc: '15–20 Instagram-ready hashtags conjured per offer, copy with one click.',
    color: 'text-ag-accent',
    bg: 'bg-ag-accent-subtle',
    border: 'border-ag-border',
  },
  {
    icon: LayoutDashboard,
    title: 'Savings Dashboard',
    desc: 'Track every dollar saved, coupons used, and your personal streak.',
    color: 'text-ag-genie',
    bg: 'bg-ag-genie-subtle',
    border: 'border-ag-border',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-ag-bg-base text-ag-fg-base font-sans overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-ag-border max-w-7xl mx-auto">
        <span className="font-display text-xl font-semibold text-ag-accent tracking-wide">
          🪔 Ad-Genie
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-ag-fg-subtle hover:text-ag-fg-base transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="ag-shimmer text-sm font-semibold px-5 py-2 rounded-lg bg-ag-accent text-ag-fg-inverted hover:bg-ag-accent-hover transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">
        {/* Glow orb */}
        <div
          className="absolute top-32 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #D4AF37 0%, #2DC7C7 60%, transparent 100%)' }}
        />
        <div className="relative">
          <p className="text-ag-genie text-sm font-semibold uppercase tracking-widest mb-4">
            ✨ Your wish for savings is granted
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-ag-fg-base leading-tight mb-6">
            Discover deals.
            <br />
            <span className="text-ag-accent">Save like magic.</span>
          </h1>
          <p className="text-ag-fg-subtle text-lg leading-relaxed max-w-2xl mb-10">
            Ad-Genie finds location-aware discounts from Target, Walmart, and CVS — delivers
            the right format for how you shop, and lets you create AI-powered ad posters
            to show off your savings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="ag-shimmer inline-block px-8 py-3.5 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-base hover:bg-ag-accent-hover transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]"
            >
              Start saving free
            </Link>
            <Link
              href="/offers"
              className="inline-block px-8 py-3.5 rounded-lg border border-ag-border text-ag-fg-base font-semibold text-base hover:bg-ag-bg-surface transition-colors"
            >
              Browse offers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <h2 className="font-display text-2xl font-semibold text-center text-ag-fg-base mb-12">
          Everything the Genie grants
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div
              key={title}
              className={`ag-fade-in rounded-xl p-6 bg-ag-bg-surface border ${border} hover:border-ag-border-strong hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all`}
            >
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-ag-fg-base mb-2">{title}</h3>
              <p className="text-sm text-ag-fg-subtle leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Retailer Strip ── */}
      <section className="border-t border-ag-border py-12 px-6">
        <p className="text-center text-ag-fg-muted text-sm mb-8 uppercase tracking-widest">
          Deals from
        </p>
        <div className="flex items-center justify-center gap-16 flex-wrap">
          {[
            { name: 'Target',  color: '#CC0000' },
            { name: 'Walmart', color: '#0071CE' },
            { name: 'CVS',     color: '#CC0000' },
          ].map(({ name, color }) => (
            <span
              key={name}
              className="font-display text-2xl font-bold"
              style={{ color }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center max-w-2xl mx-auto">
        <h2 className="font-display text-3xl font-semibold text-ag-fg-base mb-4">
          Ready to make your wish?
        </h2>
        <p className="text-ag-fg-subtle mb-8">
          Free to start. No credit card required. Your first savings are one click away.
        </p>
        <Link
          href="/signup"
          className="ag-shimmer inline-block px-10 py-4 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-base hover:bg-ag-accent-hover transition-all hover:shadow-[0_0_32px_rgba(212,175,55,0.4)]"
        >
          Create your free account
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ag-border py-8 px-6 text-center text-ag-fg-muted text-sm">
        © {new Date().getFullYear()} Ad-Genie. All rights reserved.
      </footer>
    </main>
  );
}
