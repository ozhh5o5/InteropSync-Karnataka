import { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight, PenLine, Shield } from 'lucide-react'
import { MOCK_CONFLICTS, MOCK_CONFLICT_STATS } from '../data/mock-data'
import type { Conflict } from '../data/mock-data'

const sevCfg: Record<string, { cls: string; icon: typeof AlertTriangle }> = {
  critical: { cls: 'badge-danger', icon: AlertCircle },
  warning: { cls: 'badge-warning', icon: AlertTriangle },
  info: { cls: 'badge-info', icon: Info },
}

export default function ConflictResolution() {
  const [conflicts, setConflicts] = useState<Conflict[]>([...MOCK_CONFLICTS])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [manualEntries, setManualEntries] = useState<Record<string, string>>({})
  const [showManualFor, setShowManualFor] = useState<string | null>(null)
  const stats = MOCK_CONFLICT_STATS

  function handleResolve(conflict: Conflict, value: string) {
    setConflicts(prev => prev.map(c => c.id === conflict.id
      ? { ...c, status: 'resolved' as const, resolved_value: value, resolution_notes: notes[c.id] || '', resolved_at: new Date().toISOString() }
      : c
    ))
    setShowManualFor(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Conflict Resolution</h1>
        <p className="text-sm text-slate-400 mt-1">Review and resolve data conflicts between SWS and department records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-300' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-400' },
          { label: 'Unresolved', value: stats.unresolved, color: 'text-rose-400' },
          { label: 'Critical', value: stats.by_severity.critical, color: 'text-rose-400' },
          { label: 'Warnings', value: stats.by_severity.warning, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={s.label} className={`glass-panel p-4 animate-fade-in-up stagger-${i + 1}`}>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Conflicts */}
      <div className="space-y-4">
        {conflicts.map((conflict, i) => {
          const isResolved = conflict.status === 'resolved'
          const sev = sevCfg[conflict.severity] || sevCfg.info
          const SevIcon = sev.icon
          return (
            <div key={conflict.id} className={`glass-card overflow-hidden animate-fade-in-up stagger-${Math.min(i + 1, 6)} ${isResolved ? 'opacity-60' : ''}`}>
              <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`badge ${sev.cls}`}><SevIcon className="h-3 w-3" />{conflict.severity}</span>
                  <span className="text-sm font-semibold text-white">{conflict.field_name}</span>
                  <span className="text-xs text-slate-500 font-mono">{conflict.ubid}</span>
                  <span className="text-xs text-slate-500">{conflict.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  {conflict.resolution_policy && (
                    <span className="badge badge-violet"><Shield className="h-3 w-3" />{conflict.resolution_policy}</span>
                  )}
                  {isResolved
                    ? <span className="badge badge-success"><CheckCircle2 className="h-3 w-3" />Resolved</span>
                    : <span className="badge badge-warning"><AlertTriangle className="h-3 w-3" />Unresolved</span>
                  }
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="px-5 py-4 border-r border-white/5">
                  <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1">SWS Value</p>
                  <p className="text-sm font-mono text-slate-300 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">{conflict.sws_value}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest mb-1">Department Value</p>
                  <p className="text-sm font-mono text-slate-300 bg-cyan-500/5 p-2.5 rounded-lg border border-cyan-500/10">{conflict.dept_value}</p>
                </div>
              </div>

              {!isResolved && (
                <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 space-y-3">
                  <input type="text" value={notes[conflict.id] || ''} onChange={e => setNotes(prev => ({ ...prev, [conflict.id]: e.target.value }))} placeholder="Resolution notes..." className="input-field" />
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => handleResolve(conflict, conflict.sws_value)} className="btn-primary text-xs py-2 px-3"><ArrowRight className="h-3.5 w-3.5" />Use SWS Value</button>
                    <button onClick={() => handleResolve(conflict, conflict.dept_value)} className="btn-cyan text-xs py-2 px-3"><ArrowRight className="h-3.5 w-3.5" />Use Dept Value</button>
                    <button onClick={() => setShowManualFor(showManualFor === conflict.id ? null : conflict.id)} className="btn-secondary text-xs py-2 px-3"><PenLine className="h-3.5 w-3.5" />Manual Entry</button>
                  </div>
                  {showManualFor === conflict.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <input type="text" value={manualEntries[conflict.id] || ''} onChange={e => setManualEntries(prev => ({ ...prev, [conflict.id]: e.target.value }))} placeholder="Enter resolved value..." className="input-field flex-1" />
                      <button onClick={() => handleResolve(conflict, manualEntries[conflict.id] || '')} disabled={!manualEntries[conflict.id]} className="btn-primary text-xs py-2 px-3">Apply</button>
                    </div>
                  )}
                </div>
              )}

              {isResolved && conflict.resolved_value && (
                <div className="px-5 py-3 bg-emerald-500/5 border-t border-emerald-500/10 text-sm">
                  <span className="font-medium text-emerald-400">Resolved: </span>
                  <span className="font-mono text-emerald-300">{conflict.resolved_value}</span>
                  {conflict.resolution_notes && <span className="text-emerald-500/70 ml-2">— {conflict.resolution_notes}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
