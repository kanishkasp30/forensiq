import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/Cards';
import { CaseTable } from '../components/Tables';

import {
  Cpu,
  Users,
  ShieldAlert,
  Lock,
  Activity,
  Globe,
  Database,
  Sliders,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    cases,
    auditLogs,
    threatFeed,
    assignOfficerToCase,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'workload' | 'threats' | 'rbac' | 'audit'
  >('analytics');

  const [selectedCaseId, setSelectedCaseId] = useState(
    cases[0]?.id || ''
  );

  const [targetOfficer, setTargetOfficer] = useState(
    'Inspector Sarah Vance'
  );

  /* ---------------------------------------------------------------------- */
  /* Analytics                                                              */
  /* ---------------------------------------------------------------------- */

  const totalCases = cases.length;

  const criticalCases = cases.filter(
    (c) => c.urgency === 'Critical'
  ).length;

  const totalFinancialLoss = cases.reduce(
    (acc, c) => acc + (c.lossAmount || 0),
    0
  );

  /* ---------------------------------------------------------------------- */
  /* Officer List                                                           */
  /* ---------------------------------------------------------------------- */

  const officersList = [
    {
      name: 'Inspector Sarah Vance',
      badge: 'CC-OFFICER-8902',
      cases: cases.filter((c) =>
        c.assignedOfficer.includes('Sarah')
      ).length,
      status: 'Active Duty',
    },

    {
      name: 'Detective James Wu',
      badge: 'CC-OFFICER-4412',
      cases: cases.filter((c) =>
        c.assignedOfficer.includes('James')
      ).length,
      status: 'Active Duty',
    },

    {
      name: 'Agent Elena Rostova',
      badge: 'CC-OFFICER-7710',
      cases: cases.filter((c) =>
        c.assignedOfficer.includes('Elena')
      ).length,
      status: 'On Investigation',
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* Reassign Case                                                          */
  /* ---------------------------------------------------------------------- */

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCaseId) {
      alert('Please select a case.');
      return;
    }

    assignOfficerToCase(
      selectedCaseId,
      targetOfficer
    );

    alert(
      `Case ${selectedCaseId} successfully reassigned to ${targetOfficer}.`
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Tab Button                                                             */
  /* ---------------------------------------------------------------------- */

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
      activeTab === tab
        ? 'border-purple-400 text-purple-400 bg-slate-900/50'
        : 'border-transparent text-slate-400 hover:text-slate-200'
    }`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

      {/* ------------------------------------------------------------------ */}
      {/* Top Banner                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl shadow-black/40">

        <div className="space-y-1">

          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
            <Cpu className="w-3.5 h-3.5" />

            <span>
              Master Administrator Command & Infrastructure Control
            </span>
          </div>

          <h1 className="text-2xl font-serif italic text-white">
            Director Command Dashboard
          </h1>

          <p className="text-xs text-slate-500 font-mono">
            Platform Status: NOMINAL • Cryptographic Integrity: 100%
            SHA-256 Vault Stamped
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold font-mono">
            {officersList.length} Active Officer Desks
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
            RBAC Enforced
          </span>

        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Analytics Grid                                                     */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Total Registered Cases"
          value={totalCases}
          subtitle="Cross-Jurisdictional Database"
          icon={
            <Database className="w-5 h-5 text-purple-400" />
          }
          accentColor="purple"
        />

        <StatCard
          title="Critical Cases"
          value={criticalCases}
          subtitle="Requiring Immediate Attention"
          icon={
            <ShieldAlert className="w-5 h-5 text-red-400" />
          }
          accentColor="red"
        />

        <StatCard
          title="Total Reported Loss"
          value={`₹${totalFinancialLoss.toLocaleString('en-IN')}`}
          subtitle="Tracked Across Incidents"
          icon={
            <ShieldAlert className="w-5 h-5 text-red-400" />
          }
          accentColor="red"
        />

        <StatCard
          title="Platform Audit Events"
          value={auditLogs.length}
          subtitle="Recorded Immutable Actions"
          icon={
            <Activity className="w-5 h-5 text-emerald-400" />
          }
          accentColor="emerald"
        />

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Navigation Tabs                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex overflow-x-auto border-b border-slate-800 text-xs font-semibold">

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={tabClass('analytics')}
        >
          <Cpu className="w-4 h-4" />
          <span>Master Registry & Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workload')}
          className={tabClass('workload')}
        >
          <Users className="w-4 h-4" />
          <span>Officer Workload & Dispatcher</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('threats')}
          className={tabClass('threats')}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Threat Intelligence Feeds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rbac')}
          className={tabClass('rbac')}
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Role Access Control (RBAC)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={tabClass('audit')}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Audit Logs & System Health</span>
        </button>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1 - ANALYTICS                                                  */}
      {/* ------------------------------------------------------------------ */}

      {activeTab === 'analytics' && (
        <div className="space-y-6">

          <CaseTable
            cases={cases}
            title="Administrator Master Incident Ledger"
            subtitle="Complete system oversight of all victim submissions, assigned officers, and evidence hashes"
          />

        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2 - WORKLOAD                                                   */}
      {/* ------------------------------------------------------------------ */}

      {activeTab === 'workload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Officer Workload */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">

            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Cybercrime Officer Division Workload
            </h3>

            <div className="space-y-3">

              {officersList.map((off) => (
                <div
                  key={off.badge}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >

                  <div className="space-y-1">

                    <p className="font-bold text-slate-100">
                      {off.name}
                    </p>

                    <p className="text-[10px] font-mono text-cyan-400">
                      {off.badge}
                    </p>

                  </div>

                  <div className="text-right space-y-1">

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {off.cases} Active Cases
                    </span>

                    <p className="text-[10px] text-emerald-400">
                      {off.status}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* Reassignment */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">

            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Reassign Incident to Officer
            </h3>

            <form
              onSubmit={handleReassign}
              className="space-y-4"
            >

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Case ID
                </label>

                <select
                  value={selectedCaseId}
                  onChange={(e) =>
                    setSelectedCaseId(e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                >

                  {cases.length === 0 ? (
                    <option value="">
                      No cases available
                    </option>
                  ) : (
                    cases.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.id} — {c.title.slice(0, 30)}
                        {c.title.length > 30 ? '...' : ''}
                      </option>
                    ))
                  )}

                </select>

              </div>

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Lead Officer Assignment
                </label>

                <select
                  value={targetOfficer}
                  onChange={(e) =>
                    setTargetOfficer(e.target.value)
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                >

                  {officersList.map((off) => (
                    <option
                      key={off.badge}
                      value={off.name}
                    >
                      {off.name} ({off.badge})
                    </option>
                  ))}

                </select>

              </div>

              <button
                type="submit"
                disabled={!selectedCaseId}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Execute Officer Reassignment
              </button>

            </form>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3 - THREAT INTELLIGENCE                                       */}
      {/* ------------------------------------------------------------------ */}

      {activeTab === 'threats' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Global Threat Intelligence Stream
              </h3>

              <p className="text-xs text-slate-400">
                Correlated malicious C2 IP blocks, ransomware signatures,
                and active phishing domains from partner agencies.
              </p>

            </div>

          </div>

          {threatFeed.length === 0 ? (
            <div className="p-10 text-center bg-slate-950 border border-slate-800 rounded-xl">

              <Globe className="w-8 h-8 text-slate-600 mx-auto mb-3" />

              <p className="text-sm font-semibold text-slate-300">
                No threat intelligence available
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Threat intelligence records will appear here when connected
                to a trusted feed.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {threatFeed.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-mono font-bold text-red-400">
                      {item.threatLevel} THREAT
                    </span>

                    <span className="text-[10px] font-mono text-slate-500">
                      {item.timestamp}
                    </span>

                  </div>

                  <h4 className="text-sm font-bold text-slate-100">
                    {item.title}
                  </h4>

                  <div className="text-xs text-slate-300 font-mono space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">

                    <p>
                      Source IP:{' '}
                      <code className="text-amber-400">
                        {item.sourceIp}
                      </code>
                    </p>

                    <p>
                      Target Sector:{' '}
                      {item.targetSector}
                    </p>

                    <p>
                      Status:{' '}
                      <span className="text-cyan-400">
                        {item.status}
                      </span>
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4 - RBAC                                                       */}
      {/* ------------------------------------------------------------------ */}

      {activeTab === 'rbac' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">

          <div className="space-y-1">

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Role-Based Access Control (RBAC) Policy Matrix
            </h3>

            <p className="text-xs text-slate-400">
              Granular permission gates enforced across Victim,
              Cyber Officer, and Administrator persona contexts.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs border-collapse">

              <thead>

                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono">

                  <th className="p-3">
                    Platform Capability / Action
                  </th>

                  <th className="p-3 text-indigo-400">
                    Victim
                  </th>

                  <th className="p-3 text-cyan-400">
                    Cybercrime Officer
                  </th>

                  <th className="p-3 text-purple-400">
                    Administrator
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800 text-slate-200">

                <tr>
                  <td className="p-3 font-semibold">
                    Report Incident & Upload Evidence
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">
                    View Internal Police Case Notes
                  </td>

                  <td className="p-3 text-red-400">
                    ✗ Denied
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">
                    Update Official Incident Status
                  </td>

                  <td className="p-3 text-red-400">
                    ✗ Denied
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">
                    Execute Gemini AI Lead Extractor
                  </td>

                  <td className="p-3 text-slate-500">
                    Limited (Link Scan)
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Full Dossier
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Full Dossier
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold">
                    Reassign Officer Cases & Manage RBAC
                  </td>

                  <td className="p-3 text-red-400">
                    ✗ Denied
                  </td>

                  <td className="p-3 text-red-400">
                    ✗ Denied
                  </td>

                  <td className="p-3 text-emerald-400">
                    ✓ Allowed
                  </td>
                </tr>

              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 5 - AUDIT LOGS                                                 */}
      {/* ------------------------------------------------------------------ */}

      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">

          <div className="space-y-1">

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Cryptographic Audit Log Vault
            </h3>

            <p className="text-xs text-slate-400">
              Immutable time-stamped security ledger recording all
              case creations, evidence uploads, status mutations,
              and officer access.
            </p>

          </div>

          {auditLogs.length === 0 ? (
            <div className="p-10 text-center bg-slate-950 border border-slate-800 rounded-xl">

              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3" />

              <p className="text-sm font-semibold text-slate-300">
                No audit events recorded
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Audit events will be recorded as users perform
                protected actions.
              </p>

            </div>
          ) : (
            <div className="space-y-2">

              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-mono"
                >

                  <div className="space-y-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="text-cyan-400 font-bold">
                        {log.action}
                      </span>

                      <span className="text-slate-400">
                        • Actor:{' '}
                        <strong className="text-slate-200">
                          {log.actor}
                        </strong>{' '}
                        ({log.role})
                      </span>

                    </div>

                    <div className="text-[11px] text-slate-400 font-sans space-y-0.5">

                      <p>
                        Target:{' '}
                        <span className="text-slate-300">
                          {log.target}
                        </span>
                      </p>

                      <p>
                        IP Address:{' '}
                        <span className="text-slate-300 font-mono">
                          {log.ipAddress}
                        </span>
                      </p>

                      <p>
                        Result:{' '}
                        <span
                          className={
                            log.status === 'Success'
                              ? 'text-emerald-400'
                              : log.status === 'Flagged'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }
                        >
                          {log.status}
                        </span>
                      </p>

                    </div>

                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0">
                    {log.timestamp}
                  </span>

                </div>
              ))}

            </div>
          )}

        </div>
      )}

    </div>
  );
};