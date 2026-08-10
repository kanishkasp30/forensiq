import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseItem } from '../../types';
import { StatusBadge, UrgencyBadge } from '../StatusBadges';
import { CaseTimeline } from '../Timeline';
import { FileUpload } from '../FileUpload';
import { Modal } from '../Modal';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  FolderLock, 
  MessageSquare, 
  ShieldCheck, 
  UserCheck, 
  DollarSign, 
  Lock, 
  Send, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft,
  ExternalLink,
  Plus
} from 'lucide-react';

interface VictimCasesProps {
  initialSelectedCase?: CaseItem | null;
}

export const VictimCases: React.FC<VictimCasesProps> = ({ initialSelectedCase }) => {
  const { currentUser, cases, addCommentToCase, addEvidenceToCase } = useApp();

  // Victim's cases
  const victimCases = cases.filter(c => 
    c.victimName === currentUser.name || 
    c.victimContact.toLowerCase().includes(currentUser.email.toLowerCase())
  );

  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(initialSelectedCase || victimCases[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Detail Inspector Tab
  const [detailTab, setDetailTab] = useState<'timeline' | 'evidence' | 'chat' | 'suspect' | 'ai'>('timeline');

  // Chat message state
  const [chatInput, setChatInput] = useState('');
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  // Filter logic
  const filteredCases = victimCases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') return matchesSearch && c.status !== 'Solved' && c.status !== 'Closed';
    if (statusFilter === 'SOLVED') return matchesSearch && (c.status === 'Solved' || c.status === 'Closed');
    return matchesSearch && c.status === statusFilter;
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !chatInput.trim()) return;

    addCommentToCase(selectedCase.id, chatInput, false);
    setChatInput('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>My Reported Cases & Forensics Status</span>
          </div>
          <h1 className="text-2xl font-serif italic text-white mt-1">My Cases Locket</h1>
          <p className="text-xs text-slate-400">
            Track investigation updates, inspect evidence chains, and message assigned officers in real time.
          </p>
        </div>

        {selectedCase && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Selected Case:</span>
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 font-mono font-bold text-xs rounded-lg border border-cyan-500/20">
              {selectedCase.id}
            </span>
          </div>
        )}
      </div>

      {/* Main Split Layout: Left Cases List, Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case ID, title, or category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {['ALL', 'ACTIVE', 'Submitted', 'Under Review', 'SOLVED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                    statusFilter === st 
                      ? 'bg-cyan-600 text-white font-semibold' 
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Cases List Cards */}
          <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
            {filteredCases.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#0a0d14] border border-slate-800 text-center text-slate-500 text-xs">
                No matching cases found.
              </div>
            ) : (
              filteredCases.map(c => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                        : 'bg-[#0a0d14] border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                      <div className="flex items-center gap-1.5">
                        <UrgencyBadge level={c.urgency} showIcon={false} />
                        <StatusBadge status={c.status} />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {c.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>{c.category}</span>
                      <span className="font-mono text-rose-400 font-bold">${(c.lossAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Inspector Column */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-6 shadow-2xl">
              
              {/* Selected Case Header */}
              <div className="border-b border-slate-800 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">{selectedCase.id}</span>
                    <span className="text-xs text-slate-500 font-mono">• Filed {selectedCase.reportedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UrgencyBadge level={selectedCase.urgency} />
                    <StatusBadge status={selectedCase.status} />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white leading-snug">
                  {selectedCase.title}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Assigned Officer</span>
                    <div className="font-semibold text-slate-200 truncate mt-0.5">{selectedCase.assignedOfficer}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Loss Amount</span>
                    <div className="font-bold text-rose-400 font-mono mt-0.5">${(selectedCase.lossAmount || 0).toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500">Vault Evidence</span>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">{selectedCase.evidenceFiles.length} files</div>
                  </div>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setDetailTab('timeline')}
                  className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    detailTab === 'timeline' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline ({selectedCase.timeline.length})</span>
                </button>

                <button
                  onClick={() => setDetailTab('evidence')}
                  className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    detailTab === 'evidence' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderLock className="w-3.5 h-3.5" />
                  <span>Evidence Vault ({selectedCase.evidenceFiles.length})</span>
                </button>

                <button
                  onClick={() => setDetailTab('chat')}
                  className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    detailTab === 'chat' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Officer Chat ({selectedCase.comments.length})</span>
                </button>

                <button
                  onClick={() => setDetailTab('suspect')}
                  className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    detailTab === 'suspect' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Suspect & Financial</span>
                </button>

                <button
                  onClick={() => setDetailTab('ai')}
                  className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    detailTab === 'ai' ? 'border-cyan-400 text-cyan-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Risk Scan</span>
                </button>
              </div>

              {/* Tab 1: Timeline */}
              {detailTab === 'timeline' && (
                <div className="space-y-4">
                  <CaseTimeline events={selectedCase.timeline} />
                </div>
              )}

              {/* Tab 2: Evidence Vault */}
              {detailTab === 'evidence' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      SHA-256 Vault Evidence Locker
                    </h4>
                    <button
                      onClick={() => setEvidenceModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload More Evidence</span>
                    </button>
                  </div>

                  {selectedCase.evidenceFiles.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                      No evidence files attached to this case yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCase.evidenceFiles.map(ev => (
                        <div key={ev.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100">{ev.name}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                              {ev.verificationStatus}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400 truncate">
                            SHA-256: {ev.sha256Hash}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                            <span>Size: {ev.size}</span>
                            <span>Uploaded by: {ev.uploadedBy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Officer Chat */}
              {detailTab === 'chat' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 max-h-[350px] overflow-y-auto">
                    {selectedCase.comments.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No messages exchanged with investigator yet. Post a message below.
                      </div>
                    ) : (
                      selectedCase.comments.map(c => (
                        <div key={c.id} className={`p-3 rounded-xl border space-y-1 text-xs ${
                          c.role === 'victim' 
                            ? 'bg-cyan-950/20 border-cyan-500/30 ml-6 text-cyan-100' 
                            : 'bg-indigo-950/20 border-indigo-500/30 mr-6 text-indigo-100'
                        }`}>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <strong>{c.author} ({c.role.toUpperCase()})</strong>
                            <span>{c.timestamp.slice(0, 16)}</span>
                          </div>
                          <p className="leading-relaxed">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message or inquiry to assigned investigator..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Suspect & Financial */}
              {detailTab === 'suspect' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-400 uppercase font-mono text-[11px]">Suspect Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div><span className="text-slate-500">Alias/Name:</span> <strong>{selectedCase.suspectInfo?.name || selectedCase.suspectInfo?.alias || 'Under Identification'}</strong></div>
                      <div><span className="text-slate-500">Threat Level:</span> <span className="text-amber-400 font-semibold">{selectedCase.suspectInfo?.threatLevel || 'Under Investigation'}</span></div>
                      <div><span className="text-slate-500">Wallet/UPI:</span> <span className="font-mono text-slate-200">{selectedCase.suspectInfo?.cryptoWallet || 'None logged'}</span></div>
                      <div><span className="text-slate-500">Domain/IP:</span> <span className="font-mono text-slate-200">{selectedCase.suspectInfo?.associatedDomain || 'None logged'}</span></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-rose-400 uppercase font-mono text-[11px]">Financial Loss Record</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div><span className="text-slate-500">Loss Amount:</span> <strong className="text-rose-400 font-mono">${(selectedCase.lossAmount || 0).toLocaleString()}</strong></div>
                      <div><span className="text-slate-500">Payment Channel:</span> <span>{selectedCase.financialDetails?.paymentMethod || 'Crypto / Wire'}</span></div>
                      <div className="col-span-2 truncate"><span className="text-slate-500">TxHash/UTR:</span> <span className="font-mono text-cyan-400">{selectedCase.financialDetails?.transactionId || '0x7f8a9b2c3d4e5f6a1b...'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: AI Risk Scan */}
              {detailTab === 'ai' && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-white text-sm">ForensIQ AI Incident Threat Scan</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold font-mono text-xs border border-amber-500/20">
                      Risk Score: {selectedCase.aiAnalysis?.riskScore || 85}/100
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    {selectedCase.aiAnalysis?.summary || 'Automated AI analysis completed on submitted evidence files.'}
                  </p>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 text-[10px] uppercase font-mono">Indicators of Compromise</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {selectedCase.aiAnalysis?.indicatorsOfCompromise.map((ioc, idx) => (
                        <li key={idx}>{ioc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0a0d14] border border-slate-800 text-center text-slate-500 text-xs">
              Select a case from the left panel to inspect forensic details.
            </div>
          )}
        </div>
      </div>

      {/* Upload Evidence Modal for Selected Case */}
      {selectedCase && (
        <Modal
          isOpen={evidenceModalOpen}
          onClose={() => setEvidenceModalOpen(false)}
          title={`Upload Evidence for ${selectedCase.id}`}
        >
          <div className="space-y-4">
            <FileUpload
              caseId={selectedCase.id}
              onFileUploaded={file => {
                addEvidenceToCase(selectedCase.id, file);
                setEvidenceModalOpen(false);
              }}
            />
          </div>
        </Modal>
      )}

    </div>
  );
};
