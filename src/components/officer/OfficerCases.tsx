import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseItem, CaseStatus, UrgencyLevel } from '../../types';
import { StatusBadge, UrgencyBadge } from '../StatusBadges';
import { Search, Filter, ShieldAlert, ArrowRight, UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OfficerCasesProps {
  onSelectCase: (c: CaseItem) => void;
}

export const OfficerCases: React.FC<OfficerCasesProps> = ({ onSelectCase }) => {
  const { cases, updateCaseStatus } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = Array.from(new Set(cases.map(c => c.category)));

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.victimName.toLowerCase().includes(search.toLowerCase()) ||
      c.assignedOfficer.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || c.urgency === urgencyFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesUrgency && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Bureau Docket Registry</span>
          </div>
          <h1 className="text-2xl font-serif italic text-white">All Officer Active Cases</h1>
          <p className="text-xs text-slate-400">
            Inspect, reassign, or update investigative statuses for all cybercrime complaints across departments.
          </p>
        </div>

        <div className="text-xs font-mono px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
          Total Registered: <strong className="text-cyan-400">{cases.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search case ID, title, victim..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Evidence Verified">Evidence Verified</option>
            <option value="Escalated">Escalated</option>
            <option value="In Court">In Court</option>
            <option value="Solved">Solved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Urgency Filter */}
        <div>
          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Crime Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Cases Grid / Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Case ID</th>
              <th className="p-3.5">Victim</th>
              <th className="p-3.5">Crime Type</th>
              <th className="p-3.5">Incident Date</th>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Lead Officer</th>
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
                  No cases found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
