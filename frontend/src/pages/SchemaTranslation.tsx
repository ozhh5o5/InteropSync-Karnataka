import { ArrowRight, FileCode2, GitBranch } from 'lucide-react'
import { DEPARTMENTS, DEPT_LABELS, SCHEMA_MAPPINGS, STATUS_TRANSLATIONS } from '../data/mock-data'
import type { DeptName } from '../data/mock-data'
import { useState } from 'react'

const deptColors: Record<DeptName, string> = {
  labour: 'border-amber-500/30 bg-amber-500/5',
  kspcb: 'border-emerald-500/30 bg-emerald-500/5',
  commercial_tax: 'border-cyan-500/30 bg-cyan-500/5',
  factories: 'border-violet-500/30 bg-violet-500/5',
  fire_safety: 'border-rose-500/30 bg-rose-500/5',
}

export default function SchemaTranslation() {
  const [selectedDept, setSelectedDept] = useState<DeptName>('labour')
  const mapping = SCHEMA_MAPPINGS[selectedDept]
  const statusMap = STATUS_TRANSLATIONS[selectedDept]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Schema Translation Layer</h1>
        <p className="text-sm text-slate-400 mt-1">Configurable per-department field and value translation — version-controlled, bidirectional</p>
      </div>

      {/* Department selector */}
      <div className="flex flex-wrap gap-2">
        {DEPARTMENTS.map(dept => (
          <button key={dept} onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDept === dept ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}>
            {DEPT_LABELS[dept]}
          </button>
        ))}
      </div>

      {/* Field Mapping Table */}
      <div className="glass-card overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-semibold text-white">Field Mapping — {DEPT_LABELS[selectedDept]}</h2>
          <span className="ml-auto badge badge-neutral"><GitBranch className="h-3 w-3" />v1.0</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>SWS Field</th><th></th><th>{DEPT_LABELS[selectedDept]} Field</th><th>Transform</th>
            </tr></thead>
            <tbody>
              {Object.entries(mapping).map(([swsField, deptField]) => (
                <tr key={swsField}>
                  <td>
                    <span className="font-mono text-sm text-amber-400/80 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">{swsField}</span>
                  </td>
                  <td className="text-center"><ArrowRight className="h-4 w-4 text-slate-500 mx-auto" /></td>
                  <td>
                    <span className={`font-mono text-sm text-slate-300 px-2 py-1 rounded border ${deptColors[selectedDept]}`}>{deptField}</span>
                  </td>
                  <td className="text-xs text-slate-500">
                    {(selectedDept === 'kspcb' || selectedDept === 'factories') && (swsField === 'business_name' || swsField === 'owner_name')
                      ? <span className="badge badge-warning">UPPERCASE</span>
                      : <span className="text-slate-600">identity</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Value Translation */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Status Value Translation — {DEPT_LABELS[selectedDept]}</h2>
          <p className="text-xs text-slate-500 mt-1">SWS status codes mapped to department-specific terminology</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>SWS Status</th><th></th><th>{DEPT_LABELS[selectedDept]} Status</th></tr></thead>
            <tbody>
              {Object.entries(statusMap).map(([swsStatus, deptStatus]) => (
                <tr key={swsStatus}>
                  <td><span className="font-mono text-sm text-amber-400/80">{swsStatus}</span></td>
                  <td className="text-center"><ArrowRight className="h-4 w-4 text-slate-500 mx-auto" /></td>
                  <td><span className={`font-mono text-sm text-slate-300 px-2 py-1 rounded border ${deptColors[selectedDept]}`}>{deptStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Departments Overview */}
      <div className="glass-card overflow-hidden animate-fade-in-up stagger-3">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Cross-Department Field Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>SWS Field</th>
              {DEPARTMENTS.map(d => <th key={d}>{DEPT_LABELS[d].split(' ')[0]}</th>)}
            </tr></thead>
            <tbody>
              {['business_name', 'owner_name', 'registered_address', 'application_status'].map(field => (
                <tr key={field}>
                  <td className="font-mono text-xs text-amber-400/80">{field}</td>
                  {DEPARTMENTS.map(dept => (
                    <td key={dept} className="font-mono text-xs text-slate-400">{SCHEMA_MAPPINGS[dept][field] || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
