import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseTimelineEvent, TimelineEvidence } from '../../types';
import { 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Paperclip, 
  MessageSquare, 
  FileText, 
  Phone, 
  Globe, 
  CreditCard, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  ChevronDown, 
  Layers, 
  ShieldAlert, 
  Lock, 
  RefreshCw,
  Send,
  FileCode
} from 'lucide-react';

// Default example timeline sequence specified by user requirements
const DEFAULT_TIMELINE_EVENTS: CaseTimelineEvent[] = [
  {
    id: 'tl-ex-1',
    timestamp: '2026-08-05 10:32:00',
    time: '10:32 AM',
    title: 'Victim received suspicious SMS',
    description: 'SMS received from sender ID +91 98765 43210 claiming: "Dear Customer, your Bank Account is locked due to KYC expiry. Click https://secure-login-verify-bank.com/phish to update immediately."',
    type: 'sms',
    actor: 'Threat Actor (+91 98765 43210)',
    notes: [
      '[10:40 AM - ForensIQ System]: Sender ID flagged in national cyber fraud registry across 4 previous incidents.'
    ],
    evidenceAttachments: [
      {
        id: 'att-101',
        name: 'sms_screenshot_sender_98765.png',
        type: 'Image (PNG)',
        size: '1.2 MB',
        sha256Hash: 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
        uploadedAt: '10:35 AM'
      }
    ]
  },
  {
    id: 'tl-ex-2',
    timestamp: '2026-08-05 11:05:00',
    time: '11:05 AM',
    title: 'Victim clicked phishing URL',
    description: 'Victim opened URL https://secure-login-verify-bank.com/phish from Mobile Chrome Browser (Android 14). Domain redirected to fake banking portal hosted on IP 185.220.101.5.',
    type: 'phishing',
    actor: 'Victim (Browser Client)',
    notes: [
      '[11:10 AM - Inspector Vance]: Domain registered 24 hours prior via Namecheap proxy. Takedown request queued.'
    ],
    evidenceAttachments: [
      {
        id: 'att-102',
        name: 'phishing_url_header_dump.txt',
        type: 'Text/HTTP Header',
        size: '480 KB',
        sha256Hash: 'f1e2d3c4b5a69876543210fedcba9876543210abcdef1234567890abcdef1234',
        uploadedAt: '11:08 AM'
      }
    ]
  },
  {
    id: 'tl-ex-3',
    timestamp: '2026-08-05 11:12:00',
    time: '11:12 AM',
    title: 'UPI transaction initiated',
    description: 'Fake banking portal prompted victim for instant VPA authorization. Fraudulent payment request generated for beneficiary VPA paym-fraudster@okaxis.',
    type: 'transaction',
    actor: 'UPI Gateway / Fraudulent VPA',
    notes: [
      '[11:14 AM - Cyber Cell Bot]: VPA paym-fraudster@okaxis linked to Axis Bank Branch #402.'
    ]
  },
  {
    id: 'tl-ex-4',
    timestamp: '2026-08-05 11:15:00',
    time: '11:15 AM',
    title: '₹25,000 transferred',
    description: 'Instant IMPS transaction executed. ₹25,000 deducted from victim account (Ref: IMPS/6029104829/RET) and routed to suspect mule account A/C ACC-9048-2819-5501.',
    type: 'transaction',
    actor: 'Axis Bank IMPS System',
    notes: [
      '[11:20 AM - Financial Intelligence Unit]: Account freeze request dispatched under Section 91 CrPC.'
    ],
    evidenceAttachments: [
      {
        id: 'att-103',
        name: 'bank_transfer_receipt_25000.pdf',
        type: 'PDF Document',
        size: '2.1 MB',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadedAt: '11:18 AM'
      }
    ]
  },
  {
    id: 'tl-ex-5',
    timestamp: '2026-08-05 11:30:00',
    time: '11:30 AM',
    title: 'Complaint filed',
    description: 'Victim lodged formal cyber fraud report on ForensIQ National Portal (Incident Ref: CASE-2026-0891). Loss logged as ₹25,000 ($300 USD equivalent).',
    type: 'complaint',
    actor: 'Victim (Alex Rivera)',
    notes: [
      '[11:32 AM - Portal Triage]: Case marked CRITICAL priority due to active mule account activity.'
    ]
  },
  {
    id: 'tl-ex-6',
    timestamp: '2026-08-05 12:10:00',
    time: '12:10 PM',
    title: 'Evidence uploaded',
    description: 'Victim uploaded 3 digital artifacts: SMS screenshot, bank debit notification PDF, and phishing link URL copy. SHA-256 signatures generated and sealed.',
    type: 'evidence_added',
    actor: 'Victim Evidence Locker',
    evidenceAttachments: [
      {
        id: 'att-104',
        name: 'forensic_evidence_package_zip.zip',
        type: 'ZIP Archive',
        size: '5.8 MB',
        sha256Hash: '8f9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
        uploadedAt: '12:10 PM'
      }
    ]
  },
  {
    id: 'tl-ex-7',
    timestamp: '2026-08-05 14:00:00',
    time: '2:00 PM',
    title: 'Officer assigned',
    description: 'Case formally assigned to Senior Inspector Sarah Vance (Cyber Command & Crypto Recovery Unit). Formal investigation and bank subpoena initiated.',
    type: 'officer_assigned',
    actor: 'Director Marcus Vance',
    notes: [
      '[2:05 PM - Inspector Vance]: Initiated emergency contact with Axis Bank Fraud Cell to trace downstream wallet splits.'
    ]
  }
];

export const OfficerTimeline: React.FC = () => {
  const { 
    cases, 
    currentUser, 
    addTimelineEventToCase, 
    updateTimelineEventInCase, 
    deleteTimelineEventFromCase,
    addNoteToTimelineEvent,
    attachEvidenceToTimelineEvent
  } = useApp();

  // Selected Case State
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'CASE-2026-0891');
  const [filterType, setFilterType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Chronological by default

  // Modals & Drawers State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CaseTimelineEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Active Note Drawer State
  const [activeNoteEventId, setActiveNoteEventId] = useState<string | null>(null);
  const [newNoteInput, setNewNoteInput] = useState<string>('');

  // Active Attach Evidence Drawer State
  const [activeAttachEventId, setActiveAttachEventId] = useState<string | null>(null);
  const [evidenceNameInput, setEvidenceNameInput] = useState<string>('');
  const [evidenceTypeInput, setEvidenceTypeInput] = useState<string>('Screenshot / Document');
  const [evidenceSizeInput, setEvidenceSizeInput] = useState<string>('1.5 MB');

  // Print Report Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State for Add / Edit
  const [formTime, setFormTime] = useState<string>('10:30 AM');
  const [formTimestamp, setFormTimestamp] = useState<string>('2026-08-05 10:30:00');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formType, setFormType] = useState<string>('sms');
  const [formActor, setFormActor] = useState<string>('Victim');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formEvidenceName, setFormEvidenceName] = useState<string>('');

  // Local fallback storage for interactive demo when viewing custom timelines
  const [localTimeline, setLocalTimeline] = useState<CaseTimelineEvent[]>(DEFAULT_TIMELINE_EVENTS);

  // Get current case or construct active event list
  const activeCase = cases.find(c => c.id === selectedCaseId);

  // Combine events: if activeCase has timeline events, merge with example timeline or use local state
  const rawEvents = (activeCase && activeCase.timeline && activeCase.timeline.length > 0)
    ? [...DEFAULT_TIMELINE_EVENTS, ...activeCase.timeline.filter(t => !DEFAULT_TIMELINE_EVENTS.some(d => d.id === t.id))]
    : localTimeline;

  // Filter & Search Logic
  const filteredEvents = rawEvents.filter(evt => {
    const matchesFilter = filterType === 'All' || evt.type === filterType;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchLower) ||
      evt.description.toLowerCase().includes(searchLower) ||
      (evt.time && evt.time.toLowerCase().includes(searchLower)) ||
      (evt.actor && evt.actor.toLowerCase().includes(searchLower)) ||
      (evt.notes && evt.notes.some(n => n.toLowerCase().includes(searchLower))) ||
      (evt.evidenceAttachments && evt.evidenceAttachments.some(e => e.name.toLowerCase().includes(searchLower)));

    return matchesFilter && matchesSearch;
  });

  // Sort logic
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const timeA = a.time || a.timestamp;
    const timeB = b.time || b.timestamp;
    if (sortOrder === 'asc') {
      return timeA.localeCompare(timeB);
    } else {
      return timeB.localeCompare(timeA);
    }
  });

  // Reset Add Form
  const openAddModal = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setFormTime(nowTime);
    setFormTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19));
    setFormTitle('');
    setFormDescription('');
    setFormType('sms');
    setFormActor('Victim');
    setFormNotes('');
    setFormEvidenceName('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (evt: CaseTimelineEvent) => {
    setEditingEvent(evt);
    setFormTime(evt.time || '10:30 AM');
    setFormTimestamp(evt.timestamp);
    setFormTitle(evt.title);
    setFormDescription(evt.description);
    setFormType(evt.type);
    setFormActor(evt.actor || 'Officer');
    setFormNotes(evt.notes ? evt.notes.join('\n') : '');
    setFormEvidenceName(evt.evidenceAttachments && evt.evidenceAttachments[0] ? evt.evidenceAttachments[0].name : '');
  };

  // Submit Add Event
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newEvent: CaseTimelineEvent = {
      id: `tl-user-${Date.now()}`,
      timestamp: formTimestamp,
      time: formTime,
      title: formTitle,
      description: formDescription,
      type: formType,
      actor: formActor || currentUser.name,
      notes: formNotes.trim() ? [`[${formTime} - ${currentUser.name}]: ${formNotes.trim()}`] : [],
      evidenceAttachments: formEvidenceName.trim() ? [{
        id: `att-${Date.now()}`,
        name: formEvidenceName.trim(),
        type: 'Artifact Attachment',
        size: '1.4 MB',
        sha256Hash: Array.from({ length: 64 }, (_, i) => Math.floor((i * 13 + formEvidenceName.length) % 16).toString(16)).join(''),
        uploadedAt: formTime
      }] : []
    };

    // Update Context if case exists
    if (activeCase) {
      addTimelineEventToCase(activeCase.id, newEvent);
    }

    // Update local state
    setLocalTimeline(prev => [newEvent, ...prev]);
    setIsAddModalOpen(false);
  };

  // Submit Edit Event
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !formTitle.trim()) return;

    const updatedFields: Partial<CaseTimelineEvent> = {
      time: formTime,
      title: formTitle,
      description: formDescription,
      type: formType,
      actor: formActor,
    };

    if (activeCase) {
      updateTimelineEventInCase(activeCase.id, editingEvent.id, updatedFields);
    }

    setLocalTimeline(prev => prev.map(t => t.id === editingEvent.id ? { ...t, ...updatedFields } : t));
    setEditingEvent(null);
  };

  // Delete Event
  const handleDeleteConfirm = () => {
    if (!deletingEventId) return;

    if (activeCase) {
      deleteTimelineEventFromCase(activeCase.id, deletingEventId);
    }

    setLocalTimeline(prev => prev.filter(t => t.id !== deletingEventId));
    setDeletingEventId(null);
  };

  // Submit Note
  const handleAddNoteSubmit = (eventId: string) => {
    if (!newNoteInput.trim()) return;

    if (activeCase) {
      addNoteToTimelineEvent(activeCase.id, eventId, newNoteInput);
    }

    const timestampedNote = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${currentUser.name}]: ${newNoteInput.trim()}`;
    
    setLocalTimeline(prev => prev.map(t => {
      if (t.id === eventId) {
        return {
          ...t,
          notes: [...(t.notes || []), timestampedNote]
        };
      }
      return t;
    }));

    setNewNoteInput('');
    setActiveNoteEventId(null);
  };

  // Submit Evidence Attachment
  const handleAttachEvidenceSubmit = (eventId: string) => {
    if (!evidenceNameInput.trim()) return;

    const newAtt: TimelineEvidence = {
      id: `att-${Date.now()}`,
      name: evidenceNameInput.trim(),
      type: evidenceTypeInput,
      size: evidenceSizeInput,
      sha256Hash: Array.from({ length: 64 }, (_, i) => Math.floor((i * 19 + evidenceNameInput.length) % 16).toString(16)).join(''),
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (activeCase) {
      attachEvidenceToTimelineEvent(activeCase.id, eventId, newAtt);
    }

    setLocalTimeline(prev => prev.map(t => {
      if (t.id === eventId) {
        return {
          ...t,
          evidenceAttachments: [...(t.evidenceAttachments || []), newAtt]
        };
      }
      return t;
    }));

    setEvidenceNameInput('');
    setActiveAttachEventId(null);
  };

  // Helper function to return icon & style per event type
  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'sms':
        return {
          icon: <Phone className="w-4 h-4 text-cyan-400" />,
          label: 'Suspicious SMS',
          nodeBg: 'bg-cyan-500',
          badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
        };
      case 'phishing':
        return {
          icon: <Globe className="w-4 h-4 text-rose-400" />,
          label: 'Phishing URL Click',
          nodeBg: 'bg-rose-500',
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        };
      case 'transaction':
        return {
          icon: <CreditCard className="w-4 h-4 text-amber-400" />,
          label: 'UPI / Bank Transfer',
          nodeBg: 'bg-amber-500',
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'complaint':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-purple-400" />,
          label: 'Complaint Filed',
          nodeBg: 'bg-purple-500',
          badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
        };
      case 'evidence_added':
        return {
          icon: <Paperclip className="w-4 h-4 text-emerald-400" />,
          label: 'Evidence Uploaded',
          nodeBg: 'bg-emerald-500',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'officer_assigned':
        return {
          icon: <UserCheck className="w-4 h-4 text-blue-400" />,
          label: 'Officer Assigned',
          nodeBg: 'bg-blue-500',
          badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
        };
      case 'note':
        return {
          icon: <MessageSquare className="w-4 h-4 text-teal-400" />,
          label: 'Officer Note',
          nodeBg: 'bg-teal-500',
          badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-indigo-400" />,
          label: 'System Update',
          nodeBg: 'bg-indigo-500',
          badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0b1324] to-slate-950 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>ForensIQ Chronological Investigation Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Interactive Investigation Timeline
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl font-sans">
            Reconstruct the exact sequence of digital crime events, victim actions, financial transfers, and officer interventions with court-admissible audit timestamps.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* CONTROLS BAR: Case Selector, Filters, Search & Sort */}
      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
        
        {/* Case Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase shrink-0">Case File:</span>
          <select
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Category */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 font-bold text-[11px] uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Type:
          </span>
          {[
            { id: 'All', label: 'All Events' },
            { id: 'sms', label: '💬 SMS' },
            { id: 'phishing', label: '🔗 Phishing' },
            { id: 'transaction', label: '💳 UPI / Bank' },
            { id: 'complaint', label: '📝 Complaint' },
            { id: 'evidence_added', label: '📁 Evidence' },
            { id: 'officer_assigned', label: '👮 Officer' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterType(cat.id)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                filterType === cat.id
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Order */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search event, actor, note..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Toggle Chronological Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}</span>
          </button>
        </div>

      </div>

      {/* METRICS HEADER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-500 uppercase text-[10px] font-bold block">Total Timeline Events</span>
          <span className="text-xl font-bold text-white">{sortedEvents.length} Events</span>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-500 uppercase text-[10px] font-bold block">First Incident Marker</span>
          <span className="text-sm font-bold text-cyan-400">{sortedEvents[0]?.time || '10:32 AM'}</span>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-500 uppercase text-[10px] font-bold block">Attached Evidence</span>
          <span className="text-sm font-bold text-emerald-400">
            {sortedEvents.reduce((acc, e) => acc + (e.evidenceAttachments?.length || 0), 0)} Artifacts
          </span>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-500 uppercase text-[10px] font-bold block">Officer Audit Notes</span>
          <span className="text-sm font-bold text-purple-400">
            {sortedEvents.reduce((acc, e) => acc + (e.notes?.length || 0), 0)} Notes Logged
          </span>
        </div>
      </div>

      {/* PROFESSIONAL VERTICAL TIMELINE CONTAINER */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Sequential Event Log ({sortedEvents.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Case Ref: <strong className="text-cyan-300">{selectedCaseId}</strong>
          </span>
        </div>

        {/* Vertical Spine Line */}
        <div className="relative border-l-2 border-slate-800/80 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-8">
          
          {sortedEvents.map((evt, idx) => {
            const config = getEventTypeConfig(evt.type);

            return (
              <div key={evt.id} className="relative group animate-fadeIn">
                
                {/* Glowing Illuminated Node on Spine */}
                <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full ${config.nodeBg} border-4 border-slate-950 shadow-lg group-hover:scale-125 transition-all z-10 flex items-center justify-center`} />

                {/* Event Card */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all shadow-xl">
                  
                  {/* Top Bar: Time Badge, Event Type Badge, and Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-3">
                      {/* PROMINENT TIME BADGE */}
                      <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-sm font-mono font-bold flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{evt.time || '10:00 AM'}</span>
                      </span>

                      {/* Event Category Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${config.badgeBg}`}>
                        {config.icon}
                        <span>{config.label}</span>
                      </span>
                    </div>

                    {/* Officer Action Bar: Edit, Delete, Add Note, Attach Evidence */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(evt)}
                        className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                        title="Edit Event"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-mono">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveNoteEventId(evt.id)}
                        className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-teal-300 border border-slate-800 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                        title="Add Officer Note"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-mono">+ Note</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAttachEventId(evt.id)}
                        className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                        title="Attach Digital Evidence"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-mono">+ Evidence</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingEventId(evt.id)}
                        className="p-1.5 bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white font-sans tracking-tight">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {evt.description}
                    </p>
                  </div>

                  {/* OFFICER NOTES SECTION */}
                  {evt.notes && evt.notes.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-mono uppercase text-teal-400 font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Officer Notes ({evt.notes.length}):
                      </span>
                      <div className="space-y-1.5">
                        {evt.notes.map((note, nIdx) => (
                          <div key={nIdx} className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-500/20 text-xs font-mono text-teal-200">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EVIDENCE ATTACHMENTS SECTION */}
                  {evt.evidenceAttachments && evt.evidenceAttachments.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        Attached Evidence ({evt.evidenceAttachments.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {evt.evidenceAttachments.map((att) => (
                          <div key={att.id} className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono space-y-1">
                            <div className="flex items-center justify-between text-emerald-300 font-bold">
                              <span className="truncate max-w-[200px]" title={att.name}>📄 {att.name}</span>
                              <span className="text-[10px] text-slate-400">{att.size || '1 MB'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate" title={att.sha256Hash}>
                              SHA-256: {att.sha256Hash?.slice(0, 20)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Event Card Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      Actor / Source: <strong className="text-slate-200">{evt.actor || 'System'}</strong>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Recorded: {evt.timestamp}
                    </div>
                  </div>

                  {/* INLINE QUICK ADD NOTE INPUT */}
                  {activeNoteEventId === evt.id && (
                    <div className="p-3 bg-slate-950 border border-teal-500/40 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-mono text-teal-300 font-bold">
                        <span>Append Officer Note to Event</span>
                        <button type="button" onClick={() => setActiveNoteEventId(null)} className="text-slate-500 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Verified transaction hash with bank risk unit..."
                          value={newNoteInput}
                          onChange={e => setNewNoteInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddNoteSubmit(evt.id)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer font-mono"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {/* INLINE QUICK ATTACH EVIDENCE INPUT */}
                  {activeAttachEventId === evt.id && (
                    <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
                        <span>Attach Digital Evidence File to Event</span>
                        <button type="button" onClick={() => setActiveAttachEventId(null)} className="text-slate-500 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                        <input
                          type="text"
                          placeholder="File Name (e.g. chat_log.pdf)"
                          value={evidenceNameInput}
                          onChange={e => setEvidenceNameInput(e.target.value)}
                          className="sm:col-span-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAttachEvidenceSubmit(evt.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Attach File
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })}

          {sortedEvents.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
              No timeline events match your active search or filter selection.
            </div>
          )}

        </div>
      </div>

      {/* ADD / EDIT EVENT MODAL */}
      {(isAddModalOpen || editingEvent) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{editingEvent ? 'Edit Timeline Event' : 'Add New Timeline Event'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => { setIsAddModalOpen(false); setEditingEvent(null); }}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingEvent ? handleEditSubmit : handleAddSubmit} className="space-y-4 text-xs font-mono">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block uppercase">Event Time (e.g. 10:32 AM):</label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    placeholder="10:32 AM"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block uppercase">Category / Event Type:</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="sms">💬 Suspicious SMS / Messaging</option>
                    <option value="phishing">🔗 Phishing Link / URL Click</option>
                    <option value="transaction">💳 UPI / Bank Transfer</option>
                    <option value="complaint">📝 Complaint Filed</option>
                    <option value="evidence_added">📁 Evidence Uploaded</option>
                    <option value="officer_assigned">👮 Officer Action / Assignment</option>
                    <option value="note">📓 Investigation Note</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block uppercase">Event Summary / Title:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Victim received suspicious SMS"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-sans font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block uppercase">Detailed Description:</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Provide full details of what occurred..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block uppercase">Actor / Source:</label>
                  <input
                    type="text"
                    value={formActor}
                    onChange={e => setFormActor(e.target.value)}
                    placeholder="Victim / Threat Actor / Bank"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {!editingEvent && (
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block uppercase">Attach Evidence File (Optional):</label>
                    <input
                      type="text"
                      value={formEvidenceName}
                      onChange={e => setFormEvidenceName(e.target.value)}
                      placeholder="e.g. sms_screenshot.png"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {!editingEvent && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block uppercase">Initial Officer Note (Optional):</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="Add an officer note..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingEvent(null); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg transition-all cursor-pointer"
                >
                  {editingEvent ? 'Save Event Changes' : 'Create Event'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingEventId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-xs font-mono">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Timeline Event?</h3>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">
              Are you sure you want to permanently remove this event from the investigation timeline? This action will be logged in the bureau audit trail.
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingEventId(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT REPORT PREVIEW MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-3xl w-full p-8 space-y-6 shadow-2xl font-mono text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Printer className="w-5 h-5" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Official Court-Admissible Timeline Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between text-[11px] text-slate-400">
                <div>Case Identifier: <strong className="text-cyan-300">{selectedCaseId}</strong></div>
                <div>Generated: <strong>2026-08-05 14:00:00 UTC</strong></div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase">Chronological Event Summary</h4>
                <div className="space-y-2">
                  {sortedEvents.map((evt, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-cyan-400 font-bold block">{evt.time || '10:00 AM'} — {evt.title}</span>
                        <p className="text-[11px] text-slate-300 font-sans">{evt.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{evt.actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500 text-[10px]">Signed by: Inspector Sarah Vance (Badge: CC-OFFICER-8902)</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { window.print(); }}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
