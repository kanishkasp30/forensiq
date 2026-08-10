import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseItem, CaseStatus } from '../../types';
import { StatCard } from '../Cards';
import { StatusBadge, UrgencyBadge } from '../StatusBadges';
import { Modal } from '../Modal';
import { ChainOfCustodyTimeline } from '../Timeline';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  Sparkles, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Bell, 
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  FolderLock,
  Download,
  ArrowRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';

interface OfficerOverviewProps {
  onSelectCase: (c: CaseItem) => void;
}

export const OfficerOverview: React.FC<OfficerOverviewProps> = ({ onSelectCase }) => {
  const { cases, currentUser, notifications } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Calculating Officer Dashboard Metrics
  const totalCases = cases.length;
  const newCases = cases.filter(c => c.status === 'Submitted').length;
  const activeInvestigations = cases.filter(c => c.status === 'Under Review' || c.status === 'Evidence Verified').length;
  const highRiskCases = cases.filter(c => c.urgency === 'Critical' || c.urgency === 'High').length;
  const resolvedCases = cases.filter(c => c.status === 'Solved' || c.status === 'Closed').length;

  // Chart Data Preparation: Case Priority Distribution
  const criticalCount = cases.filter(c => c.urgency === 'Critical').length;
  const highCount = cases.filter(c => c.urgency === 'High').length;
  const mediumCount = cases.filter(c => c.urgency === 'Medium').length;
  const lowCount = cases.filter(c => c.urgency === 'Low').length;

  const priorityData = [
    { name: 'Critical', value: criticalCount, color: '#ef4444' },
    { name: 'High', value: highCount, color: '#f97316' },
    { name: 'Medium', value: mediumCount, color: '#f59e0b' },
    { name: 'Low', value: lowCount, color: '#06b6d4' },
  ];

  // Category Breakdown Data
  const categories = Array.from(new Set(cases.map(c => c.category)));
  const categoryData = categories.map(cat => {
    const catStr = String(cat || '');
    return {
      category: catStr.length > 15 ? catStr.substring(0, 14) + '...' : catStr,
      count: cases.filter(c => c.category === cat).length
    };
  });

  // Filtering Recent Cases Table
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedOfficer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Recent Officer Alerts
  const recentAlerts = [
    { id: '1', title: 'Critical Subpoena Deadline', time: '10m ago', urgency: 'high', message: 'Binance USDT Freeze request on wallet 0x71C... expires in 2 hours.' },
    { id: '2', title: 'SHA-256 Vault Verification', time: '45m ago', urgency: 'info', message: '12 evidence items uploaded by Victim V-9108 verified successfully.' },
    { id: '3', title: 'High-Risk Incident Ingested', time: '2h ago', urgency: 'high', message: 'New Ransomware attack reported with $120,000 demand.' },
    { id: '4', title: 'AI Cluster Matched', time: '4h ago', urgency: 'medium', message: 'Suspect "ApexPhish" linked to 3 separate phishing complaints.' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Officer Welcome Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1322] to-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl shadow-black/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ForensIQ Cybercrime Bureau • Officer Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Officer Dashboard — Inspector {currentUser.name}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Badge ID: <span className="text-cyan-300 font-bold">{currentUser.badgeId || 'OFF-8842'}</span> • Department: <span className="text-slate-200">{currentUser.department || 'Federal Cyber Fraud & Ransomware Taskforce'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold font-mono flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
            <span>{criticalCount} Critical Priority Triage</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{resolvedCases} Solved / Prosecuted</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid (5 Required Stat Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Cases"
          value={totalCases}
          subtitle="Registered in Bureau"
          icon={<FileText className="w-5 h-5 text-cyan-400" />}
          accentColor="cyan"
        />
        <StatCard
          title="New Cases"
          value={newCases}
          subtitle="Awaiting Initial Triage"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
        />
        <StatCard
          title="Active Investigations"
          value={activeInvestigations}
          subtitle="In Active Forensic Review"
          icon={<ShieldAlert className="w-5 h-5 text-indigo-400" />}
          accentColor="cyan"
        />
        <StatCard
          title="High Risk Cases"
          value={highRiskCases}
          subtitle="Critical Threat Level"
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          accentColor="red"
        />
        <StatCard
          title="Resolved Cases"
          value={resolvedCases}
          subtitle="Closed & Subpoenaed"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          accentColor="emerald"
        />
      </div>

      {/* Middle Section: Visualizations & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Case Priority Distribution Chart */}
        <div className="lg:col-span-5 bg-[#0a0d14] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Case Priority Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Urgency breakdown across active dockets</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">Recharts AI</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crime Type Breakdown Bar Chart */}
        <div className="lg:col-span-4 bg-[#0a0d14] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white">Incident Category Volume</h3>
            <p className="text-[11px] text-slate-400">Distribution by crime classification</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="lg:col-span-3 bg-[#0a0d14] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Recent Alerts
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">Live Feed</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[270px] pr-1">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                  alert.urgency === 'high' 
                    ? 'bg-red-950/30 border-red-500/30 text-red-200' 
                    : alert.urgency === 'medium' 
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' 
                    : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{alert.title}</span>
                  <span className="text-[10px] font-mono opacity-70">{alert.time}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-snug">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Cases Table Section */}
      <div className="bg-[#0a0d14] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Bureau Case Register & Officer Queue
            </h3>
            <p className="text-xs text-slate-400">
              Filter by keywords or crime category. Click "Investigate" to open the detailed case dossier.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search case, victim, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cases Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Case ID</th>
                <th className="p-3.5">Victim</th>
                <th className="p-3.5">Crime Type</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Officer</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCases.map(c => (
                <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-cyan-400">{c.id}</td>
                  <td className="p-3.5 text-slate-200 font-medium">{c.victimName}</td>
                  <td className="p-3.5 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                      {c.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">{c.incidentDate}</td>
                  <td className="p-3.5">
                    <UrgencyBadge level={c.urgency} />
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-3.5 text-slate-300 font-mono">{c.assignedOfficer}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectCase(c)}
                      className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    No cases match the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
