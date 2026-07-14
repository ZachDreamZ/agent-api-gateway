import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Overview from './pages/Overview';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';
import Landing from './pages/AuraLanding';
import Docs from './pages/Docs';

// ─── SVG Icons ───

function IconOverview({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconKeys({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconBilling({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconDocs({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconMenu({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChevronRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── SVG Logo Mark ───

function LogoMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

// ─── User Info ───

interface UserInfo {
  tier: string;
  queries_per_month: number;
}

function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  useEffect(() => {
    fetch('/v1/billing/current')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<UserInfo>;
      })
      .then(setUser)
      .catch(() => {});
  }, []);
  return user;
}

// ─── Nav Items ───

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: IconOverview },
  { path: '/dashboard/api-keys', label: 'API Keys', icon: IconKeys },
  { path: '/dashboard/billing', label: 'Billing', icon: IconBilling },
];

// ─── Sidebar ───

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-white/10 bg-[#0c0c0c]">
      <Link to="/" className="flex items-center gap-2.5 px-5 pt-5 pb-4 text-white/50 hover:text-white transition-colors" onClick={onNavigate}>
        <LogoMark className="w-5 h-5 text-brand-400" />
        <span className="text-sm font-semibold tracking-tight">AgentAPI</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                isActive
                  ? 'bg-brand-600/15 text-brand-400'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-400' : 'text-white/30 group-hover:text-white/50'}`} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-0.5 h-5 rounded-r bg-brand-400"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <Link to="/docs" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors" onClick={onNavigate}>
          <IconDocs className="w-3.5 h-3.5" />
          API Docs
        </Link>
        <p className="mt-1.5 text-[10px] text-white/20 font-medium tracking-wider uppercase">v0.1</p>
      </div>
    </aside>
  );
}

// ─── Mobile Header ───

function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#0c0c0c]/80 px-4 backdrop-blur-xl lg:hidden">
      <Link to="/" className="flex items-center gap-2">
        <LogoMark className="w-5 h-5 text-brand-400" />
        <span className="text-sm font-semibold tracking-tight text-white">AgentAPI</span>
      </Link>
      <button
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <IconMenu />
      </button>
    </div>
  );
}

// ─── Mobile Sidebar Overlay ───

function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <Sidebar onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── User Bar ───

function UserBar({ user }: { user: UserInfo | null }) {
  if (!user) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex items-center gap-3 rounded-xl glass-card px-4 py-3"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/20">
        <span className="text-xs font-bold text-brand-400">{user.tier.charAt(0).toUpperCase()}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-white">{user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Plan</p>
        <p className="text-xs text-white/40">{user.queries_per_month.toLocaleString()} queries this month</p>
      </div>
      <Link
        to="/dashboard/billing"
        className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/70"
      >
        Manage
        <IconChevronRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}

// ─── Dashboard Layout ───

function DashboardLayout() {
  const user = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white selection:bg-brand-aura/30">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <MobileHeader onMenuOpen={() => setMobileMenuOpen(true)} />

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main content */}
      <main className="min-h-screen lg:ml-60">
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-12 lg:px-8 lg:pt-8">
          <UserBar user={user} />
          <Routes>
            <Route index element={<Overview />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="billing" element={<Billing />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ─── App ───

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
