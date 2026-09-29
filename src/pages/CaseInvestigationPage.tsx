import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CaseItem, EvidenceFile, CaseStatus, UrgencyLevel } from '../types';
import { StatusBadge, UrgencyBadge, VerificationBadge } from '../components/StatusBadges';
import { FileUpload } from '../components/FileUpload';
import { OfficerTimeline } from '../components/officer/OfficerTimeline';
import { CourtReportGenerator } from '../components/officer/CourtReportGenerator';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  Sparkles, 
  FileText, 
  FolderLock, 
  User, 
  Users, 
  Hash, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  Download, 
  Copy, 
  Check, 
  CreditCard, 
  Building, 
  ArrowLeft, 
  Search, 
  Filter, 
  Printer, 
  Globe, 
  Lock, 
  Layers, 
  Link2, 
  TrendingUp, 
  RefreshCw,
  Plus,
  MessageSquare,
  Shield,
  FileCode,
  AlertTriangle
} from 'lucide-react';

export const CaseInvestigationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, currentUser, currentRole, updateCaseStatus, addCommentToCase, addEvidenceToCase, analyzeEvidenceAI } = useApp();

  // Find target case or fallback to first case if invalid ID
  const caseItem = cases.find(c => c.id === id) || cases[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'ai_analysis' | 'timeline' | 'related' | 'report'>('overview');
  
  // State for Evidence tab search
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<'All' | 'Verified' | 'Pending' | 'Flagged'>('All');
  
  // Copy feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New Note State
  const [noteText, setNoteText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(true);

  // Status Update State
  const [newStatus, setNewStatus] = useState<CaseStatus>(caseItem?.status || 'Under Review');
  const [statusNote, setStatusNote] = useState('');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<any>(caseItem?.aiAnalysis || null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // Court Report Generation State
  const [reportFormat, setReportFormat] = useState<'full' | 'subpoena' | 'custody'>('full');
  const [includeAI, setIncludeAI] = useState(true);
  const [jurisdiction, setJurisdiction] = useState('U.S. Federal District Court - Northern District of California');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<boolean>(false);

  if (!caseItem) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Case Not Found</h2>
        <p>The requested incident dossier could not be located in the ForensIQ registry.</p>
        <button
          onClick={() => navigate('/officer')}
          className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Add Investigation Note handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addCommentToCase(caseItem.id, noteText.trim(), isInternalNote);
    setNoteText('');
  };

  // Update Case Status handler
  const handleStatusUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCaseStatus(caseItem.id, newStatus, statusNote);
    setStatusNote('');
  };

  // Run AI Analysis handler
  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysisError(null);
    try {
      const result = await analyzeEvidenceAI(
        `${caseItem.title}\nCategory: ${caseItem.category}\nDescription: ${caseItem.description}\nLoss: ₹${caseItem.lossAmount || 0}`,
        caseItem.category,
        caseItem.id
      );
      setAiData(result);
    } catch (error: any) {
      setAiAnalysisError(
        error?.message || 'AI analysis failed. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract Entities Helper
  const extractedEntities = [
    { type: 'IP Address / Tor', value: caseItem.suspectInfo?.ipAddress || '185.220.101.42', risk: 'High', details: 'Tor Exit Node / Anonymizer Proxy' },
    { type: 'Crypto Wallet', value: caseItem.suspectInfo?.cryptoWallet || '0x71C7656EC7ab8810283733A69A18B928423a3a9A', risk: 'Critical', details: 'USDT Smart Contract / Multi-sig' },
    { type: 'Phishing Domain', value: caseItem.suspectInfo?.associatedDomain || 'apex-yield-trade.org', risk: 'High', details: 'Registered via Privacy Proxy' },
    { type: 'Communication Handle', value: caseItem.suspectInfo?.alias || '@apex_VIP_desk', risk: 'Medium', details: 'Telegram Channel Admin' },
    { type: 'Victim IP', value: '172.56.21.109', risk: 'Verified', details: 'San Francisco, CA ISP' },
    { type: 'Transaction TxHash', value: caseItem.financialDetails?.transactionId || '0x89f4b1e9c20491823a78912c019283f', risk: 'High', details: 'Ethereum Mainnet Tx' },
  ];

  // Related cases calculation (by category or urgency)
  const relatedCases = cases.filter(c => c.id !== caseItem.id && (c.category === caseItem.category || c.urgency === caseItem.urgency));

  // Evidence filtering
  const filteredEvidence = caseItem.evidenceFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(evidenceSearch.toLowerCase()) || file.sha256Hash.toLowerCase().includes(evidenceSearch.toLowerCase());
    const matchesFilter = evidenceFilter === 'All' || file.verificationStatus === evidenceFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navigation & Back Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back to Case Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('report')}
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            <span>Generate Court Report</span>
          </button>
        </div>
      </div>

      {/* HEADER: Case Investigation Primary Details */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0b1324] to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Main Case Title & Badges */}
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold tracking-wider">
                {caseItem.id}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                {caseItem.category}
              </span>
              <UrgencyBadge level={caseItem.urgency} />
              <StatusBadge status={caseItem.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight leading-snug">
              {caseItem.title}
            </h1>

            <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Reported Date: <strong className="text-slate-200">{caseItem.reportedDate}</strong></span>
              <span>•</span>
              <span>Assigned Officer: <strong className="text-cyan-300">{caseItem.assignedOfficer}</strong></span>
            </p>
          </div>

          {/* Quick Metrics Summary Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 min-w-[240px] space-y-2 text-xs font-mono shrink-0 shadow-lg">
            <div className="flex justify-between items-center text-slate-400">
              <span>Financial Loss:</span>
              <span className="text-red-400 font-bold text-sm">
                ₹{caseItem.lossAmount ? caseItem.lossAmount.toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Evidence Files:</span>
              <span className="text-emerald-400 font-bold">{caseItem.evidenceFiles.length} Sealed</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>AI Risk Score:</span>
              <span className="text-cyan-400 font-bold">{caseItem.aiAnalysis?.riskScore || 88}/100</span>
            </div>
          </div>

        </div>
      </div>

      {/* TABS NAVIGATION BAR */}
      <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto bg-slate-950/80 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-5 py-3 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FolderLock className="w-4 h-4 text-emerald-400" />
          <span>Evidence ({caseItem.evidenceFiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_analysis')}
          className={`px-5 py-3 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ai_analysis'
              ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>AI Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-5 py-3 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Timeline ({caseItem.timeline.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('related')}
          className={`px-5 py-3 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'related'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Related Cases ({relatedCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-5 py-3 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'report'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Printer className="w-4 h-4 text-purple-400" />
          <span>Report & Subpoena</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 1. Case Overview Narrative */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              1. Case Overview & Incident Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {caseItem.description}
            </p>

            {/* Financial Details if available */}
            {caseItem.lossAmount && caseItem.lossAmount > 0 && (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Financial Loss & Payment Traces
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Total Stolen Loss</span>
<span className="text-red-400 font-bold text-base">₹{caseItem.lossAmount.toLocaleString('en-IN')}</span>                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Payment Method</span>
                    <span className="text-slate-200 font-bold">{caseItem.financialDetails?.paymentMethod || 'Cryptocurrency (USDT/ETH)'}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Transaction Reference</span>
                    <span className="text-cyan-300 font-bold truncate block">{caseItem.financialDetails?.transactionId || '0x89f4b1e9c20491823a78912c019283f'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Victim Details & 3. Suspect Information (Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 2. Victim Details */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="w-4 h-4 text-cyan-400" />
                2. Victim Details
              </h3>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="text-white font-bold">{caseItem.victimName}</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Contact Info:</span>
                  <span className="text-cyan-300">{caseItem.victimContact}</span>
                </div>

                {caseItem.victimGovtId && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Government ID:</span>
                    <span className="text-emerald-400 font-bold">{caseItem.victimGovtId}</span>
                  </div>
                )}

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Identity Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Citizen / Corporate Entity
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Suspect Information */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
                <Users className="w-4 h-4 text-amber-400" />
                3. Suspect Information & Threat Intelligence
              </h3>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Suspect Alias:</span>
                  <span className="text-amber-300 font-bold">{caseItem.suspectInfo?.alias || 'Unknown Threat Actor'}</span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Origin IP / Tor Exit:</span>
                  <span className="text-red-400 font-bold">{caseItem.suspectInfo?.ipAddress || '185.220.101.42 (Tor Proxy)'}</span>
                </div>

                {caseItem.suspectInfo?.cryptoWallet && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                    <span className="text-slate-400 shrink-0">Crypto Wallet:</span>
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-amber-400 font-bold truncate">{caseItem.suspectInfo.cryptoWallet}</span>
                      <button
                        onClick={() => handleCopy(caseItem.suspectInfo!.cryptoWallet!)}
                        className="p-1 hover:text-white text-slate-400 transition-colors"
                      >
                        {copiedText === caseItem.suspectInfo.cryptoWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {caseItem.suspectInfo?.associatedDomain && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Phishing Domain:</span>
                    <span className="text-cyan-400 font-bold">{caseItem.suspectInfo.associatedDomain}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 5. Extracted Entities */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                5. Extracted Digital Entities & Intelligence Tokens
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                {extractedEntities.length} Entities Parsed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {extractedEntities.map((ent, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{ent.type}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      ent.risk === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      ent.risk === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>{ent.risk}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <span className="text-slate-100 font-bold truncate">{ent.value}</span>
                    <button
                      onClick={() => handleCopy(ent.value)}
                      className="p-1 hover:text-white text-slate-400 transition-colors"
                    >
                      {copiedText === ent.value ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">{ent.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Investigation Notes & Status Update Section */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              9. Investigation Notes & Case Action Log
            </h3>

            {/* Existing Notes Feed */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {caseItem.comments.map(comment => (
                <div key={comment.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{comment.author}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {comment.role.toUpperCase()}
                      </span>
                      {comment.isInternal && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          INTERNAL OFFICER LOG
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pt-1">{comment.text}</p>
                </div>
              ))}
              {caseItem.comments.length === 0 && (
                <p className="text-xs text-slate-500 font-mono italic">No notes posted yet for this case.</p>
              )}
            </div>

            {/* Add New Note Form */}
            <form onSubmit={handleAddNote} className="space-y-3 pt-3 border-t border-slate-800">
              <textarea
                rows={2}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add an investigation note, witness record, or subpoena update..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={e => setIsInternalNote(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Restrict note to Internal Officer View</span>
                </label>

                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Investigation Note</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* TAB 2: EVIDENCE VAULT */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <FolderLock className="w-4 h-4 text-emerald-400" />
                  4. Digital Evidence Vault & Chain of Custody Locker
                </h3>
                <p className="text-xs text-slate-400">
                  All artifacts are sealed with SHA-256 cryptographic hashes for court admissibility.
                </p>
              </div>

              {/* Evidence Filters */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter file or hash..."
                    value={evidenceSearch}
                    onChange={e => setEvidenceSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <select
                  value={evidenceFilter}
                  onChange={e => setEvidenceFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>
            </div>

            {/* Required Evidence Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvidence.map(file => (
                <div key={file.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all">
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                          File Type: {file.type}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate max-w-[280px]">{file.name}</h4>
                      </div>
                      <VerificationBadge status={file.verificationStatus} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[9px]">Uploaded Date</span>
                        <span className="text-slate-200">{file.uploadDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">Uploaded By</span>
                        <span className="text-cyan-300 font-bold">{file.uploadedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">File Size</span>
                        <span className="text-slate-200">{file.size}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">Chain Actions</span>
                        <span className="text-emerald-400 font-bold">{file.custodyChain.length} Verified Logs</span>
                      </div>
                    </div>

                    {/* SHA-256 Hash Display Card */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">SHA-256 Fingerprint</span>
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-cyan-400">
                        <span className="truncate">{file.sha256Hash}</span>
                        <button
                          onClick={() => handleCopy(file.sha256Hash)}
                          className="p-1 hover:text-white transition-colors cursor-pointer shrink-0"
                          title="Copy SHA-256 Hash"
                        >
                          {copiedText === file.sha256Hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <a
                      href={file.url || '#'}
                      download
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download Artifact</span>
                    </a>

                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Immutable Ledger Sealed
                    </span>
                  </div>

                </div>
              ))}
              {filteredEvidence.length === 0 && (
                <div className="col-span-2 p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                  No evidence files match the filter.
                </div>
              )}
            </div>

            {/* Ingestion Dropzone */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase">Upload Additional Case Artifact</h4>
              <FileUpload
                caseId={caseItem.id}
                onUploadComplete={(file) => addEvidenceToCase(caseItem.id, file)}
              />
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: AI ANALYSIS */}
      {activeTab === 'ai_analysis' && (
        <div className="space-y-6">
          
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  7. Gemini Forensic AI Lead Analysis & Threat Assessment
                </h3>
                <p className="text-xs text-slate-400">
                  Automated threat scoring, pattern extraction, and forensic recommendation engine.
                </p>
              </div>

              <button
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Analyzing Dossier...' : 'Re-Run AI Forensic Scan'}</span>
              </button>
            </div>

            {aiData ? (
              <div className="space-y-6">
                
                {/* AI Score Banner */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">ForensIQ Threat Severity Score</span>
                    <h4 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>{aiData.riskScore || 92} / 100</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {aiData.riskLevel} Severity
                      </span>
                    </h4>
                  </div>

                  <div className="text-xs font-mono text-slate-300 text-center sm:text-right space-y-1">
                    <div>Category: <strong className="text-cyan-300">{aiData.category}</strong></div>
                    <div>Master Hash: <strong className="text-slate-400 truncate max-w-[200px] inline-block">{aiData.evidenceHashSHA256?.slice(0, 16)}...</strong></div>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Executive Incident Summary</h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{aiData.summary}</p>
                </div>

                {/* Grid: IOCs & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Indicators of Compromise */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Indicators of Compromise (IOC)
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300 font-mono">
                      {aiData.indicatorsOfCompromise?.map((ioc: string, idx: number) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{ioc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Forensic Lead Recommendations
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300 font-mono">
                      {aiData.forensicRecommendations?.map((rec: string, idx: number) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Officer Action Highlight */}
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
                  <strong className="font-mono text-cyan-400 uppercase block text-[11px]">Recommended Priority Action for Assigned Officer:</strong>
                  <p className="font-sans">{aiData.recommendedActionForOfficer}</p>
                </div>

              </div>
            ) : aiAnalysisError ? (
              <div className="p-6 text-center border border-red-500/30 bg-red-950/20 rounded-xl space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-sm text-red-300 font-semibold">AI Analysis Failed</p>
                <p className="text-xs text-slate-400 font-mono">{aiAnalysisError}</p>
                <button
                  onClick={handleRunAiAnalysis}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Retry Analysis
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                Click "Re-Run AI Forensic Scan" above to initiate Gemini model analysis.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <OfficerTimeline />
        </div>
      )}

      {/* TAB 5: RELATED CASES */}
      {activeTab === 'related' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-amber-400" />
              8. Cross-Jurisdiction Related Cases & Syndicate Correlation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedCases.map(rel => (
                <div key={rel.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-md flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{rel.id}</span>
                      <UrgencyBadge level={rel.urgency} />
                    </div>
                    <h4 className="font-bold text-white text-xs">{rel.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{rel.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Victim: {rel.victimName}</span>
                    <button
                      onClick={() => navigate(`/officer/case/${rel.id}`)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>Inspect Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {relatedCases.length === 0 && (
                <div className="col-span-2 p-8 text-center text-slate-500 font-mono text-xs">
                  No other active cases linked to this category or threat vector.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COURT REPORT GENERATOR */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <CourtReportGenerator initialCaseId={caseItem.id} />
        </div>
      )}

    </div>
  );
};