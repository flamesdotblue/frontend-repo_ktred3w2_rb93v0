import { useEffect } from 'react';

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function TaxCalculator({ income, setIncome, deductions, setDeductions, regime, setRegime, taxResult, setTaxResult }) {
  useEffect(() => {
    const calcOld = (income, d) => {
      const taxable = Math.max(
        0,
        income - Math.min(d.sec80C, 150000) - Math.min(d.sec80D, 50000) - Math.min(d.nps, 50000) - Math.min(d.hra, 200000)
      );
      let remaining = taxable;
      let t = 0;
      const bands = [
        { upTo: 250000, rate: 0 },
        { upTo: 250000, rate: 0.05 },
        { upTo: 500000, rate: 0.2 },
      ];
      for (const b of bands) {
        const take = Math.min(remaining, b.upTo);
        t += take * b.rate;
        remaining -= take;
      }
      if (remaining > 0) t += remaining * 0.3;
      return Math.round(t);
    };

    const calcNew = (income) => {
      let t = 0;
      const thresholds = [300000, 300000, 300000, 300000, 300000];
      const rates = [0, 0.05, 0.1, 0.15, 0.2];
      let remaining = income;
      for (let i = 0; i < thresholds.length; i++) {
        const take = Math.min(remaining, thresholds[i]);
        t += take * rates[i];
        remaining -= take;
      }
      if (remaining > 0) t += remaining * 0.3;
      return Math.round(t);
    };

    const taxOld = calcOld(income, deductions);
    const taxNew = calcNew(income);
    const suggested = taxOld <= taxNew ? 'old' : 'new';
    setTaxResult({ taxOld, taxNew, suggested });
  }, [income, deductions, setTaxResult]);

  const activeRegime = regime === 'suggested' ? taxResult.suggested : regime;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Estimate your tax</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <label className="text-sm text-slate-600">Annual Income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(parseInt(e.target.value || '0'))}
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <NumberInput label="80C" value={deductions.sec80C} onChange={(v) => setDeductions({ ...deductions, sec80C: v })} />
            <NumberInput label="80D" value={deductions.sec80D} onChange={(v) => setDeductions({ ...deductions, sec80D: v })} />
            <NumberInput label="NPS" value={deductions.nps} onChange={(v) => setDeductions({ ...deductions, nps: v })} />
            <NumberInput label="HRA" value={deductions.hra} onChange={(v) => setDeductions({ ...deductions, hra: v })} />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <span>Caps applied: 80C ₹1.5L, 80D ₹50k, NPS ₹50k, HRA ₹2L</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card title="Old Regime" value={formatINR(taxResult.taxOld)} active={activeRegime === 'old'} onClick={() => setRegime('old')} />
            <Card title="New Regime" value={formatINR(taxResult.taxNew)} active={activeRegime === 'new'} onClick={() => setRegime('new')} />
          </div>
          <div className="rounded-lg border bg-white p-4 text-sm text-slate-600">
            Suggested: <span className="font-medium text-slate-900">{taxResult.suggested.toUpperCase()}</span>. You can override above.
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ title, value, active, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-lg border p-4 text-left shadow-sm ${active ? 'border-emerald-500 ring-2 ring-emerald-200' : ''}`}>
      <div className="text-sm text-slate-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </button>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || '0'))}
        className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}
