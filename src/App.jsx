import React, { useState } from 'react';
import AdminHeader from './components/AdminHeader';
import SectorCapsManager from './components/SectorCapsManager';
import UtilizationUpdates from './components/UtilizationUpdates';
import AuditTrailDashboard from './components/AuditTrailDashboard';

export default function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <AdminHeader activeTab={tab} onChangeTab={setTab} />

      {tab === 'dashboard' && <AdminDashboardOverview onGoToCaps={() => setTab('caps')} onGoToUtil={() => setTab('utilization')} onGoToAudits={() => setTab('audits')} />}
      {tab === 'caps' && <SectorCapsManager />}
      {tab === 'utilization' && <UtilizationUpdates />}
      {tab === 'audits' && <AuditTrailDashboard />}

      <footer className="mx-auto mt-16 max-w-6xl px-4 pb-10 text-center text-xs text-slate-500">
        Built for transparency and better taxpayer experience.
      </footer>
    </div>
  );
}

function Card({ title, children, action }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function AdminDashboardOverview({ onGoToCaps, onGoToUtil, onGoToAudits }) {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="pt-8">
        <h2 className="text-2xl font-semibold tracking-tight">Admin Console</h2>
        <p className="mt-1 text-sm text-slate-600">Manage sector caps, publish utilization updates, and review audit trails at a glance.</p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card
          title="Sector Caps"
          action={<button onClick={onGoToCaps} className="text-xs font-medium text-indigo-600 hover:underline">Manage</button>}
        >
          <p className="text-sm text-slate-600">Define policy caps that guide taxpayer allocation suggestions and ensure balance across sectors.</p>
        </Card>
        <Card
          title="Utilization"
          action={<button onClick={onGoToUtil} className="text-xs font-medium text-indigo-600 hover:underline">Open</button>}
        >
          <p className="text-sm text-slate-600">Publish verified spend with descriptive updates for public transparency.</p>
        </Card>
        <Card
          title="Audits"
          action={<button onClick={onGoToAudits} className="text-xs font-medium text-indigo-600 hover:underline">Review</button>}
        >
          <p className="text-sm text-slate-600">Search and filter an immutable trail of changes and utilization updates.</p>
        </Card>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card title="Transparency Tips">
          <ul className="list-disc pl-5 text-sm text-slate-700">
            <li>Provide clear, non-technical descriptions for each utilization update.</li>
            <li>Include dates and measured outcomes to improve public trust.</li>
            <li>Use sector caps to avoid over-concentration and maintain balance.</li>
          </ul>
        </Card>
        <Card title="Next Steps">
          <ul className="list-disc pl-5 text-sm text-slate-700">
            <li>Connect live backend endpoints for caps and utilization sync.</li>
            <li>Enable role-based access to restrict admin features.</li>
            <li>Publish dashboards publicly for citizens to explore.</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
