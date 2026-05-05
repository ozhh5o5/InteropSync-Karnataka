import { Wifi, WifiOff, Clock, CheckCircle2, AlertTriangle, MapPin, GitBranch } from 'lucide-react'
import { MOCK_OFFLINE_QUEUE } from '../data/mock-data'

const connCfg: Record<string, { cls: string; icon: typeof Wifi; label: string }> = {
  online: { cls: 'badge-success', icon: Wifi, label: 'Online' },
  offline: { cls: 'badge-danger', icon: WifiOff, label: 'Offline' },
  intermittent: { cls: 'badge-warning', icon: Wifi, label: 'Intermittent' },
}

const statusCfg: Record<string, { cls: string; icon: typeof CheckCircle2 }> = {
  synced: { cls: 'badge-success', icon: CheckCircle2 },
  queued: { cls: 'badge-warning', icon: Clock },
  conflict: { cls: 'badge-danger', icon: AlertTriangle },
}

export default function OfflineSync() {
  const items = MOCK_OFFLINE_QUEUE
  const synced = items.filter(i => i.status === 'synced').length
  const queued = items.filter(i => i.status === 'queued').length
  const conflicts = items.filter(i => i.status === 'conflict').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Offline-First Sync</h1>
        <p className="text-sm text-slate-400 mt-1">Rural district offices queue updates locally — auto-sync on connectivity restore via vector clocks</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Synced', value: synced, color: 'text-emerald-400', accent: 'emerald' },
          { label: 'Queued', value: queued, color: 'text-amber-400', accent: 'amber' },
          { label: 'Conflicts', value: conflicts, color: 'text-rose-400', accent: 'rose' },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card ${s.accent} animate-fade-in-up stagger-${i + 1}`}>
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const conn = connCfg[item.connectivity] || connCfg.offline
          const ConnIcon = conn.icon
          const st = statusCfg[item.status] || statusCfg.queued
          const StIcon = st.icon
          return (
            <div key={item.id} className={`glass-card overflow-hidden animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-white">{item.district_office}</span>
                  <span className="font-mono text-xs text-slate-500">{item.ubid}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${conn.cls}`}><ConnIcon className="h-3 w-3" />{conn.label}</span>
                  <span className={`badge ${st.cls}`}><StIcon className="h-3 w-3" />{item.status}</span>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Event: <strong className="text-slate-300">{item.event_type}</strong></span>
                  <span>Queued: {new Date(item.queued_at).toLocaleString()}</span>
                  {item.synced_at && <span>Synced: <span className="text-emerald-400">{new Date(item.synced_at).toLocaleString()}</span></span>}
                </div>
                {/* Vector Clock */}
                <div className="glass-panel p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="h-3.5 w-3.5 text-cyan-500" />
                    <p className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest">Vector Clock</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(item.vector_clock).map(([node, counter]) => (
                      <div key={node} className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">{node}:</span>
                        <span className="font-mono text-sm font-bold text-cyan-400">{counter}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">Vector clocks detect and resolve ordering conflicts without data loss or duplication</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
