/**
 * Network flow feature definitions matching the 42 UNSW-NB15 features.
 */

export interface NetworkFlowRecord {
  // 3 Categorical Features
  proto: string;
  service: string;
  state: string;

  // 39 Numerical Features
  dur: number;
  spkts: number;
  dpkts: number;
  sbytes: number;
  dbytes: number;
  rate: number;
  sttl: number;
  dttl: number;
  sload: number;
  dload: number;
  sloss: number;
  dloss: number;
  sinpkt: number;
  dinpkt: number;
  sjit: number;
  djit: number;
  swin: number;
  stcpb: number;
  dtcpb: number;
  dwin: number;
  tcprtt: number;
  synack: number;
  ackdat: number;
  smean: number;
  dmean: number;
  trans_depth: number;
  response_body_len: number;
  ct_srv_src: number;
  ct_state_ttl: number;
  ct_dst_ltm: number;
  ct_src_dport_ltm: number;
  ct_dst_sport_ltm: number;
  ct_dst_src_ltm: number;
  is_ftp_login: number;
  ct_ftp_cmd: number;
  ct_flw_http_mthd: number;
  ct_src_ltm: number;
  ct_srv_dst: number;
  is_sm_ips_ports: number;

  // Optional model override
  model_name?: string;
}

export interface FlowFieldMeta {
  key: keyof NetworkFlowRecord;
  label: string;
  category: 'basic' | 'content' | 'tcp' | 'counts';
  description: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export const FLOW_CATEGORIES: { id: 'basic' | 'content' | 'tcp' | 'counts'; title: string; desc: string }[] = [
  { id: 'basic', title: 'Basic Flow Telemetry', desc: 'Duration, protocol, service, packet and byte volumes' },
  { id: 'tcp', title: 'TCP & Timing Dynamics', desc: 'Jitter, round-trip times, window sizes, and sequence numbers' },
  { id: 'content', title: 'Payload & Application Layer', desc: 'Mean packet sizes, HTTP depths, and response lengths' },
  { id: 'counts', title: 'Connection & State Counts', desc: 'Cross-connection frequencies and security state TTLs' },
];

export const FLOW_FIELDS: FlowFieldMeta[] = [
  // Basic
  { key: 'proto', label: 'Protocol (proto)', category: 'basic', description: 'Transaction protocol', type: 'select', options: ['tcp', 'udp', 'arp', 'ospf', 'icmp', 'sctp', 'ddp'] },
  { key: 'service', label: 'Service', category: 'basic', description: 'Destination service', type: 'select', options: ['-', 'http', 'dns', 'smtp', 'ftp', 'ftp-data', 'ssh', 'pop3', 'ssl', 'snmp'] },
  { key: 'state', label: 'State', category: 'basic', description: 'State and dependent protocol', type: 'select', options: ['FIN', 'INT', 'CON', 'REQ', 'RST', 'ACC', 'CLO'] },
  { key: 'dur', label: 'Duration (dur)', category: 'basic', description: 'Flow duration in seconds', type: 'number', min: 0, step: 0.0001 },
  { key: 'spkts', label: 'Source Packets (spkts)', category: 'basic', description: 'Source to destination packet count', type: 'number', min: 0, step: 1 },
  { key: 'dpkts', label: 'Dest Packets (dpkts)', category: 'basic', description: 'Destination to source packet count', type: 'number', min: 0, step: 1 },
  { key: 'sbytes', label: 'Source Bytes (sbytes)', category: 'basic', description: 'Source to destination volume in bytes', type: 'number', min: 0, step: 1 },
  { key: 'dbytes', label: 'Dest Bytes (dbytes)', category: 'basic', description: 'Destination to source volume in bytes', type: 'number', min: 0, step: 1 },
  { key: 'rate', label: 'Flow Rate (rate)', category: 'basic', description: 'Flow rate in packets per second', type: 'number', min: 0, step: 0.1 },
  { key: 'sttl', label: 'Source TTL (sttl)', category: 'basic', description: 'Source to destination time-to-live', type: 'number', min: 0, max: 255, step: 1 },
  { key: 'dttl', label: 'Dest TTL (dttl)', category: 'basic', description: 'Destination to source time-to-live', type: 'number', min: 0, max: 255, step: 1 },
  { key: 'sload', label: 'Source Load (sload)', category: 'basic', description: 'Source bits per second', type: 'number', min: 0, step: 1 },
  { key: 'dload', label: 'Dest Load (dload)', category: 'basic', description: 'Destination bits per second', type: 'number', min: 0, step: 1 },
  { key: 'sloss', label: 'Source Packet Loss (sloss)', category: 'basic', description: 'Source retransmitted or dropped packets', type: 'number', min: 0, step: 1 },
  { key: 'dloss', label: 'Dest Packet Loss (dloss)', category: 'basic', description: 'Destination retransmitted or dropped packets', type: 'number', min: 0, step: 1 },

  // TCP & Timing
  { key: 'sinpkt', label: 'Source Interpacket (sinpkt)', category: 'tcp', description: 'Source interpacket arrival time (ms)', type: 'number', min: 0, step: 0.001 },
  { key: 'dinpkt', label: 'Dest Interpacket (dinpkt)', category: 'tcp', description: 'Destination interpacket arrival time (ms)', type: 'number', min: 0, step: 0.001 },
  { key: 'sjit', label: 'Source Jitter (sjit)', category: 'tcp', description: 'Source jitter in milliseconds', type: 'number', min: 0, step: 0.1 },
  { key: 'djit', label: 'Dest Jitter (djit)', category: 'tcp', description: 'Destination jitter in milliseconds', type: 'number', min: 0, step: 0.1 },
  { key: 'swin', label: 'Source Window (swin)', category: 'tcp', description: 'Source TCP window advertisement value', type: 'number', min: 0, max: 65535, step: 1 },
  { key: 'dwin', label: 'Dest Window (dwin)', category: 'tcp', description: 'Destination TCP window advertisement value', type: 'number', min: 0, max: 65535, step: 1 },
  { key: 'stcpb', label: 'Source TCP Seq (stcpb)', category: 'tcp', description: 'Source TCP base sequence number', type: 'number', min: 0, step: 1 },
  { key: 'dtcpb', label: 'Dest TCP Seq (dtcpb)', category: 'tcp', description: 'Destination TCP base sequence number', type: 'number', min: 0, step: 1 },
  { key: 'tcprtt', label: 'TCP RTT (tcprtt)', category: 'tcp', description: 'TCP connection setup round-trip time', type: 'number', min: 0, step: 0.001 },
  { key: 'synack', label: 'SYN-ACK Time (synack)', category: 'tcp', description: 'Setup time between SYN and SYN-ACK', type: 'number', min: 0, step: 0.001 },
  { key: 'ackdat', label: 'ACK-DAT Time (ackdat)', category: 'tcp', description: 'Setup time between SYN-ACK and ACK', type: 'number', min: 0, step: 0.001 },

  // Content
  { key: 'smean', label: 'Source Mean Size (smean)', category: 'content', description: 'Mean flow packet size sent by source', type: 'number', min: 0, step: 1 },
  { key: 'dmean', label: 'Dest Mean Size (dmean)', category: 'content', description: 'Mean flow packet size sent by dest', type: 'number', min: 0, step: 1 },
  { key: 'trans_depth', label: 'Transaction Depth', category: 'content', description: 'HTTP request/response transaction depth', type: 'number', min: 0, step: 1 },
  { key: 'response_body_len', label: 'Response Body Len', category: 'content', description: 'Uncompressed size of HTTP response', type: 'number', min: 0, step: 1 },

  // Counts
  { key: 'ct_srv_src', label: 'Connections Service-Src', category: 'counts', description: 'Connections with same service and src in 100', type: 'number', min: 0, step: 1 },
  { key: 'ct_state_ttl', label: 'State TTL Count', category: 'counts', description: 'Count of state by TTL range', type: 'number', min: 0, step: 1 },
  { key: 'ct_dst_ltm', label: 'Connections Dest LTM', category: 'counts', description: 'Connections to destination in last 100', type: 'number', min: 0, step: 1 },
  { key: 'ct_src_dport_ltm', label: 'Connections Src-DstPort', category: 'counts', description: 'Connections of same src and dst port in 100', type: 'number', min: 0, step: 1 },
  { key: 'ct_dst_sport_ltm', label: 'Connections Dst-SrcPort', category: 'counts', description: 'Connections of same dst and src port in 100', type: 'number', min: 0, step: 1 },
  { key: 'ct_dst_src_ltm', label: 'Connections Dst-Src', category: 'counts', description: 'Connections between same src and dst in 100', type: 'number', min: 0, step: 1 },
  { key: 'is_ftp_login', label: 'Is FTP Login (0/1)', category: 'counts', description: '1 if FTP session authenticated, else 0', type: 'select', options: ['0', '1'] },
  { key: 'ct_ftp_cmd', label: 'FTP Commands Count', category: 'counts', description: 'Count of FTP commands in session', type: 'number', min: 0, step: 1 },
  { key: 'ct_flw_http_mthd', label: 'HTTP Methods Count', category: 'counts', description: 'Count of HTTP methods (GET, POST)', type: 'number', min: 0, step: 1 },
  { key: 'ct_src_ltm', label: 'Connections Src LTM', category: 'counts', description: 'Connections from source in last 100', type: 'number', min: 0, step: 1 },
  { key: 'ct_srv_dst', label: 'Connections Service-Dst', category: 'counts', description: 'Connections with same service and dst in 100', type: 'number', min: 0, step: 1 },
  { key: 'is_sm_ips_ports', label: 'Equal IPs & Ports (0/1)', category: 'counts', description: '1 if source and destination match, else 0', type: 'select', options: ['0', '1'] },
];

export interface PredictionHistoryItem {
  id: string;
  timestamp: string;
  prediction: 0 | 1;
  label: 'Normal' | 'Attack';
  probability: number | null;
  model_used: string;
  flowSummary: {
    proto: string;
    service: string;
    state: string;
    sbytes: number;
    dbytes: number;
    dur: number;
  };
  durations: {
    preprocessing_ms: number;
    inference_ms: number;
    total_ms: number;
  };
  source: 'single' | 'batch' | 'sample';
}
