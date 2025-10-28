import React from 'react';
import { Settings, ShieldCheck, Activity, Database } from 'lucide-react';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity },
  { key: 'caps', label: 'Sector Caps', icon: Settings },
  { key: 'utilization', label: 'Utilization', icon: Database },
  { key: 'audits', label: 'Audits', icon: ShieldCheck },
];

export default function AdminHeader({ activeTab, onChangeTab }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-500 text-white font-bold">
              ₹
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">TaxFlow Admin</h1>
              <p className="text-xs text-slate-500">Controls, audits and transparency</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {tabs.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => onChangeTab(key)}
                  className={`group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} className={active ? 'opacity-100' : 'opacity-70'} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
