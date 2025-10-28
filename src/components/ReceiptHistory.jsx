import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, ExternalLink, IndianRupee, ReceiptText } from "lucide-react";

function formatINR(n) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ReceiptHistory({ inputs, result, allocation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("receipts");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("receipts", JSON.stringify(history));
  }, [history]);

  const payable = useMemo(() => Number(result?.tax || 0), [result]);

  function simulatePay() {
    const rec = {
      id: uid(),
      at: new Date().toISOString(),
      regime: result?.regime || "old",
      tax: payable,
      inputs,
      allocation,
      note: "Payment simulated (test mode)",
      status: "success",
    };
    setHistory((prev) => [rec, ...prev]);
  }

  function download(rec) {
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${rec.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function share(rec) {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(rec))));
    const link = `${location.origin}${location.pathname}#receipt=${payload}`;
    navigator.clipboard.writeText(link);
    alert("Share link copied to clipboard");
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Pay & Receipt</h2>
          <p className="text-sm text-slate-600 mb-4">This demo simulates a payment and generates a downloadable receipt stored on your device.</p>

          <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
            <div>
              <div className="text-sm text-slate-600">Amount Payable</div>
              <div className="text-2xl font-semibold flex items-center gap-1">₹{formatINR(payable)} <IndianRupee size={18} className="text-slate-400" /></div>
              <div className="text-xs text-slate-500">Regime: {result?.regime?.toUpperCase() || "-"}</div>
            </div>
            <button onClick={simulatePay} className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60" disabled={!payable}>
              Pay Now (Demo)
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {history.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Receipt #{rec.id.slice(-6).toUpperCase()}</div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1"><CheckCircle2 size={14} /> {rec.status}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1">{new Date(rec.at).toLocaleString()}</div>
                <div className="mt-2 text-sm">Paid: <span className="font-semibold">₹{formatINR(rec.tax)}</span> · Regime: <span className="uppercase">{rec.regime}</span></div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => download(rec)} className="px-3 py-1.5 rounded-lg border inline-flex items-center gap-2 text-sm"><Download size={16} /> Download</button>
                  <button onClick={() => share(rec)} className="px-3 py-1.5 rounded-lg border inline-flex items-center gap-2 text-sm"><ExternalLink size={16} /> Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><ReceiptText size={18} /> Local History</h3>
          <p className="text-sm text-slate-600">Your recent simulated payments and allocations live here. They never leave your device.</p>
          <ul className="mt-4 space-y-3">
            {history.slice(0, 6).map((rec) => (
              <li key={rec.id} className="text-sm p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">₹{formatINR(rec.tax)}</span>
                  <span className="text-xs uppercase text-slate-500">{rec.regime}</span>
                </div>
                <div className="text-xs text-slate-500">{new Date(rec.at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
