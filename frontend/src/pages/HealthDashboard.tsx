import { HeartPulse, CheckCircle2, AlertTriangle, XCircle, Activity, Clock, Inbox, AlertCircle } from 'lucide-react'
import { MOCK_DEPT_HEALTH, DEPT_LABELS, LATENCY_HISTORY } from '../data/mock-data'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const statusCfg: Record<string, { cls: string; icon: typeof CheckCircle2; label: string }> = {
  healthy: { cls: 'badge-success', icon: CheckCircle2, label: 'Healthy' },
  degraded: { cls: 'badge-warning', icon: AlertTriangle, label: 'Degraded' },
  down: { cls: 'badge-danger', icon: XCircle, label: 'Down' },
}

const DEPT_COLORS: Record<string, string> = {
  labour: '#f59e0b', kspcb: '#10b981', commercial_tax: '#06b6d4', factories: '#8b5cf6', fire_safety: '#f43f5e',
}

export default function HealthDashboard() {
  const depts = MOCK_DEPT_HEALTH

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Department Health & SLA Monitoring</h1>
        <p className="text-sm text-slate-400 mt-1">Live command center — sync health, latency percentiles, failure rates, and SLA breach alerts</p>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {depts.map((dept, i) => {
          const st = statusCfg[dept.status] || statusCfg.healthy
          const StIcon = st.icon
          return (
            <div key={dept.department} className={`glass-card overflow-hidden dept-${dept.department} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4" style={{ color: DEPT_COLORS[dept.department] }} />
                  <h3 className="text-sm font-semibold text-white">{DEPT_LABELS[dept.department]}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {dept.sla_breach && <span className="badge badge-danger"><AlertCircle className="h-3 w-3" />SLA Breach</span>}
                  <span className={`badge ${st.cls}`}><StIcon className="h-3 w-3" />{st.label}</span>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                {/* Latency */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Propagation Latency (ms)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'p50', value: dept.latency_p50 },
                      { label: 'p95', value: dept.latency_p95 },
                      { label: 'p99', value: dept.latency_p99 },
                    ].map(l => (
                      <div key={l.label} className="glass-panel p-2 text-center">
                        <p className="text-[10px] text-slate-500">{l.label}</p>
                        <p className={`text-lg font-bold ${l.value > 1000 ? 'text-rose-400' : l.value > 500 ? 'text-amber-400' : 'text-emerald-400'}`}>{l.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-400">Failure Rate:</span>
                    <span className={`font-bold ${dept.failure_rate > 10 ? 'text-rose-400' : dept.failure_rate > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>{dept.failure_rate}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-400">Conflicts:</span>
                    <span className="font-bold text-slate-300">{dept.pending_conflicts}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Inbox className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-400">DLQ Depth:</span>
                    <span className="font-bold text-slate-300">{dept.dlq_depth}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-400">Volume 24h:</span>
                    <span className="font-bold text-slate-300">{dept.sync_volume_24h}</span>
                  </div>
                </div>
                {/* Uptime bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Uptime</span>
                    <span className={`font-bold ${dept.uptime_pct > 99 ? 'text-emerald-400' : dept.uptime_pct > 95 ? 'text-amber-400' : 'text-rose-400'}`}>{dept.uptime_pct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${dept.uptime_pct > 99 ? 'bg-emerald-500' : dept.uptime_pct > 95 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${dept.uptime_pct}%` }} />
                  </div>
                </div>
                <div className="text-[10px] text-slate-600">
                  Schema Drift: <span className={`font-bold ${dept.schema_drift_score > 0.1 ? 'text-amber-400' : 'text-slate-400'}`}>{(dept.schema_drift_score * 100).toFixed(1)}%</span>
                  {' · '}Last Sync: {new Date(dept.last_sync).toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Latency Chart */}
      <div className="glass-card p-6 animate-fade-in-up stagger-6">
        <h2 className="text-base font-semibold text-white mb-4">24-Hour Latency Trend (p50, ms)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={LATENCY_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {Object.entries(DEPT_COLORS).map(([dept, color]) => (
                <Line key={dept} type="monotone" dataKey={dept} stroke={color} strokeWidth={2} dot={false} name={DEPT_LABELS[dept as keyof typeof DEPT_LABELS]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
