import React, { ReactNode } from 'react';
import { CaseItem, ThreatFeedItem } from '../types';
import { UrgencyBadge, StatusBadge } from './StatusBadges';
import { ArrowUpRight, ShieldAlert, FileText, Lock, Calendar, User, DollarSign, Activity, Hash, AlertOctagon } from 'lucide-react';

export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  subtitle?: string;
  accentColor?: 'cyan' | 'red' | 'emerald' | 'amber' | 'purple';
}> = ({ title, value, change, isPositive, icon, subtitle, accentColor = 'cyan' }) => {
  const accentGlows = {
    cyan: 'border-slate-800 hover:border-cyan-500/30 text-cyan-400',
    red: 'border-slate-800 hover:border-red-500/30 text-red-400',
    emerald: 'border-slate-800 hover:border-emerald-500/30 text-emerald-400',
    amber: 'border-slate-800 hover:border-amber-500/30 text-amber-400',
    purple: 'border-slate-800 hover:border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900/40 border ${accentGlows[accentColor]} transition-colors relative overflow-hidden group shadow-xl`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
        <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300 group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-serif text-white">{value}</span>
        {change && (
          <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-xs text-slate-500 leading-snug">{subtitle}</p>}
    </div>
  );
};

export const CaseCard: React.FC<{
  caseItem: CaseItem;
  onSelect: (caseItem: CaseItem) => void;
  showOfficerControls?: boolean;
}> = ({ caseItem, onSelect, showOfficerControls = false }) => {
  return (
    <div 
      onClick={() => onSelect(caseItem)}
      className="p-5 rounded-2xl bg-[#0a0d14] hover:bg-slate-800/30 border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 shadow-xl cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 font-mono text-[11px] font-bold border border-slate-800">
            {caseItem.id}
          </span>
          <UrgencyBadge level={caseItem.urgency} />
        </div>
        <StatusBadge status={caseItem.status} />
      </div>

      <h3 className="mt-3 text-base font-serif italic text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
        {caseItem.title}
      </h3>

      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {caseItem.description}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-800/50 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">{caseItem.victimName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{caseItem.reportedDate.split(' ')[0]}</span>
        </div>
        {caseItem.lossAmount ? (
          <div className="flex items-center gap-1.5 text-red-400 font-mono font-medium">
            <DollarSign className="w-3.5 h-3.5" />
            <span>${caseItem.lossAmount.toLocaleString()} Loss</span>
          </div>
        ) : null}
        <div className="flex items-center gap-1.5 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>{caseItem.evidenceFiles.length} Evidence File(s)</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/50">
        <span className="text-slate-500">
          Assigned: <strong className="text-slate-300">{caseItem.assignedOfficer}</strong>
        </span>
        <span className="text-cyan-400 font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Inspect Case <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export const ThreatCard: React.FC<{ threat: ThreatFeedItem }> = ({ threat }) => {
  return (
    <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-red-500/30 transition-all text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-bold text-red-400 uppercase tracking-wider">
          <AlertOctagon className="w-3.5 h-3.5" />
          {threat.threatLevel} Threat
        </span>
        <span className="text-slate-500 text-[11px] font-mono">{threat.timestamp}</span>
      </div>
      <h4 className="mt-1.5 text-sm font-semibold text-slate-200">{threat.title}</h4>
      <div className="mt-2 space-y-1 text-slate-400">
        <p><strong className="text-slate-300">Source:</strong> <code className="text-amber-400 font-mono">{threat.sourceIp}</code></p>
        <p><strong className="text-slate-300">Target Sector:</strong> {threat.targetSector}</p>
      </div>
      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
          {threat.type}
        </span>
        <span className="text-emerald-400 font-mono text-[11px]">{threat.status}</span>
      </div>
    </div>
  );
};
