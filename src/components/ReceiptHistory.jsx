import { useEffect, useState } from 'react';
import { Download, CreditCard } from 'lucide-react';

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function ReceiptHistory({ token, authHeaders, apiBase, regime, allocation, taxResult }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReceipts = async () => {
    if (!token) return setItems([]);
    setLoading(true);
    const res = await fetch(`${apiBase}/receipts`, { headers: { ...authHeaders } });
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReceipts();
  }, [token]);

  const demoPay = async () => {
    if (!token) return alert('Sign in to pay');
    const amount = regime === 'old' ? taxResult.taxOld : taxResult.taxNew;
    const res = await fetch(`${apiBase}/pay/demo`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, regime, allocation }),
    });
    if (!res.ok) return alert('Payment failed');
    await fetchReceipts();
    alert('Demo payment successful. Receipt created.');
  };

  const exportJSON = (r) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${r.id || r.reference}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Payments & receipts</h2>
        <p className="text-slate-600">Make a demo payment to generate a receipt. Live payments require Razorpay keys on the server.</p>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-600">Estimated tax ({regime.toUpperCase()} regime)</div>
            <div className="text-2xl font-semibold">{formatINR(regime === 'old' ? taxResult.taxOld : taxResult.taxNew)}</div>
          </div>
          <button onClick={demoPay} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
            <CreditCard className="h-4 w-4" /> Pay now (Demo)
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your receipts</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {loading && <div className="text-slate-500">Loading...</div>}
          {!loading && items.length === 0 && <div className="text-slate-500">No receipts yet.</div>}
          {items.map((r) => (
            <div key={r.id || r.reference} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{r.currency}</div>
                  <div className="text-xl font-semibold">{formatINR(r.amount)}</div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <div>Method: {r.payment_method}</div>
                  <div>Ref: {r.reference}</div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <div className="text-slate-600">Allocation</div>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {Object.entries(r.allocation || {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="capitalize text-slate-700">{k}</span>
                      <span className="tabular-nums">{v}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <button onClick={() => exportJSON(r)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-slate-700 hover:bg-slate-50">
                  <Download className="h-4 w-4" /> Download JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
