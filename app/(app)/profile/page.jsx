'use client';

import { useState, useEffect, useRef } from 'react';
import { CircleUser, Camera, Save } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { STORE_KEYS as STORES, STORE_LABELS } from '@/lib/stores';

export default function ProfilePage() {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [stores, setStores] = useState([]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);
  const showToast = useToast();

  useEffect(() => {
    const id = localStorage.getItem('userId');
    setUserId(id);
    if (!id) { setLoading(false); return; }
    fetch(`/api/profile?userId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setName(data.displayName || '');
        setEmail(data.email || '');
        setZip(data.zipCode || '');
        setStores(data.favouriteStores || []);
        setPhotoUrl(data.photoUrl || null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleStore(s) {
    setStores(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPEG and PNG images are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    setError('');

    const localPreview = URL.createObjectURL(file);
    setPhotoUrl(localPreview);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('photo', file);

    try {
      const res = await fetch('/api/profile/photo', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setPhotoUrl(data.photoUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      URL.revokeObjectURL(localPreview);
    }
  }

  async function handleDeletePhoto() {
    if (!userId) return;
    try {
      await fetch(`/api/profile/photo?userId=${userId}`, { method: 'DELETE' });
      setPhotoUrl(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, displayName: name, zipCode: zip, favouriteStores: stores }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved(true);
      showToast('Profile saved.', 'success');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
      showToast('Could not save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="h-40 rounded-xl bg-ag-bg-surface border border-ag-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-semibold text-ag-fg-base mb-1">Profile</h1>
      <p className="text-ag-fg-subtle text-sm mb-8">
        Your photo is used to personalise AI poster generation.
      </p>

      {error && (
        <div className="text-ag-error text-sm bg-[rgba(201,64,64,0.1)] border border-[rgba(201,64,64,0.25)] rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6">
          <h2 className="font-semibold text-ag-fg-base mb-4">Profile photo</h2>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={photoUrl ? 'Replace profile photo' : 'Upload profile photo'}
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-ag-accent cursor-pointer hover:border-ag-accent-hover transition-colors group"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-ag-bg-elevated">
                  <CircleUser className="w-10 h-10 text-ag-fg-muted" strokeWidth={1} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            </button>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold text-ag-accent hover:text-ag-accent-hover transition-colors"
              >
                {photoUrl ? 'Replace photo' : 'Upload photo'}
              </button>
              <p className="text-xs text-ag-fg-muted mt-1">JPEG or PNG · Max 5MB</p>
              <p className="text-xs text-ag-fg-muted mt-1">
                Used only for AI poster generation. Never shared.
              </p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-ag-fg-base">Account details</h2>

          {[
            { label: 'Display name', value: name, set: setName, type: 'text', ph: 'Jane Smith', req: true, readOnly: false },
            { label: 'Email', value: email, set: setEmail, type: 'email', ph: 'you@example.com', req: true, readOnly: true },
            { label: 'Home zip code', value: zip, set: setZip, type: 'text', ph: '90210 (optional)', req: false, readOnly: false },
          ].map(({ label, value, set, type, ph, req, readOnly }) => (
            <div key={label}>
              <label htmlFor={`profile-${label.toLowerCase().replace(/\s+/g, '-')}`} className="block text-xs font-semibold text-ag-fg-subtle uppercase tracking-wide mb-1.5">
                {label}
              </label>
              <input
                id={`profile-${label.toLowerCase().replace(/\s+/g, '-')}`}
                type={type}
                required={req}
                readOnly={readOnly}
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={ph}
                className={`w-full h-10 px-3.5 rounded-lg bg-ag-bg-base border border-ag-border text-ag-fg-base placeholder:text-ag-fg-muted text-sm focus:outline-none focus:border-ag-border-strong focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          ))}
        </div>

        <div className="bg-ag-bg-surface border border-ag-border rounded-xl p-6">
          <h2 className="font-semibold text-ag-fg-base mb-4">Favourite stores</h2>
          <div className="flex flex-wrap gap-3">
            {STORES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleStore(s)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  stores.includes(s)
                    ? 'bg-ag-accent text-ag-fg-inverted border-ag-accent'
                    : 'border-ag-border text-ag-fg-subtle hover:border-ag-border-strong hover:text-ag-fg-base'
                }`}
              >
                {STORE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="ag-shimmer w-full h-10 rounded-lg bg-ag-accent text-ag-fg-inverted font-semibold text-sm hover:bg-ag-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" strokeWidth={1.5} />
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save profile'}
        </button>

        {photoUrl && (
          <button
            type="button"
            onClick={handleDeletePhoto}
            className="w-full text-sm text-ag-error hover:underline text-center"
          >
            Delete my photo
          </button>
        )}
      </form>
    </div>
  );
}
