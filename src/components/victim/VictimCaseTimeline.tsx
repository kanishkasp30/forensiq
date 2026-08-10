import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, UrgencyBadge } from '../StatusBadges';
import { CaseTimeline } from '../Timeline';
import { 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Send, 
  Sparkles, 
  MessageSquare,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export const VictimCaseTimeline: React.FC = () => {
  const { currentUser, cases, addCommentToCase } = useApp();

  const victimCases = cases.filter(c => 
    c.victimName === currentUser.name || 
    c.victimContact.toLowerCase().includes(currentUser.email.toLowerCase())
  );

  const [selectedCaseId, setSelectedCaseId] = useState<string>(victimCases[0]?.id || '');
  const [commentInput, setCommentInput] = useState('');

  const selectedCase = victimCases.find(c => c.id === selectedCaseId) || victimCases[0];

  const handlePostInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !commentInput.trim()) return;

    addCommentToCase(selectedCase.id, `[Status Inquiry] ${commentInput}`, false);
    setCommentInput('');
  };

  // 5 Stages Milestone Progression
  const stages = [
    { label: 'Submitted', key: 'Submitted' },
    { label: 'Under Review', key: 'Under Review' },
    { label: 'Evidence Verified', key: 'Evidence Verified' },
    { label: 'Escalated / In Court', key: 'In Court' },
    { label: 'Solved / Closed', key: 'Solved' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Evidence Verified': return 2;
      case 'Escalated': case 'In Court': return 3;
      case 'Solved': case 'Closed': return 4;
      default: return 1;
    }
  };

  const currentStageIdx = selectedCase ? getStageIndex(selectedCase.status) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Case Selector */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Live Incident Investigation Progression</span>
          </div>
          <h1 className="text-2xl font-serif italic text-white mt-1">Case Timeline & Status Tracking</h1>
          <p className="text-xs text-slate-400">
            Follow forensic analysis milestones, officer assignments, and court subpoena updates step by step.
          </p>
        </div>

        {victimCases.length > 0 && (
          <select
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {victimCases.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200 font-sans">
                {c.id} — {c.title.slice(0, 35)}...
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedCase ? (
        <div className="space-y-6">
          
          {/* Milestone Progress Stepper Bar */}
          <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400">{selectedCase.id}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedCase.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <UrgencyBadge level={selectedCase.urgency} />
                <StatusBadge status={selectedCase.status} />
              </div>
            </div>

            {/* Stage Stepper */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Investigation Lifecycle Stage</span>
              <div className="grid grid-cols-5 gap-2">
                {stages.map((st, idx) => {
                  const isCompleted = currentStageIdx > idx;
                  const isCurrent = currentStageIdx === idx;
                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                        isCurrent 
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' 
                          : isCompleted 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-900/40 border-slate-800 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono">{idx + 1}</span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold truncate">{st.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chronological Vertical Events Timeline */}
          <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Forensic Chain of Events Log ({selectedCase.timeline.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Assigned Officer: {selectedCase.assignedOfficer}</span>
            </div>

            <CaseTimeline events={selectedCase.timeline} />

            {/* Post Status Inquiry */}
            <form onSubmit={handlePostInquiry} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 pt-4">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Send Direct Timeline Update Inquiry to Inspector
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask assigned officer for status update or add new event context..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Update</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0a0d14] border border-slate-800 text-center text-slate-500 text-xs">
          No cases reported yet. File a cybercrime complaint to track case timeline.
        </div>
      )}

    </div>
  );
};
