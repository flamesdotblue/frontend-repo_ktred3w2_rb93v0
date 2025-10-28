import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import TaxCalculator from "./components/TaxCalculator";
import Allocation from "./components/Allocation";
import ReceiptHistory from "./components/ReceiptHistory";
import UtilizationFeed from "./components/UtilizationFeed";

function formatINR(n) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function App() {
  const [route, setRoute] = useState("calculator");
  const [inputs, setInputs] = useState({ income: 1200000, sec80C: 150000, sec80D: 25000, nps: 20000, hra: 60000 });
  const [result, setResult] = useState({ regime: "old", tax: 0 });
  const [allocation, setAllocation] = useState({});

  useEffect(() => {
    // Allow opening a shared receipt link
    if (location.hash.startsWith("#receipt=")) {
      setRoute("utilization");
    }
  }, []);

  const amount = useMemo(() => Number(result.tax || 0), [result]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-violet-50 text-slate-900">
      <Header onNavigate={setRoute} current={route} />

      <main>
        <section className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-semibold">Plan, Pay, and Track your Taxes with Transparency</h1>
            <p className="text-slate-600 mt-2">Calculate your tax under old vs new regime, choose how it’s allocated across sectors with live visuals, and generate receipts you can download and share. This demo uses only your browser — no data is sent to a server.</p>
            <div className="mt-3 text-sm text-slate-600">Estimated tax set to: <span className="font-semibold">₹{formatINR(amount)}</span></div>
          </div>
        </section>

        <TaxCalculator inputs={inputs} setInputs={setInputs} result={result} setResult={setResult} />
        <Allocation amount={amount} allocation={allocation} setAllocation={setAllocation} regime={result.regime} />
        <ReceiptHistory inputs={inputs} result={result} allocation={allocation} />
        <UtilizationFeed />
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-10 text-center text-sm text-slate-500">
        <div>Disclosures: Educational demo. Slabs simplified; cess/surcharge omitted. Data stays on your device.</div>
        <div className="mt-1">Made for transparent taxation in India — supporting lakh/crore formatting and sector-wise impact.</div>
      </footer>
    </div>
  );
}
