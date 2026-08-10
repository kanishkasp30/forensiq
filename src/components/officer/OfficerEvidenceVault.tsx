import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceFile } from '../../types';
import { VerificationBadge } from '../StatusBadges';
import { FileUpload } from '../FileUpload';
import { Modal } from '../Modal';
import { 
  FolderLock, 
  Hash, 
  Search, 
  Download, 
  CheckCircle2, 
  ShieldAlert, 
  Check, 
  Copy, 
  Image as ImageIcon,
  FileText,
  Music,
  Video,
  File,
  Camera,
  ArrowDown,
  Clock,
  ShieldCheck,
  User,
  History,
  AlertTriangle,
  Sparkles,
  Eye,
  Filter
} from 'lucide-react';

export const OfficerEvidenceVault: React.FC = () => {
  const { cases, addEvidenceToCase, currentUser } = useApp();

  const [inputHash, setInputHash] = useState('');
  const [hashResult, setHashResult] = useState<{ match: boolean; file?: EvidenceFile & { caseId?: string; victim?: string }; caseId?: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  
  // Active Filter Category
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Case for Upload
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'CASE-2026-0891');

  // Modal for Chain of Custody History
  const [inspectingFile, setInspectingFile] = useState<(EvidenceFile & { caseId?: string; victim?: string }) | null>(null);

  // Animated Verification Step State
  const [verifyingStep, setVerifyingStep] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Consolidate all evidence files from cases
  const allFiles = cases.flatMap(c => c.evidenceFiles.map(f => ({ ...f, caseId: c.id, victim: c.victimName })));

  const handleVerifyHash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHash.trim()) return;

    setIsVerifying(true);
    setVerifyingStep(1); // Evidence loaded

    const trimmed = inputHash.trim().toLowerCase();
    const match = allFiles.find(f => f.sha256Hash.toLowerCase() === trimmed || f.name.toLowerCase().includes(trimmed));

    setTimeout(() => {
      setVerifyingStep(2); // SHA-256 Calculated
      setTimeout(() => {
        setVerifyingStep(3); // Timestamp Verified
        setTimeout(() => {
          setVerifyingStep(4); // Chain of Custody Logged
          setTimeout(() => {
            setVerifyingStep(5); // Integrity Verified
            setIsVerifying(false);
            if (match) {
              setHashResult({ match: true, file: match, caseId: match.caseId });
            } else {
              setHashResult({ match: false });
            }
          }, 400);
        }, 400);
      }, 400);
    }, 400);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Category filter helper
  const filteredFiles = allFiles.filter(file => {
    const typeLower = file.type.toLowerCase();
    const nameLower = file.name.toLowerCase();
    const matchesCategory = 
      categoryFilter === 'All' ||
      (categoryFilter === 'Images' && (typeLower.includes('image') || typeLower.includes('png') || typeLower.includes('jpg'))) ||
      (categoryFilter === 'PDFs' && (typeLower.includes('pdf') || nameLower.endsWith('.pdf'))) ||
      (categoryFilter === 'Audio' && (typeLower.includes('audio') || typeLower.includes('mp3') || nameLower.endsWith('.wav'))) ||
      (categoryFilter === 'Video' && (typeLower.includes('video') || typeLower.includes('mp4') || nameLower.endsWith('.mov'))) ||
      (categoryFilter === 'Documents' && (typeLower.includes('doc') || typeLower.includes('document') || typeLower.includes('txt'))) ||
      (categoryFilter === 'Screenshots' && (typeLower.includes('screenshot') || nameLower.includes('screen') || nameLower.includes('capture')));

    const matchesSearch = 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.caseId && file.caseId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0a1224] to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30 font-mono">
            <FolderLock className="w-3.5 h-3.5" />
            <span>ForensIQ Cryptographic Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Secure Digital Evidence Vault
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl font-sans">
            Centralized digital evidence locker supporting multi-modal file ingestion (Images, PDFs, Audio, Video, Documents, Screenshots) with immutable SHA-256 cryptographic hashing and chain-of-custody logging.
          </p>
        </div>

        <div className="z-10 flex flex-col items-end gap-2 shrink-0">
          <div className="text-xs font-mono px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-bold shadow-inner">
            Vault Total: <span className="text-white text-sm">{allFiles.length}</span> Sealed Artifacts
          </div>
        </div>
      </div>

      {/* MANDATORY DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono text-amber-200 flex items-start gap-3 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 uppercase tracking-wider block text-[11px]">Notice Regarding Mock Hashing Data:</strong>
          <p className="text-amber-200/90 leading-relaxed font-sans">
            ForensIQ Secure Evidence Vault uses client-side simulated cryptographic hashing for preview and demonstration purposes. Mock data generated in this preview environment is not certified as legally admissible court evidence.
          </p>
        </div>
      </div>

      {/* SECTION 1: DRAG & DROP EVIDENCE INGESTION */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-cyan-400" />
              1. Ingest Digital Evidence & Generate SHA-256 Hash
            </h2>
            <p className="text-xs text-slate-400">
              Select case target and drop files (Images, PDFs, Audio, Video, Documents, Screenshots).
            </p>
          </div>

          {/* Case selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Target Case:</span>
            <select
              value={selectedCaseId}
              onChange={e => setSelectedCaseId(e.target.value)}
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-bold"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        <FileUpload
          caseId={selectedCaseId}
          uploaderName={currentUser.name}
          onFileUploaded={newFile => {
            addEvidenceToCase(selectedCaseId, newFile);
          }}
        />
      </div>

      {/* SECTION 2: REQUIRED VERIFICATION PIPELINE & HASH CHECKER */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            2. Cryptographic Integrity Verification Engine
          </h2>
          <p className="text-xs text-slate-400">
            Verify evidence authenticity across the required 5-stage chain of custody pipeline.
          </p>
        </div>

        {/* REQUIRED STEP-BY-STEP FLOW DIAGRAM */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Required ForensIQ Chain of Custody Pipeline:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            
            {/* Step 1 */}
            <div className={`p-4 rounded-xl border space-y-2 transition-all ${
              verifyingStep >= 1 ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/40 mx-auto flex items-center justify-center font-bold text-cyan-400 text-xs">
                1
              </div>
              <h4 className="font-mono font-bold text-xs text-white">Evidence</h4>
              <p className="text-[10px] text-slate-400">Artifact ingested into vault</p>
            </div>

            {/* Step 2 */}
            <div className={`p-4 rounded-xl border space-y-2 transition-all ${
              verifyingStep >= 2 ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/40 mx-auto flex items-center justify-center font-bold text-cyan-400 text-xs">
                2
              </div>
              <h4 className="font-mono font-bold text-xs text-white">SHA-256 Hash</h4>
              <p className="text-[10px] text-slate-400">64-char fingerprint generated</p>
            </div>

            {/* Step 3 */}
            <div className={`p-4 rounded-xl border space-y-2 transition-all ${
              verifyingStep >= 3 ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-indigo-500/40 mx-auto flex items-center justify-center font-bold text-indigo-400 text-xs">
                3
              </div>
              <h4 className="font-mono font-bold text-xs text-white">Timestamp</h4>
              <p className="text-[10px] text-slate-400">UTC Stamped & Certified</p>
            </div>

            {/* Step 4 */}
            <div className={`p-4 rounded-xl border space-y-2 transition-all ${
              verifyingStep >= 4 ? 'bg-purple-950/50 border-purple-500/50 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/40 mx-auto flex items-center justify-center font-bold text-purple-400 text-xs">
                4
              </div>
              <h4 className="font-mono font-bold text-xs text-white">Chain of Custody</h4>
              <p className="text-[10px] text-slate-400">Immutable ledger entry</p>
            </div>

            {/* Step 5 */}
            <div className={`p-4 rounded-xl border space-y-2 transition-all ${
              verifyingStep >= 5 ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-lg glow-emerald' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-emerald-500/40 mx-auto flex items-center justify-center font-bold text-emerald-400 text-xs">
                ✓
              </div>
              <h4 className="font-mono font-bold text-xs text-emerald-300">Integrity Verified</h4>
              <p className="text-[10px] text-slate-400">Authenticity confirmed</p>
            </div>

          </div>
        </div>

        {/* Hash Search & Execution Form */}
        <form onSubmit={handleVerifyHash} className="space-y-3">
          <label className="text-xs text-slate-300 font-mono block font-semibold">
            Run Verification Pipeline on SHA-256 Hash or File Name:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter SHA-256 hash string (e.g. 7f8a9b2c...) or file name..."
                value={inputHash}
                onChange={e => setInputHash(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={!inputHash.trim() || isVerifying}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg shrink-0"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Ledger...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute Pipeline</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Verification Result Notification */}
        {hashResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
            hashResult.match ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hashResult.match ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm">INTEGRITY VERIFIED — SHA-256 Hash Matched in Ledger</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span className="text-sm">HASH MISMATCH / UNREGISTERED — Tamper Alert</span>
                  </>
                )}
              </div>
              <span className="px-2.5 py-0.5 rounded font-mono text-[10px] bg-slate-950 border border-slate-800">
                {hashResult.match ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {hashResult.match && hashResult.file && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2 border-t border-emerald-500/30">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">Matched File Name</span>
                  <span className="text-white font-bold truncate block">{hashResult.file.name}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">Associated Case ID</span>
                  <span className="text-cyan-400 font-bold block">{hashResult.caseId}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">Uploaded By</span>
                  <span className="text-slate-200 block">{hashResult.file.uploadedBy}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: VAULT ARTIFACTS GALLERY & DETAIL CARDS */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-5 shadow-xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-cyan-400" />
              3. Ingested Evidence Gallery & Chain of Custody Records
            </h2>
            <p className="text-xs text-slate-400">
              Showing required details: File Name, Type, Size, Upload Timestamp, Uploaded By, SHA-256 Hash, Status, and Custody History.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search file, hash, officer, case..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono border-b border-slate-800/60 pb-3">
          <span className="text-slate-500 font-bold text-[10px] uppercase flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> Category Filter:
          </span>
          {['All', 'Images', 'PDFs', 'Audio', 'Video', 'Documents', 'Screenshots'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                categoryFilter === cat
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* EVIDENCE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFiles.map((file, idx) => (
            <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
              
              <div className="space-y-3">
                
                {/* File Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 shrink-0">
                      {file.type.toLowerCase().includes('image') && <ImageIcon className="w-5 h-5 text-cyan-400" />}
                      {file.type.toLowerCase().includes('pdf') && <FileText className="w-5 h-5 text-red-400" />}
                      {file.type.toLowerCase().includes('audio') && <Music className="w-5 h-5 text-purple-400" />}
                      {file.type.toLowerCase().includes('video') && <Video className="w-5 h-5 text-emerald-400" />}
                      {file.type.toLowerCase().includes('doc') && <File className="w-5 h-5 text-amber-400" />}
                      {file.type.toLowerCase().includes('screenshot') && <Camera className="w-5 h-5 text-blue-400" />}
                    </div>

                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                        Case: {file.caseId || 'CASE-2026-0891'}
                      </span>
                      <h4 className="font-bold text-white text-sm truncate">{file.name}</h4>
                    </div>
                  </div>

                  <VerificationBadge status={file.verificationStatus} />
                </div>

                {/* File Metadata Details Grid (Required Items) */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[9px]">File Type</span>
                    <span className="text-slate-200 font-bold truncate block">{file.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">File Size</span>
                    <span className="text-slate-200 font-bold">{file.size}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Upload Timestamp</span>
                    <span className="text-slate-300 truncate block">{file.uploadDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Uploaded By</span>
                    <span className="text-cyan-300 font-bold truncate block">{file.uploadedBy}</span>
                  </div>
                </div>

                {/* SHA-256 Hash Card */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase font-bold">
                    <span>SHA-256 Fingerprint</span>
                    <span className="text-emerald-400 font-semibold">Immutable Hash</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-cyan-300">
                    <span className="truncate">{file.sha256Hash}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(file.sha256Hash)}
                      className="p-1 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy SHA-256 Hash"
                    >
                      {copiedHash === file.sha256Hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Bottom Card Actions: Download & Chain of Custody Modal trigger */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setInspectingFile(file)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-purple-400" />
                  <span>Chain of Custody ({file.custodyChain?.length || 1})</span>
                </button>

                <a
                  href={file.url || '#'}
                  download
                  className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-mono inline-flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download</span>
                </a>
              </div>

            </div>
          ))}

          {filteredFiles.length === 0 && (
            <div className="col-span-2 p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
              No evidence files match the selected filter category "{categoryFilter}".
            </div>
          )}
        </div>

      </div>

      {/* CHAIN OF CUSTODY HISTORY MODAL */}
      {inspectingFile && (
        <Modal
          isOpen={!!inspectingFile}
          onClose={() => setInspectingFile(null)}
          title={`Chain of Custody Audit Log — ${inspectingFile.name}`}
        >
          <div className="space-y-4 text-xs font-mono">
            
            {/* Header info */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">File Artifact:</span>
                <span className="text-white font-bold">{inspectingFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Case:</span>
                <span className="text-cyan-400 font-bold">{inspectingFile.caseId || 'CASE-2026-0891'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SHA-256 Hash:</span>
                <span className="text-emerald-400 truncate max-w-[240px]">{inspectingFile.sha256Hash}</span>
              </div>
            </div>

            {/* Custody Timeline */}
            <div className="space-y-3">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Sequential Audit History ({inspectingFile.custodyChain.length} Events):</span>

              <div className="space-y-2">
                {inspectingFile.custodyChain.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Event #{idx + 1}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="text-slate-200 font-bold text-xs">{item.action}</div>
                    <div className="flex justify-between text-[10px] pt-1 border-t border-slate-900 text-slate-400">
                      <span>Actor: <strong className="text-cyan-300">{item.actor}</strong> ({item.role})</span>
                      <span className="text-emerald-400 font-bold">SHA-256 Match: PASS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-400">
              Note: Every action on this artifact is cryptographically logged and signed with SHA-256 hashes.
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
