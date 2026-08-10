import React, { useState } from 'react';
import { CaseItem, CaseStatus, EvidenceFile } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../Modal';
import { StatusBadge, UrgencyBadge, VerificationBadge } from '../StatusBadges';
import { ChainOfCustodyTimeline } from '../Timeline';
import { FileUpload } from '../FileUpload';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  FolderLock, 
  User, 
  Hash, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Send,
  Download,
  AlertOctagon,
  Copy,
  Check,
  CreditCard,
  Building
} from 'lucide-react';

interface CaseInvestigationModalProps {
  caseItem: CaseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaseInvestigationModal: React.FC<CaseInvestigationModalProps> = ({
  caseItem,
  isOpen,
  onClose
}) => {
  const { updateCaseStatus, addCommentToCase, addEvidenceToCase, analyzeEvidenceAI } = useApp();

  const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'ai_analysis' | 'custody' | 'update'>('details');
  const [newStatus, setNewStatus] = useState<CaseStatus>(caseItem?.status || 'Under Review');
  const [officerNote, setOfficerNote] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(caseItem?.aiAnalysis || null);

  if (!caseItem) return null;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCaseStatus(caseItem.id, newStatus, officerNote);
    setOfficerNote('');
    onClose();
  };

  const handleRunAI = async () => {
    setAnalyzing(true);
    const result = await analyzeEvidenceAI(
      `${caseItem.title}\nCategory: ${caseItem.category}\nDescription: ${caseItem.description}`,
      caseItem.category,
      caseItem.id
    );
    setAiResult(result);
    setAnalyzing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Case File Dossier — ${caseItem.id}`}
      subtitle={`Victim: ${caseItem.victimName} | ${caseItem.category}`}
      maxWidth="5xl"
    >
      <div className="space-y-6">
        
        {/* Top Header Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UrgencyBadge level={caseItem.urgency} />
            <StatusBadge status={caseItem.status} />
            <span className="text-xs font-mono text-slate-400">Assigned: {caseItem.assignedOfficer}</span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Incident Date: <span className="text-slate-200">{caseItem.incidentDate}</span>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'details' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Incident & Suspect Details</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'evidence' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderLock className="w-4 h-4 text-emerald-400" />
            <span>Evidence Vault ({caseItem.evidenceFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_analysis')}
            className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ai_analysis' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Gemini AI Forensic Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('custody')}
            className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'custody' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Chain of Custody Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('update')}
            className={`px-4 py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'update' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Record Action / Update Status</span>
          </button>
        </div>

        {/* Tab 1: Incident & Suspect Details */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Incident Summary</h4>
              <h3 className="text-base font-bold text-white">{caseItem.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{caseItem.description}</p>
            </div>

            {/* Financial Details */}
            {caseItem.financialDetails && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Financial & Transaction Traces
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  {caseItem.financialDetails.amountLost && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Total Loss</span>
                      <span className="text-red-400 font-bold text-sm">${caseItem.financialDetails.amountLost.toLocaleString()}</span>
                    </div>
                  )}
                  {caseItem.financialDetails.paymentMethod && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Payment Rail</span>
                      <span className="text-slate-200 font-bold">{caseItem.financialDetails.paymentMethod}</span>
                    </div>
                  )}
                  {caseItem.financialDetails.transactionId && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 col-span-2">
                      <span className="text-slate-500 block text-[10px]">TxHash / Ref ID</span>
                      <span className="text-cyan-300 font-bold text-[11px] truncate block">{caseItem.financialDetails.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suspect Information */}
            {caseItem.suspectInfo && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Suspect Threat Actor Intelligence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <p><strong className="text-slate-400">Alias:</strong> <span className="text-white font-bold">{caseItem.suspectInfo.alias}</span></p>
                    {caseItem.suspectInfo.threatLevel && (
                      <p><strong className="text-slate-400">Threat Level:</strong> <span className="text-red-400 font-bold">{caseItem.suspectInfo.threatLevel}</span></p>
                    )}
                    {caseItem.suspectInfo.ipAddress && (
                      <p><strong className="text-slate-400">Origin IP:</strong> <span className="text-cyan-400">{caseItem.suspectInfo.ipAddress}</span></p>
                    )}
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    {caseItem.suspectInfo.cryptoWallet && (
                      <p><strong className="text-slate-400">Crypto Wallet:</strong> <span className="text-amber-400 text-[11px] block truncate">{caseItem.suspectInfo.cryptoWallet}</span></p>
                    )}
                    {caseItem.suspectInfo.associatedDomain && (
                      <p><strong className="text-slate-400">Domain:</strong> <span className="text-indigo-400">{caseItem.suspectInfo.associatedDomain}</span></p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Evidence Vault */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Chain of Custody File Locker
            </h4>

            <div className="space-y-3">
              {caseItem.evidenceFiles.map(file => (
                <div key={file.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-xs">{file.name}</span>
                    <VerificationBadge status={file.verificationStatus} />
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                    <span className="truncate">SHA-256: {file.sha256Hash}</span>
                    <button
                      onClick={() => copyToClipboard(file.sha256Hash)}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedHash === file.sha256Hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Uploaded by: {file.uploadedBy} • {file.size}</span>
                    <a
                      href={file.url}
                      download
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Gemini AI Analysis */}
        {activeTab === 'ai_analysis' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Gemini Forensic Intelligence Model
              </h4>
              <button
                onClick={handleRunAI}
                disabled={analyzing}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {analyzing ? 'Analyzing Incident...' : 'Run Gemini Pre-Analysis'}
              </button>
            </div>

            {aiResult ? (
              <div className="p-5 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 font-mono">AUTOMATED AI DOSSIER</span>
                  <span className="text-xs font-bold text-red-400">{aiResult.riskLevel} Risk Level</span>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-300 uppercase mb-1">Executive Summary</h5>
                  <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800">{aiResult.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <h5 className="text-xs font-bold text-red-400 uppercase mb-1">Indicators of Compromise (IOC)</h5>
                    <ul className="space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono">
                      {aiResult.indicatorsOfCompromise?.map((ioc: string, idx: number) => (
                        <li key={idx}>• {ioc}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-emerald-400 uppercase mb-1">Recommended Forensic Actions</h5>
                    <ul className="space-y-1 bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono">
                      {aiResult.forensicRecommendations?.map((rec: string, idx: number) => (
                        <li key={idx}>✓ {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                Click "Run Gemini Pre-Analysis" to extract automated IOC indicators and lead recommendations.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Chain of Custody */}
        {activeTab === 'custody' && (
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Immutable Chain of Custody Audit Log
            </h4>
            <ChainOfCustodyTimeline steps={caseItem.evidenceFiles.flatMap(f => f.custodyChain)} />
          </div>
        )}

        {/* Tab 5: Record Action & Update Status */}
        {activeTab === 'update' && (
          <form onSubmit={handleStatusSubmit} className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Record Official Forensic Progress & Change Status</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Incident State</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as CaseStatus)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Submitted">Submitted (New)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Evidence Verified">Evidence Verified</option>
                  <option value="Escalated">Escalated to Federal Unit</option>
                  <option value="In Court">In Court / Prosecution Warrant</option>
                  <option value="Solved">Solved / Funds Recovered</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Investigator</label>
                <input
                  type="text"
                  value={caseItem.assignedOfficer}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Forensic Action Log Note</label>
              <textarea
                rows={3}
                value={officerNote}
                onChange={e => setOfficerNote(e.target.value)}
                placeholder="Detail officer actions taken (e.g. Served subpoena to service provider, validated transaction chain, requested freezing order)."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors shadow-lg cursor-pointer"
              >
                Save Action Note & Update Docket State
              </button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
};
