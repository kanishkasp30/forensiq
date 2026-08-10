import React from 'react';
import { Modal } from './Modal';
import { ShieldAlert, PhoneCall, Lock, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';

export const EmergencySOSModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="EMERGENCY CYBERCRIME LOCKDOWN & SOS HOTLINE"
      subtitle="Immediate active threat mitigation & Law Enforcement Command escalation"
      icon={<ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl space-y-2">
          <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Under Active Financial Theft or Ransomware Attack?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Follow these emergency steps immediately to preserve electronic evidence and halt unauthorized bank wires or crypto transfers.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-200 block">National Cybercrime Emergency Hotline</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">1-800-CYBER-911 (Toll Free 24/7)</span>
            </div>
            <a
              href="tel:180029237911"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Now
            </a>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-200 block">FinCEN Wire Recall & Crypto Emergency Freeze</span>
              <span className="text-xs text-slate-400">Triggers immediate SWIFT recall for bank wires under 48 hours old</span>
            </div>
            <span className="px-2 py-1 bg-emerald-950 text-emerald-400 text-[11px] font-mono border border-emerald-500/30 rounded">
              Active Protocol
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Crucial Evidence Actions:</h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Do NOT reboot infected devices:</strong> Live volatile RAM memory contains encryption keys and C2 IP sockets.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Take screenshots of chat messages, wallet addresses, and URLs:</strong> Upload directly into your ForensIQ Evidence Vault.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Contact your financial institution:</strong> Inform them of active fraud to freeze outgoing ACH / Wire batches.</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors border border-slate-700 cursor-pointer"
        >
          Dismiss SOS Panel
        </button>
      </div>
    </Modal>
  );
};
