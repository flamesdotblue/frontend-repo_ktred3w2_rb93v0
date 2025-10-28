import React, { useEffect, useState } from 'react';
import { Receipt, Download, Trash2 } from 'lucide-react';

export default function ReceiptHistoryLite({ user, alloc }) {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('taxflow_receipts') || '[]');
      setReceipts(saved);
    } catch {}
  }, []);

  const createReceipt = () => {
    const amount = Math.round(Object.values(alloc?.mix || {}).reduce((acc, p) => acc + (p / 100) * (alloc?.amount || 0), 0));
    const data = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      user: user ? { name: user.name, email: user.email, panMasked: user.pan ? maskPAN(user.pan) : null } : null,
      allocation: alloc,
      amount,
      status: 'PAID (demo)',
      source: 'local-demo',
    };
    const next = [data, ...receipts];
    setReceipts(next);
    localStorage.setItem('taxflow_receipts', JSON.stringify(next));
  };

  const download = (r) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${r.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const remove = (id) => {
    const next = receipts.filter(r => r.id !== id);
    setReceipts(next);
    localStorage.setItem('taxflow_receipts', JSON.stringify(next));
  };

  return (
    <section className="mx-auto mt-8 max-w-6xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Receipts</h2>
          <p className="text-sm text-slate-600">Generate a downloadable demo receipt with your current allocation.</p>
        </div>
        <button onClick={createReceipt} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          <Receipt size={16} /> Create Demo Receipt
        </button>
      </div>

      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
        {receipts.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-600">No receipts yet. Create one to test the flow.</div>
        )}
        {receipts.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">#{r.id.slice(0, 8)} · {new Date(r.createdAt).toLocaleString()}</div>
              <div className="truncate text-xs text-slate-600">{r.user?.email || 'Guest'} · ₹{(r.amount || 0).toLocaleString('en-IN')} · {r.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => download(r)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Download size={14} /> JSON
              </button>
              <button onClick={() => remove(r.id)} className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100">
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function maskPAN(pan) {
  return pan ? pan.toUpperCase().replace(/^(...)(....)(.)$/, (_, a, b, c) => `${a}****${c}`) : '';
}
