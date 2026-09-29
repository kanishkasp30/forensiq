import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../StatusBadges';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Key, 
  Lock, 
  Bell, 
  FileText, 
  FolderLock, 
  IndianRupee, 
  CheckCircle2, 
  Copy, 
  Check,
  Edit2
} from 'lucide-react';

export const VictimProfile: React.FC = () => {
  const { currentUser, cases } = useApp();

  const victimCases = cases.filter(c => 
    c.victimName === currentUser.name || 
    c.victimContact.toLowerCase().includes(currentUser.email.toLowerCase())
  );

  const totalLoss = victimCases.reduce((acc, c) => acc + (c.lossAmount || 0), 0);
  const totalEvidenceFiles = victimCases.reduce((acc, c) => acc + c.evidenceFiles.length, 0);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  const pubKeyHash = '0x49f8a72b1c3d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pubKeyHash);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0d14] border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg shadow-cyan-950/50"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif italic text-white">{currentUser.name}</h1>
                <VerificationBadge status={currentUser.isVerified ? 'Verified' : 'Pending'} />
              </div>
              <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-mono border border-cyan-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ForensIQ Verified Citizen Vault ID: {currentUser.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Total Incidents Reported</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{victimCases.length} Cases</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Total Recorded Loss</span>
<div className="text-lg font-bold text-rose-400 font-mono mt-0.5">₹{totalLoss.toLocaleString('en-IN')}</div>          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Vault Evidence Stored</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{totalEvidenceFiles} Files</div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-4 shadow-xl text-xs">
          <h3 className="text-sm font-serif italic text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Personal Identification & Address</span>
          </h3>

          <div className="space-y-3 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Full Name</span>
              <strong className="text-slate-100 text-sm">{currentUser.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Primary Email</span>
              <span className="text-slate-200">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Phone Number</span>
              <span className="text-slate-200">{currentUser.phone || '+1 (555) 234-8901'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Government ID Number</span>
              <span className="font-mono text-cyan-400">{currentUser.govtId || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Physical Address</span>
              <span className="text-slate-300">{currentUser.address || '742 Evergreen Terrace, San Francisco, CA'}</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Security & Preferences */}
        <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-4 shadow-xl text-xs">
          <h3 className="text-sm font-serif italic text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Cryptographic Vault & Security</span>
          </h3>

          <div className="space-y-4">
            {/* Public Key */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400">
                <span>SHA-256 Public Key Fingerprint</span>
                <button
                  onClick={handleCopyKey}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[10px] text-emerald-400 break-all leading-tight">
                {pubKeyHash}
              </div>
            </div>

            {/* Security Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Two-Factor Authentication (2FA)</div>
                  <div className="text-[10px] text-slate-500">Hardware YubiKey / Authenticator App</div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={e => setTwoFactorEnabled(e.target.checked)}
                  className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">Instant Officer Case Alerts</div>
                  <div className="text-[10px] text-slate-500">Email & SMS alerts on investigation milestone changes</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlertsEnabled}
                  onChange={e => setEmailAlertsEnabled(e.target.checked)}
                  className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
