import React from 'react';
import { UrgencyLevel, CaseStatus, UserRole } from '../types';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, ShieldAlert, FileCheck, Shield, UserCheck, ShieldCheck } from 'lucide-react';

export const UrgencyBadge: React.FC<{ level: UrgencyLevel; showIcon?: boolean }> = ({ level, showIcon = true }) => {
  const styles = {
    Critical: 'bg-red-500/15 text-red-400 border-red-500/30 glow-red',
    High: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  const icons = {
    Critical: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
    High: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
    Medium: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
    Low: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {showIcon && icons[level]}
      <span>{level} Priority</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const styles: Record<CaseStatus, string> = {
    'Submitted': 'bg-slate-800 text-slate-300 border-slate-700',
    'Under Review': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'Evidence Verified': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    'Escalated': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'In Court': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    'Solved': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Closed': 'bg-slate-800/80 text-slate-400 border-slate-700/60',
  };

  const icons: Record<CaseStatus, React.ReactNode> = {
    'Submitted': <Clock className="w-3 h-3" />,
    'Under Review': <FileCheck className="w-3 h-3" />,
    'Evidence Verified': <CheckCircle2 className="w-3 h-3" />,
    'Escalated': <ShieldAlert className="w-3 h-3" />,
    'In Court': <Shield className="w-3 h-3" />,
    'Solved': <CheckCircle2 className="w-3 h-3" />,
    'Closed': <Clock className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      <span>{status}</span>
    </span>
  );
};

export const VerificationBadge: React.FC<{ status: 'Verified' | 'Pending' | 'Flagged' }> = ({ status }) => {
  if (status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>SHA-256 VERIFIED</span>
      </span>
    );
  }
  if (status === 'Flagged') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/80 text-red-400 border border-red-500/40">
        <ShieldAlert className="w-3 h-3 text-red-400" />
        <span>HASH MISMATCH / FLAGGED</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/80 text-amber-400 border border-amber-500/40">
      <Clock className="w-3 h-3 text-amber-400" />
      <span>PENDING HASH CHECK</span>
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const configs = {
    victim: {
      label: 'Victim Portal',
      bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    officer: {
      label: 'Cybercrime Officer',
      bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    admin: {
      label: 'Administrator',
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[role];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
