import { Server, Webhook, HardDrive, Database, CheckCircle2, Settings, ArrowRight } from 'lucide-react'
import { DEPARTMENTS, DEPT_LABELS, DEPT_TRANSPORT } from '../data/mock-data'

const transportIcons: Record<string, typeof Server> = {
  'REST API': Server,
  'Webhook': Webhook,
  'SFTP File Drop': HardDrive,
  'Database Polling': Database,
}

const transportDescriptions: Record<string, string> = {
  'REST API': 'Direct HTTP calls to department REST endpoints. Supports JSON payload with OAuth2 bearer token authentication.',
  'Webhook': 'Event-driven push notifications. The department system calls back on state changes via registered webhook URL.',
  'SFTP File Drop': 'Scheduled file exchange via secure FTP. CSV/XML snapshots deposited hourly, parsed on arrival.',
  'Database Polling': 'Periodic snapshot comparison against department database views. CDC-like detection via last_modified timestamps.',
}

const transportConfigs: Record<string, Record<string, string>> = {
  'REST API': { Endpoint: 'https://{dept}.karnataka.gov.in/api/v2/', Auth: 'OAuth2 Bearer Token', Format: 'JSON', Timeout: '30s', Rate_Limit: '100 req/min' },
  'Webhook': { Callback_URL: 'https://interopsync.karnataka.gov.in/hook/{dept}', Events: 'status_change, new_registration', Retry: '3x exponential', HMAC_Secret: '••••••••' },
  'SFTP File Drop': { Host: 'sftp.{dept}.karnataka.gov.in', Path: '/sync/outbound/', Schedule: 'Every 60 min', Format: 'CSV (pipe-delimited)', Encryption: 'AES-256-GCM' },
  'Database Polling': { DSN: 'postgresql://{dept}_ro@db.karnataka.gov.in:5432/{dept}_prod', View: 'v_sync_records', Poll_Interval: '15 min', Watermark: 'last_modified > :checkpoint' },
}

export default function IntegrationEngine() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Multi-Surface Integration Engine</h1>
        <p className="text-sm text-slate-400 mt-1">Auto-selects the appropriate transport per department — REST API, Webhook, SFTP, or DB Polling</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(transportIcons).map(([name, Icon], i) => {
          const count = DEPARTMENTS.filter(d => DEPT_TRANSPORT[d] === name).length
          return (
            <div key={name} className={`stat-card amber animate-fade-in-up stagger-${i + 1}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10">
                  <Icon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{name}</p>
                  <p className="text-xl font-bold text-white">{count} dept{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Department Cards */}
      <div className="space-y-4">
        {DEPARTMENTS.map((dept, i) => {
          const transport = DEPT_TRANSPORT[dept]
          const TIcon = transportIcons[transport] || Server
          const config = transportConfigs[transport] || {}
          return (
            <div key={dept} className={`glass-card overflow-hidden dept-${dept} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <TIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{DEPT_LABELS[dept]}</h3>
                    <p className="text-xs text-slate-500">{dept}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-success"><CheckCircle2 className="h-3 w-3" />Connected</span>
                  <span className="badge badge-violet"><Settings className="h-3 w-3" />{transport}</span>
                </div>
              </div>
              <div className="px-6 py-4 space-y-3">
                <p className="text-xs text-slate-400">{transportDescriptions[transport]}</p>
                <div className="glass-panel p-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Configuration Manifest</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(config).map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] text-slate-500">{k.replace(/_/g, ' ')}</p>
                        <p className="text-xs font-mono text-slate-300">{v.replace('{dept}', dept)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ArrowRight className="h-3 w-3 text-amber-500" />
                  <span>Adding a new department requires only a manifest entry and schema mapping — <strong className="text-amber-500/80">no code changes</strong></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
