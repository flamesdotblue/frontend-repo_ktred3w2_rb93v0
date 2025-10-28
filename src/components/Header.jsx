import { User, ShieldCheck, Home } from "lucide-react";

export default function Header({ onNavigate, current }) {
  const tabs = [
    { key: "calculator", label: "Tax Calculator", icon: Home },
    { key: "allocation", label: "Allocation", icon: ShieldCheck },
    { key: "utilization", label: "Utilization", icon: User },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">₹</div>
          <div className="leading-tight">
            <h1 className="font-semibold text-slate-900">Tax Transparency</h1>
            <p className="text-xs text-slate-500">See where every rupee goes</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                current === key
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
