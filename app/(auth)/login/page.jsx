'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GenieLamp from '@/components/icons/GenieLamp';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign in failed');
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userEmail', data.email);
      router.push('/offers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <GenieLamp size={56} className="ag-float" />
            <span className="font-display text-2xl font-semibold ag-gradient-text">Ad-Genie</span>
          </Link>
          <p className="text-ag-fg-muted text-sm mt-3">Welcome back — your deals await</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="ag-glass rounded-2xl p-8 space-y-5"
          style={{ border: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
        >
          <h1 className="font-display text-xl font-semibold text-ag-fg-base text-center">Sign in</h1>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide">Email</label>
            <input
              id="login-email" type="email" required value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full h-11 px-4 rounded-xl text-ag-fg-base placeholder:text-ag-fg-muted text-sm outline-none transition-all"
              style={{ background: 'rgba(5,1,15,0.6)', border: '1px solid rgba(139,92,246,0.2)' }}
              onFocus={e => e.target.style.border='1px solid rgba(139,92,246,0.6)'}
              onBlur={e => e.target.style.border='1px solid rgba(139,92,246,0.2)'}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide">Password</label>
            <input
              id="login-password" type="password" required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl text-ag-fg-base placeholder:text-ag-fg-muted text-sm outline-none transition-all"
              style={{ background: 'rgba(5,1,15,0.6)', border: '1px solid rgba(139,92,246,0.2)' }}
              onFocus={e => e.target.style.border='1px solid rgba(139,92,246,0.6)'}
              onBlur={e => e.target.style.border='1px solid rgba(139,92,246,0.2)'}
            />
          </div>

          <button type="submit" disabled={loading}
            className="ag-btn-magic ag-shimmer w-full h-11 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Signing in…</>
              : 'Sign in to Ad-Genie'}
          </button>

          <p className="text-center text-sm text-ag-fg-subtle">
            No account?{' '}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#A78BFA' }}>
              Create one free →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
