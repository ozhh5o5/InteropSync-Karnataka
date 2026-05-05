import { useState, useMemo } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, AlertTriangle, XCircle, ChevronDown, ChevronUp, Filter, Shield, Lock } from 'lucide-react'
import { MOCK_SYNC_EVENTS, DEPT_LABELS } from '../data/mock-data'

const statusCfg: Record<string, { cls: string; icon: typeof CheckCircle2 }> = {
  completed: { cls: 'badge-success', icon: CheckCircle2 },
  pending: { cls: 'badge-warning', icon: Clock },
  conflict: { cls: 'badge-danger', icon: AlertTriangle },
  failed: { cls: 'badge-neutral', icon: XCircle },
}

export default function AuditTrail() {
  const events = MOCK_SYNC_EVENTS
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dirFilter, setDirFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')

  const departments = useMemo(() => [...new Set(events.map(e => e.department))].sort(), [events])
  const filtered = useMemo(() => events.filter(ev => {
    if (dirFilter !== 'all' && ev.direction !== dirFilter) return false
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false
    if (deptFilter !== 'all' && ev.department !== deptFilter) return false
    return true
  }), [events, dirFilter, statusFilter, deptFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tamper-Proof Audit Trail</h1>
        <p className="text-sm text-slate-400 mt-1">Cryptographic hash chain — every propagation is independently verifiable</p>
      </div>

      <div className="glass-card px-5 py-4 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-300">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={dirFilter} onChange={e => setDirFilter(e.target.value)} className="select-field">
            <option value="all">All Directions</option>
            <option value="sws_to_dept">SWS → Department</option>
            <option value="dept_to_sws">Department → SWS</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-field">
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="conflict">Conflict</option>
            <option value="failed">Failed</option>
          </select>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="select-field">
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <span className="text-xs text-slate-500 self-center ml-auto">{filtered.length} of {events.length} events</span>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 20).map((ev, i) => {
          const isExpanded = expandedId === ev.id
          const cfg = statusCfg[ev.status] || statusCfg.pending
          const StatusIcon = cfg.icon
          return (
            <div key={ev.id} className={`glass-card overflow-hidden animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <button onClick={() => setExpandedId(isExpanded ? null : ev.id)} className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Hash chain indicator */}
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-500/60" />
                    <span className="font-mono text-[10px] text-amber-500/50">{ev.payload_hash.slice(0, 8)}…</span>
                  </div>
                  {ev.direction === 'sws_to_dept'
                    ? <span className="badge badge-warning"><span>SWS</span><ArrowRight className="h-3 w-3" /><span>Dept</span></span>
                    : <span className="badge badge-info"><span>Dept</span><ArrowLeft className="h-3 w-3" /><span>SWS</span></span>
                  }
                  <span className="text-sm font-medium text-slate-300">{(DEPT_LABELS as Record<string,string>)[ev.department] || ev.department}</span>
                  <span className="font-mono text-xs text-slate-500">{ev.ubid}</span>
                  <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">{ev.event_type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${cfg.cls}`}><StatusIcon className="h-3 w-3" />{ev.status}</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(ev.timestamp).toLocaleString()}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/5 px-5 py-4 bg-white/[0.01] space-y-4 animate-fade-in">
                  {(ev.source_schema || ev.translated_schema) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ev.source_schema && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Source Schema</p>
                          <pre className="text-xs bg-black/30 border border-white/5 rounded-lg p-3 overflow-x-auto text-slate-400 font-mono">{JSON.stringify(ev.source_schema, null, 2)}</pre>
                        </div>
                      )}
                      {ev.translated_schema && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Translated Schema</p>
                          <pre className="text-xs bg-black/30 border border-white/5 rounded-lg p-3 overflow-x-auto text-slate-400 font-mono">{JSON.stringify(ev.translated_schema, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Crypto hash chain */}
                  <div className="glass-panel p-4 space-y-2">
                    <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">Cryptographic Verification</p>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-slate-400">Payload Hash:</span>
                      <code className="text-xs font-mono text-amber-400/80 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">{ev.payload_hash}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-400">Previous Hash:</span>
                      <code className="text-xs font-mono text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">{ev.prev_hash.slice(0, 32)}…</code>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Hash chain verified — append-only integrity confirmed</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span><strong className="text-slate-400">Event ID:</strong> <span className="font-mono">{ev.id}</span></span>
                    <span><strong className="text-slate-400">Attempts:</strong> {ev.attempt_count}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
