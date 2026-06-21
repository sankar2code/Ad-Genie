'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-semibold text-ag-accent">
            🪔 Ad-Genie
          </Link>
          <p className="text-ag-fg-subtle text-sm mt-2">Welcome back — your deals await</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ag-bg-surface border border-ag-border rounded-xl p-8 space-y-5"
        >
          <h1 className="font-display text-xl font-semibold text-ag-fg-base text-center">
            Sign in
          </h1>

          {error && (
            <div className="text-ag-error text-sm bg-[rgba(201,64,64,0.1)] border border-[rgba(201,64,64,0.25)] rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="login-email" className="text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-10 px-3.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base placeholder:text-ag-fg-muted text-sm focus:outline-none focus:border-ag-border-strong focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base placeholder:text-ag-fg-muted text-sm focus:outline-none focus:border-ag-border-strong focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ag-shimmer w-full h-10 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-sm hover:bg-ag-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-ag-fg-subtle">
            No account?{' '}
            <Link href="/signup" className="text-ag-accent hover:underline font-medium">
              Create one free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
