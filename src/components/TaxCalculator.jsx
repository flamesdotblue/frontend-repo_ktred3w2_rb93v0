import { useMemo } from "react";

function formatINR(n) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function calcOldRegimeTax(taxable) {
  let tax = 0;
  const slabs = [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 0.05 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ];
  let prev = 0;
  for (const s of slabs) {
    const amount = Math.max(0, Math.min(taxable, s.upTo) - prev);
    tax += amount * s.rate;
    prev = s.upTo;
    if (taxable <= s.upTo) break;
  }
  return Math.max(0, Math.round(tax));
}

function calcNewRegimeTax(income) {
  // Simplified new regime slabs (Budget 2023)
  let tax = 0;
  const slabs = [
    { upTo: 300000, rate: 0 },
    { upTo: 600000, rate: 0.05 },
    { upTo: 900000, rate: 0.1 },
    { upTo: 1200000, rate: 0.15 },
    { upTo: 1500000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ];
  let prev = 0;
  for (const s of slabs) {
    const amount = Math.max(0, Math.min(income, s.upTo) - prev);
    tax += amount * s.rate;
    prev = s.upTo;
    if (income <= s.upTo) break;
  }
  return Math.max(0, Math.round(tax));
}

export default function TaxCalculator({
  inputs,
  setInputs,
  result,
  setResult,
}) {
  const allowed = useMemo(() => {
    const cap80C = Math.min(inputs.sec80C || 0, 150000);
    const cap80D = Math.min(inputs.sec80D || 0, 50000);
    const capNPS = Math.min(inputs.nps || 0, 50000);
    const hra = inputs.hra || 0; // simplified
    const total = cap80C + cap80D + capNPS + hra;
    return { cap80C, cap80D, capNPS, hra, total };
  }, [inputs]);

  const computed = useMemo(() => {
    const income = Number(inputs.income || 0);
    const taxableOld = Math.max(0, income - allowed.total);
    const oldTax = calcOldRegimeTax(taxableOld);
    const newTax = calcNewRegimeTax(income);
    const best = oldTax <= newTax ? "old" : "new";
    return { income, taxableOld, oldTax, newTax, best };
  }, [inputs, allowed]);

  function update(field, value) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  function applySuggestion() {
    setResult({ ...result, regime: computed.best, tax: computed.best === "old" ? computed.oldTax : computed.newTax });
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Income & Deductions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Annual Income (₹)</label>
              <input type="number" value={inputs.income || ""} onChange={(e) => update("income", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 1200000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Section 80C (₹)</label>
                <input type="number" value={inputs.sec80C || ""} onChange={(e) => update("sec80C", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="Max 1,50,000" />
                <p className="text-xs text-slate-500 mt-1">Counted: ₹{formatINR(allowed.cap80C)}</p>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Section 80D (₹)</label>
                <input type="number" value={inputs.sec80D || ""} onChange={(e) => update("sec80D", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="Max 50,000" />
                <p className="text-xs text-slate-500 mt-1">Counted: ₹{formatINR(allowed.cap80D)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">NPS (₹)</label>
                <input type="number" value={inputs.nps || ""} onChange={(e) => update("nps", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="Max 50,000" />
                <p className="text-xs text-slate-500 mt-1">Counted: ₹{formatINR(allowed.capNPS)}</p>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">HRA (₹)</label>
                <input type="number" value={inputs.hra || ""} onChange={(e) => update("hra", Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="Eligible HRA" />
                <p className="text-xs text-slate-500 mt-1">Counted: ₹{formatINR(allowed.hra)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Old vs New Regime</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Old Regime</h3>
              <p className="text-sm text-slate-600">Taxable: ₹{formatINR(computed.taxableOld)}</p>
              <p className="text-2xl font-semibold mt-1">₹{formatINR(computed.oldTax)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">New Regime</h3>
              <p className="text-sm text-slate-600">Taxable: ₹{formatINR(computed.income)}</p>
              <p className="text-2xl font-semibold mt-1">₹{formatINR(computed.newTax)}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-indigo-50 text-indigo-800 rounded-lg text-sm">
            Suggested: <span className="font-semibold uppercase">{computed.best} regime</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={applySuggestion} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Use Suggested</button>
            <button onClick={() => setResult({ ...result, regime: "old", tax: computed.oldTax })} className="px-4 py-2 rounded-lg border">Choose Old</button>
            <button onClick={() => setResult({ ...result, regime: "new", tax: computed.newTax })} className="px-4 py-2 rounded-lg border">Choose New</button>
          </div>
          <p className="text-xs text-slate-500 mt-3">Note: Education cess/surcharge not included. This is an estimate for guidance.</p>
        </div>
      </div>
    </section>
  );
}
