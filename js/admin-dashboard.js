/**
 * Admin Security Operations Center Dashboard Controller
 */
(function () {
  'use strict';

  const authOverlay = document.getElementById('adminAuthOverlay');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('loginError');
  const killswitchBtn = document.getElementById('killswitchBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  const metricStreams = document.getElementById('metricStreams');
  const metricBlocked = document.getElementById('metricBlocked');
  const metricDevtools = document.getElementById('metricDevtools');
  const metricRateLimits = document.getElementById('metricRateLimits');
  const auditTableBody = document.getElementById('auditTableBody');
  const activeTicketsCount = document.getElementById('activeTicketsCount');
  const activeTicketsList = document.getElementById('activeTicketsList');
  const activeSessionsCount = document.getElementById('activeSessionsCount');
  const activeSessionsList = document.getElementById('activeSessionsList');
  const lastUpdated = document.getElementById('lastUpdated');

  let pollInterval = null;

  async function checkAuthAndPoll() {
    try {
      const res = await fetch('/api/admin/telemetry');
      if (res.status === 403 || res.status === 401) {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        // Show login modal
        authOverlay.style.display = 'flex';
        return;
      }

      if (!res.ok) throw new Error('Telemetry request failed');

      authOverlay.style.display = 'none';
      const data = await res.json();
      updateDashboard(data);

      if (!pollInterval) {
        pollInterval = setInterval(checkAuthAndPoll, 3000);
      }
    } catch (err) {
      console.warn('[Admin SOC] Telemetry sync error:', err.message);
    }
  }

  function updateDashboard(data) {
    lastUpdated.textContent = 'Synced ' + new Date().toLocaleTimeString();

    // Metrics
    if (data.metrics) {
      metricStreams.textContent = data.metrics.totalStreamsLastHour || 0;
      metricBlocked.textContent = data.metrics.blockedEventsLastHour || 0;
      metricDevtools.textContent = data.metrics.devtoolsAlertsLastHour || 0;
      metricRateLimits.textContent = data.metrics.rateLimitTriggersLastHour || 0;
    }

    // Active Tickets
    if (data.activeTickets) {
      activeTicketsCount.textContent = data.activeTickets.length;
      if (data.activeTickets.length === 0) {
        activeTicketsList.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:12px">No active streaming tokens</div>';
      } else {
        activeTicketsList.replaceChildren(...data.activeTickets.map(t => {
          const row = document.createElement('div');
          row.style.padding = '8px 0';
          row.style.borderBottom = '1px solid var(--border-subtle)';
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';

          const assetSpan = document.createElement('span');
          assetSpan.style.color = 'var(--accent-gold)';
          assetSpan.style.fontFamily = 'var(--font-mono)';
          assetSpan.textContent = String(t.assetId || '');

          const ttlSpan = document.createElement('span');
          ttlSpan.style.color = 'var(--text-muted)';
          ttlSpan.textContent = `TTL: ${t.expiresIn}s (${t.hitCount} chunks)`;

          row.appendChild(assetSpan);
          row.appendChild(ttlSpan);
          return row;
        }));
      }
    }

    // Active Sessions
    if (data.activeSessions) {
      activeSessionsCount.textContent = data.activeSessions.length;
      activeSessionsList.replaceChildren(...data.activeSessions.map(s => {
        const row = document.createElement('div');
        row.style.padding = '8px 0';
        row.style.borderBottom = '1px solid var(--border-subtle)';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';

        const idSpan = document.createElement('span');
        idSpan.style.fontFamily = 'var(--font-mono)';
        idSpan.style.fontSize = '11px';
        idSpan.textContent = String(s.id || '').slice(0, 14) + '...';

        const roleSpan = document.createElement('span');
        roleSpan.style.color = s.role === 'admin' ? 'var(--accent-gold)' : 'var(--text-muted)';
        roleSpan.textContent = `${String(s.role || '').toUpperCase()} (${s.ticketsIssued || 0} tickets)`;

        row.appendChild(idSpan);
        row.appendChild(roleSpan);
        return row;
      }));
    }

    // Audit Table - Safe DOM construction (prevents XSS)
    if (data.recentEvents && data.recentEvents.length > 0) {
      auditTableBody.replaceChildren(...data.recentEvents.map(e => {
        const tr = document.createElement('tr');

        const tdTime = document.createElement('td');
        tdTime.textContent = new Date(e.timestamp).toLocaleTimeString();

        const tdType = document.createElement('td');
        tdType.style.color = '#fff';
        tdType.style.fontWeight = '500';
        tdType.textContent = String(e.type || '');

        const tdIp = document.createElement('td');
        tdIp.textContent = String(e.ip || '');

        const tdSession = document.createElement('td');
        tdSession.textContent = e.sessionId ? String(e.sessionId).slice(0, 10) + '...' : '-';

        const tdSeverity = document.createElement('td');
        const badge = document.createElement('span');
        let badgeClass = 'badge-info';
        if (e.severity === 'WARN') badgeClass = 'badge-warn';
        if (e.severity === 'CRITICAL') badgeClass = 'badge-critical';
        if (e.severity === 'BLOCKED') badgeClass = 'badge-blocked';
        badge.className = badgeClass;
        badge.textContent = String(e.severity || 'INFO');
        tdSeverity.appendChild(badge);

        const tdDetails = document.createElement('td');
        tdDetails.style.maxWidth = '280px';
        tdDetails.style.whiteSpace = 'nowrap';
        tdDetails.style.overflow = 'hidden';
        tdDetails.style.textOverflow = 'ellipsis';
        const detailsStr = JSON.stringify(e.details || {}).replace(/["{}]/g, ' ').trim() || '-';
        tdDetails.title = detailsStr;
        tdDetails.textContent = detailsStr;

        tr.append(tdTime, tdType, tdIp, tdSession, tdSeverity, tdDetails);
        return tr;
      }));
    }
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.style.display = 'none';

      const username = document.getElementById('adminUser').value;
      const password = document.getElementById('adminPass').value;

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Authentication rejected');
        }

        authOverlay.style.display = 'none';
        checkAuthAndPoll();
      } catch (err) {
        loginError.textContent = err.message;
        loginError.style.display = 'block';
      }
    });
  }

  // Killswitch
  if (killswitchBtn) {
    killswitchBtn.addEventListener('click', async () => {
      if (!confirm('EMERGENCY ACTION: Revoke all active media stream tickets immediately?')) return;
      try {
        const res = await fetch('/api/admin/killswitch', { method: 'POST' });
        if (res.ok) {
          alert('All active media streaming tickets have been purged.');
          checkAuthAndPoll();
        }
      } catch (err) {
        alert('Action failed: ' + err.message);
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = 'index.html';
    });
  }

  // Initial call
  checkAuthAndPoll();
})();
