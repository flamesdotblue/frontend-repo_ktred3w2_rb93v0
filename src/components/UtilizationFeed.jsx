import { CheckCheck, MapPin, Shield } from "lucide-react";

const MOCK = [
  {
    id: "p1",
    sector: "Education",
    title: "Smart Classrooms Upgrade - Govt School Cluster",
    location: "Pune, Maharashtra",
    vendor: "EduTech Solutions Pvt Ltd",
    amount: 250000,
    auditedAt: "2025-06-12",
    milestones: ["Procurement", "Installation", "Teacher Training"],
    links: [
      { label: "Utilization Report", url: "https://example.com/edu-report" },
      { label: "Invoice Snapshot", url: "https://example.com/edu-invoice" },
    ],
  },
  {
    id: "p2",
    sector: "Healthcare",
    title: "PHC Diagnostics Equipment Upgrade",
    location: "Kochi, Kerala",
    vendor: "MediServe Ltd",
    amount: 180000,
    auditedAt: "2025-07-02",
    milestones: ["PO Issued", "Delivery", "Commissioning"],
    links: [
      { label: "Utilization Report", url: "https://example.com/health-report" },
      { label: "Invoice Snapshot", url: "https://example.com/health-invoice" },
    ],
  },
];

function formatINR(n) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function UtilizationFeed() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Verified Utilization Feed</h2>
          <div className="text-xs text-slate-600 flex items-center gap-1"><Shield size={14} /> Last audited: Jul 2025</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {MOCK.map((p) => (
            <article key={p.id} className="border rounded-lg p-4">
              <div className="text-xs text-slate-500">{p.sector}</div>
              <h3 className="font-semibold">{p.title}</h3>
              <div className="text-sm text-slate-600 flex items-center gap-1 mt-1"><MapPin size={14} /> {p.location}</div>
              <div className="text-sm mt-2">Vendor: <span className="text-slate-700">{p.vendor}</span></div>
              <div className="text-sm">Amount Utilized: ₹{formatINR(p.amount)}</div>
              <div className="text-xs text-slate-500">Audited: {new Date(p.auditedAt).toLocaleDateString()}</div>
              <ul className="flex flex-wrap gap-2 mt-3">
                {p.links.map((l, i) => (
                  <li key={i}><a href={l.url} target="_blank" rel="noreferrer" className="text-indigo-700 underline text-sm">{l.label}</a></li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm"><CheckCheck size={16} /> {p.milestones.join(" · ")}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
