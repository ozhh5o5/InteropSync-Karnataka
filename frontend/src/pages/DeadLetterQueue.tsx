import { useState } from 'react'
import { Inbox, RotateCcw, Trash2, CheckCircle2, XCircle, Clock, AlertTriangle, Shield } from 'lucide-react'
import { MOCK_DEAD_LETTER, DEPT_LABELS } from '../data/mock-data'
import type { DeadLetterItem } from '../data/mock-data'

const statusCfg: Record<string, { cls: string; label: string }> = {
  exhausted: { cls: 'badge-danger', label: 'Exhausted' },
  replayed: { cls: 'badge-success', label: 'Replayed' },
  discarded: { cls: 'badge-neutral', label: 'Discarded' },
}

export default function DeadLetterQueue() {
  const [items, setItems] = useState<DeadLetterItem[]>([...MOCK_DEAD_LETTER])

  function handleReplay(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'replayed' as const } : i))
  }
  function handleDiscard(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'discarded' as const } : i))
  }

  const exhausted = items.filter(i => i.status === 'exhausted').length
  const replayed = items.filter(i => i.status === 'replayed').length
  const discarded = items.filter(i => i.status === 'discarded').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dead Letter Queue</h1>
        <p className="text-sm text-slate-400 mt-1">Retry-exhausted propagation events — replay or discard with full audit logging</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Exhausted', value: exhausted, color: 'text-rose-400', icon: XCircle },
          { label: 'Replayed', value: replayed, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Discarded', value: discarded, color: 'text-slate-400', icon: Trash2 },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card ${i === 0 ? 'rose' : i === 1 ? 'emerald' : 'cyan'} animate-fade-in-up stagger-${i + 1}`}>
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const st = statusCfg[item.status] || statusCfg.exhausted
          return (
            <div key={item.id} className={`glass-card overflow-hidden animate-fade-in-up stagger-${Math.min(i + 1, 6)} ${item.status !== 'exhausted' ? 'opacity-60' : ''}`}>
              <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Inbox className="h-4 w-4 text-rose-400" />
                  <span className="text-sm font-semibold text-white">{(DEPT_LABELS as Record<string,string>)[item.department] || item.department}</span>
                  <span className="font-mono text-xs text-slate-500">{item.ubid}</span>
                  <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded">{item.event_type}</span>
                </div>
                <span className={`badge ${st.cls}`}>{st.label}</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="glass-panel p-3">
                  <p className="text-xs text-rose-400 font-medium mb-1">Error Message</p>
                  <p className="text-sm text-slate-300 font-mono">{item.error_message}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span><Clock className="h-3 w-3 inline mr-1" />Attempts: <strong className="text-slate-300">{item.attempts}/{item.max_attempts}</strong></span>
                  <span>First: {new Date(item.first_attempt).toLocaleString()}</span>
                  <span>Last: {new Date(item.last_attempt).toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Hash: <code className="font-mono text-amber-500/60">{item.payload_hash.slice(0, 16)}…</code></span>
                </div>
                {/* Retry timeline */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: item.max_attempts }, (_, idx) => (
                    <div key={idx} className={`h-2 flex-1 rounded-full ${idx < item.attempts ? 'bg-rose-500/60' : 'bg-white/5'}`} title={`Attempt ${idx + 1}: ${idx < item.attempts ? 'Failed' : 'Not attempted'}`} />
                  ))}
                </div>
                {item.status === 'exhausted' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleReplay(item.id)} className="btn-primary text-xs py-1.5 px-3"><RotateCcw className="h-3.5 w-3.5" />Replay</button>
                    <button onClick={() => handleDiscard(item.id)} className="btn-secondary text-xs py-1.5 px-3"><Trash2 className="h-3.5 w-3.5" />Discard</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
