import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, ShieldCheck, Key, Lock, Award, FileText } from 'lucide-react';

export const OfficerProfile: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-2xl font-serif">
            {currentUser.name.charAt(0)}
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Cybercrime Inspector</span>
            </div>
            <h1 className="text-2xl font-serif italic text-white">{currentUser.name}</h1>
            <p className="text-xs text-slate-400 font-mono">
              Badge: <span className="text-cyan-300 font-bold">{currentUser.badgeId || 'OFF-8842'}</span> • {currentUser.email}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
          Clearance Level: TOP SECRET / SCI
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Official Bureau Credentials
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="text-slate-200 font-bold">{currentUser.department || 'Federal Cyber Fraud Unit'}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Badge Serial Number:</span>
              <span className="text-cyan-400 font-bold">{currentUser.badgeId || 'OFF-8842'}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Role Authority:</span>
              <span className="text-amber-400 font-bold">Lead Sworn Investigator</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Security & Authentication Token
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Hardware YubiKey:</span>
              <span className="text-emerald-400 font-bold">Active & Bonded</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Session Encryption:</span>
              <span className="text-cyan-400 font-bold">AES-256 GCM</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Last Sign-In:</span>
              <span className="text-slate-300">Today at 08:30 EST</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
