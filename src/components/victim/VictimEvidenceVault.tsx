import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileUpload } from '../FileUpload';
import { Modal } from '../Modal';
import { EvidenceFile } from '../../types';
import { 
  FolderLock, 
  Search, 
  Plus, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  ExternalLink,
  Eye,
  Lock,
  AlertTriangle
} from 'lucide-react';

export const VictimEvidenceVault: React.FC = () => {
  const { currentUser, cases, addEvidenceToCase } = useApp();

  // Victim's cases
  const victimCases = cases.filter(c => 
    c.victimName === currentUser.name || 
    c.victimContact.toLowerCase().includes(currentUser.email.toLowerCase())
  );

  const [selectedCaseId, setSelectedCaseId] = useState<string>(victimCases[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<EvidenceFile | null>(null);

  // All evidence files belonging to victim's cases
  const allEvidenceFiles = victimCases.flatMap(c => 
    c.evidenceFiles.map(f => ({ ...f, caseId: c.id, caseTitle: c.title }))
  );

  const filteredFiles = allEvidenceFiles.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.caseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <FolderLock className="w-3.5 h-3.5" />
            <span>Digital Evidence Locker & SHA-256 Chain of Custody</span>
          </div>
          <h1 className="text-2xl font-serif italic text-white mt-1">Upload Digital Evidence</h1>
          <p className="text-xs text-slate-400">
            Attach screenshots, transaction receipts, bank statements, or chat exports to your active cases.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            {allEvidenceFiles.length} Sealed Files
          </span>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>DISCLAIMER:</strong> ForensIQ Evidence Vault uses client-side simulated cryptographic hashing for testing and demonstration purposes. Mock data generated in this preview environment is not certified as legally admissible court evidence.
        </span>
      </div>

      {/* Main Upload Box & Case Selector */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-6 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Select Incident Case for Evidence Ingestion
            </h3>
            <p className="text-xs text-slate-400">
              Choose the case report to attach your digital evidence files to.
            </p>
          </div>

          {victimCases.length > 0 ? (
            <select
              value={selectedCaseId}
              onChange={e => setSelectedCaseId(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {victimCases.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200 font-sans">
                  {c.id} — {c.title.slice(0, 40)}...
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-rose-400 font-medium">No active cases available. Please file a complaint first.</div>
          )}
        </div>

        {/* Upload Component */}
        {selectedCaseId ? (
          <div className="space-y-3">
            <FileUpload
              caseId={selectedCaseId}
              uploaderName={currentUser.name}
              onFileUploaded={file => addEvidenceToCase(selectedCaseId, file)}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            Select a case above to start uploading evidence.
          </div>
        )}
      </div>

      {/* Vault Evidence Files List */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-serif italic text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Vault Sealed Evidence Files ({filteredFiles.length})</span>
          </h3>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file name, SHA-256, case ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No evidence files found in vault matching search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFiles.map(file => (
              <div key={file.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-mono text-[10px] font-bold text-cyan-400">{file.caseId}</span>
                    <h4 className="font-bold text-white truncate">{file.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 shrink-0">
                    {file.verificationStatus}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-slate-800 flex items-center justify-between gap-2 font-mono text-[10px]">
                  <span className="text-emerald-400 truncate">SHA-256: {file.sha256Hash}</span>
                  <button
                    onClick={() => handleCopyHash(file.sha256Hash)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy SHA-256 Hash"
                  >
                    {copiedHash === file.sha256Hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Size: {file.size} • {file.uploadDate.slice(0, 10)}</span>
                  <button
                    onClick={() => setViewingFile(file)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Inspection Modal */}
      {viewingFile && (
        <Modal
          isOpen={!!viewingFile}
          onClose={() => setViewingFile(null)}
          title={`Evidence File Inspection — ${viewingFile.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Case Reference:</span>
<strong className="text-cyan-400 font-mono">{selectedCaseId}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Uploaded By:</span>
                <strong className="text-slate-200">{viewingFile.uploadedBy}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Upload Timestamp:</span>
                <span className="font-mono text-slate-300">{viewingFile.uploadDate}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>File Format & Size:</span>
                <span className="text-slate-300">{viewingFile.type} ({viewingFile.size})</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Cryptographic Fingerprint</span>
              <div className="font-mono text-emerald-300 break-all text-[11px]">{viewingFile.sha256Hash}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 uppercase font-mono text-[10px]">Chain of Custody Events ({viewingFile.custodyChain.length})</span>
              <div className="space-y-2">
                {viewingFile.custodyChain.map(step => (
                  <div key={step.id} className="p-2.5 rounded-lg bg-[#0a0d14] border border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                      <span>{step.actor} ({step.role})</span>
                      <span>{step.timestamp}</span>
                    </div>
                    <div className="text-slate-200 font-semibold">{step.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
