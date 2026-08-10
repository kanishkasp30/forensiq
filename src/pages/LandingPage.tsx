import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  Search,
  Globe,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { threatFeed } = useApp();

  const [quickCheckUrl, setQuickCheckUrl] = useState('');
  const [quickCheckResult, setQuickCheckResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  /*
   * Users must authenticate before entering any role dashboard.
   *
   * The selected role is passed to the login page through the URL.
   * Example:
   * /login?role=victim
   * /login?role=officer
   * /login?role=admin
   */
  const goToLogin = (
    role?: 'victim' | 'officer' | 'admin'
  ) => {
    if (role) {
      navigate(`/login?role=${role}`);
    } else {
      navigate('/login');
    }
  };

  /*
   * Public URL checker.
   *
   * NOTE:
   * This is still a local pattern checker.
   * We will connect this to the real backend threat-analysis
   * service in a later phase.
   */
  const handleQuickCheck = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!quickCheckUrl.trim()) {
      return;
    }

    setChecking(true);
    setQuickCheckResult(null);

    setTimeout(() => {
      const value =
        quickCheckUrl.trim().toLowerCase();

      const isSuspicious =
        value.includes('apex') ||
        value.includes('login') ||
        value.includes('bank') ||
        value.includes('crypto') ||
        value.includes('verify');

      setQuickCheckResult({
        url: quickCheckUrl.trim(),

        riskScore: isSuspicious
          ? 92
          : 12,

        status: isSuspicious
          ? 'High Risk Phishing Domain Detected'
          : 'Clean / Low Risk Domain Pattern',

        recommendation: isSuspicious
          ? 'Do NOT enter passwords or connect Web3 wallets. Report the suspicious activity through your ForensIQ account.'
          : 'No immediate threats detected from the current local analysis. Continue using standard security precautions.',
      });

      setChecking(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Top Emergency Banner */}
      <div className="bg-slate-900/60 border-b border-red-500/20 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">

          <div className="flex items-center gap-2 text-red-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

            <strong className="text-red-400 uppercase font-mono">
              Cybercrime Incident Response
            </strong>

            <span>
              Secure digital incident reporting platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => goToLogin('victim')}
              className="text-[11px] underline text-slate-300 hover:text-white font-semibold cursor-pointer"
            >
              Report Incident Now →
            </button>
          </div>

        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-cyber-grid border-b border-slate-800/50">

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a0d14] border border-cyan-500/30 text-xs font-mono text-cyan-400 shadow-xl">

            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />

            <span>
              AI-Powered Cybercrime Investigation & Digital Forensics
            </span>

          </div>

          <h1 className="text-4xl sm:text-6xl font-serif italic text-white max-w-4xl mx-auto leading-tight">
            AI-Powered Digital Evidence Vault &{' '}
            <span className="text-cyan-400">
              Cybercrime Investigation
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            ForensIQ connects citizens, cybercrime investigators,
            and administrators through a secure case-management
            platform for incident reporting, digital evidence
            management, investigation workflows, and forensic analysis.
          </p>

          {/* Authentication Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">

            <button
              onClick={() => goToLogin('victim')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/80 border border-cyan-400/40 glow-cyan flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <UserCheck className="w-4 h-4" />

              <span>
                Citizen Login
              </span>

              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => goToLogin('officer')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm border border-slate-700 shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />

              <span>
                Officer Login
              </span>
            </button>

            <button
              onClick={() => goToLogin('admin')}
              className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white text-sm font-semibold border border-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-purple-400" />

              <span>
                Administrator Login
              </span>
            </button>

          </div>

          {/* Register */}
          <div className="pt-2">

            <button
              onClick={() => navigate('/register')}
              className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
            >
              Don't have an account? Create one →
            </button>

          </div>

          {/* Stats */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-2xl font-bold font-mono text-cyan-400">
                SHA-256
              </span>

              <span className="text-xs text-slate-400 block font-medium">
                Evidence Integrity
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                RBAC
              </span>

              <span className="text-xs text-slate-400 block font-medium">
                Role-Based Access
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-2xl font-bold font-mono text-amber-400">
                AI
              </span>

              <span className="text-xs text-slate-400 block font-medium">
                Evidence Analysis
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-2xl font-bold font-mono text-purple-400">
                24/7
              </span>

              <span className="text-xs text-slate-400 block font-medium">
                Case Access
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* Public Scanner */}
      <section className="py-12 bg-slate-900/60 border-b border-slate-800/80">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

          <div className="text-center space-y-2">

            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Public Security Utility
            </span>

            <h2 className="text-2xl font-bold text-white">
              Phishing & Scam URL Scanner
            </h2>

            <p className="text-xs text-slate-400">
              Enter a suspicious URL or message to perform a preliminary
              security check.
            </p>

          </div>

          <form
            onSubmit={handleQuickCheck}
            className="flex flex-col sm:flex-row gap-2"
          >

            <input
              type="text"
              placeholder="Enter suspicious URL or domain..."
              value={quickCheckUrl}
              onChange={e =>
                setQuickCheckUrl(e.target.value)
              }
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />

            <button
              type="submit"
              disabled={
                checking ||
                !quickCheckUrl.trim()
              }
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >

              {checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Scan Link</span>
                </>
              )}

            </button>

          </form>

          {quickCheckResult && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-300">

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">

                <span className="text-xs font-mono text-slate-400">
                  Target:{' '}
                  <code className="text-cyan-300">
                    {quickCheckResult.url}
                  </code>
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    quickCheckResult.riskScore > 50
                      ? 'bg-red-950 text-red-400 border border-red-500/40'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  Risk Score: {quickCheckResult.riskScore}/100
                </span>

              </div>

              <h4 className="text-sm font-bold text-slate-100">
                {quickCheckResult.status}
              </h4>

              <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {quickCheckResult.recommendation}
              </p>

            </div>
          )}

        </div>
      </section>

      {/* Role Matrix */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="text-center space-y-2">

          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Platform Architecture
          </span>

          <h2 className="text-3xl font-extrabold text-white">
            Built for Every Cybersecurity Stakeholder
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Citizen */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-500/60 transition-all space-y-4 shadow-xl relative overflow-hidden group">

            <div className="p-3 w-12 h-12 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-mono text-indigo-400 uppercase font-bold">
                Citizen
              </span>

              <h3 className="text-xl font-bold text-white mt-1">
                Incident Reporting & Case Tracking
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              File cybercrime incidents, upload digital evidence,
              monitor investigation progress, and communicate through
              the case workflow.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Incident Filing</span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Digital Evidence Upload</span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Case Status Tracking</span>
              </li>

            </ul>

            <button
              onClick={() => goToLogin('victim')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Citizen Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

          {/* Officer */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-4 shadow-xl relative overflow-hidden group">

            <div className="p-3 w-12 h-12 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                Cybercrime Officer
              </span>

              <h3 className="text-xl font-bold text-white mt-1">
                Investigation & Forensic Analysis
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Investigate assigned cases, examine digital evidence,
              update case status, and perform forensic analysis.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Case Investigation</span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Evidence Analysis</span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Chain of Custody</span>
              </li>

            </ul>

            <button
              onClick={() => goToLogin('officer')}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4 glow-cyan"
            >
              <span>Officer Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

          {/* Admin */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 transition-all space-y-4 shadow-xl relative overflow-hidden group">

            <div className="p-3 w-12 h-12 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-500/40 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-mono text-purple-400 uppercase font-bold">
                Administrator
              </span>

              <h3 className="text-xl font-bold text-white mt-1">
                Platform Management
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Manage platform users, investigate system activity,
              control access, and monitor security operations.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>User Management</span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Role-Based Access Control</span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Security Audit Logs</span>
              </li>

            </ul>

            <button
              onClick={() => goToLogin('admin')}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Administrator Login</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </section>

      {/* Threat Feed */}
      <section className="py-12 bg-slate-950 border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Globe className="w-5 h-5 text-cyan-400 animate-spin-slow" />

              <h3 className="text-lg font-bold text-white">
                Cyber Threat Intelligence Feed
              </h3>

            </div>

            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />

              SYSTEM ACTIVE

            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {threatFeed.map(item => (

              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
              >

                <div className="flex items-center justify-between text-xs">

                  <span className="font-mono text-red-400 font-bold uppercase">
                    {item.threatLevel}
                  </span>

                  <span className="text-slate-500 text-[11px] font-mono">
                    {item.timestamp}
                  </span>

                </div>

                <h4 className="text-xs font-bold text-slate-100">
                  {item.title}
                </h4>

                <div className="text-[11px] text-slate-400 space-y-1">

                  <p>
                    IP:{' '}
                    <code className="text-amber-400">
                      {item.sourceIp}
                    </code>
                  </p>

                  <p>
                    Target: {item.targetSector}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">

            <Shield className="w-4 h-4 text-cyan-400" />

            <span className="font-mono font-bold text-slate-300">
              ForensIQ
            </span>

            <span>
              — Cybercrime Investigation Platform
            </span>

          </div>

          <div className="flex items-center gap-4 text-slate-400 font-medium">

            <button
              onClick={() => goToLogin()}
              className="hover:text-cyan-400"
            >
              Portal Login
            </button>

            <button
              onClick={() => navigate('/roles')}
              className="hover:text-cyan-400"
            >
              Role Matrix
            </button>

            <span>
              Secure Role-Based Access
            </span>

          </div>

        </div>
      </footer>

    </div>
  );
};