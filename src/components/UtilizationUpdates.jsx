import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';

const sectors = ['Education', 'Healthcare', 'Infrastructure', 'Defense', 'Other'];

export default function UtilizationUpdates() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ sector: 'Education', amount: '', description: '', date: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('taxflow_utilization');
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('taxflow_utilization', JSON.stringify(entries));
  }, [entries]);

  const addEntry = async (e) => {
    e.preventDefault();
    setStatus(null);
    const payload = { ...form, id: crypto.randomUUID(), amount: Number(form.amount) };
    setEntries(prev => [payload, ...prev]);
    setForm({ sector: 'Education', amount: '', description: '', date: '' });

    // Try to sync with backend if available
    try {
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      await fetch(`${base}/admin/utilization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setStatus({ ok: true, msg: 'Update posted and synced.' });
    } catch {
      setStatus({ ok: false, msg: 'Saved locally. Sync when backend is available.' });
    }
  };

  const totalBySector = entries.reduce((acc, e) => {
    acc[e.sector] = (acc[e.sector] || 0) + (e.amount || 0);
    return acc;
  }, {});

  return (
    <section className="mx-auto mt-6 max-w-6xl px-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Utilization & Updates</h2>
        <p className="text-sm text-slate-600">Publish verified spend and progress updates for transparency.</p>
      </div>

      <form onSubmit={addEntry} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-4">
        <label className="text-sm">
          <div className="mb-1 text-slate-600">Sector</div>
          <select
            value={form.sector}
            onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <div className="mb-1 text-slate-600">Amount (₹)</div>
          <input
            type="number"
            required
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g., 250000"
          />
        </label>
        <label className="text-sm md:col-span-2">
          <div className="mb-1 text-slate-600">Description</div>
          <input
            type="text"
            required
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Upgrade 50 schools with smart labs"
          />
        </label>
        <label className="text-sm">
          <div className="mb-1 text-slate-600">Date</div>
          <input
            type="date"
            required
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="md:col-span-3 flex items-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500"
          >
            <Plus size={16} /> Add Update
          </button>
          {status && (
            <span className={`ml-3 inline-flex items-center gap-2 text-sm ${status.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
              <CheckCircle2 size={16} /> {status.msg}
            </span>
          )}
        </div>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        {sectors.map((s, i) => (
          <div key={s} className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">{s}</div>
            <div className="mt-1 text-xl font-semibold">₹{(totalBySector[s] || 0).toLocaleString('en-IN')}</div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded bg-slate-100">
              <div className={`${barColor(i)} h-full`} style={{ width: `${percentOf(totalBySector[s] || 0, entries)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200">
        {entries.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-600">No updates yet. Add the first utilization update above.</div>
        )}
        {entries.map(item => (
          <div key={item.id} className="flex items-start gap-4 p-4">
            <div className="mt-1 h-2 w-2 flex-none rounded-full bg-slate-400" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{item.sector}</div>
                <div className="text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-slate-700">{item.description}</div>
              <div className="mt-1 text-sm font-medium">₹{item.amount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function percentOf(val, entries) {
  const total = entries.reduce((a, e) => a + (e.amount || 0), 0) || 1;
  return Math.min(100, Math.round((val / total) * 100));
}

function barColor(i) {
  const palette = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-sky-500',
  ];
  return palette[i % palette.length];
}
