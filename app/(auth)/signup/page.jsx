'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');
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
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-semibold text-ag-accent">
            🪔 Ad-Genie
          </Link>
          <p className="text-ag-fg-subtle text-sm mt-2">Your first wish is on us — it's free</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ag-bg-surface border border-ag-border rounded-xl p-8 space-y-5"
        >
          <h1 className="font-display text-xl font-semibold text-ag-fg-base text-center">
            Create account
          </h1>

          {error && (
            <div className="text-ag-error text-sm bg-[rgba(201,64,64,0.1)] border border-[rgba(201,64,64,0.25)] rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {[
            { label: 'Name',     type: 'text',     value: name,     set: setName,     ph: 'Jane Smith' },
            { label: 'Email',    type: 'email',    value: email,    set: setEmail,    ph: 'you@example.com' },
            { label: 'Password', type: 'password', value: password, set: setPassword, ph: '8+ characters' },
          ].map(({ label, type, value, set, ph }) => (
            <div key={label} className="space-y-1">
              <label htmlFor={`signup-${label.toLowerCase()}`} className="text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide">
                {label}
              </label>
              <input
                id={`signup-${label.toLowerCase()}`}
                type={type}
                required
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={ph}
                minLength={type === 'password' ? 8 : undefined}
                className="w-full h-10 px-3.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base placeholder:text-ag-fg-muted text-sm focus:outline-none focus:border-ag-border-strong focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="ag-shimmer w-full h-10 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-sm hover:bg-ag-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create free account'}
          </button>

          <p className="text-center text-sm text-ag-fg-subtle">
            Already have an account?{' '}
            <Link href="/login" className="text-ag-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
