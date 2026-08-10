import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Shield, 
  UserCheck, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  FileText, 
  FolderLock, 
  Sparkles, 
  Users, 
  Globe, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useApp();

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-[#05070a] bg-cyber-grid text-slate-300 p-4 sm:p-8 flex flex-col justify-center max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-cyan-600 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-950/60 border border-cyan-400/30">
            <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="text-2xl font-serif italic font-bold tracking-tight text-white">
            ForensIQ
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif italic text-white">Select Portal Persona Workspace</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Switch between Victim, Officer, and Administrator views instantly. State and case updates persist across all portals in real-time.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Victim Portal */}
        <div className="bg-[#0a0d14] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 space-y-5 shadow-2xl flex flex-col justify-between group transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800 flex items-center justify-center shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Portal 1</span>
              <h2 className="text-lg font-serif italic text-white mt-0.5">Victim Assistance Portal</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                For victims filing cybercrime reports, managing digital evidence lockers, and tracking investigation status live.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Incident Reporting 4-Step Wizard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>SHA-256 Vault Evidence Locker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>AI Scam Link & Phishing Checker</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelectRole('victim')}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Launch Victim Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Officer Bureau */}
        <div className="bg-[#0a0d14] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 space-y-5 shadow-2xl flex flex-col justify-between group transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Portal 2</span>
              <h2 className="text-lg font-serif italic text-white mt-0.5">Cybercrime Officer Bureau</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                For law enforcement officers prioritizing triage queues, generating Gemini AI leads, and verifying custody chains.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Priority Case Triage Queue</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Gemini AI Auto-Lead Extractor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Suspect IP & Wallet Clustering</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelectRole('officer')}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(8,145,178,0.2)] transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Launch Officer Bureau</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Command */}
        <div className="bg-[#0a0d14] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 space-y-5 shadow-2xl flex flex-col justify-between group transition-all">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-purple-400 border border-slate-800 flex items-center justify-center shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">Portal 3</span>
              <h2 className="text-lg font-serif italic text-white mt-0.5">Administrator Command</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                For cyber command directors managing officer workloads, RBAC permissions, threat intelligence feeds, and audit logs.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Officer Workload Dispatcher</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Platform System Health & Audits</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSelectRole('admin')}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
