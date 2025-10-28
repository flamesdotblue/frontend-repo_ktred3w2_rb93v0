import React, { useEffect, useState } from 'react';
import { X, User, ShieldCheck } from 'lucide-react';

function maskPAN(pan) {
  if (!pan) return '';
  const up = pan.toUpperCase();
  return up.replace(/^(...)(....)(.)$/, (_, a, b, c) => `${a}****${c}`);
}

function isValidPAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test((pan || '').toUpperCase());
}

export default function AuthModal({ open, onClose, onAuthed }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', pan: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setMode('login');
      setForm({ name: '', email: '', password: '', pan: '' });
      setError('');
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    setError('');

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('Enter a valid email');
      return;
    }
    if (form.password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    if (mode === 'register' && form.pan && !isValidPAN(form.pan)) {
      setError('Invalid PAN format');
      return;
    }

    // Local auth store (no backend required for quick wins)
    const users = JSON.parse(localStorage.getItem('taxflow_users') || '{}');

    if (mode === 'register') {
      if (users[form.email]) {
        setError('Account already exists');
        return;
      }
      users[form.email] = {
        name: form.name || form.email.split('@')[0],
        email: form.email,
        password: form.password, // In production, hash on server
        pan: form.pan ? form.pan.toUpperCase() : '',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('taxflow_users', JSON.stringify(users));
    } else {
      const u = users[form.email];
      if (!u || u.password !== form.password) {
        setError('Invalid credentials');
        return;
      }
    }

    const user = users[form.email];
    const token = `local.${btoa(`${user.email}|${Date.now()}`)}`;
    localStorage.setItem('taxflow_token', token);
    localStorage.setItem('taxflow_current_user', JSON.stringify(user));
    onAuthed(user, token);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18} />
            <h3 className="text-sm font-semibold">{mode === 'login' ? 'Sign in' : 'Create account'}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <label className="block text-sm">
              <div className="mb-1 text-slate-600">Full name</div>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Aarav Sharma"
              />
            </label>
          )}
          <label className="block text-sm">
            <div className="mb-1 text-slate-600">Email</div>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm">
            <div className="mb-1 text-slate-600">Password</div>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </label>
          {mode === 'register' && (
            <label className="block text-sm">
              <div className="mb-1 flex items-center gap-2 text-slate-600">
                PAN (optional) <ShieldCheck size={14} className="text-emerald-600" />
              </div>
              <input
                value={form.pan}
                onChange={(e) => setForm(f => ({ ...f, pan: e.target.value.toUpperCase() }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wider"
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              {form.pan && (
                <div className={`mt-1 text-xs ${isValidPAN(form.pan) ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isValidPAN(form.pan) ? `Will be stored as ${maskPAN(form.pan)}` : 'Invalid PAN format'}
                </div>
              )}
            </label>
          )}

          {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">{error}</div>}

          <button className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-3 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <button className="font-medium text-indigo-600 hover:underline" onClick={() => setMode('register')}>Need an account? Sign up</button>
          ) : (
            <button className="font-medium text-indigo-600 hover:underline" onClick={() => setMode('login')}>Have an account? Sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}
