// InteropSync Karnataka — Comprehensive Mock Data
// All data is synthetic — no real PII or government data.

export const DEPARTMENTS = ['labour', 'kspcb', 'commercial_tax', 'factories', 'fire_safety'] as const;
export type DeptName = typeof DEPARTMENTS[number];

export const DEPT_LABELS: Record<DeptName, string> = {
  labour: 'Labour Department',
  kspcb: 'KSPCB',
  commercial_tax: 'Commercial Tax',
  factories: 'Factories & Boilers',
  fire_safety: 'Fire & Emergency Services',
};

export const DEPT_TRANSPORT: Record<DeptName, string> = {
  labour: 'REST API',
  kspcb: 'Webhook',
  commercial_tax: 'REST API',
  factories: 'SFTP File Drop',
  fire_safety: 'Database Polling',
};

export const SCHEMA_MAPPINGS: Record<DeptName, Record<string, string>> = {
  labour: { business_name: 'establishment_name', owner_name: 'proprietor_name', registered_address: 'premises_address', pincode: 'pin_code', business_type: 'entity_type', application_status: 'registration_status' },
  kspcb: { business_name: 'unit_name', owner_name: 'contact_person', registered_address: 'plant_address', pincode: 'pin_code', sector: 'industry_category', application_status: 'consent_status' },
  commercial_tax: { business_name: 'dealer_name', owner_name: 'authorized_signatory', registered_address: 'business_address', pincode: 'pin_code', pan: 'pan_number', gstin: 'gstin', application_status: 'registration_status' },
  factories: { business_name: 'factory_name', owner_name: 'occupier_name', registered_address: 'factory_address', pincode: 'pin_code', sector: 'manufacturing_process', application_status: 'license_status' },
  fire_safety: { business_name: 'building_name', owner_name: 'owner_occupant', registered_address: 'building_address', pincode: 'pin_code', application_status: 'noc_status' },
};

export const STATUS_TRANSLATIONS: Record<DeptName, Record<string, string>> = {
  labour: { submitted: 'Application Received', approved: 'Registered', rejected: 'Registration Denied', pending_dept: 'Under Review' },
  kspcb: { submitted: 'CTE Application Filed', approved: 'CTO Granted', rejected: 'Consent Refused', pending_dept: 'Under Inspection' },
  commercial_tax: { submitted: 'Application Received', approved: 'Active', rejected: 'Cancelled', pending_dept: 'Verification Pending' },
  factories: { submitted: 'License Application Filed', approved: 'License Issued', rejected: 'License Denied', pending_dept: 'Inspection Pending' },
  fire_safety: { submitted: 'NOC Application Filed', approved: 'NOC Issued', rejected: 'NOC Denied', pending_dept: 'Inspection Scheduled' },
};

function sha256Mock(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) { hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0; }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex + hex + hex + hex + hex).slice(0, 64);
}

export interface Application {
  id: string; ubid: string; sws_reference_no: string; entity_name: string; owner_name: string;
  registered_address: string; pincode: string; business_type: string; sector: string;
  service_type: string; status: string; pan: string; gstin: string;
  created_at: string; updated_at: string; department_records: DepartmentRecord[];
}

export interface DepartmentRecord {
  id: string; department: string; status: string; last_synced: string | null;
  data: Record<string, unknown>;
}

export interface SyncEvent {
  id: string; direction: 'sws_to_dept' | 'dept_to_sws'; department: string; ubid: string;
  event_type: string; status: 'completed' | 'pending' | 'conflict' | 'failed';
  timestamp: string; source_schema?: Record<string, unknown>; translated_schema?: Record<string, unknown>;
  payload_hash: string; prev_hash: string; attempt_count: number;
}

export interface Conflict {
  id: string; application_id: string; ubid: string; department: string; field_name: string;
  sws_value: string; dept_value: string; severity: 'critical' | 'warning' | 'info';
  status: 'unresolved' | 'resolved'; resolved_value?: string; resolution_notes?: string;
  resolution_policy?: string; created_at: string; resolved_at?: string;
}

export interface ConflictStats {
  total: number; resolved: number; unresolved: number;
  by_severity: { critical: number; warning: number; info: number };
}

export interface DeadLetterItem {
  id: string; ubid: string; department: string; event_type: string; error_message: string;
  attempts: number; max_attempts: number; first_attempt: string; last_attempt: string;
  status: 'exhausted' | 'replayed' | 'discarded'; payload_hash: string;
}

export interface OfflineQueueItem {
  id: string; district_office: string; ubid: string; event_type: string;
  queued_at: string; synced_at: string | null; vector_clock: Record<string, number>;
  status: 'queued' | 'synced' | 'conflict'; connectivity: 'online' | 'offline' | 'intermittent';
}

export interface DeptHealth {
  department: DeptName; status: 'healthy' | 'degraded' | 'down';
  latency_p50: number; latency_p95: number; latency_p99: number;
  failure_rate: number; schema_drift_score: number; pending_conflicts: number;
  dlq_depth: number; last_sync: string; uptime_pct: number;
  sync_volume_24h: number; sla_breach: boolean;
}

const BASE_DATE = new Date('2026-04-15T06:00:00Z');
function dateOffset(hours: number): string {
  return new Date(BASE_DATE.getTime() + hours * 3600000).toISOString();
}

const BUSINESSES = [
  { name: 'Karnataka Textiles Pvt. Ltd.', owner: 'Rajesh Kumar', addr: '42 MG Road, Bengaluru', pin: '560001', type: 'Manufacturing', sector: 'Textiles', pan: 'AABCK1234A', gstin: '29AABCK1234A1Z5' },
  { name: 'Mysore Silk Emporium', owner: 'Priya Sharma', addr: '15 Sayyaji Rao Road, Mysuru', pin: '570001', type: 'Retail', sector: 'Textiles', pan: 'BBCMS5678B', gstin: '29BBCMS5678B1Z3' },
  { name: 'Hubli Engineering Works', owner: 'Venkatesh Patil', addr: '78 Station Road, Hubli', pin: '580020', type: 'Manufacturing', sector: 'Engineering', pan: 'CCHEW9012C', gstin: '29CCHEW9012C1Z1' },
  { name: 'Mangalore Seafood Exports', owner: 'Abdul Rahman', addr: '23 Port Area, Mangaluru', pin: '575001', type: 'Export', sector: 'Food Processing', pan: 'DDMSE3456D', gstin: '29DDMSE3456D1Z9' },
  { name: 'Belgaum Auto Components', owner: 'Suresh Joshi', addr: '56 Industrial Estate, Belagavi', pin: '590010', type: 'Manufacturing', sector: 'Automotive', pan: 'EEBAC7890E', gstin: '29EEBAC7890E1Z7' },
  { name: 'Shimoga Agro Industries', owner: 'Lakshmi Devi', addr: '12 Tunga Road, Shivamogga', pin: '577201', type: 'Processing', sector: 'Agriculture', pan: 'FFSAI2345F', gstin: '29FFSAI2345F1Z5' },
  { name: 'Udupi Hotels Chain', owner: 'Ganesh Bhat', addr: '89 Car Street, Udupi', pin: '576101', type: 'Hospitality', sector: 'Food & Beverage', pan: 'GGUHC6789G', gstin: '29GGUHC6789G1Z3' },
  { name: 'Davangere Cotton Mills', owner: 'Ramesh Shetty', addr: '34 Mill Road, Davangere', pin: '577002', type: 'Manufacturing', sector: 'Textiles', pan: 'HHDCM0123H', gstin: '29HHDCM0123H1Z1' },
  { name: 'Gulbarga Cement Works', owner: 'Basavaraj Reddy', addr: '67 Industrial Area, Kalaburagi', pin: '585102', type: 'Manufacturing', sector: 'Construction', pan: 'IIGCW4567I', gstin: '29IIGCW4567I1Z9' },
  { name: 'Dharwad Software Solutions', owner: 'Neha Kulkarni', addr: '45 BVB Campus Road, Dharwad', pin: '580004', type: 'IT Services', sector: 'Technology', pan: 'JJDSS8901J', gstin: '29JJDSS8901J1Z7' },
  { name: 'Raichur Power Equipment', owner: 'Manoj Gowda', addr: '21 Thermal Colony, Raichur', pin: '584101', type: 'Manufacturing', sector: 'Energy', pan: 'KKRPE2345K', gstin: '29KKRPE2345K1Z5' },
  { name: 'Hassan Coffee Estates', owner: 'Chandra Hegde', addr: '78 Belur Road, Hassan', pin: '573201', type: 'Agriculture', sector: 'Plantation', pan: 'LLHCE6789L', gstin: '29LLHCE6789L1Z3' },
];

const STATUSES = ['approved', 'submitted', 'pending_dept', 'approved', 'approved', 'submitted'];

export const MOCK_APPLICATIONS: Application[] = BUSINESSES.map((b, i) => {
  const ubid = `UBID-KA-2026-${String(i + 1).padStart(5, '0')}`;
  const status = STATUSES[i % STATUSES.length];
  const deptRecords: DepartmentRecord[] = DEPARTMENTS.map((d, di) => ({
    id: `dr-${i}-${di}`,
    department: d,
    status: status === 'approved' ? 'completed' : status === 'submitted' ? 'pending' : 'in_progress',
    last_synced: status === 'approved' ? dateOffset(i * 24 + di * 4) : null,
    data: { [SCHEMA_MAPPINGS[d].business_name || 'name']: b.name },
  }));
  return {
    id: `app-${String(i + 1).padStart(3, '0')}`,
    ubid, sws_reference_no: `SWS-${String(20260000 + i * 137).slice(-8)}`,
    entity_name: b.name, owner_name: b.owner, registered_address: b.addr,
    pincode: b.pin, business_type: b.type, sector: b.sector,
    service_type: i % 3 === 0 ? 'new_registration' : i % 3 === 1 ? 'renewal' : 'address_change',
    status, pan: b.pan, gstin: b.gstin,
    created_at: dateOffset(i * 12), updated_at: dateOffset(i * 12 + 48),
    department_records: deptRecords,
  };
});

let prevHash = '0'.repeat(64);
export const MOCK_SYNC_EVENTS: SyncEvent[] = [];
MOCK_APPLICATIONS.forEach((app, ai) => {
  DEPARTMENTS.forEach((dept, di) => {
    const dir: 'sws_to_dept' | 'dept_to_sws' = (ai + di) % 3 === 0 ? 'dept_to_sws' : 'sws_to_dept';
    const st: SyncEvent['status'] = ai % 5 === 4 ? 'failed' : ai % 7 === 3 ? 'conflict' : 'completed';
    const srcSchema = { business_name: app.entity_name, owner_name: app.owner_name, registered_address: app.registered_address, pincode: app.pincode };
    const mapping = SCHEMA_MAPPINGS[dept];
    const translatedSchema: Record<string, unknown> = {};
    Object.entries(srcSchema).forEach(([k, v]) => { translatedSchema[mapping[k] || k] = v; });
    const hash = sha256Mock(`${app.ubid}-${dept}-${ai}-${di}`);
    MOCK_SYNC_EVENTS.push({
      id: `se-${ai}-${di}`, direction: dir, department: dept, ubid: app.ubid,
      event_type: app.service_type, status: st,
      timestamp: dateOffset(ai * 12 + di * 2 + 1),
      source_schema: srcSchema, translated_schema: translatedSchema,
      payload_hash: hash, prev_hash: prevHash, attempt_count: st === 'failed' ? 3 : 1,
    });
    prevHash = hash;
  });
});

export const MOCK_CONFLICTS: Conflict[] = [
  { id: 'cf-001', application_id: 'app-001', ubid: 'UBID-KA-2026-00001', department: 'labour', field_name: 'business_name', sws_value: 'Karnataka Textiles Pvt. Ltd.', dept_value: 'Karnataka Textile Industries Pvt Ltd', severity: 'warning', status: 'unresolved', resolution_policy: 'escalate-to-human', created_at: dateOffset(50) },
  { id: 'cf-002', application_id: 'app-001', ubid: 'UBID-KA-2026-00001', department: 'commercial_tax', field_name: 'application_status', sws_value: 'approved', dept_value: 'Verification Pending', severity: 'critical', status: 'unresolved', resolution_policy: 'source-authority-wins', created_at: dateOffset(52) },
  { id: 'cf-003', application_id: 'app-002', ubid: 'UBID-KA-2026-00002', department: 'kspcb', field_name: 'registered_address', sws_value: '15 Sayyaji Rao Road, Mysuru', dept_value: '15, Sayaji Rao Rd, Mysore', severity: 'warning', status: 'resolved', resolved_value: '15 Sayyaji Rao Road, Mysuru', resolution_notes: 'SWS address is canonical', resolution_policy: 'latest-timestamp-wins', created_at: dateOffset(30), resolved_at: dateOffset(35) },
  { id: 'cf-004', application_id: 'app-003', ubid: 'UBID-KA-2026-00003', department: 'factories', field_name: 'owner_name', sws_value: 'Venkatesh Patil', dept_value: 'V. Patil', severity: 'warning', status: 'unresolved', resolution_policy: 'escalate-to-human', created_at: dateOffset(60) },
  { id: 'cf-005', application_id: 'app-004', ubid: 'UBID-KA-2026-00004', department: 'fire_safety', field_name: 'pincode', sws_value: '575001', dept_value: '575002', severity: 'info', status: 'resolved', resolved_value: '575001', resolution_notes: 'Pincode verified via India Post', resolution_policy: 'latest-timestamp-wins', created_at: dateOffset(25), resolved_at: dateOffset(28) },
  { id: 'cf-006', application_id: 'app-005', ubid: 'UBID-KA-2026-00005', department: 'labour', field_name: 'application_status', sws_value: 'approved', dept_value: 'Under Review', severity: 'critical', status: 'unresolved', resolution_policy: 'source-authority-wins', created_at: dateOffset(70) },
  { id: 'cf-007', application_id: 'app-006', ubid: 'UBID-KA-2026-00006', department: 'kspcb', field_name: 'business_name', sws_value: 'Shimoga Agro Industries', dept_value: 'SHIMOGA AGRO INDUSTRIES', severity: 'info', status: 'resolved', resolved_value: 'Shimoga Agro Industries', resolution_notes: 'Case normalization applied', resolution_policy: 'latest-timestamp-wins', created_at: dateOffset(40), resolved_at: dateOffset(42) },
  { id: 'cf-008', application_id: 'app-007', ubid: 'UBID-KA-2026-00007', department: 'commercial_tax', field_name: 'registered_address', sws_value: '89 Car Street, Udupi', dept_value: '89, Car St., Udupi', severity: 'warning', status: 'unresolved', resolution_policy: 'escalate-to-human', created_at: dateOffset(75) },
  { id: 'cf-009', application_id: 'app-008', ubid: 'UBID-KA-2026-00008', department: 'factories', field_name: 'application_status', sws_value: 'submitted', dept_value: 'License Issued', severity: 'critical', status: 'unresolved', resolution_policy: 'source-authority-wins', created_at: dateOffset(80) },
  { id: 'cf-010', application_id: 'app-010', ubid: 'UBID-KA-2026-00010', department: 'labour', field_name: 'owner_name', sws_value: 'Neha Kulkarni', dept_value: 'N. Kulkarni', severity: 'warning', status: 'unresolved', resolution_policy: 'escalate-to-human', created_at: dateOffset(85) },
];

export const MOCK_CONFLICT_STATS: ConflictStats = {
  total: MOCK_CONFLICTS.length,
  resolved: MOCK_CONFLICTS.filter(c => c.status === 'resolved').length,
  unresolved: MOCK_CONFLICTS.filter(c => c.status === 'unresolved').length,
  by_severity: {
    critical: MOCK_CONFLICTS.filter(c => c.severity === 'critical').length,
    warning: MOCK_CONFLICTS.filter(c => c.severity === 'warning').length,
    info: MOCK_CONFLICTS.filter(c => c.severity === 'info').length,
  },
};

export const MOCK_DEAD_LETTER: DeadLetterItem[] = [
  { id: 'dlq-001', ubid: 'UBID-KA-2026-00005', department: 'kspcb', event_type: 'renewal', error_message: 'KSPCB API timeout after 30s — endpoint unreachable', attempts: 5, max_attempts: 5, first_attempt: dateOffset(60), last_attempt: dateOffset(68), status: 'exhausted', payload_hash: sha256Mock('dlq1') },
  { id: 'dlq-002', ubid: 'UBID-KA-2026-00008', department: 'factories', event_type: 'address_change', error_message: 'SFTP connection refused — server maintenance window', attempts: 5, max_attempts: 5, first_attempt: dateOffset(72), last_attempt: dateOffset(80), status: 'exhausted', payload_hash: sha256Mock('dlq2') },
  { id: 'dlq-003', ubid: 'UBID-KA-2026-00003', department: 'fire_safety', event_type: 'new_registration', error_message: 'Database polling returned empty resultset — schema migration in progress', attempts: 3, max_attempts: 5, first_attempt: dateOffset(55), last_attempt: dateOffset(58), status: 'replayed', payload_hash: sha256Mock('dlq3') },
  { id: 'dlq-004', ubid: 'UBID-KA-2026-00011', department: 'labour', event_type: 'renewal', error_message: 'HTTP 503 — Labour API under maintenance', attempts: 5, max_attempts: 5, first_attempt: dateOffset(82), last_attempt: dateOffset(90), status: 'exhausted', payload_hash: sha256Mock('dlq4') },
  { id: 'dlq-005', ubid: 'UBID-KA-2026-00009', department: 'commercial_tax', event_type: 'status_update', error_message: 'SSL certificate expired on CT endpoint', attempts: 2, max_attempts: 5, first_attempt: dateOffset(85), last_attempt: dateOffset(86), status: 'discarded', payload_hash: sha256Mock('dlq5') },
];

export const MOCK_OFFLINE_QUEUE: OfflineQueueItem[] = [
  { id: 'oq-001', district_office: 'Ramanagara Taluk Office', ubid: 'UBID-KA-2026-00001', event_type: 'renewal', queued_at: dateOffset(88), synced_at: dateOffset(92), vector_clock: { sws: 3, labour: 2, local: 4 }, status: 'synced', connectivity: 'online' },
  { id: 'oq-002', district_office: 'Chamarajanagar District', ubid: 'UBID-KA-2026-00004', event_type: 'address_change', queued_at: dateOffset(90), synced_at: null, vector_clock: { sws: 1, kspcb: 1, local: 2 }, status: 'queued', connectivity: 'offline' },
  { id: 'oq-003', district_office: 'Kodagu Hill Station', ubid: 'UBID-KA-2026-00012', event_type: 'new_registration', queued_at: dateOffset(85), synced_at: null, vector_clock: { sws: 0, labour: 0, local: 1 }, status: 'queued', connectivity: 'intermittent' },
  { id: 'oq-004', district_office: 'Yadgir Taluk Office', ubid: 'UBID-KA-2026-00006', event_type: 'renewal', queued_at: dateOffset(78), synced_at: dateOffset(84), vector_clock: { sws: 5, commercial_tax: 4, local: 6 }, status: 'synced', connectivity: 'online' },
  { id: 'oq-005', district_office: 'Chitradurga Rural', ubid: 'UBID-KA-2026-00009', event_type: 'status_update', queued_at: dateOffset(91), synced_at: null, vector_clock: { sws: 2, factories: 1, local: 3 }, status: 'conflict', connectivity: 'intermittent' },
  { id: 'oq-006', district_office: 'Koppal Taluk Office', ubid: 'UBID-KA-2026-00007', event_type: 'address_change', queued_at: dateOffset(93), synced_at: null, vector_clock: { sws: 1, fire_safety: 0, local: 2 }, status: 'queued', connectivity: 'offline' },
];

export const MOCK_DEPT_HEALTH: DeptHealth[] = [
  { department: 'labour', status: 'healthy', latency_p50: 120, latency_p95: 340, latency_p99: 890, failure_rate: 1.2, schema_drift_score: 0.03, pending_conflicts: 3, dlq_depth: 1, last_sync: dateOffset(95), uptime_pct: 99.7, sync_volume_24h: 847, sla_breach: false },
  { department: 'kspcb', status: 'degraded', latency_p50: 450, latency_p95: 1200, latency_p99: 3400, failure_rate: 8.5, schema_drift_score: 0.12, pending_conflicts: 2, dlq_depth: 1, last_sync: dateOffset(90), uptime_pct: 94.2, sync_volume_24h: 312, sla_breach: true },
  { department: 'commercial_tax', status: 'healthy', latency_p50: 95, latency_p95: 280, latency_p99: 650, failure_rate: 0.8, schema_drift_score: 0.01, pending_conflicts: 1, dlq_depth: 1, last_sync: dateOffset(96), uptime_pct: 99.9, sync_volume_24h: 1203, sla_breach: false },
  { department: 'factories', status: 'down', latency_p50: 0, latency_p95: 0, latency_p99: 0, failure_rate: 100, schema_drift_score: 0.25, pending_conflicts: 2, dlq_depth: 1, last_sync: dateOffset(72), uptime_pct: 78.3, sync_volume_24h: 0, sla_breach: true },
  { department: 'fire_safety', status: 'healthy', latency_p50: 200, latency_p95: 520, latency_p99: 1100, failure_rate: 2.1, schema_drift_score: 0.05, pending_conflicts: 0, dlq_depth: 0, last_sync: dateOffset(94), uptime_pct: 98.8, sync_volume_24h: 456, sla_breach: false },
];

export const LATENCY_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  labour: 100 + Math.round(Math.random() * 80),
  kspcb: 300 + Math.round(Math.random() * 400),
  commercial_tax: 80 + Math.round(Math.random() * 60),
  factories: i < 18 ? 150 + Math.round(Math.random() * 100) : 0,
  fire_safety: 160 + Math.round(Math.random() * 120),
}));
