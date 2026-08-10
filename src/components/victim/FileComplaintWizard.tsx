import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseCategory, UrgencyLevel, EvidenceFile, CaseItem } from '../../types';
import { FileUpload } from '../FileUpload';
import { StatusBadge, UrgencyBadge } from '../StatusBadges';
import { 
  PlusCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  AlertTriangle, 
  FileText, 
  DollarSign, 
  FolderLock, 
  Lock, 
  Copy, 
  Clock, 
  ExternalLink,
  Edit2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FileComplaintWizardProps {
  onComplete?: (newCase: CaseItem) => void;
}

export const FileComplaintWizard: React.FC<FileComplaintWizardProps> = ({ onComplete }) => {
  const { currentUser, addCase } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submittedCase, setSubmittedCase] = useState<CaseItem | null>(null);

  // Step 1: Personal Information
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 234-8901');
  const [govtId, setGovtId] = useState(currentUser.govtId || 'US-GOV-984214-X');
  const [address, setAddress] = useState(currentUser.address || '742 Evergreen Terrace, San Francisco, CA');

  // Step 2: Incident Information
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CaseCategory>('Phishing / Social Engineering');
  const [urgency, setUrgency] = useState<UrgencyLevel>('High');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [incidentLocation, setIncidentLocation] = useState('Telegram & Fake Trading Web Portal');
  const [description, setDescription] = useState('');

  // Step 3: Suspect Information
  const [suspectName, setSuspectName] = useState('');
  const [suspectContact, setSuspectContact] = useState('');
  const [suspectWallet, setSuspectWallet] = useState('');
  const [suspectDomain, setSuspectDomain] = useState('');
  const [suspectNotes, setSuspectNotes] = useState('');

  // Step 4: Financial & Transaction Details
  const [hasLoss, setHasLoss] = useState<boolean>(true);
  const [lossAmount, setLossAmount] = useState<number | ''>(25000);
  const [paymentMethod, setPaymentMethod] = useState('Crypto USDT / BTC');
  const [transactionId, setTransactionId] = useState('0x7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [fraudulentAccount, setFraudulentAccount] = useState('TRX7v9k2LmPqR3sTuVwXyZ123456');

  // Step 5: Supporting Evidence
  const [stagedEvidence, setStagedEvidence] = useState<EvidenceFile[]>([]);

  // Step 6: Review & Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = () => {
    setErrorMsg('');
    // Validation
    if (currentStep === 1) {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setErrorMsg('Please complete all required personal contact details.');
        return;
      }
    } else if (currentStep === 2) {
      if (!title.trim() || !description.trim()) {
        setErrorMsg('Please provide an Incident Title and Detailed Description.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg('You must declare truthful information and accept the legal terms before submitting.');
      return;
    }

    const created = addCase({
      title,
      category,
      urgency,
      victimName: fullName,
      victimContact: `${email} | ${phone}`,
      victimGovtId: govtId,
      victimAddress: address,
      incidentLocation,
      incidentDate,
      assignedOfficer: 'Pending Officer Assignment',
      description,
      lossAmount: hasLoss && lossAmount !== '' ? Number(lossAmount) : 0,
      financialDetails: {
        hasLoss,
        lossAmount: hasLoss && lossAmount !== '' ? Number(lossAmount) : 0,
        paymentMethod,
        transactionId,
        transactionDate,
        fraudulentAccount,
      },
      suspectInfo: {
        name: suspectName,
        alias: suspectName,
        contact: suspectContact,
        cryptoWallet: suspectWallet,
        associatedDomain: suspectDomain,
        additionalNotes: suspectNotes,
      },
      initialEvidence: stagedEvidence,
    });

    setSubmittedCase(created);
    if (onComplete) onComplete(created);
  };

  const categoriesList: CaseCategory[] = [
    'Phishing / Social Engineering',
    'Cryptocurrency Scam',
    'Ransomware / Extortion',
    'Financial & Bank Fraud',
    'Identity Theft',
    'Cyber Harassment',
    'Data Breach'
  ];

  // Confirmation Screen After Submission
  if (submittedCase) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
        <div className="bg-[#0a0d14] border border-emerald-500/40 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono rounded-full uppercase tracking-wider">
              Formal Cybercrime Complaint Stamped
            </span>
            <h2 className="text-3xl font-serif italic text-white">Complaint Successfully Filed</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Your report has been cryptographically sealed and logged into the ForensIQ SHA-256 Vault. It is queued for immediate officer assignment.
            </p>
          </div>

          {/* Key Incident Metadata */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-left space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-mono tracking-wider text-[10px]">Unique Case ID</span>
                <div className="text-lg font-mono font-bold text-cyan-400 mt-0.5">{submittedCase.id}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono tracking-wider text-[10px]">Submission Timestamp</span>
                <div className="text-sm font-mono text-slate-200 mt-0.5">{submittedCase.reportedDate}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono tracking-wider text-[10px]">Incident Category</span>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">{submittedCase.category}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono tracking-wider text-[10px]">Chain of Custody Hash</span>
                <div className="text-xs font-mono text-emerald-400 truncate mt-0.5">
                  {submittedCase.evidenceFiles[0]?.sha256Hash || 'SHA-256: e3b0c44298fc1c149afbf4c...'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/victim/cases')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(8,145,178,0.25)] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View Case in My Cases</span>
            </button>
            <button
              onClick={() => navigate('/victim/timeline')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Track Case Timeline</span>
            </button>
            <button
              onClick={() => { setSubmittedCase(null); setCurrentStep(1); }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              File Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Wizard Header & Stepper */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Official Cybercrime Incident Reporting</span>
            </div>
            <h1 className="text-2xl font-serif italic text-white mt-1">File Cybercrime Complaint</h1>
            <p className="text-xs text-slate-400">
              Provide complete details across all 6 steps for law enforcement intake and evidence analysis.
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            Step <span className="text-cyan-400 font-bold">{currentStep}</span> of 6
          </div>
        </div>

        {/* 6 Step Indicators */}
        <div className="grid grid-cols-6 gap-2 pt-2 border-t border-slate-800/60">
          {[
            { step: 1, label: 'Personal' },
            { step: 2, label: 'Incident' },
            { step: 3, label: 'Suspect' },
            { step: 4, label: 'Financial' },
            { step: 5, label: 'Evidence' },
            { step: 6, label: 'Review' },
          ].map(s => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => isDone && setCurrentStep(s.step)}
                disabled={!isDone && !isCurrent}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer text-center ${
                  isCurrent 
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300' 
                    : isDone 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-900/50 text-slate-600 border border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                  isCurrent ? 'bg-cyan-500 text-slate-950' : isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </div>
                <span className="text-[10px] font-medium hidden sm:block truncate w-full">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-6 shadow-2xl">
        
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Step 1: Complainant Personal Information
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify your contact info for official law enforcement subpoena and status updates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g., Alex Rivera"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex.rivera@example.com"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Contact Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Govt Identification / Passport / SSN</label>
                <input
                  type="text"
                  value={govtId}
                  onChange={e => setGovtId(e.target.value)}
                  placeholder="US-GOV-984214-X"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace, San Francisco, CA 94107"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Incident Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Step 2: Cybercrime Incident Information
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Specify the type of attack, incident timing, online platform, and complete breakdown.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Incident Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as CaseCategory)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Urgency Level *</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Critical" className="bg-slate-900">Critical (Active Drain / Immediate Threat)</option>
                  <option value="High" className="bg-slate-900">High (Significant Loss / Ongoing Attack)</option>
                  <option value="Medium" className="bg-slate-900">Medium (Attempted Scam / Moderate Damage)</option>
                  <option value="Low" className="bg-slate-900">Low (Suspicious Activity / Phishing Spam)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">Incident Title / Summary Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Telegram Pig-Butchering Scam & Fake USDT Exchange Wallet Drain"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Date & Time of Occurrence</label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={e => setIncidentDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Platform / Location / URL</label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={e => setIncidentLocation(e.target.value)}
                  placeholder="e.g., Telegram @crypto_yield_vip / apex-trade-vault.org"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">Detailed Description of Incident *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe how the contact was initiated, messages exchanged, fake websites presented, promises made, and exact sequence of events..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Suspect Information */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Step 3: Perpetrator & Suspect Details
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide any known aliases, handles, wallet addresses, phone numbers, or domains of the suspect.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Suspect Name or Alias</label>
                <input
                  type="text"
                  value={suspectName}
                  onChange={e => setSuspectName(e.target.value)}
                  placeholder="e.g., Alex 'CryptoKing' / @trader_devin"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Suspect Contact (Email / Phone / Telegram)</label>
                <input
                  type="text"
                  value={suspectContact}
                  onChange={e => setSuspectContact(e.target.value)}
                  placeholder="e.g., support@apex-yield-trade.org / +44 7911 123456"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Suspect Crypto Wallet / UPI ID</label>
                <input
                  type="text"
                  value={suspectWallet}
                  onChange={e => setSuspectWallet(e.target.value)}
                  placeholder="e.g., 0x7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Associated Website Domain / IP Address</label>
                <input
                  type="text"
                  value={suspectDomain}
                  onChange={e => setSuspectDomain(e.target.value)}
                  placeholder="e.g., apex-yield-trade.org / 185.220.101.5"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">Additional Suspect Behavioral Notes</label>
                <textarea
                  rows={3}
                  value={suspectNotes}
                  onChange={e => setSuspectNotes(e.target.value)}
                  placeholder="Describe accent, language used, profile picture descriptions, operating hours, or pressure tactics..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Financial & Transaction Details */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                Step 4: Financial & Transaction Loss Details
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Record payment methods, transaction hashes, and total financial impact for recovery tracking.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-200 font-semibold">Did this incident result in monetary loss?</span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasLoss"
                    checked={hasLoss}
                    onChange={() => setHasLoss(true)}
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-300">Yes</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasLoss"
                    checked={!hasLoss}
                    onChange={() => setHasLoss(false)}
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-300">No</span>
                </label>
              </div>

              {hasLoss && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Total Loss Amount ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        value={lossAmount}
                        onChange={e => setLossAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="25000"
                        className="w-full pl-8 pr-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Payment / Transfer Channel</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Crypto USDT / BTC" className="bg-slate-900">Crypto Transfer (USDT / BTC / ETH)</option>
                      <option value="Wire Transfer" className="bg-slate-900">Bank Wire Transfer</option>
                      <option value="UPI / Instant Pay" className="bg-slate-900">UPI / Instant Mobile Payment</option>
                      <option value="Credit / Debit Card" className="bg-slate-900">Credit / Debit Card Transaction</option>
                      <option value="Gift Card / Voucher" className="bg-slate-900">Gift Cards / Prepaid Codes</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Transaction ID / UTR / Blockchain TxHash</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="e.g., 0x7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Date of Payment</label>
                    <input
                      type="date"
                      value={transactionDate}
                      onChange={e => setTransactionDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-slate-300 font-medium">Fraudulent Recipient Account / Wallet Details</label>
                    <input
                      type="text"
                      value={fraudulentAccount}
                      onChange={e => setFraudulentAccount(e.target.value)}
                      placeholder="e.g., Receiver Wallet / Bank Acc No: TRX7v9k2LmPqR3sTuVwXyZ123456"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Supporting Evidence */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-cyan-400" />
                Step 5: Upload Supporting Digital Evidence
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Attach screenshots, PDF bank statements, chat exports, or email headers. ForensIQ automatically generates SHA-256 hashes.
              </p>
            </div>

            <FileUpload
              caseId="DRAFT-CASE"
              onFileUploaded={file => setStagedEvidence(prev => [...prev, file])}
            />

            {/* Uploaded List Preview */}
            {stagedEvidence.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Attached Files for Intake ({stagedEvidence.length})
                </div>
                <div className="space-y-2">
                  {stagedEvidence.map(file => (
                    <div key={file.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{file.name}</div>
                        <div className="text-[10px] font-mono text-emerald-400">SHA-256: {file.sha256Hash}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                        {file.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Step 6: Review & Legal Submission Declaration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect your entered report details carefully before submitting to the ForensIQ evidence vault.
              </p>
            </div>

            {/* Summary Preview Box */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase font-mono">1. Complainant Info</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Name:</span> <strong className="text-slate-200">{fullName}</strong></div>
                  <div><span className="text-slate-500">Contact:</span> <span className="text-slate-300">{email} | {phone}</span></div>
                  <div><span className="text-slate-500">Govt ID:</span> <span className="text-slate-300 font-mono">{govtId}</span></div>
                  <div><span className="text-slate-500">Address:</span> <span className="text-slate-300">{address}</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase font-mono">2. Incident Details</span>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div><span className="text-slate-500">Title:</span> <strong className="text-white">{title || 'Untitled Incident'}</strong></div>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-slate-500">Category: <strong className="text-slate-200">{category}</strong></span>
                    <UrgencyBadge level={urgency} />
                  </div>
                  <p className="text-slate-300 pt-1 text-[11px] leading-relaxed line-clamp-2">{description}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase font-mono">3 & 4. Suspect & Financial Loss</span>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Suspect Alias:</span> <span className="text-slate-200 font-semibold">{suspectName || 'Unknown'}</span></div>
                  <div><span className="text-slate-500">Loss Amount:</span> <strong className="text-red-400 font-mono">${(lossAmount || 0).toLocaleString()}</strong></div>
                  <div><span className="text-slate-500">Payment Channel:</span> <span className="text-slate-300">{paymentMethod}</span></div>
                  <div className="truncate"><span className="text-slate-500">TxHash:</span> <span className="text-cyan-400 font-mono">{transactionId || 'None'}</span></div>
                </div>
              </div>
            </div>

            {/* Legal Terms Checkbox */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-cyan-500 w-4 h-4 rounded"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I solemnly declare that the facts stated above in this cybercrime incident report are true, correct, and complete to the best of my knowledge. I acknowledge that filing false police reports carries legal consequences.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Control Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded-xl border border-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : <div />}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(8,145,178,0.25)] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!acceptedTerms}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Formal Cybercrime Report</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
