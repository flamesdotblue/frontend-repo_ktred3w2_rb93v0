import React, { useEffect, useState } from 'react';
import Hero3D from './components/Hero3D';
import AuthModal from './components/AuthModal';
import AllocationPresets from './components/AllocationPresets';
import ReceiptHistoryLite from './components/ReceiptHistoryLite';
import { Home, Sliders, Receipt, Shield, User } from 'lucide-react';

export default function App() {
  const [route, setRoute] = useState('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [allocState, setAllocState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('taxflow_alloc') || '{}');
      return saved.amount ? saved : { amount: 100000, mix: { education: 28, healthcare: 25, infrastructure: 25, defense: 15, other: 7 }, presetKey: 'recommended' };
    } catch {
      return { amount: 100000, mix: { education: 28, healthcare: 25, infrastructure: 25, defense: 15, other: 7 }, presetKey: 'recommended' };
    }
  });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('taxflow_current_user') || 'null');
      if (u) setUser(u);
    } catch {}
  }, []);

  const onAuthed = (u) => setUser(u);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <TopNav current={route} onNav={setRoute} user={user} onOpenAuth={() => setAuthOpen(true)} />

      {route === 'home' && (
        <>
          <Hero3D onGetStarted={() => setRoute('allocation')} onOpenAuth={() => setAuthOpen(true)} user={user} />
          <HomeHighlights />
        </>
      )}

      {route === 'allocation' && (
        <div className="py-6">
          <AllocationPresets user={user} />
        </div>
      )}

      {route === 'receipts' && (
        <div className="py-6">
          <ReceiptHistoryLite user={user} alloc={allocState} />
        </div>
      )}

      {route === 'transparency' && <Transparency />}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={onAuthed} />

      <footer className="mx-auto mt-16 max-w-6xl px-4 pb-10 text-center text-xs text-slate-500">
        Disclosures: Calculations are estimates; verify slab changes each FY. Privacy-first. Exports available in Profile.
      </footer>
    </div>
  );
}

function TopNav({ current, onNav, user, onOpenAuth }) {
  const items = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'allocation', label: 'Allocation', icon: Sliders },
    { key: 'receipts', label: 'Receipts', icon: Receipt },
    { key: 'transparency', label: 'Transparency', icon: Shield },
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold">₹</div>
          <div className="text-sm font-semibold">TaxFlow</div>
        </div>
        <nav className="flex items-center gap-1">
          {items.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => onNav(key)} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${current === key ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Icon size={16} /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 text-sm text-slate-700"><User size={16} /> {user.name}</div>
          ) : (
            <button onClick={onOpenAuth} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}

function HomeHighlights() {
  const items = [
    { title: 'Best Regime Suggestion', body: 'Compare old vs new side-by-side and get the cheaper recommendation automatically.' },
    { title: 'Presets + Live Charts', body: 'Apply recommended or focus mixes and see the doughnut update in real-time.' },
    { title: 'Receipts & Sharing', body: 'Generate receipts locally and export JSON. Share privacy-safe summaries.' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="mt-1 text-sm text-slate-600">{it.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Transparency() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-xl font-semibold">Transparency & Disclosures</h2>
      <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
        <li>Data sources include Union Budget documents and public scheme dashboards.</li>
        <li>Assumptions reflect the latest FY slabs; confirm changes each year.</li>
        <li>Privacy: export/delete your data anytime from your device.</li>
        <li>Accessibility: designed with AA color contrast; Hindi/regional languages coming soon.</li>
      </ul>
    </section>
  );
}
