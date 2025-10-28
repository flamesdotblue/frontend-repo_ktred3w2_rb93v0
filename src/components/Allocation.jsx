import { useEffect, useMemo, useState } from "react";
import { Info, Save, SlidersHorizontal } from "lucide-react";

const DEFAULT_SECTORS = [
  { key: "education", name: "Education", min: 10, max: 40, color: "#4f46e5" },
  { key: "healthcare", name: "Healthcare", min: 10, max: 40, color: "#16a34a" },
  { key: "infrastructure", name: "Infrastructure", min: 5, max: 35, color: "#0ea5e9" },
  { key: "defense", name: "Defense", min: 10, max: 30, color: "#f59e0b" },
  { key: "agriculture", name: "Agriculture", min: 5, max: 25, color: "#84cc16" },
  { key: "social", name: "Social Welfare", min: 5, max: 25, color: "#ef4444" },
  { key: "climate", name: "Climate & Environment", min: 0, max: 20, color: "#8b5cf6" },
];

const PRESETS = {
  government: {
    label: "Govt Recommended",
    values: { education: 15, healthcare: 15, infrastructure: 20, defense: 15, agriculture: 15, social: 10, climate: 10 },
    rationale: "A diversified allocation aligned with typical Union Budget priorities.",
  },
  balanced: {
    label: "Balanced",
    values: { education: 15, healthcare: 15, infrastructure: 15, defense: 15, agriculture: 15, social: 15, climate: 10 },
    rationale: "Equal emphasis across socio-economic development areas.",
  },
  education: {
    label: "Education Focus",
    values: { education: 30, healthcare: 15, infrastructure: 10, defense: 10, agriculture: 10, social: 15, climate: 10 },
    rationale: "Boost human capital development through higher education spend.",
  },
  healthcare: {
    label: "Healthcare Focus",
    values: { education: 15, healthcare: 30, infrastructure: 10, defense: 10, agriculture: 10, social: 15, climate: 10 },
    rationale: "Stronger public health outcomes via increased healthcare allocation.",
  },
};

function formatINR(n) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function normalizeWithCaps(values) {
  // Ensure min and max caps and total 100
  const sectors = DEFAULT_SECTORS;
  // Step 1: Apply mins
  let adjusted = { ...values };
  for (const s of sectors) {
    adjusted[s.key] = Math.max(adjusted[s.key] ?? 0, s.min);
  }
  // Step 2: Apply max caps
  for (const s of sectors) {
    adjusted[s.key] = Math.min(adjusted[s.key], s.max);
  }
  // Step 3: Scale to 100 keeping proportions (above mins)
  const minSum = sectors.reduce((acc, s) => acc + s.min, 0);
  const extraTarget = 100 - minSum;
  const currentSum = sectors.reduce((acc, s) => acc + adjusted[s.key], 0);
  const currentExtra = currentSum - minSum;
  if (currentExtra <= 0) return adjusted; // already at mins
  const scale = extraTarget / currentExtra;
  const result = {};
  for (const s of sectors) {
    const aboveMin = adjusted[s.key] - s.min;
    result[s.key] = Math.round((s.min + aboveMin * scale) * 10) / 10;
  }
  // small correction to exactly 100
  const sum = sectors.reduce((a, s) => a + result[s.key], 0);
  const diff = Math.round((100 - sum) * 10) / 10;
  if (Math.abs(diff) > 0.001) {
    const first = sectors[0].key;
    result[first] = Math.round((result[first] + diff) * 10) / 10;
  }
  return result;
}

function Donut({ data }) {
  const total = 100;
  let cumulative = 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 120 120" className="w-48 h-48">
      <circle cx="60" cy="60" r={radius} stroke="#e5e7eb" strokeWidth="16" fill="none" />
      {DEFAULT_SECTORS.map((s) => {
        const value = data[s.key] || 0;
        const dash = (value / total) * circumference;
        const gap = circumference - dash;
        const strokeDasharray = `${dash} ${gap}`;
        const strokeDashoffset = (circumference * (1 - cumulative / total));
        cumulative += value;
        return (
          <circle
            key={s.key}
            cx="60"
            cy="60"
            r={radius}
            stroke={s.color}
            strokeWidth="16"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
          />
        );
      })}
      <circle cx="60" cy="60" r="38" fill="#fff" />
      <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="fill-slate-900 text-sm font-semibold">
        {Math.round(total)}%
      </text>
    </svg>
  );
}

export default function Allocation({ amount, allocation, setAllocation, regime }) {
  const [rationale, setRationale] = useState("");

  useEffect(() => {
    // Ensure valid on mount
    const normalized = normalizeWithCaps(Object.fromEntries(DEFAULT_SECTORS.map((s) => [s.key, allocation[s.key] ?? s.min])));
    setAllocation(normalized);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(() => Object.values(allocation).reduce((a, b) => a + (Number(b) || 0), 0), [allocation]);

  function applyPreset(key) {
    const preset = PRESETS[key];
    const normalized = normalizeWithCaps(preset.values);
    setAllocation(normalized);
    setRationale(preset.rationale);
  }

  function update(key, value) {
    const next = { ...allocation, [key]: Number(value) };
    const normalized = normalizeWithCaps(next);
    setAllocation(normalized);
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Allocation</h2>
            <p className="text-sm text-slate-600">Distribute your estimated tax ₹{formatINR(amount || 0)} under the {regime?.toUpperCase()} regime</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(PRESETS).map(([k, v]) => (
              <button key={k} onClick={() => applyPreset(k)} className="px-3 py-2 rounded-lg border text-sm hover:bg-slate-50">
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-4">
            {DEFAULT_SECTORS.map((s) => (
              <div key={s.key} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-slate-500">min {s.min}% · max {s.max}%</span>
                  </div>
                  <div className="font-semibold">{allocation[s.key] ?? s.min}%</div>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step="1"
                  value={allocation[s.key] ?? s.min}
                  onChange={(e) => update(s.key, e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Info size={14} /> Every change auto-balances to keep total at 100%.</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Live Visual</h3>
                <SlidersHorizontal size={18} className="text-slate-500" />
              </div>
              <div className="flex items-center justify-center">
                <Donut data={allocation} />
              </div>
              <p className="text-sm text-slate-600 mt-3">Total: <span className={`font-semibold ${Math.round(total) === 100 ? "text-green-600" : "text-red-600"}`}>{Math.round(total)}%</span></p>
              <ul className="mt-3 space-y-1 text-sm">
                {DEFAULT_SECTORS.map((s) => (
                  <li key={s.key} className="flex justify-between">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.name}</span>
                    <span>₹{formatINR(Math.round((amount || 0) * (Number(allocation[s.key] || 0) / 100)))}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border rounded-xl p-4 bg-slate-50">
              <h4 className="font-medium mb-1">Explain this split</h4>
              <p className="text-sm text-slate-700 min-h-[48px]">{rationale || "Pick a preset to view a rationale based on your preference."}</p>
            </div>

            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white">
              <Save size={16} /> Save Allocation Template
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
