import { useState } from 'react'
import { RefreshCw, ArrowRight, ArrowLeft, CheckCircle2, Clock, AlertTriangle, XCircle, Database, Building2, ArrowLeftRight, Loader2, Activity } from 'lucide-react'
import { MOCK_APPLICATIONS, MOCK_SYNC_EVENTS, MOCK_CONFLICT_STATS, DEPT_LABELS } from '../data/mock-data'
import type { Application, SyncEvent } from '../data/mock-data'

const statusCfg: Record<string, { cls: string; icon: typeof CheckCircle2 }> = {
  completed: { cls: 'badge-success', icon: CheckCircle2 },
  pending: { cls: 'badge-warning', icon: Clock },
  conflict: { cls: 'badge-danger', icon: AlertTriangle },
  failed: { cls: 'badge-neutral', icon: XCircle },
  approved: { cls: 'badge-success', icon: CheckCircle2 },
  submitted: { cls: 'badge-info', icon: Clock },
  pending_dept: { cls: 'badge-warning', icon: Clock },
  in_progress: { cls: 'badge-info', icon: Activity },
}

function Badge({ status }: { status: string }) {
  const c = statusCfg[status] || statusCfg.pending
  const I = c.icon
  return <span className={`badge ${c.cls}`}><I className="h-3 w-3" />{status.replace('_', ' ')}</span>
}

function DirArrow({ direction }: { direction: string }) {
  return direction === 'sws_to_dept'
    ? <span className="badge badge-warning"><span>SWS</span><ArrowRight className="h-3 w-3" /><span>Dept</span></span>
    : <span className="badge badge-info"><span>Dept</span><ArrowLeft className="h-3 w-3" /><span>SWS</span></span>
}

export default function SyncDashboard() {
  const [syncing, setSyncing] = useState(false)
  const apps = MOCK_APPLICATIONS
  const events = MOCK_SYNC_EVENTS.slice(0, 15)
  const stats = MOCK_CONFLICT_STATS

  const totalApps = apps.length
  const syncedDepts = new Set(MOCK_SYNC_EVENTS.filter(e => e.status === 'completed').map(e => e.department)).size
  const pendingSyncs = MOCK_SYNC_EVENTS.filter(e => e.status === 'pending').length
  const unresolvedConflicts = stats.unresolved

  function handleSync() {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sync Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor SWS ↔ Department synchronization at a glance</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn-primary">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sync All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: totalApps, icon: Database, color: 'amber' },
          { label: 'Synced Departments', value: syncedDepts, icon: Building2, color: 'emerald' },
          { label: 'Pending Syncs', value: pendingSyncs, icon: Clock, color: 'cyan' },
          { label: 'Unresolved Conflicts', value: unresolvedConflicts, icon: AlertTriangle, color: 'rose' },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card ${s.color} animate-fade-in-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <s.icon className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sync Events */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-5">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-semibold text-white">Recent Sync Events</h2>
          <span className="ml-auto text-xs text-slate-500">{MOCK_SYNC_EVENTS.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Direction</th><th>Department</th><th>UBID</th><th>Type</th><th>Status</th><th>Timestamp</th>
            </tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td><DirArrow direction={ev.direction} /></td>
                  <td className="font-medium text-slate-300">{(DEPT_LABELS as Record<string, string>)[ev.department] || ev.department}</td>
                  <td className="font-mono text-xs text-slate-500">{ev.ubid}</td>
                  <td><span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">{ev.event_type}</span></td>
                  <td><Badge status={ev.status} /></td>
                  <td className="text-xs text-slate-500">{new Date(ev.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-6">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Database className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-semibold text-white">Applications</h2>
          <span className="ml-auto text-xs text-slate-500">{apps.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>UBID</th><th>Entity Name</th><th>Status</th><th>Departments</th><th>Created</th>
            </tr></thead>
            <tbody>
              {apps.slice(0, 10).map(app => (
                <tr key={app.id}>
                  <td className="font-mono text-xs text-amber-500/70">{app.ubid}</td>
                  <td className="font-medium text-slate-300">{app.entity_name}</td>
                  <td><Badge status={app.status} /></td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {app.department_records.slice(0, 3).map(d => (
                        <span key={d.id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{d.department}</span>
                      ))}
                      {app.department_records.length > 3 && <span className="text-[10px] text-slate-600">+{app.department_records.length - 3}</span>}
                    </div>
                  </td>
                  <td className="text-xs text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
