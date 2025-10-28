import { useMemo, useState } from 'react';
import { Home, Receipt, SlidersHorizontal, User as UserIcon, LogOut } from 'lucide-react';

export default function Header({ route, onRouteChange, user, onLogin, onRegister, onLogout }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  return (
    <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold">₹</span>
          <span className="text-lg font-semibold">TaxPay India</span>
        </div>

        <nav className="flex items-center gap-1 text-sm">
          <NavBtn active={route === 'calculator'} onClick={() => onRouteChange('calculator')} icon={Home}>
            Calculator
          </NavBtn>
          <NavBtn active={route === 'allocation'} onClick={() => onRouteChange('allocation')} icon={SlidersHorizontal}>
            Allocation
          </NavBtn>
          <NavBtn active={route === 'receipts'} onClick={() => onRouteChange('receipts')} icon={Receipt}>
            Receipts
          </NavBtn>
        </nav>

        {!user ? (
          <button
            onClick={() => {
              setMode('login');
              setAuthOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
          >
            <UserIcon className="h-4 w-4" /> Sign in
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>

      {authOpen && (
        <AuthModal
          mode={mode}
          onClose={() => setAuthOpen(false)}
          onSwitchMode={(m) => setMode(m)}
          onLogin={onLogin}
          onRegister={onRegister}
        />
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 ${
        active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

function AuthModal({ mode, onClose, onSwitchMode, onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pan, setPan] = useState('');
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await onRegister({ email, password, name, pan: pan.toUpperCase() });
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isRegister ? 'Create account' : 'Sign in'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="text-sm text-slate-600">Full name</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {isRegister && (
            <div>
              <label className="text-sm text-slate-600">PAN (ABCDE1234F)</label>
              <input
                className="mt-1 w-full uppercase rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
                title="Enter valid PAN"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">
            {isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <div className="mt-3 text-center text-sm text-slate-600">
          {isRegister ? (
            <button className="underline" onClick={() => onSwitchMode('login')}>Have an account? Sign in</button>
          ) : (
            <button className="underline" onClick={() => onSwitchMode('register')}>New here? Create account</button>
          )}
        </div>
      </div>
    </div>
  );
}
