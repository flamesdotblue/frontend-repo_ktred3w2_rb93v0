import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, Save, AlertTriangle, Info, Link as LinkIcon } from 'lucide-react';

const SECTORS = [
  { key: 'education', label: 'Education', min: 10, max: 50, desc: 'Improve school infrastructure, teacher training, and digital kits', link: 'https://vikaspedia.in/education' },
  { key: 'healthcare', label: 'Healthcare', min: 10, max: 50, desc: 'Primary care, equipment, vaccines and maternal health', link: 'https://nhm.gov.in/' },
  { key: 'infrastructure', label: 'Infrastructure', min: 10, max: 40, desc: 'Rural roads, water, electricity, and public transport', link: 'https://www.indiainvestmentgrid.gov.in/' },
  { key: 'defense', label: 'Defense', min: 5, max: 30, desc: 'Modernisation, veterans welfare and R&D', link: 'https://mod.gov.in/' },
  { key: 'other', label: 'Other', min: 0, max: 30, desc: 'Arts, environment and contingency reserves', link: 'https://moef.gov.in/' },
];

const PRESETS = {
  recommended: { name: 'Govt Recommended', mix: { education: 28, healthcare: 25, infrastructure: 25, defense: 15, other: 7 } },
  balanced: { name: 'Balanced', mix: { education: 25, healthcare: 25, infrastructure: 25, defense: 15, other: 10 } },
  education: { name: 'Education Focus', mix: { education: 45, healthcare: 20, infrastructure: 20, defense: 10, other: 5 } },
  healthcare: { name: 'Healthcare Focus', mix: { education: 20, healthcare: 45, infrastructure: 20, defense: 10, other: 5 } },
};

export default function AllocationPresets({ user }) {
  const [amount, setAmount] = useState(100000);
  const [mix, setMix] = useState(PRESETS.recommended.mix);
  const [presetKey, setPresetKey] = useState('recommended');
  const [locked, setLocked] = useState(() => {
    const obj = {};
    SECTORS.forEach(s => obj[s.key] = false);
    return obj;
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('taxflow_alloc') || '{}');
      if (saved.amount) setAmount(saved.amount);
      if (saved.mix) setMix(saved.mix);
      if (saved.presetKey) setPresetKey(saved.presetKey);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('taxflow_alloc', JSON.stringify({ amount, mix, presetKey }));
    if (user?.email) {
      localStorage.setItem(`taxflow_alloc_${user.email}`, JSON.stringify({ amount, mix, presetKey }));
    }
  }, [amount, mix, presetKey, user]);

  const total = useMemo(() => Object.values(mix).reduce((a, b) => a + Number(b || 0), 0), [mix]);
  const warnings = useMemo(() => guardrails(mix), [mix]);

  const applyPreset = (key) => {
    setPresetKey(key);
    setMix(PRESETS[key].mix);
  };

  const setValue = (key, value) => {
    const v = Math.max(0, Math.min(100, Number(value)));
    const updated = { ...mix, [key]: v };
    const sum = Object.values(updated).reduce((a, b) => a + b, 0) || 1;
    // Normalize to 100 keeping locked values intact
    const freeKeys = SECTORS.map(s => s.key).filter(k => !locked[k] && k !== key);
    const freeTotal = freeKeys.reduce((a, k) => a + updated[k], 0);
    const factor = (100 - updated[key] - lockedSum(updated, locked, key)) / (freeTotal || 1);
    const normalized = { ...updated };
    freeKeys.forEach(k => {
      normalized[k] = Math.max(0, Math.round(updated[k] * factor));
    });
    normalized[key] = updated[key];
    SECTORS.forEach(s => {
      if (locked[s.key]) normalized[s.key] = mix[s.key];
    });
    setMix(normalized);
  };

  const toggleLock = (k) => setLocked(l => ({ ...l, [k]: !l[k] }));

  const saveTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('taxflow_templates') || '[]');
    const name = prompt('Save mix as template name:');
    if (!name) return;
    const tpl = { id: crypto.randomUUID(), name, mix, createdAt: new Date().toISOString() };
    localStorage.setItem('taxflow_templates', JSON.stringify([tpl, ...templates]));
    alert('Template saved');
  };

  const explain = useMemo(() => explainSplit(mix, presetKey, user), [mix, presetKey, user]);

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="mt-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-xl font-semibold">Allocation</h2>
          <p className="text-sm text-slate-600">Choose a preset or fine-tune. Guardrails prevent exceeding policy thresholds.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">
            <div className="mb-1 text-slate-600">Contribution (₹)</div>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value || 0))} className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <button onClick={saveTemplate} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Save size={16} /> Save Template
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {Object.entries(PRESETS).map(([k, p]) => (
          <button key={k} onClick={() => applyPreset(k)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${presetKey === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <SlidersHorizontal size={14} /> {p.name}
          </button>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5" />
          <div>
            <div className="font-medium">Guardrails</div>
            <ul className="list-disc pl-5">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          {SECTORS.map((s) => (
            <div key={s.key} className="mb-4 last:mb-0">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.label}</span>
                  <a href={s.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1"><LinkIcon size={12} /> Evidence</a>
                  <span className="group relative">
                    <Info size={14} className="text-slate-400" />
                    <span className="pointer-events-none absolute -left-2 top-5 hidden w-64 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-700 shadow group-hover:block">{s.desc}</span>
                  </span>
                </div>
                <div className="text-sm text-slate-600">{mix[s.key]}% · ₹{Math.round((amount * mix[s.key]) / 100).toLocaleString('en-IN')}</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="range" min={s.min} max={s.max} value={mix[s.key]} onChange={(e) => setValue(s.key, e.target.value)} className="w-full" />
                <button onClick={() => toggleLock(s.key)} className={`text-xs ${locked[s.key] ? 'text-emerald-600' : 'text-slate-500'} underline`}>{locked[s.key] ? 'Locked' : 'Lock'}</button>
              </div>
              <div className="mt-1 text-xs text-slate-500">Min {s.min}% · Max {s.max}%</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 text-sm font-medium text-slate-700">Live Mix</div>
          <Doughnut mix={mix} />
          <div className="mt-4 text-sm text-slate-700">{explain}</div>
        </div>
      </div>
    </section>
  );
}

function Doughnut({ mix }) {
  const gradient = conicFromMix(mix);
  return (
    <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full" style={{ background: gradient }}>
      <div className="h-36 w-36 rounded-full bg-white shadow-inner" />
    </div>
  );
}

function conicFromMix(mix) {
  const palette = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
  let start = 0;
  const stops = Object.entries(mix).map(([_, v], i) => {
    const end = start + Number(v) * 3.6; // percent to degrees
    const stop = `${palette[i % palette.length]} ${start}deg ${end}deg`;
    start = end;
    return stop;
  });
  return `conic-gradient(${stops.join(',')})`;
}

function guardrails(mix) {
  const errors = [];
  SECTORS.forEach(s => {
    const v = Number(mix[s.key]);
    if (v < s.min) errors.push(`${s.label} is below policy minimum (${s.min}%).`);
    if (v > s.max) errors.push(`${s.label} exceeds policy maximum (${s.max}%).`);
  });
  const total = Object.values(mix).reduce((a, b) => a + Number(b || 0), 0);
  if (total !== 100) errors.push(`Total is ${total}%. Adjust sliders to make it 100%.`);
  return errors;
}

function lockedSum(updated, locked, excludeKey) {
  return Object.entries(locked).reduce((acc, [k, v]) => (v && k !== excludeKey ? acc + updated[k] : acc), 0);
}

function explainSplit(mix, presetKey, user) {
  const top = Object.entries(mix).sort((a, b) => b[1] - a[1])[0][0];
  const named = { recommended: 'Government recommended balance', balanced: 'Balanced mix', education: 'Education-oriented mix', healthcare: 'Healthcare-oriented mix' };
  const who = user?.name ? `for ${user.name}` : 'for you';
  if (presetKey === 'education') return `Focused on Education ${who}, prioritizing learning outcomes while preserving minimums in health and infrastructure.`;
  if (presetKey === 'healthcare') return `Healthcare-forward ${who}, with strong allocations to primary care and vaccines.`;
  if (presetKey === 'balanced') return `A balanced split ${who} to distribute impact evenly across core sectors.`;
  return `${named[presetKey] || 'Custom mix'} ${who}. Highest share goes to ${labelFor(top)} based on selected preset and guardrails.`;
}

function labelFor(key) {
  const s = SECTORS.find(x => x.key === key);
  return s ? s.label : key;
}
