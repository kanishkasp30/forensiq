import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, FileCode, ArrowRight, Copy, Check } from 'lucide-react';

interface AIEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialType?: string;
}

export const AIEvidenceModal: React.FC<AIEvidenceModalProps> = ({
  isOpen,
  onClose,
  initialContent = '',
  initialType = 'Phishing / Suspicious Link',
}) => {
  const { analyzeEvidenceAI } = useApp();
  const [content, setContent] = useState(initialContent);
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('Evidence Artifact Scan');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const result = await analyzeEvidenceAI(content, type, title);
      setAnalysisResult(result);
    } catch (error: any) {
      setAnalysisError(
        error?.message || 'AI analysis failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResults = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ForensIQ AI Evidence Inspector"
      subtitle="Server-side Gemini AI threat analysis, IOC extraction & hash verification"
      icon={<Sparkles className="w-5 h-5 text-amber-400" />}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Input Form */}
        <form onSubmit={handleRunScan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Evidence Artifact Category</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Phishing / Social Engineering">Phishing / Suspicious Link / Email</option>
                <option value="Cryptocurrency Scam">Cryptocurrency Wallet / Transaction Hash</option>
                <option value="Ransomware / Extortion">Ransomware Note / Malicious Script</option>
                <option value="Identity Theft">Synthetic Identity / KYC Document Data</option>
                <option value="General Evidence">General Cybercrime Logs & Chat Export</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Artifact Label</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. telegram_chat_log.txt or phishing_url.org"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Evidence Content / Raw Text / URL / Wallet / Log Data</label>
            <textarea
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste suspicious link, email header, chat transcript, ransomware note, or crypto transaction ID here..."
              className="w-full p-3 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-cyan-600 to-blue-600 hover:from-amber-500 hover:to-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Deep AI Forensic Scan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute ForensIQ AI Analysis</span>
              </>
            )}
          </button>
        </form>

        {/* Error display */}
        {analysisError && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
            <p className="text-sm text-red-300 font-semibold">Analysis Failed</p>
            <p className="text-xs text-slate-400 font-mono">{analysisError}</p>
          </div>
        )}

        {/* Results display */}
        {analysisResult && (
          <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  RISK SCORE: {analysisResult.riskScore}/100
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  analysisResult.riskLevel === 'Critical' ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-orange-950 text-orange-400 border border-orange-500/40'
                }`}>
                  {analysisResult.riskLevel} Threat
                </span>
              </div>

              <button
                onClick={copyResults}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Executive AI Summary</h4>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                {analysisResult.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Indicators of Compromise (IOCs)
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {analysisResult.indicatorsOfCompromise?.map((ioc: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-mono">•</span>
                      <span>{ioc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Forensic Action Steps
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {analysisResult.forensicRecommendations?.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {analysisResult.evidenceHashSHA256 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Calculated SHA-256 Digest:</span>
                <code className="text-xs text-cyan-300 font-mono break-all bg-slate-900 p-2 rounded block mt-0.5 border border-slate-800">
                  {analysisResult.evidenceHashSHA256}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};