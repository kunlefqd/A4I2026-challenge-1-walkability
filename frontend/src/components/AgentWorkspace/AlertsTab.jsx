import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Truck, 
  XCircle, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Filter, 
  ChevronRight,
  Info,
  Sparkles,
  Search
} from 'lucide-react';

export default function AlertsTab({
  alerts,
  onDismissAlert,
  onDeployTruckFromAlert,
  auditLog,
  onSelectTractById
}) {
  const [activeSubTab, setActiveSubTab] = useState('alerts'); // 'alerts' or 'audit'
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchAudit, setSearchAudit] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'all') return true;
    return alert.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const filteredAuditLog = auditLog.filter(log => {
    if (!searchAudit) return true;
    const term = searchAudit.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.location.toLowerCase().includes(term) ||
      log.equityResult.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900/60">
      
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'alerts'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Alerts ({alerts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'audit'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Log & Equity ({auditLog.length})</span>
          </button>
        </div>

        {activeSubTab === 'alerts' && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Filter:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded px-2 py-1 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
            </select>
          </div>
        )}

        {activeSubTab === 'audit' && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search audit..."
              value={searchAudit}
              onChange={(e) => setSearchAudit(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-7 pr-2 py-1 focus:outline-none w-36 sm:w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* VIEW 1: ACTIVE ALERTS */}
        {activeSubTab === 'alerts' && (
          <>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                <h4 className="text-sm font-semibold text-slate-200">No Active High-Risk Alerts</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  All active thermal anomaly alerts have been addressed or dismissed. Continuous BQML spatial monitoring active.
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-lg space-y-3 transition-all"
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide border flex items-center gap-1 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Zone info & BQML Offset badge */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => onSelectTractById(alert.tractId)}
                      className="font-medium text-orange-300 hover:text-orange-200 hover:underline flex items-center gap-1 text-left"
                    >
                      <span>{alert.tractName}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800">
                      Offset: {alert.bqmlOffset}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Key Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-2 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800/80">
                    <div>Heat Offset: <b className="text-orange-400">{alert.metrics.heatOffset}</b></div>
                    <div>Surface: <b className="text-rose-400">{alert.metrics.surfaceTemp}</b></div>
                    <div>Zero-Car: <b className="text-purple-300">{alert.metrics.noVehicleRate || alert.metrics.occupancy}</b></div>
                    <div>Affected: <b className="text-slate-100">{alert.affectedPop.toLocaleString()}</b></div>
                  </div>

                  {/* Suggested Action Note */}
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-200 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span><b>AI Plan:</b> {alert.suggestedAction}</span>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dismiss</span>
                    </button>

                    <button
                      onClick={() => onDeployTruckFromAlert(alert)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-orange-950/50 transition-all hover:scale-[1.02]"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Take Action (Deploy Truck)</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </>
        )}

        {/* VIEW 2: ACTION HISTORY & AUDIT LOG */}
        {activeSubTab === 'audit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Automated Title VI Equity Verification Ledger</span>
              <span className="font-mono text-emerald-400 font-semibold">100% Audited</span>
            </div>

            {filteredAuditLog.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md space-y-2 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <h4 className="text-xs font-bold text-white">{log.action}</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      📍 {log.location}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    {log.timestamp}
                  </span>
                </div>

                {/* Actor */}
                <div className="text-[10px] text-slate-400 font-mono">
                  Actor: <span className="text-slate-300">{log.actor}</span>
                </div>

                {/* Automated Equity Check Result Badge */}
                <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Automated Equity Check:</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      ✓ {log.equityResult}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {log.equityDetails}
                  </p>
                </div>

                {/* Realized Impact */}
                {log.impact && (
                  <div className="text-[11px] text-cyan-300 flex items-center gap-1.5 pt-1">
                    <span className="font-semibold text-slate-400">Impact:</span>
                    <span>{log.impact}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
