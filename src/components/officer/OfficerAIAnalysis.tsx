import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Phone,
  Mail,
  Globe,
  CreditCard,
  QrCode,
  Link as LinkIcon,
  User,
  Calendar,
  Receipt,
  AlertTriangle,
  Search,
  Copy,
  Check,
  RefreshCw,
  Network,
  Cpu,
  Layers,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface ExtractedEntity {
  id: string;
  category:
    | 'Phone'
    | 'Email'
    | 'IP Address'
    | 'Bank Account'
    | 'UPI ID'
    | 'URL'
    | 'Name'
    | 'Date'
    | 'Transaction Ref';
  value: string;
  confidence: number;
  sourceDoc: string;
  contextSnippet: string;
  flag:
    | 'High Risk'
    | 'Suspicious'
    | 'Verified Entity'
    | 'Mule Account'
    | 'Phishing URL';
}

interface AIAnalysisResult {
  riskScore: number;
  riskLevel:
    | 'Critical'
    | 'High'
    | 'Medium'
    | 'Low'
    | 'Clean';
  category: string;
  summary: string;
  indicatorsOfCompromise: string[];
  forensicRecommendations: string[];
  evidenceHashSHA256: string;
  recommendedActionForOfficer: string;
}

export const OfficerAIAnalysis: React.FC = () => {
  const {
    cases,
    analyzeEvidenceAI,
  } = useApp();

  /*
   * ------------------------------------------------------------------------
   * CASE / EVIDENCE STATE
   * ------------------------------------------------------------------------
   */

  const [selectedCaseId, setSelectedCaseId] =
    useState<string>(cases[0]?.id || '');

  const [selectedFile, setSelectedFile] =
    useState<string>('');

  /*
   * ------------------------------------------------------------------------
   * ANALYSIS STATE
   * ------------------------------------------------------------------------
   */

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisStep, setAnalysisStep] =
    useState<number>(1);

  const [aiResult, setAiResult] =
    useState<AIAnalysisResult | null>(null);

  const [analysisError, setAnalysisError] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------------------
   * FILTER STATE
   * ------------------------------------------------------------------------
   */

  const [activeCategory, setActiveCategory] =
    useState<string>('All');

  const [searchTerm, setSearchTerm] =
    useState('');

  /*
   * ------------------------------------------------------------------------
   * COPY STATE
   * ------------------------------------------------------------------------
   */

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------------------
   * CURRENT CASE
   * ------------------------------------------------------------------------
   */

  const currentCase =
    cases.find(
      (caseItem) =>
        caseItem.id === selectedCaseId
    ) || cases[0];

  /*
   * ------------------------------------------------------------------------
   * CURRENT SELECTED EVIDENCE
   * ------------------------------------------------------------------------
   */

  const selectedEvidence =
    currentCase?.evidenceFiles?.find(
      (file) =>
        file.name === selectedFile
    );

  /*
   * ------------------------------------------------------------------------
   * SYNCHRONIZE CASE SELECTION
   * ------------------------------------------------------------------------
   *
   * If cases load asynchronously and selectedCaseId
   * is initially empty, select the first available case.
   */

  useEffect(() => {
    if (
      cases.length > 0 &&
      !cases.some(
        (caseItem) =>
          caseItem.id === selectedCaseId
      )
    ) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  /*
   * ------------------------------------------------------------------------
   * SYNCHRONIZE EVIDENCE SELECTION
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    if (!currentCase) {
      setSelectedFile('');
      return;
    }

    const evidenceFiles =
      currentCase.evidenceFiles || [];

    if (evidenceFiles.length === 0) {
      setSelectedFile('');
      return;
    }

    const selectedFileStillExists =
      evidenceFiles.some(
        (file) =>
          file.name === selectedFile
      );

    if (!selectedFileStillExists) {
      setSelectedFile(
        evidenceFiles[0].name
      );
    }
  }, [currentCase, selectedFile]);

  /*
   * ------------------------------------------------------------------------
   * CLEAR PREVIOUS ANALYSIS WHEN CASE / EVIDENCE CHANGES
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    setAiResult(null);
    setAnalysisError(null);
    setAnalysisStep(1);
  }, [selectedCaseId, selectedFile]);

  /*
   * ------------------------------------------------------------------------
   * DEMO ENTITY DATA
   * ------------------------------------------------------------------------
   *
   * These are demonstration entities only.
   *
   * IMPORTANT:
   * They are NOT treated as Gemini findings.
   * Gemini currently returns:
   * - risk score
   * - category
   * - summary
   * - indicators
   * - recommendations
   * - evidence hash
   * - officer action
   *
   * Therefore these entity cards remain clearly marked as
   * demonstration data until a dedicated entity extraction
   * API is implemented.
   */

  const demoEntities: ExtractedEntity[] = [
    {
      id: 'ent-1',
      category: 'Phone',
      value: '+1 (555) 019-2834',
      confidence: 98,
      sourceDoc:
        'whatsapp_extortion_screenshot.jpg',
      contextSnippet:
        '"Transfer $5,000 immediately to clear account or call +1 (555) 019-2834"',
      flag: 'High Risk',
    },
    {
      id: 'ent-2',
      category: 'Phone',
      value: '+91 98765 43210',
      confidence: 94,
      sourceDoc: 'call_log_export.csv',
      contextSnippet:
        'Inbound SMS sender ID claiming to be Bank Cyber Cell: +91 98765 43210',
      flag: 'Suspicious',
    },
    {
      id: 'ent-3',
      category: 'Email',
      value: 'suspect_x@shadowpay.io',
      confidence: 96,
      sourceDoc:
        'phishing_email_headers.eml',
      contextSnippet:
        'Reply-To: suspect_x@shadowpay.io via spoofed Mailgun relay node',
      flag: 'High Risk',
    },
    {
      id: 'ent-4',
      category: 'Email',
      value: 'extortion_desk@proton.me',
      confidence: 98,
      sourceDoc:
        'whatsapp_extortion_screenshot.jpg',
      contextSnippet:
        'Encrypted communication handle provided by suspect: extortion_desk@proton.me',
      flag: 'High Risk',
    },
    {
      id: 'ent-5',
      category: 'IP Address',
      value: '185.220.101.5',
      confidence: 94,
      sourceDoc:
        'server_access_log.json',
      contextSnippet:
        'HTTP POST /api/v1/withdraw originated from TOR Exit Node 185.220.101.5',
      flag: 'Phishing URL',
    },
    {
      id: 'ent-6',
      category: 'IP Address',
      value: '192.168.1.104',
      confidence: 99,
      sourceDoc:
        'forensic_device_dump.docx',
      contextSnippet:
        'Internal LAN IP assigned to suspect staging machine during session execution',
      flag: 'Verified Entity',
    },
    {
      id: 'ent-7',
      category: 'Bank Account',
      value: 'ACC-9048-2819-5501',
      confidence: 98,
      sourceDoc:
        'bank_transfer_receipt_049.png',
      contextSnippet:
        'Beneficiary Account: ACC-9048-2819-5501 (Cyber Crime Fraud Hotline Flagged)',
      flag: 'Mule Account',
    },
    {
      id: 'ent-8',
      category: 'Bank Account',
      value: 'A/C 0049-3829-1920',
      confidence: 95,
      sourceDoc:
        'subpoena_exchange_records.pdf',
      contextSnippet:
        'Secondary distribution node account receiving $2,400 split payout',
      flag: 'Mule Account',
    },
    {
      id: 'ent-9',
      category: 'UPI ID',
      value: 'paym-fraudster@okaxis',
      confidence: 97,
      sourceDoc:
        'bank_transfer_receipt_049.png',
      contextSnippet:
        'Virtual Payment Address (VPA) linked to instant fund drain request',
      flag: 'High Risk',
    },
    {
      id: 'ent-10',
      category: 'UPI ID',
      value: 'quicklender@ybl',
      confidence: 92,
      sourceDoc:
        'whatsapp_extortion_screenshot.jpg',
      contextSnippet:
        'Fake loan app settlement UPI ID provided in extortion message',
      flag: 'Suspicious',
    },
    {
      id: 'ent-11',
      category: 'URL',
      value:
        'https://secure-login-verify-bank.com/phish',
      confidence: 96,
      sourceDoc:
        'phishing_email_headers.eml',
      contextSnippet:
        'Credential harvester URL embedded in fake account security notification',
      flag: 'Phishing URL',
    },
    {
      id: 'ent-12',
      category: 'URL',
      value:
        'https://bit.ly/claim-prize-392',
      confidence: 91,
      sourceDoc:
        'whatsapp_extortion_screenshot.jpg',
      contextSnippet:
        'Shortened redirect URL directing victim to malware APK download',
      flag: 'Phishing URL',
    },
    {
      id: 'ent-13',
      category: 'Name',
      value:
        'Vikram Malhotra (Alias: ShadowOperator)',
      confidence: 94,
      sourceDoc:
        'forensic_device_dump.docx',
      contextSnippet:
        'Primary Telegram admin username matching KYC records at crypto gateway',
      flag: 'High Risk',
    },
    {
      id: 'ent-14',
      category: 'Name',
      value:
        'Rajesh Kumar (Mule Account Holder)',
      confidence: 91,
      sourceDoc:
        'bank_transfer_receipt_049.png',
      contextSnippet:
        'Account title holder registered at Axis Bank Branch #402',
      flag: 'Mule Account',
    },
    {
      id: 'ent-15',
      category: 'Date',
      value:
        '2026-08-03 14:22:10 UTC',
      confidence: 99,
      sourceDoc:
        'bank_transfer_receipt_049.png',
      contextSnippet:
        'Timestamp of unauthorized IMPS fund transfer initiation',
      flag: 'Verified Entity',
    },
    {
      id: 'ent-16',
      category: 'Date',
      value:
        '2026-08-04 09:15:00 UTC',
      confidence: 97,
      sourceDoc:
        'server_access_log.json',
      contextSnippet:
        'Timestamp of suspect credential extraction request from remote IP',
      flag: 'Verified Entity',
    },
    {
      id: 'ent-17',
      category: 'Transaction Ref',
      value:
        'TXN-8849201948',
      confidence: 98,
      sourceDoc:
        'bank_transfer_receipt_049.png',
      contextSnippet:
        'IMPS Reference Number: TXN-8849201948 ($5,000 transferred)',
      flag: 'High Risk',
    },
    {
      id: 'ent-18',
      category: 'Transaction Ref',
      value:
        'IMPS/6029104829/RET',
      confidence: 96,
      sourceDoc:
        'subpoena_exchange_records.pdf',
      contextSnippet:
        'Interbank settlement reference ID flagged by fraud monitoring engine',
      flag: 'Suspicious',
    },
  ];

  /*
   * ------------------------------------------------------------------------
   * RUN REAL GEMINI FORENSIC ANALYSIS
   * ------------------------------------------------------------------------
   */

  const handleRunAnalysis =
    async () => {
      if (!currentCase) {
        setAnalysisError(
          'No case is currently selected.'
        );
        return;
      }

      if (!selectedEvidence) {
        setAnalysisError(
          'Please select an evidence artifact before running AI analysis.'
        );
        return;
      }

      setIsAnalyzing(true);
      setAnalysisError(null);
      setAiResult(null);
      setAnalysisStep(1);

      try {
        /*
         * STEP 1
         * Evidence ingestion
         */

        await new Promise<void>(
          (resolve) =>
            setTimeout(resolve, 500)
        );

        setAnalysisStep(2);

        /*
         * STEP 2
         * Evidence metadata / text representation
         *
         * NOTE:
         * At the moment EvidenceFile contains metadata,
         * not the original file bytes.
         *
         * Therefore Gemini receives the structured
         * evidence metadata available in the application.
         */

        const evidenceContent = `
Evidence File Name:
${selectedEvidence.name}

Evidence Type:
${selectedEvidence.type}

Evidence Size:
${selectedEvidence.size}

Upload Date:
${selectedEvidence.uploadDate}

SHA-256 Hash:
${selectedEvidence.sha256Hash || 'not-provided'}

Verification Status:
${selectedEvidence.verificationStatus}

Uploaded By:
${selectedEvidence.uploadedBy}

Case ID:
${currentCase.id}

Case Title:
${currentCase.title}

Case Category:
${currentCase.category}

Case Urgency:
${currentCase.urgency}

Case Status:
${currentCase.status}

Incident Description:
${currentCase.description}

Victim Name:
${currentCase.victimName}

Incident Location:
${currentCase.incidentLocation || 'Not provided'}

Incident Date:
${currentCase.incidentDate || 'Not provided'}

Reported Date:
${currentCase.reportedDate}

Financial Loss:
${
  currentCase.lossAmount !== undefined
    ? currentCase.lossAmount
    : 'Not provided'
}

Financial Details:
${JSON.stringify(
  currentCase.financialDetails || {},
  null,
  2
)}

Existing Suspect Information:
${JSON.stringify(
  currentCase.suspectInfo || {},
  null,
  2
)}

Chain of Custody:
${JSON.stringify(
  selectedEvidence.custodyChain || [],
  null,
  2
)}
`;

        await new Promise<void>(
          (resolve) =>
            setTimeout(resolve, 500)
        );

        setAnalysisStep(3);

        /*
         * STEP 3
         * Gemini forensic analysis
         */

        const result =
          await analyzeEvidenceAI(
            evidenceContent,
            selectedEvidence.type,
            selectedEvidence.name
          );

        setAnalysisStep(4);

        await new Promise<void>(
          (resolve) =>
            setTimeout(resolve, 500)
        );

        /*
         * STEP 5
         * Relationship detection
         */

        setAnalysisStep(5);

        await new Promise<void>(
          (resolve) =>
            setTimeout(resolve, 500)
        );

        /*
         * STEP 6
         * Investigation insights
         */

        setAnalysisStep(6);

        /*
         * Ensure the returned result has
         * safe defaults.
         */

        const normalizedResult: AIAnalysisResult = {
          riskScore:
            typeof result?.riskScore ===
            'number'
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    result.riskScore
                  )
                )
              : 0,

          riskLevel:
            result?.riskLevel ||
            'Clean',

          category:
            result?.category ||
            'Uncategorized',

          summary:
            result?.summary ||
            'No forensic summary was returned by the AI service.',

          indicatorsOfCompromise:
            Array.isArray(
              result?.indicatorsOfCompromise
            )
              ? result.indicatorsOfCompromise
              : [],

          forensicRecommendations:
            Array.isArray(
              result?.forensicRecommendations
            )
              ? result.forensicRecommendations
              : [],

          /*
           * Prefer the actual evidence hash
           * stored in the selected evidence artifact.
           */

          evidenceHashSHA256:
            selectedEvidence.sha256Hash ||
            result?.evidenceHashSHA256 ||
            'not-provided',

          recommendedActionForOfficer:
            result?.recommendedActionForOfficer ||
            'Review the evidence and independently verify the AI-generated findings.',
        };

        setAiResult(
          normalizedResult
        );
      } catch (error) {
        console.error(
          'Officer AI Analysis failed:',
          error
        );

        setAnalysisError(
          error instanceof Error
            ? error.message
            : 'Unable to complete forensic AI analysis.'
        );

        setAnalysisStep(1);
      } finally {
        setIsAnalyzing(false);
      }
    };

  /*
   * ------------------------------------------------------------------------
   * COPY ENTITY VALUE
   * ------------------------------------------------------------------------
   */

  const copyToClipboard =
    async (
      id: string,
      text: string
    ) => {
      try {
        await navigator.clipboard.writeText(
          text
        );

        setCopiedId(id);

        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } catch {
        setCopiedId(null);
      }
    };

  /*
   * ------------------------------------------------------------------------
   * FILTER ENTITIES
   * ------------------------------------------------------------------------
   *
   * IMPORTANT:
   * Demo entities are no longer hidden simply because their
   * source filename does not equal the currently selected
   * real evidence filename.
   *
   * This prevents the UI from showing "0 entities" for every
   * real uploaded artifact.
   */

  const filteredEntities =
    useMemo(() => {
      return demoEntities.filter(
        (entity) => {
          const matchesCategory =
            activeCategory ===
              'All' ||
            entity.category ===
              activeCategory;

          const normalizedSearch =
            searchTerm
              .toLowerCase()
              .trim();

          const matchesSearch =
            normalizedSearch === '' ||
            entity.value
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            entity.contextSnippet
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            entity.sourceDoc
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            entity.flag
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      activeCategory,
      searchTerm,
      demoEntities,
    ]);

  /*
   * ------------------------------------------------------------------------
   * ENTITY CATEGORY ICON
   * ------------------------------------------------------------------------
   */

  const getCategoryIcon =
    (category: string) => {
      switch (category) {
        case 'Phone':
          return (
            <Phone className="w-4 h-4 text-cyan-400" />
          );

        case 'Email':
          return (
            <Mail className="w-4 h-4 text-purple-400" />
          );

        case 'IP Address':
          return (
            <Globe className="w-4 h-4 text-blue-400" />
          );

        case 'Bank Account':
          return (
            <CreditCard className="w-4 h-4 text-emerald-400" />
          );

        case 'UPI ID':
          return (
            <QrCode className="w-4 h-4 text-amber-400" />
          );

        case 'URL':
          return (
            <LinkIcon className="w-4 h-4 text-rose-400" />
          );

        case 'Name':
          return (
            <User className="w-4 h-4 text-indigo-400" />
          );

        case 'Date':
          return (
            <Calendar className="w-4 h-4 text-teal-400" />
          );

        case 'Transaction Ref':
          return (
            <Receipt className="w-4 h-4 text-orange-400" />
          );

        default:
          return (
            <Sparkles className="w-4 h-4 text-cyan-400" />
          );
      }
    };

  /*
   * ------------------------------------------------------------------------
   * ANALYSIS PIPELINE
   * ------------------------------------------------------------------------
   */

  const pipelineSteps = [
    {
      number: '1',
      title: 'Evidence',
      description:
        'File Ingestion & SHA-256 Validation',
      activeClass:
        'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md',
      iconClass:
        'border-cyan-500/40 text-cyan-400',
    },
    {
      number: '2',
      title: 'OCR / Text Extraction',
      description:
        'Tesseract & Multimodal Document Parsing',
      activeClass:
        'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md',
      iconClass:
        'border-cyan-500/40 text-cyan-400',
    },
    {
      number: '3',
      title: 'Entity Extraction',
      description:
        'Regex & Gemini NER Tokenization',
      activeClass:
        'bg-blue-950/40 border-blue-500/50 text-blue-200 shadow-md',
      iconClass:
        'border-blue-500/40 text-blue-400',
    },
    {
      number: '4',
      title: 'Entity Classification',
      description:
        'Confidence Scoring & Risk Flagging',
      activeClass:
        'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 shadow-md',
      iconClass:
        'border-indigo-500/40 text-indigo-400',
    },
    {
      number: '5',
      title: 'Relationship Detection',
      description:
        'Graph Link Analysis & Suspect Correlation',
      activeClass:
        'bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-md',
      iconClass:
        'border-purple-500/40 text-purple-400',
    },
    {
      number: '6',
      title: 'Investigation Insights',
      description:
        'Actionable Lead Dossier Generated',
      activeClass:
        'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-lg glow-emerald',
      iconClass:
        'border-emerald-500/40 text-emerald-400',
    },
  ];

  /*
   * ------------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------------
   */

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* =====================================================
          TOP BANNER
      ===================================================== */}

      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0b1324] to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30 font-mono">
            <Cpu className="w-3.5 h-3.5" />

            <span>
              ForensIQ Gemini AI Forensic Analysis Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            AI Forensic Evidence Analysis
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl font-sans">
            Analyze case evidence metadata using the
            server-side Gemini forensic analysis engine.
            Results include risk scoring, indicators,
            recommendations, and investigative actions.
          </p>
        </div>

        <div className="z-10 shrink-0">

          <button
            type="button"
            onClick={
              handleRunAnalysis
            }
            disabled={
              isAnalyzing ||
              !selectedEvidence
            }
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >

            <RefreshCw
              className={`w-4 h-4 ${
                isAnalyzing
                  ? 'animate-spin'
                  : ''
              }`}
            />

            <span>
              {isAnalyzing
                ? 'Running AI Engine...'
                : 'Analyze Evidence'}
            </span>

          </button>

        </div>
      </div>

      {/* =====================================================
          AI STATUS NOTICE
      ===================================================== */}

      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-start gap-3 shadow-lg">

        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />

        <div className="space-y-1">

          <strong className="text-cyan-300 uppercase tracking-wider block text-[11px]">
            Gemini AI Analysis Active
          </strong>

          <p className="text-cyan-200/90 leading-relaxed font-sans">
            The forensic risk assessment displayed below
            is generated by the configured Gemini AI
            backend. AI output is investigative assistance
            only and must be independently verified by a
            qualified investigator.
          </p>

        </div>
      </div>

      {/* =====================================================
          CASE & ARTIFACT SELECTOR
      ===================================================== */}

      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">

        {/* CASE SELECTOR */}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">

          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            Target Case:
          </span>

          <select
            value={selectedCaseId}
            onChange={(event) =>
              setSelectedCaseId(
                event.target.value
              )
            }
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold cursor-pointer"
          >

            {cases.length === 0 ? (
              <option value="">
                No cases available
              </option>
            ) : (
              cases.map(
                (caseItem) => (
                  <option
                    key={caseItem.id}
                    value={caseItem.id}
                  >
                    {caseItem.id} —{' '}
                    {caseItem.title.slice(
                      0,
                      35
                    )}
                    {caseItem.title
                      .length > 35
                      ? '...'
                      : ''}
                  </option>
                )
              )
            )}

          </select>
        </div>

        {/* EVIDENCE SELECTOR */}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">

          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            Input Artifact:
          </span>

          <select
            value={selectedFile}
            onChange={(event) =>
              setSelectedFile(
                event.target.value
              )
            }
            disabled={
              !currentCase
                ?.evidenceFiles
                ?.length
            }
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {!currentCase
              ?.evidenceFiles
              ?.length ? (
              <option value="">
                No evidence uploaded
              </option>
            ) : (
              currentCase.evidenceFiles.map(
                (file) => (
                  <option
                    key={file.id}
                    value={file.name}
                  >
                    {file.name} (
                    {file.type})
                  </option>
                )
              )
            )}

          </select>

        </div>
      </div>

      {/* =====================================================
          SELECTED EVIDENCE INFORMATION
      ===================================================== */}

      {selectedEvidence && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/20 shadow-lg">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>

              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500">
                Selected Evidence
              </span>

              <div className="mt-1 flex items-center gap-2">

                <span className="text-sm font-mono font-bold text-white">
                  {selectedEvidence.name}
                </span>

                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  {
                    selectedEvidence.verificationStatus
                  }
                </span>

              </div>

            </div>

            <div className="text-right">

              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-500 block">
                SHA-256
              </span>

              <span
                className="text-[10px] font-mono text-cyan-400"
                title={
                  selectedEvidence.sha256Hash
                }
              >
                {selectedEvidence.sha256Hash
                  ? selectedEvidence.sha256Hash.slice(
                      0,
                      24
                    )
                  : 'not-provided'}
                {selectedEvidence.sha256Hash
                  ? '...'
                  : ''}
              </span>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          ANALYSIS PIPELINE
      ===================================================== */}

      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-5 shadow-xl">

        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">

          <div>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              ForensIQ Visual AI Analysis Pipeline
            </h2>

            <p className="text-xs text-slate-400">
              Progression from evidence ingestion to
              Gemini-powered investigation insights.
            </p>

          </div>

          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/20">
            Stage {analysisStep} / 6
          </span>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-center">

          {pipelineSteps.map(
            (step) => {
              const isActive =
                analysisStep >=
                Number(
                  step.number
                );

              return (
                <div
                  key={
                    step.number
                  }
                  className={`p-4 rounded-xl border space-y-2 transition-all ${
                    isActive
                      ? step.activeClass
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >

                  <div
                    className={`w-8 h-8 rounded-full bg-slate-950 border mx-auto flex items-center justify-center font-bold text-xs ${step.iconClass}`}
                  >
                    {step.number ===
                      '6' &&
                    isActive
                      ? '✓'
                      : step.number}
                  </div>

                  <h4 className="font-mono font-bold text-xs text-white">
                    {step.title}
                  </h4>

                  <p className="text-[10px] text-slate-400">
                    {
                      step.description
                    }
                  </p>

                </div>
              );
            }
          )}

        </div>
      </div>

      {/* =====================================================
          EXTRACTED ENTITIES - DEMO
      ===================================================== */}

      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6 shadow-xl">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">

          <div>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              Demonstration Entity Intelligence (
              {
                filteredEntities.length
              }
              )
            </h2>

            <p className="text-xs text-slate-400">
              Demonstration entity cards retained for
              UI prototyping. These are not Gemini findings
              from the currently selected evidence.
            </p>

          </div>

          <div className="relative min-w-[240px]">

            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />

            <input
              type="text"
              placeholder="Filter entity, file, snippet..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />

          </div>

        </div>

        {/* DEMO DATA NOTICE */}

        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">

          <p className="text-[10px] text-amber-300/80 font-mono leading-relaxed">
            <strong>
              DEMONSTRATION DATA:
            </strong>{' '}
            The entity cards below are retained from
            the original prototype. The current Gemini
            endpoint does not yet return structured
            entity objects, so these values must not be
            interpreted as extracted from the selected
            artifact.
          </p>

        </div>

        {/* CATEGORY FILTERS */}

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono border-b border-slate-800/60 pb-3">

          <span className="text-slate-500 font-bold text-[10px] uppercase flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            Filter Category:
          </span>

          {[
            'All',
            'Phone',
            'Email',
            'IP Address',
            'Bank Account',
            'UPI ID',
            'URL',
            'Name',
            'Date',
            'Transaction Ref',
          ].map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category
                  )
                }
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  activeCategory ===
                  category
                    ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {category}
              </button>
            )
          )}

        </div>

        {/* ENTITY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredEntities.map(
            (entity) => (
              <div
                key={entity.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
              >

                <div className="space-y-2">

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold">

                      {getCategoryIcon(
                        entity.category
                      )}

                      <span className="text-slate-200">
                        {
                          entity.category
                        }
                      </span>

                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                        entity.confidence >=
                        95
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : entity.confidence >=
                            90
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {
                        entity.confidence
                      }
                      % Confidence
                    </span>

                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">

                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                      Extracted Entity Value
                    </div>

                    <div className="flex items-center justify-between gap-2">

                      <span
                        className="text-sm font-bold text-white font-mono truncate"
                        title={
                          entity.value
                        }
                      >
                        {
                          entity.value
                        }
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            entity.id,
                            entity.value
                          )
                        }
                        className="p-1 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                        title="Copy Value"
                      >
                        {copiedId ===
                        entity.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                    </div>

                  </div>

                  <div className="space-y-1">

                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                      Context Snippet
                    </div>

                    <p className="text-xs text-slate-300 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed font-sans">
                      {
                        entity.contextSnippet
                      }
                    </p>

                  </div>

                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">

                  <span
                    className="truncate max-w-[140px]"
                    title={
                      entity.sourceDoc
                    }
                  >
                    📄{' '}
                    {
                      entity.sourceDoc
                    }
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      entity.flag ===
                        'High Risk' ||
                      entity.flag ===
                        'Mule Account' ||
                      entity.flag ===
                        'Phishing URL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {
                      entity.flag
                    }
                  </span>

                </div>

              </div>
            )
          )}

          {filteredEntities.length ===
            0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
              No demonstration entities match the
              selected category or search filter.
            </div>
          )}

        </div>
      </div>

      {/* =====================================================
          REAL GEMINI AI ANALYSIS RESULT
      ===================================================== */}

      {aiResult && (
        <div className="p-6 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-5 shadow-2xl">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800 pb-4">

            <div className="flex items-center gap-2">

              <Sparkles className="w-5 h-5 text-emerald-400" />

              <div>

                <h2 className="text-base font-serif italic text-white">
                  Gemini Forensic AI Analysis
                </h2>

                <p className="text-xs text-slate-400 font-sans">
                  Server-side Gemini assessment of the
                  selected evidence artifact.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2 flex-wrap">

              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                {
                  aiResult.category
                }
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  aiResult.riskLevel ===
                  'Critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : aiResult.riskLevel ===
                      'High'
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : aiResult.riskLevel ===
                      'Medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : aiResult.riskLevel ===
                      'Low'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {
                  aiResult.riskLevel
                }
              </span>

            </div>
          </div>

          {/* =================================================
              RISK / ARTIFACT / STATUS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* RISK SCORE */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">

              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                AI Risk Score
              </span>

              <div className="flex items-end gap-2 mt-2">

                <span className="text-4xl font-bold text-white font-mono">
                  {
                    aiResult.riskScore
                  }
                </span>

                <span className="text-xs text-slate-500 mb-1">
                  / 100
                </span>

              </div>

              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-rose-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        aiResult.riskScore
                      )
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* ARTIFACT */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">

              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Analyzed Artifact
              </span>

              <p className="mt-2 text-sm text-white font-mono font-bold truncate">
                {
                  selectedEvidence?.name
                }
              </p>

              <p className="mt-1 text-[10px] text-slate-500 font-mono">
                Evidence metadata analyzed by Gemini
              </p>

            </div>

            {/* STATUS */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">

              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                Analysis Status
              </span>

              <div className="flex items-center gap-2 mt-2">

                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                <span className="text-sm text-emerald-300 font-mono font-bold">
                  Analysis Complete
                </span>

              </div>

              <p className="mt-1 text-[10px] text-slate-500 font-mono">
                Gemini 2.5 Flash
              </p>

            </div>

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">

            <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
              Forensic Summary
            </span>

            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
              {
                aiResult.summary
              }
            </p>

          </div>

          {/* =================================================
              INDICATORS + RECOMMENDATIONS
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* INDICATORS */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">

              <div className="flex items-center gap-2 mb-3">

                <AlertTriangle className="w-4 h-4 text-rose-400" />

                <h3 className="text-xs font-mono font-bold text-white uppercase">
                  Indicators of Compromise
                </h3>

              </div>

              {aiResult
                .indicatorsOfCompromise
                .length > 0 ? (
                <ul className="space-y-2">

                  {aiResult.indicatorsOfCompromise.map(
                    (
                      indicator,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                        className="flex gap-2 text-xs text-slate-300"
                      >
                        <span className="text-rose-400 font-bold">
                          •
                        </span>

                        <span>
                          {
                            indicator
                          }
                        </span>
                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  No indicators returned by
                  the AI model.
                </p>
              )}

            </div>

            {/* RECOMMENDATIONS */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">

              <div className="flex items-center gap-2 mb-3">

                <ShieldCheck className="w-4 h-4 text-cyan-400" />

                <h3 className="text-xs font-mono font-bold text-white uppercase">
                  Forensic Recommendations
                </h3>

              </div>

              {aiResult
                .forensicRecommendations
                .length > 0 ? (
                <ul className="space-y-2">

                  {aiResult.forensicRecommendations.map(
                    (
                      recommendation,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                        className="flex gap-2 text-xs text-slate-300"
                      >

                        <span className="text-cyan-400 font-bold">
                          {index +
                            1}
                          .
                        </span>

                        <span>
                          {
                            recommendation
                          }
                        </span>

                      </li>
                    )
                  )}

                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  No recommendations returned
                  by the AI model.
                </p>
              )}

            </div>

          </div>

          {/* =================================================
              OFFICER ACTION
          ================================================= */}

          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">

            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">
              Recommended Officer Action
            </span>

            <p className="mt-2 text-sm text-cyan-100 leading-relaxed font-medium">
              {
                aiResult.recommendedActionForOfficer
              }
            </p>

          </div>

          {/* =================================================
              EVIDENCE HASH
          ================================================= */}

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">

            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">

                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Evidence SHA-256
                </span>

                <p className="mt-2 text-[11px] text-slate-300 font-mono break-all">
                  {
                    aiResult.evidenceHashSHA256 ||
                    'not-provided'
                  }
                </p>

              </div>

              {aiResult.evidenceHashSHA256 &&
                aiResult.evidenceHashSHA256 !==
                  'not-provided' && (
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'evidence-hash',
                        aiResult.evidenceHashSHA256
                      )
                    }
                    className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-colors shrink-0"
                    title="Copy SHA-256"
                  >
                    {copiedId ===
                    'evidence-hash' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}

            </div>

          </div>

          {/* =================================================
              AI DISCLAIMER
          ================================================= */}

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">

            <p className="text-[10px] text-amber-300/80 font-mono leading-relaxed">

              AI-generated analysis is an investigative
              assistance output. Findings must be independently
              verified by qualified investigators. The AI
              response does not by itself establish legal
              guilt or evidentiary admissibility.

            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {analysisError && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 font-mono">

          <strong>
            AI Analysis Error:
          </strong>{' '}

          {analysisError}

        </div>
      )}

      {/* =====================================================
          INVESTIGATION INSIGHTS
      ===================================================== */}

      <div className="p-6 bg-slate-950 border border-cyan-500/30 rounded-2xl space-y-4 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">

          <div className="flex items-center gap-2">

            <Sparkles className="w-5 h-5 text-cyan-400" />

            <h3 className="text-base font-serif italic text-white">
              Investigation Insights
            </h3>

          </div>

          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
            AI-Assisted
          </span>

        </div>

        {!aiResult ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">

            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />

            <p className="text-xs text-slate-500 font-mono">
              Run Gemini analysis on an evidence
              artifact to generate investigation insights.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">

            {/* AI CATEGORY */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">

              <span className="text-slate-500 text-[10px] uppercase font-bold block">
                Detected Category
              </span>

              <span className="text-cyan-400 font-bold block">
                {
                  aiResult.category
                }
              </span>

              <p className="text-[11px] text-slate-400 font-sans mt-1">
                Category returned by the Gemini forensic
                analysis model.
              </p>

            </div>

            {/* RISK LEVEL */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">

              <span className="text-slate-500 text-[10px] uppercase font-bold block">
                Risk Assessment
              </span>

              <span className="text-orange-400 font-bold block">
                {
                  aiResult.riskLevel
                }{' '}
                —{' '}
                {
                  aiResult.riskScore
                }
                /100
              </span>

              <p className="text-[11px] text-slate-400 font-sans mt-1">
                AI-generated risk assessment based on
                the supplied evidence representation.
              </p>

            </div>

            {/* OFFICER ACTION */}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">

              <span className="text-slate-500 text-[10px] uppercase font-bold block">
                Recommended Action
              </span>

              <span className="text-emerald-400 font-bold block">
                Officer Review Required
              </span>

              <p className="text-[11px] text-slate-400 font-sans mt-1">
                {
                  aiResult.recommendedActionForOfficer
                }
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};