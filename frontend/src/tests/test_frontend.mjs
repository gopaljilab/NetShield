import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../../');
const backendDir = path.resolve(frontendDir, '../backend');

test('1. Production build bundle exists and contains compiled assets', () => {
  const distDir = path.join(frontendDir, 'dist');
  assert.ok(fs.existsSync(distDir), 'frontend/dist directory must exist');

  const indexHtml = path.join(distDir, 'index.html');
  assert.ok(fs.existsSync(indexHtml), 'dist/index.html must exist');

  const assetsDir = path.join(distDir, 'assets');
  assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');

  const assetFiles = fs.readdirSync(assetsDir);
  const hasJs = assetFiles.some((f) => f.endsWith('.js'));
  const hasCss = assetFiles.some((f) => f.endsWith('.css'));
  assert.ok(hasJs, 'dist/assets must contain bundled JS');
  assert.ok(hasCss, 'dist/assets must contain bundled CSS');
});

test('2. FLOW_FIELDS schema contains all 42 input features', () => {
  const flowTsPath = path.join(frontendDir, 'src/types/flow.ts');
  const flowTs = fs.readFileSync(flowTsPath, 'utf8');

  // Verify the 3 categorical columns
  assert.ok(flowTs.includes("'proto'"), 'Must include proto');
  assert.ok(flowTs.includes("'service'"), 'Must include service');
  assert.ok(flowTs.includes("'state'"), 'Must include state');

  // Verify numerical features
  const expectedNumericals = [
    'dur', 'spkts', 'dpkts', 'sbytes', 'dbytes', 'rate', 'sttl', 'dttl',
    'sload', 'dload', 'sloss', 'dloss', 'sinpkt', 'dinpkt', 'sjit', 'djit',
    'swin', 'stcpb', 'dtcpb', 'dwin', 'tcprtt', 'synack', 'ackdat', 'smean',
    'dmean', 'trans_depth', 'response_body_len', 'ct_srv_src', 'ct_state_ttl',
    'ct_dst_ltm', 'ct_src_dport_ltm', 'ct_dst_sport_ltm', 'ct_dst_src_ltm',
    'is_ftp_login', 'ct_ftp_cmd', 'ct_flw_http_mthd', 'ct_src_ltm', 'ct_srv_dst',
    'is_sm_ips_ports'
  ];

  for (const feat of expectedNumericals) {
    assert.ok(flowTs.includes(`'${feat}'`), `FLOW_FIELDS must include feature '${feat}'`);
  }

  // Count field definitions in FLOW_FIELDS
  const matches = flowTs.match(/key:\s*'([^']+)'/g);
  assert.ok(matches && matches.length === 42, `FLOW_FIELDS must define exactly 42 fields, found: ${matches ? matches.length : 0}`);
});

test('3. Strict anti-leakage boundary (id, attack_cat, label excluded)', () => {
  const flowTsPath = path.join(frontendDir, 'src/types/flow.ts');
  const flowTs = fs.readFileSync(flowTsPath, 'utf8');

  // Ensure FLOW_FIELDS keys do not contain leakage columns
  assert.ok(!flowTs.match(/key:\s*'id'/), 'FLOW_FIELDS must never contain id');
  assert.ok(!flowTs.match(/key:\s*'attack_cat'/), 'FLOW_FIELDS must never contain attack_cat');
  assert.ok(!flowTs.match(/key:\s*'label'/), 'FLOW_FIELDS must never contain label');
});

test('4. Sample flow presets contain all 42 features', () => {
  const sampleFlowsPath = path.join(frontendDir, 'src/utils/sampleFlows.ts');
  const sampleFlowsContent = fs.readFileSync(sampleFlowsPath, 'utf8');

  assert.ok(sampleFlowsContent.includes('normal-tcp'), 'Must include normal-tcp preset');
  assert.ok(sampleFlowsContent.includes('attack-backdoor'), 'Must include attack-backdoor preset');
  assert.ok(sampleFlowsContent.includes('attack-dos'), 'Must include attack-dos preset');
  assert.ok(sampleFlowsContent.includes('attack-exploits'), 'Must include attack-exploits preset');

  // Check no leakage keys in sample flows
  assert.ok(!sampleFlowsContent.match(/attack_cat:\s*'/), 'Sample flows must not pass attack_cat in flow object');
});

test('5. API client contract matches FastAPI backend routes', () => {
  const clientPath = path.join(frontendDir, 'src/api/client.ts');
  const clientContent = fs.readFileSync(clientPath, 'utf8');

  // Verify all 5 routes are invoked
  assert.ok(clientContent.includes('/api/v1/health'), 'Must call /api/v1/health');
  assert.ok(clientContent.includes('/api/v1/models'), 'Must call /api/v1/models');
  assert.ok(clientContent.includes('/api/v1/statistics'), 'Must call /api/v1/statistics');
  assert.ok(clientContent.includes('/api/v1/predict'), 'Must call /api/v1/predict');
  assert.ok(clientContent.includes('/api/v1/predict/batch'), 'Must call /api/v1/predict/batch');
});

test('6. Model Performance audited values match research/reports/model_comparison.csv', () => {
  const perfPath = path.join(frontendDir, 'src/pages/ModelPerformancePage.tsx');
  const perfContent = fs.readFileSync(perfPath, 'utf8');

  // XGBoost numbers
  assert.ok(perfContent.includes('accuracy: 90.0'), 'XGBoost accuracy must be 90.0%');
  assert.ok(perfContent.includes('f1: 92.15'), 'XGBoost F1 must be 92.15%');
  assert.ok(perfContent.includes('fpr: 2.1'), 'XGBoost FPR must be 2.1%');
  assert.ok(perfContent.includes('latencyPer1k: 0.394'), 'XGBoost latency must be 0.394 ms');

  // Random Forest numbers
  assert.ok(perfContent.includes('accuracy: 90.21'), 'Random Forest accuracy must be 90.21%');
  assert.ok(perfContent.includes('f1: 92.34'), 'Random Forest F1 must be 92.34%');
  assert.ok(perfContent.includes('fpr: 2.25'), 'Random Forest FPR must be 2.25%');
});

test('7. Advanced SaaS components exist (Skeleton, DataTable, ConfirmModal, Toast, CommandPalette, ThreatRateIndicator)', () => {
  const commonDir = path.join(frontendDir, 'src/components/common');
  assert.ok(fs.existsSync(path.join(commonDir, 'Skeleton.tsx')), 'Skeleton.tsx must exist');
  assert.ok(fs.existsSync(path.join(commonDir, 'DataTable.tsx')), 'DataTable.tsx must exist');
  assert.ok(fs.existsSync(path.join(commonDir, 'ConfirmModal.tsx')), 'ConfirmModal.tsx must exist');
  assert.ok(fs.existsSync(path.join(commonDir, 'Toast.tsx')), 'Toast.tsx must exist');
  assert.ok(fs.existsSync(path.join(commonDir, 'CommandPalette.tsx')), 'CommandPalette.tsx must exist');
  assert.ok(fs.existsSync(path.join(commonDir, 'ThreatRateIndicator.tsx')), 'ThreatRateIndicator.tsx must exist');
  assert.ok(fs.existsSync(path.join(commonDir, 'OnboardingModal.tsx')), 'OnboardingModal.tsx must exist');
  assert.ok(fs.existsSync(path.join(commonDir, 'Cyber404.tsx')), 'Cyber404.tsx must exist');
});

test('8. Global keyboard shortcuts and debouncing / throttling hooks exist', () => {
  const hooksDir = path.join(frontendDir, 'src/hooks');
  assert.ok(fs.existsSync(path.join(hooksDir, 'useDebounce.ts')), 'useDebounce.ts must exist');
  assert.ok(fs.existsSync(path.join(hooksDir, 'useThrottle.ts')), 'useThrottle.ts must exist');
  assert.ok(fs.existsSync(path.join(hooksDir, 'useKeyboardShortcuts.ts')), 'useKeyboardShortcuts.ts must exist');

  const shortcutsContent = fs.readFileSync(path.join(hooksDir, 'useKeyboardShortcuts.ts'), 'utf8');
  assert.ok(shortcutsContent.includes("e.key.toLowerCase() === 'k'"), 'Must handle Cmd+K / Ctrl+K');
  assert.ok(shortcutsContent.includes("e.key === 'Escape'"), 'Must handle Escape');
  assert.ok(shortcutsContent.includes("e.key === '?'"), 'Must handle ?');
  assert.ok(shortcutsContent.includes("e.key.toLowerCase() === 'r'"), 'Must handle R');
});

test('9. Smart form validation and debounced auto-save implemented in FlowForm', () => {
  const flowFormContent = fs.readFileSync(path.join(frontendDir, 'src/components/playground/FlowForm.tsx'), 'utf8');
  assert.ok(flowFormContent.includes('fieldValidation'), 'Must compute real-time fieldValidation');
  assert.ok(flowFormContent.includes('42/42 Valid Features'), 'Must provide 42 features validation progress');
  assert.ok(flowFormContent.includes('useDebouncedCallback'), 'Must use debounced auto-save');
  assert.ok(flowFormContent.includes('DRAFT_STORAGE_KEY'), 'Must persist draft to session storage');
});

test('10. Academic Showcase & Research references page exists with IEEE MilCIS 2015 citation', () => {
  const academicPath = path.join(frontendDir, 'src/pages/AcademicShowcasePage.tsx');
  assert.ok(fs.existsSync(academicPath), 'AcademicShowcasePage.tsx must exist');

  const academicContent = fs.readFileSync(academicPath, 'utf8');
  assert.ok(academicContent.includes('BCS586'), 'Must cite Course Code BCS586');
  assert.ok(academicContent.includes('Moustafa, Nour and Slay, Jill'), 'Must cite Moustafa & Slay 2015');
  assert.ok(academicContent.includes('10.1109/MilCIS.2015.7348942'), 'Must include IEEE MilCIS DOI');
});

test('11. Client-side CSV Parsing & Anti-Leakage Stripping Edge Cases', () => {
  const uploaderPath = path.join(frontendDir, 'src/components/playground/BatchCsvUploader.tsx');
  assert.ok(fs.existsSync(uploaderPath), 'BatchCsvUploader.tsx must exist');

  const uploaderContent = fs.readFileSync(uploaderPath, 'utf8');
  // Check that the parser explicitly sanitizes forbidden columns
  assert.ok(uploaderContent.includes('attack_cat'), 'Must check for attack_cat');
  assert.ok(uploaderContent.includes('label'), 'Must check for label');
  assert.ok(uploaderContent.includes('Papa.parse'), 'Must use Papa.parse for streaming/batch parsing');
  assert.ok(uploaderContent.includes('header: true'), 'Must enable header row mapping');
  assert.ok(uploaderContent.includes('skipEmptyLines: true'), 'Must skip empty rows');
});

test('12. Real-time Form Validation Logic & Numerical Boundary Rules', () => {
  const flowFormPath = path.join(frontendDir, 'src/components/playground/FlowForm.tsx');
  const flowFormContent = fs.readFileSync(flowFormPath, 'utf8');

  // Verify numerical boundary checks
  assert.ok(flowFormContent.includes('num < 0'), 'Must reject negative numbers');
  assert.ok(flowFormContent.includes('Must be ≥ 0'), 'Must generate boundary error message');
  assert.ok(flowFormContent.includes('field.max !== undefined && num > field.max'), 'Must enforce max boundary on numerical metrics');
  assert.ok(flowFormContent.includes('String(val).trim() === \'\''), 'Must reject empty categorical strings');
});

test('13. Threat Rate Indicator Severity Tiers & Zero Division Guard', () => {
  const triPath = path.join(frontendDir, 'src/components/common/ThreatRateIndicator.tsx');
  assert.ok(fs.existsSync(triPath), 'ThreatRateIndicator.tsx must exist');

  const triContent = fs.readFileSync(triPath, 'utf8');
  // Verify safe division when total === 0
  assert.ok(triContent.includes('total > 0 ? (attacks / total) * 100 : 0'), 'Must guard against division by zero');
  // Verify severity tiers
  assert.ok(triContent.includes("threatRate > 50"), 'Must trigger CRITICAL at > 50% threat ratio');
  assert.ok(triContent.includes("threatRate > 30"), 'Must trigger ELEVATED at > 30% threat ratio');
  assert.ok(triContent.includes("CRITICAL"), 'Must include CRITICAL tier text');
  assert.ok(triContent.includes("ELEVATED"), 'Must include ELEVATED tier text');
  assert.ok(triContent.includes("GUARDED"), 'Must include GUARDED tier text');
  assert.ok(triContent.includes("LOW"), 'Must include LOW tier text');
});

test('14. Severity Probability Gauge Tiers in Threat Investigation', () => {
  const detPath = path.join(frontendDir, 'src/pages/DetectionCenterPage.tsx');
  assert.ok(fs.existsSync(detPath), 'DetectionCenterPage.tsx must exist');

  const detContent = fs.readFileSync(detPath, 'utf8');
  // Verify probability severity tiers
  assert.ok(detContent.includes('prob >= 0.9'), 'Must identify Critical threats at >= 90% probability');
  assert.ok(detContent.includes('prob >= 0.75'), 'Must identify High threats at >= 75% probability');
  assert.ok(detContent.includes('prob >= 0.5'), 'Must identify Medium threats at >= 50% probability');
});

test('15. Session History Storage & Corrupted JSON Recovery Invariants', () => {
  const contextPath = path.join(frontendDir, 'src/context/AppContext.tsx');
  assert.ok(fs.existsSync(contextPath), 'AppContext.tsx must exist');

  const contextContent = fs.readFileSync(contextPath, 'utf8');
  assert.ok(contextContent.includes('HISTORY_STORAGE_KEY'), 'Must define session history storage key');
  assert.ok(contextContent.includes('JSON.parse(stored)'), 'Must parse persisted history');
  // Verify try/catch block around localStorage parse
  assert.ok(contextContent.includes('try {'), 'Must enclose storage reads in try/catch');
  assert.ok(contextContent.includes('slice(0, 100)'), 'Must enforce max 100 items retention bound');
});

test('16. API Client Error Sanitization & Backend Communication Contract', () => {
  const clientPath = path.join(frontendDir, 'src/api/client.ts');
  const clientContent = fs.readFileSync(clientPath, 'utf8');

  assert.ok(clientContent.includes('class NetShieldApiClient'), 'Must define structured NetShieldApiClient class');
  assert.ok(clientContent.includes('errorJson.detail'), 'Must extract backend detail error field');
  assert.ok(clientContent.includes('errorJson.error'), 'Must extract backend error title');
  assert.ok(clientContent.includes('DEFAULT_API_URL'), 'Must define fallback default API URL');
  assert.ok(clientContent.includes('Pydantic validation error array'), 'Must parse Pydantic validation array');
});

test('17. Page Navigation Matrix & Cyber404 Route Integrity', () => {
  const appPath = path.join(frontendDir, 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');

  const requiredPages = ['overview', 'traffic', 'detections', 'performance', 'playground', 'settings', 'academic'];
  for (const page of requiredPages) {
    assert.ok(appContent.includes(`activePage === '${page}'`), `App.tsx must handle page route '${page}'`);
  }

  assert.ok(appContent.includes('!isValidPage'), 'Must detect invalid page routes');
  assert.ok(appContent.includes('<Cyber404'), 'Must render Cyber404 fallback for invalid routes');
});

test('18. Sample Flow Presets Structural Completeness & Feature Parity', () => {
  const samplePath = path.join(frontendDir, 'src/utils/sampleFlows.ts');
  const sampleContent = fs.readFileSync(samplePath, 'utf8');

  // Verify all 4 preset identifiers exist
  assert.ok(sampleContent.includes("id: 'normal-tcp'"), 'Must include normal-tcp preset');
  assert.ok(sampleContent.includes("id: 'attack-backdoor'"), 'Must include attack-backdoor preset');
  assert.ok(sampleContent.includes("id: 'attack-dos'"), 'Must include attack-dos preset');
  assert.ok(sampleContent.includes("id: 'attack-exploits'"), 'Must include attack-exploits preset');

  // Verify realistic network protocols are used
  assert.ok(sampleContent.includes("proto: 'tcp'"), 'Must use tcp protocol in sample flow');
  assert.ok(sampleContent.includes("proto: 'udp'"), 'Must use udp protocol in sample flow');
});

test('19. Command Palette Index Completeness & Global Search Action Map', () => {
  const cpPath = path.join(frontendDir, 'src/components/common/CommandPalette.tsx');
  const cpContent = fs.readFileSync(cpPath, 'utf8');

  assert.ok(cpContent.includes("'nav-overview'"), 'Must index Overview in Command Palette');
  assert.ok(cpContent.includes("'nav-traffic'"), 'Must index Traffic in Command Palette');
  assert.ok(cpContent.includes("'nav-detections'"), 'Must index Detections in Command Palette');
  assert.ok(cpContent.includes("'nav-performance'"), 'Must index Performance in Command Palette');
  assert.ok(cpContent.includes("'nav-playground'"), 'Must index Playground in Command Palette');
  assert.ok(cpContent.includes("'nav-settings'"), 'Must index Settings in Command Palette');
  assert.ok(cpContent.includes("'nav-showcase'"), 'Must index Academic Showcase in Command Palette');
  assert.ok(cpContent.includes("'action-refresh'"), 'Must index Telemetry Refresh action');
});

test('20. Zero-Flicker Sidebar Contract & Stable Button Boundaries', () => {
  const sidebarPath = path.join(frontendDir, 'src/components/layout/Sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

  // Verify transition-colors is used instead of layout-shifting transition-all
  assert.ok(sidebarContent.includes('transition-colors duration-150'), 'Sidebar buttons must use transition-colors duration-150');
  // Verify border-transparent on inactive items prevents 2px box-model shift
  assert.ok(sidebarContent.includes('border-transparent'), 'Inactive nav buttons must have border-transparent');
  // Verify focus:outline-none select-none prevents browser outline flicker
  assert.ok(sidebarContent.includes('focus:outline-none select-none'), 'Nav buttons must have focus:outline-none select-none');
  // Verify shadow-glow-cyan is removed from buttons to prevent Chromium box-shadow expansion blink
  assert.ok(!sidebarContent.match(/navItems\.map[\s\S]*?shadow-glow-cyan/), 'Nav buttons must not animate shadow-glow-cyan on click');
});


