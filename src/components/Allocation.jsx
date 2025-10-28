import { useMemo, useState } from 'react';

function formatPct(n) {
  return `${n.toFixed(0)}%`;
}

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function Allocation({ income, taxResult, allocation, setAllocation, token, authHeaders, apiBase }) {
  const totalTax = useMemo(() => {
    const t = taxResult && (taxResult.suggested === 'old' ? taxResult.taxOld : taxResult.taxNew);
    return t || 0;
  }, [taxResult]);

  const sectors = Object.keys(allocation);

  const update = (key, val) => {
    const next = { ...allocation, [key]: Math.max(0, Math.min(100, val)) };
    // normalize to 100
    const sum = Object.values(next).reduce((a, b) => a + b, 0);
    const factor = sum === 0 ? 0 : 100 / sum;
    const normalized = Object.fromEntries(Object.entries(next).map(([k, v]) => [k, Math.round(v * factor)]));
    setAllocation(normalized);
  };

  const saveServer = async () => {
    if (!token) return alert('Sign in to save');
    const res = await fetch(`${apiBase}/allocations`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectors: allocation }),
    });
    if (res.ok) alert('Allocation saved');
    else alert('Failed to save');
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Allocate your taxes</h2>
        <p className="text-slate-600">Drag sliders to split your estimated tax across sectors. Total stays at 100%.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
          {sectors.map((s) => (
            <div key={s} className="grid grid-cols-6 items-center gap-3">
              <div className="col-span-2 capitalize text-slate-700">{s}</div>
              <input
                type="range"
                min={0}
                max={100}
                value={allocation[s]}
                onChange={(e) => update(s, parseInt(e.target.value))}
                className="col-span-3"
              />
              <div className="col-span-1 text-right font-medium">{formatPct(allocation[s])}</div>
            </div>
          ))}
          <button onClick={saveServer} className="mt-2 inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
            Save allocation
          </button>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Estimated distribution</h3>
          <div className="mt-2 space-y-2">
            {sectors.map((s) => (
              <div key={s} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-700">{s}</span>
                <span className="tabular-nums text-slate-900">{formatINR((allocation[s] / 100) * totalTax)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
