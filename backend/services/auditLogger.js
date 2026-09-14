const fs = require('fs');
const path = require('path');

const LOG_FILE = path.resolve(__dirname, '../../security_audit.log');
const MAX_MEMORY_EVENTS = 250;
const memoryLogs = [];

/**
 * Structured security audit log event
 */
function logSecurityEvent({ type, ip, sessionId, assetId, details, severity = 'INFO' }) {
  const event = {
    id: 'EVT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    type,
    severity, // 'INFO', 'WARN', 'CRITICAL', 'BLOCKED'
    ip: ip || 'unknown',
    sessionId: sessionId || 'unknown',
    assetId: assetId || null,
    details: details || {}
  };

  memoryLogs.unshift(event);
  if (memoryLogs.length > MAX_MEMORY_EVENTS) {
    memoryLogs.pop();
  }

  // Persist to audit log file asynchronously
  const line = JSON.stringify(event) + '\n';
  fs.appendFile(LOG_FILE, line, 'utf8', (err) => {
    if (err) console.error('[AuditLogger] Error writing to file:', err.message);
  });

  return event;
}

function getRecentAuditEvents(limit = 100, filterType = null) {
  let list = memoryLogs;
  if (filterType) {
    list = list.filter(e => e.type === filterType || e.severity === filterType);
  }
  return list.slice(0, limit);
}

function getSecurityMetrics() {
  const now = Date.now();
  const lastHour = now - 60 * 60 * 1000;
  
  let totalStreams = 0;
  let blockedCount = 0;
  let devtoolsAlerts = 0;
  let rateLimitTriggers = 0;

  for (const log of memoryLogs) {
    const time = new Date(log.timestamp).getTime();
    if (time > lastHour) {
      if (log.type === 'MEDIA_STREAM_SERVED') totalStreams++;
      if (log.severity === 'BLOCKED' || log.severity === 'CRITICAL') blockedCount++;
      if (log.type === 'DEVTOOLS_HEURISTIC_DETECTED') devtoolsAlerts++;
      if (log.type === 'RATE_LIMIT_EXCEEDED') rateLimitTriggers++;
    }
  }

  return {
    totalStreamsLastHour: totalStreams,
    blockedEventsLastHour: blockedCount,
    devtoolsAlertsLastHour: devtoolsAlerts,
    rateLimitTriggersLastHour: rateLimitTriggers,
    totalLoggedEvents: memoryLogs.length
  };
}

module.exports = {
  logSecurityEvent,
  getRecentAuditEvents,
  getSecurityMetrics
};
