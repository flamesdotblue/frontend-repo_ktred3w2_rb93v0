import React, { useEffect, useMemo, useState } from 'react';
import { Save, RefreshCcw, Download, Upload, AlertCircle } from 'lucide-react';

const defaultCaps = {
  education: 30,
  healthcare: 25,
  infrastructure: 20,
  defense: 15,
  other: 10,
};

const sectors = [
  { key: 'education', label: 'Education' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'defense', label: 'Defense' },
  { key: 'other', label: 'Other' },
];

export default function SectorCapsManager() {
  const [caps, setCaps] = useState(defaultCaps);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('taxflow_caps');
      if (saved) setCaps(JSON.parse(saved));
    } catch {}
  }, []);

  const total = useMemo(() => Object.values(caps).reduce((a, b) => a + Number(b), 0), [caps]);

  const normalized = useMemo(() => {
    if (total === 0) return caps;
    const factor = 100 / total;
    const out = {};
    for (const s of sectors) out[s.key] = Math.round(caps[s.key] * factor);
    return out;
  }, [caps, total]);

  const handleChange = (key, value) => {
    setCaps(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleNormalize = () => {
    setCaps(normalized);
  };

  const handleReset = () => {
    setCaps(defaultCaps);
    setMessage({ type: 'info', text: 'Caps reset to defaults.' });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Persist locally for reliability even if backend is unreachable
      localStorage.setItem('taxflow_caps', JSON.stringify(caps));

      // Attempt backend save if available
      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/admin/caps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caps }),
      });
      if (!res.ok) throw new Error('Backend rejected the request');
      setMessage({ type: 'success', text: 'Caps saved successfully.' });
    } catch (e) {
      setMessage({ type: 'warning', text: 'Saved locally. Backend not reachable.' });
    } finally {
      setSaving(false);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ caps }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sector_caps.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed && parsed.caps) setCaps(parsed.caps);
        setMessage({ type: 'success', text: 'Caps imported.' });
      } catch {
        setMessage({ type: 'error', text: 'Invalid JSON file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="mx-auto mt-6 max-w-6xl px-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Sector Contribution Caps</h2>
        <p className="text-sm text-slate-600">Set policy caps per sector. Values normalize to 100% for allocation recommendations.</p>
      </div>

      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-md border p-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : message.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : message.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          <AlertCircle size={16} />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {sectors.map(s => (
          <div key={s.key} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{s.label}</span>
              <span className="text-sm text-slate-600">{caps[s.key]}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={caps[s.key]}
              onChange={e => handleChange(s.key, e.target.value)}
              className="w-full"
            />
            <div className="mt-2 text-xs text-slate-500">Normalized: {normalized[s.key]}%</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Caps'}
        </button>
        <button
          onClick={handleNormalize}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} /> Normalize to 100%
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw size={16} /> Reset Defaults
        </button>
        <button
          onClick={downloadJSON}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download size={16} /> Export JSON
        </button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Upload size={16} /> Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files[0] && uploadJSON(e.target.files[0])} />
        </label>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 p-4">
        <h3 className="mb-2 font-medium">Current Mix</h3>
        <div className="h-3 w-full overflow-hidden rounded bg-slate-100">
          <div className="flex h-full w-full">
            {sectors.map((s, idx) => (
              <div
                key={s.key}
                title={`${s.label}: ${normalized[s.key]}%`}
                style={{ width: `${normalized[s.key]}%` }}
                className={`${barColor(idx)} h-full`}
              />
            ))}
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-600">Total: {total}% → Normalized to 100%</div>
      </div>
    </section>
  );
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
