import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../Cards';
import { StatusBadge, UrgencyBadge } from '../StatusBadges';
import { CaseItem } from '../../types';
import { 
  Plus, 
  Clock, 
  DollarSign, 
  FolderLock, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Bell,
  Sparkles,
  UserCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VictimOverviewProps {
  onSelectCase?: (c: CaseItem) => void;
}

export const VictimOverview: React.FC<VictimOverviewProps> = ({ onSelectCase }) => {
  const { currentUser, cases, notifications } = useApp();
  const navigate = useNavigate();

  // Filter cases belonging to current victim
  const victimCases = cases.filter(c => 
    c.victimName === currentUser.name || 
    c.victimContact.toLowerCase().includes(currentUser.email.toLowerCase())
  );

  // Dashboard Statistics
  const totalComplaints = victimCases.length;
  const activeCases = victimCases.filter(c => c.status !== 'Solved' && c.status !== 'Closed');
  const activeCasesCount = activeCases.length;
  const resolvedCasesCount = victimCases.filter(c => c.status === 'Solved' || c.status === 'Closed').length;
  const totalLoss = victimCases.reduce((acc, c) => acc + (c.lossAmount || 0), 0);

  // Latest Case
  const latestCase = victimCases.length > 0 ? victimCases[0] : null;

  // Recent Updates across all victim cases (flattened timeline events)
  const recentUpdates = victimCases
    .flatMap(c => c.timeline.map(ev => ({ ...ev, caseId: c.id, caseTitle: c.title })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl shadow-black/40">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Victim Assistance & Recovery Workspace</span>
          </div>
          <h1 className="text-2xl font-serif italic text-white">Welcome back, {currentUser.name}</h1>
          <p className="text-xs text-slate-400">
            Your reported incidents are secured with cryptographic SHA-256 chain of custody and actively assigned to cybercrime investigators.
          </p>
        </div>

        <button
          onClick={() => navigate('/victim/file-complaint')}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(8,145,178,0.25)] flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>File Cybercrime Complaint</span>
        </button>
      </div>

      {/* Required Stats Dashboard Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={totalComplaints}
          subtitle="Filed in ForensIQ Vault"
          icon={<FileText className="w-5 h-5 text-indigo-400" />}
          accentColor="indigo"
        />
        <StatCard
          title="Active Cases"
          value={activeCasesCount}
          subtitle="Under Active Forensic Inquiry"
          icon={<Clock className="w-5 h-5 text-cyan-400" />}
          accentColor="cyan"
        />
        <StatCard
          title="Resolved Cases"
          value={resolvedCasesCount}
          subtitle="Successfully Prosecuted / Closed"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          accentColor="emerald"
        />
        <StatCard
          title="Reported Loss Amount"
          value={`$${totalLoss.toLocaleString()}`}
          subtitle="Submitted for Recovery Recall"
          icon={<DollarSign className="w-5 h-5 text-rose-400" />}
          accentColor="red"
        />
      </div>

      {/* Main Grid: Latest Case Status + Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Latest Case Status Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif italic text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Latest Reported Case Status</span>
            </h3>
            <button
              onClick={() => navigate('/victim/cases')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({totalComplaints})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestCase ? (
            <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-5 shadow-2xl relative overflow-hidden group">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{latestCase.id}</span>
                  <span className="text-[11px] text-slate-500 font-mono">• {latestCase.reportedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UrgencyBadge level={latestCase.urgency} />
                  <StatusBadge status={latestCase.status} />
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {latestCase.title}
                </h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {latestCase.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[10px]">Category</span>
                  <div className="font-semibold text-slate-300 truncate mt-0.5">{latestCase.category}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[10px]">Assigned Officer</span>
                  <div className="font-semibold text-slate-300 truncate mt-0.5">{latestCase.assignedOfficer}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[10px]">Loss Amount</span>
                  <div className="font-bold text-rose-400 font-mono mt-0.5">
                    {latestCase.lossAmount ? `$${latestCase.lossAmount.toLocaleString()}` : '$0'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{latestCase.evidenceFiles.length} Evidence Files Vault Stamped</span>
                </div>

                <button
                  onClick={() => {
                    if (onSelectCase) onSelectCase(latestCase);
                    navigate('/victim/cases');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-semibold text-xs rounded-xl border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Inspect Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0a0d14] border border-slate-800 text-center space-y-4">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-slate-400 text-xs">You have not submitted any cybercrime complaints yet.</div>
              <button
                onClick={() => navigate('/victim/file-complaint')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                File Cybercrime Complaint Now
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Recent Updates Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif italic text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Recent Investigation Updates</span>
            </h3>
            <button
              onClick={() => navigate('/victim/notifications')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-4 shadow-2xl">
            {recentUpdates.length > 0 ? (
              <div className="space-y-4">
                {recentUpdates.map(upd => (
                  <div key={upd.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-cyan-400">{upd.caseId}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{upd.timestamp.slice(0, 16)}</span>
                    </div>
                    <div className="font-bold text-slate-200">{upd.title}</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{upd.description}</p>
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Actor: <strong className="text-slate-300">{upd.actor}</strong></span>
                      <span className="font-mono text-indigo-400 uppercase">{upd.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No recent updates recorded yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60">
        <button
          onClick={() => navigate('/victim/file-complaint')}
          className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <Plus className="w-5 h-5" />
          </div>
          <div className="font-bold text-white text-xs group-hover:text-cyan-400 transition-colors">File New Complaint</div>
          <div className="text-[11px] text-slate-400 mt-1">Submit 6-step incident report</div>
        </button>

        <button
          onClick={() => navigate('/victim/evidence')}
          className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <FolderLock className="w-5 h-5" />
          </div>
          <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">Upload Evidence</div>
          <div className="text-[11px] text-slate-400 mt-1">SHA-256 Vault File Stamping</div>
        </button>

        <button
          onClick={() => navigate('/victim/timeline')}
          className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors">Case Timeline</div>
          <div className="text-[11px] text-slate-400 mt-1">Track milestone progress live</div>
        </button>

        <button
          onClick={() => navigate('/victim/notifications')}
          className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Bell className="w-5 h-5" />
          </div>
          <div className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">Notifications</div>
          <div className="text-[11px] text-slate-400 mt-1">Officer alerts & status changes</div>
        </button>
      </div>

    </div>
  );
};
