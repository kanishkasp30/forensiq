import React from 'react';
import { CaseTimelineEvent, CustodyStep } from '../types';
import { CheckCircle2, ShieldCheck, UserCheck, Sparkles, FileText, AlertCircle, Lock, Shield } from 'lucide-react';

export const CaseTimeline: React.FC<{ events: CaseTimelineEvent[] }> = ({ events }) => {
  const getIcon = (type: CaseTimelineEvent['type']) => {
    switch (type) {
      case 'submission':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'officer_assigned':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      case 'ai_scan':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'evidence_added':
        return <Lock className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events.map((evt, idx) => (
        <div key={evt.id || idx} className="relative group">
          {/* Node marker */}
          <div className="absolute -left-[30px] top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
            {getIcon(evt.type)}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-200">{evt.title}</h4>
              <span className="text-[11px] font-mono text-slate-500">{evt.timestamp}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>
            <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <span>By: <strong className="text-slate-300">{evt.actor}</strong></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChainOfCustodyTimeline: React.FC<{ steps: CustodyStep[] }> = ({ steps }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
        <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          Immutable Chain of Custody Audit Log
        </span>
        <span className="font-mono text-[11px]">SHA-256 Vault Stamped</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={step.id || idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{step.action}</span>
                {step.hashMatch ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    HASH MATCH OK
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-400 border border-red-500/30">
                    INTEGRITY WARNING
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px]">Actor: <span className="text-slate-300 font-medium">{step.actor}</span> ({step.role})</p>
              {step.notes && <p className="text-slate-500 italic text-[11px]">{step.notes}</p>}
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">{step.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
