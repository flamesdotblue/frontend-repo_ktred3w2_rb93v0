import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import TaxCalculator from './components/TaxCalculator';
import Allocation from './components/Allocation';
import ReceiptHistory from './components/ReceiptHistory';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function App() {
  const [route, setRoute] = useState('calculator');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);

  // Calculator state
  const [income, setIncome] = useState(1200000);
  const [deductions, setDeductions] = useState({
    sec80C: 150000,
    sec80D: 25000,
    nps: 50000,
    hra: 0,
  });
  const [regime, setRegime] = useState('suggested'); // 'old' | 'new' | 'suggested'
  const [taxResult, setTaxResult] = useState({ taxOld: 0, taxNew: 0, suggested: 'new' });

  // Allocation state (percentages)
  const [allocation, setAllocation] = useState({
    education: 25,
    healthcare: 25,
    infrastructure: 25,
    defense: 15,
    other: 10,
  });

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/me`, { headers: { ...authHeaders } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => {
        setUser(null);
        setToken('');
        localStorage.removeItem('token');
      });
  }, [token]);

  // Fetch saved allocation on login
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/allocations`, { headers: { ...authHeaders } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data && data.sectors && Object.keys(data.sectors).length) {
          setAllocation(data.sectors);
        }
      })
      .catch(() => {});
  }, [token]);

  const handleLogin = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
  };

  const handleRegister = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    // auto-login
    await handleLogin(payload.email, payload.password);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header
        route={route}
        onRouteChange={setRoute}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {route === 'calculator' && (
          <TaxCalculator
            income={income}
            setIncome={setIncome}
            deductions={deductions}
            setDeductions={setDeductions}
            regime={regime}
            setRegime={setRegime}
            taxResult={taxResult}
            setTaxResult={setTaxResult}
          />
        )}

        {route === 'allocation' && (
          <Allocation
            income={income}
            taxResult={taxResult}
            allocation={allocation}
            setAllocation={setAllocation}
            token={token}
            authHeaders={authHeaders}
            apiBase={API_BASE}
          />)
        }

        {route === 'receipts' && (
          <ReceiptHistory
            token={token}
            authHeaders={authHeaders}
            apiBase={API_BASE}
            regime={regime === 'suggested' ? taxResult.suggested : regime}
            allocation={allocation}
            taxResult={taxResult}
          />
        )}
      </main>

      <footer className="border-t bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500 flex items-center justify-between">
          <p>Made for Indian taxpayers — secure, transparent, and auditable.</p>
          <p>Payments: Demo-ready. Add Razorpay keys in backend env to go live.</p>
        </div>
      </footer>
    </div>
  );
}
