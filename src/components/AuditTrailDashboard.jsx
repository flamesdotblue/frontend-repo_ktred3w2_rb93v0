import React, { useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';

export default function AuditTrailDashboard() {
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('30');
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    // Load from localStorage for resilience when backend is down
    try {
      const util = JSON.parse(localStorage.getItem('taxflow_utilization') || '[]');
      const mapped = util.map((u) => ({
        id: `audit-${u.id}`,
        actor: 'system',
        action: 'UTILIZATION_UPDATE',
        sector: u.sector,
        amount: u.amount,
        description: u.description,
        at: u.date,
      }));
      setAudits(mapped);
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = now - Number(range) * 24 * 60 * 60 * 1000;
    return audits.filter(a => {
      const t = new Date(a.at).getTime();
      if (isFinite(cutoff) && t < cutoff) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        a.sector.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q)
      );
    });
  }, [audits, query, range]);

  const sectorTotals = filtered.reduce((acc, a) => {
    acc[a.sector] = (acc[a.sector] || 0) + (a.amount || 0);
    return acc;
  }, {});

  return (
    <section className="mx-auto mt-6 max-w-6xl px-4">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-xl font-semibold">Audit Trail & Transparency</h2>
          <p className="text-sm text-slate-600">Filter, search, and review a verifiable history of updates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sector, action, description"
              className="w-72 rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <Filter size={16} />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value={Number.POSITIVE_INFINITY}>All time</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.entries(sectorTotals).map(([sector, amt]) => (
          <div key={sector} className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">{sector}</div>
            <div className="mt-1 text-xl font-semibold">₹{amt.toLocaleString('en-IN')}</div>
            <div className="mt-2 text-xs text-slate-500">From filtered audit entries</div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-600">When</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Action</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Sector</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Amount</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No entries match your filters.</td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-600">{new Date(a.at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {a.action}
                  </span>
                </td>
                <td className="px-4 py-2">{a.sector}</td>
                <td className="px-4 py-2 font-medium">₹{(a.amount || 0).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 text-slate-700">{a.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
