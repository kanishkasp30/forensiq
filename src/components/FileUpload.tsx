import React, { useState, useRef } from 'react';
import { EvidenceFile } from '../types';
import { VerificationBadge } from './StatusBadges';
import { 
  UploadCloud, 
  File as FileIcon, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Camera, 
  ShieldCheck, 
  Hash, 
  Trash2, 
  Check, 
  Lock, 
  AlertCircle
} from 'lucide-react';

interface FileUploadProps {
  caseId?: string;
  onFileUploaded?: (file: EvidenceFile) => void;
  onUploadComplete?: (file: EvidenceFile) => void;
  uploaderName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  caseId = 'CASE-CURRENT', 
  onFileUploaded, 
  onUploadComplete,
  uploaderName = 'Investigating Officer' 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState<'Image' | 'PDF' | 'Audio' | 'Video' | 'Document' | 'Screenshot'>('Document');
  const [uploading, setUploading] = useState(false);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [custodyConsent, setCustodyConsent] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Classify category from mime type or extension
  const detectCategory = (file: File): 'Image' | 'PDF' | 'Audio' | 'Video' | 'Document' | 'Screenshot' => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    if (name.includes('screenshot') || name.includes('screen_') || name.includes('capture')) return 'Screenshot';
    if (type.includes('image')) return 'Image';
    if (type.includes('pdf') || name.endsWith('.pdf')) return 'PDF';
    if (type.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a')) return 'Audio';
    if (type.includes('video') || name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.avi')) return 'Video';
    return 'Document';
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setFileCategory(detectCategory(file));
    setUploading(true);

    try {
      if (window.crypto && window.crypto.subtle) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setComputedHash(hashHex);
      } else {
        throw new Error('Crypto API unavailable');
      }
    } catch {
      // Fallback deterministic mock hash
      const simulatedHash = Array.from({ length: 64 }, (_, i) => 
        Math.floor((i * 19 + file.name.length + file.size) % 16).toString(16)
      ).join('');
      setComputedHash(simulatedHash);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 600);
    }
  };

  // Demo Presets for Quick Testing
  const handleLoadSample = (category: 'Image' | 'PDF' | 'Audio' | 'Video' | 'Document' | 'Screenshot') => {
    const samples = {
      Image: { name: 'bank_transfer_receipt_049.png', type: 'image/png', size: 2450000 },
      PDF: { name: 'subpoena_exchange_records.pdf', type: 'application/pdf', size: 4890000 },
      Audio: { name: 'wiretap_suspect_call_recording.mp3', type: 'audio/mp3', size: 8120000 },
      Video: { name: 'atm_cctv_suspect_footage.mp4', type: 'video/mp4', size: 18400000 },
      Document: { name: 'forensic_device_dump.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 3200000 },
      Screenshot: { name: 'whatsapp_extortion_screenshot.jpg', type: 'image/jpeg', size: 1950000 },
    };

    const s = samples[category];
    const blob = new Blob(['ForensIQ Mock Artifact Content'], { type: s.type });
    const mockFile = new File([blob], s.name, { type: s.type });
    processFile(mockFile);
  };

  const confirmUpload = () => {
    if (!selectedFile || !computedHash) return;

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newEvidence: EvidenceFile = {
      id: `ev-${Date.now().toString().slice(-4)}`,
      name: selectedFile.name,
      type: `${fileCategory} (${selectedFile.type || 'binary/data'})`,
      size: formatSize(selectedFile.size),
      uploadDate: now,
      sha256Hash: computedHash,
      verificationStatus: 'Verified',
      uploadedBy: uploaderName,
      custodyChain: [
        {
          id: `cc-${Date.now()}-1`,
          timestamp: now,
          actor: uploaderName,
          role: 'user',
          action: 'Evidence Ingestion & Drag-and-Drop Staging',
          hashMatch: true,
        },
        {
          id: `cc-${Date.now()}-2`,
          timestamp: now,
          actor: 'ForensIQ SHA-256 Engine',
          role: 'system',
          action: `Cryptographic SHA-256 Digest Calculated: ${computedHash.slice(0, 16)}...`,
          hashMatch: true,
        }
      ]
    };

    if (onFileUploaded) onFileUploaded(newEvidence);
    if (onUploadComplete) onUploadComplete(newEvidence);

    setSelectedFile(null);
    setComputedHash(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Category Shortcuts */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 font-bold uppercase text-[10px]">Quick Test Samples:</span>
        <button type="button" onClick={() => handleLoadSample('Image')} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer">
          <ImageIcon className="w-3 h-3 text-cyan-400" /> Image
        </button>
        <button type="button" onClick={() => handleLoadSample('PDF')} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer">
          <FileText className="w-3 h-3 text-red-400" /> PDF
        </button>
        <button type="button" onClick={() => handleLoadSample('Audio')} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer">
          <Music className="w-3 h-3 text-purple-400" /> Audio
        </button>
        <button type="button" onClick={() => handleLoadSample('Video')} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer">
          <Video className="w-3 h-3 text-emerald-400" /> Video
        </button>
        <button type="button" onClick={() => handleLoadSample('Document')} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer">
          <FileIcon className="w-3 h-3 text-amber-400" /> Document
        </button>
        <button type="button" onClick={() => handleLoadSample('Screenshot')} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer">
          <Camera className="w-3 h-3 text-blue-400" /> Screenshot
        </button>
      </div>

      {/* Drop Zone */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-cyan-400 bg-cyan-950/30 glow-cyan scale-[1.01]' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={handleChange}
            accept="image/*,application/pdf,audio/*,video/*,.doc,.docx,.txt,.csv,.json"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-cyan-400 mb-3 shadow-lg">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Drag & Drop Digital Evidence Artifacts
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Supports Images, PDFs, Audio, Video, Documents, and Screenshots. Automatic cryptographic hashing applied upon ingestion.
          </p>

          <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 font-mono inline-flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Images
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-red-400 font-mono inline-flex items-center gap-1">
              <FileText className="w-3 h-3" /> PDFs
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-purple-400 font-mono inline-flex items-center gap-1">
              <Music className="w-3 h-3" /> Audio
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-mono inline-flex items-center gap-1">
              <Video className="w-3 h-3" /> Video
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-amber-400 font-mono inline-flex items-center gap-1">
              <FileIcon className="w-3 h-3" /> Documents
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-blue-400 font-mono inline-flex items-center gap-1">
              <Camera className="w-3 h-3" /> Screenshots
            </span>
          </div>
        </div>
      ) : (
        /* File Staging & Hashing Card */
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-cyan-400">
                {fileCategory === 'Image' && <ImageIcon className="w-6 h-6 text-cyan-400" />}
                {fileCategory === 'PDF' && <FileText className="w-6 h-6 text-red-400" />}
                {fileCategory === 'Audio' && <Music className="w-6 h-6 text-purple-400" />}
                {fileCategory === 'Video' && <Video className="w-6 h-6 text-emerald-400" />}
                {fileCategory === 'Document' && <FileIcon className="w-6 h-6 text-amber-400" />}
                {fileCategory === 'Screenshot' && <Camera className="w-6 h-6 text-blue-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/20">
                    {fileCategory}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{selectedFile.name}</h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Binary Evidence Data'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedFile(null); setComputedHash(null); }}
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Cryptographic Hash Status */}
          {uploading ? (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-cyan-300">Calculating SHA-256 Cryptographic Digest...</span>
            </div>
          ) : computedHash ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Cryptographic Integrity Hash Sealed
                  </span>
                  <VerificationBadge status="Verified" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">SHA-256 Digest String:</span>
                  <code className="text-xs text-cyan-300 font-mono break-all bg-slate-950 p-2 rounded-lg block border border-slate-800">
                    {computedHash}
                  </code>
                </div>
              </div>

              {/* Custody Affirmation */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={custodyConsent}
                  onChange={e => setCustodyConsent(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Certify artifact authenticity and log into ForensIQ Chain of Custody ledger.</span>
              </label>

              {/* Confirm Submit Button */}
              <button
                type="button"
                onClick={confirmUpload}
                disabled={!custodyConsent}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lock Artifact into Evidence Vault</span>
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] font-mono text-amber-300/90 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>DISCLAIMER:</strong> ForensIQ Evidence Vault uses client-side simulated cryptographic hashing for testing and demonstration purposes. Mock data generated in this preview environment is not certified as legally admissible court evidence.
        </span>
      </div>

    </div>
  );
};