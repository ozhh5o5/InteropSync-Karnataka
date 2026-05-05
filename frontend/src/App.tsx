import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight, LayoutDashboard, AlertTriangle, Activity,
  Shield, Server, FileCode2, Inbox, WifiOff, HeartPulse,
} from 'lucide-react'
import SyncDashboard from './pages/SyncDashboard'
import ConflictResolution from './pages/ConflictResolution'
import AuditTrail from './pages/AuditTrail'
import IntegrationEngine from './pages/IntegrationEngine'
import SchemaTranslation from './pages/SchemaTranslation'
import DeadLetterQueue from './pages/DeadLetterQueue'
import OfflineSync from './pages/OfflineSync'
import HealthDashboard from './pages/HealthDashboard'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/integration-engine', label: 'Integration Engine', icon: Server },
  { to: '/schema-translation', label: 'Schema Translation', icon: FileCode2 },
  { to: '/conflicts', label: 'Conflict Resolution', icon: AlertTriangle },
  { to: '/audit-trail', label: 'Audit Trail', icon: Shield },
  { to: '/dead-letter-queue', label: 'Dead Letter Queue', icon: Inbox },
  { to: '/offline-sync', label: 'Offline Sync', icon: WifiOff },
  { to: '/health', label: 'Health & SLA', icon: HeartPulse },
]

export default function App() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen bg-[#060a14]">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ArrowLeftRight className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">InteropSync</h1>
              <p className="text-[10px] text-amber-500/80 font-semibold tracking-widest uppercase">Karnataka</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400">SWS ↔ 5 Departments</span>
          </div>
        </div>

        <nav className="py-3">
          <p className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigation</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <p className="text-[10px] text-slate-500 text-center">
            PanIIT AI for Bharat 2026
          </p>
          <p className="text-[10px] text-slate-600 text-center mt-0.5">
            Theme 2 — SWS Interoperability
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[260px] min-h-screen">
        <header className="sticky top-0 z-40 px-8 py-4 border-b border-white/5 bg-[#060a14]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {navItems.find(n => n.to === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Self-Healing Semantic Middleware for Government Interoperability
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">System Operational</span>
            </div>
          </div>
        </header>

        <div className="p-8 page-enter" key={location.pathname}>
          <Routes>
            <Route path="/" element={<SyncDashboard />} />
            <Route path="/integration-engine" element={<IntegrationEngine />} />
            <Route path="/schema-translation" element={<SchemaTranslation />} />
            <Route path="/conflicts" element={<ConflictResolution />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/dead-letter-queue" element={<DeadLetterQueue />} />
            <Route path="/offline-sync" element={<OfflineSync />} />
            <Route path="/health" element={<HealthDashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
