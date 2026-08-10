import React, { useState } from 'react';
import { CaseItem } from '../types';
import { UrgencyBadge, StatusBadge } from './StatusBadges';
import { Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, FileCode, ExternalLink } from 'lucide-react';

interface CaseTableProps {
  cases: CaseItem[];
  onSelectCase: (caseItem: CaseItem) => void;
  title?: string;
  subtitle?: string;
}

export const CaseTable: React.FC<CaseTableProps> = ({
  cases,
  onSelectCase,
  title = "Investigation Case Registry",
  subtitle = "Real-time cybercrime incidents and chain-of-custody status"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = cases.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.victimName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.assignedOfficer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUrgency = urgencyFilter === 'ALL' || c.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesUrgency && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedCases = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCSV = () => {
    const headers = ['Case ID', 'Title', 'Category', 'Urgency', 'Status', 'Victim', 'Loss Amount', 'Officer', 'Reported Date'];
    const rows = filtered.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.urgency,
      c.status,
      `"${c.victimName.replace(/"/g, '""')}"`,
      c.lossAmount ? `$${c.lossAmount}` : 'N/A',
      c.assignedOfficer,
      c.reportedDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ForensIQ_Cases_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0a0d14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Table Bar Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif italic text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Case ID, title, victim..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={urgencyFilter}
              onChange={e => { setUrgencyFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Urgency</option>
              <option value="Critical" className="bg-slate-900">Critical</option>
              <option value="High" className="bg-slate-900">High</option>
              <option value="Medium" className="bg-slate-900">Medium</option>
              <option value="Low" className="bg-slate-900">Low</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors shadow-[0_4px_12px_rgba(8,145,178,0.2)] cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0a0d14] text-slate-500 border-b border-slate-800 uppercase tracking-widest text-[10px] font-bold">
              <th className="py-4 px-6">ID Ref</th>
              <th className="py-4 px-6">Incident Title</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6">Urgency</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Victim</th>
              <th className="py-4 px-6">Assigned</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedCases.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <p className="text-sm">No cybercrime cases match your filters.</p>
                  <p className="text-xs text-slate-500 mt-1">Try resetting search query or urgency level.</p>
                </td>
              </tr>
            ) : (
              paginatedCases.map(c => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                >
                  <td className="py-4 px-6 font-mono text-[11px] font-bold text-cyan-500">
                    {c.id}
                  </td>
                  <td className="py-4 px-6 font-medium text-white max-w-[220px] truncate">
                    {c.title}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {c.category}
                  </td>
                  <td className="py-4 px-6">
                    <UrgencyBadge level={c.urgency} showIcon={false} />
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-4 px-6 text-slate-300 truncate max-w-[120px]">
                    {c.victimName}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {c.assignedOfficer}
                  </td>
                  <td className="py-4 px-6 text-right text-slate-500 group-hover:text-white">
                    <span className="inline-flex items-center gap-1 text-cyan-400 font-medium group-hover:text-cyan-300">
                      View <ExternalLink className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0a0d14] flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} cases
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-mono text-slate-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
