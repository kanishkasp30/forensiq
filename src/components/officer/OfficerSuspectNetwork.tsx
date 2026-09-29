import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CaseItem } from '../../types';
import { 
  Users, 
  User, 
  Phone, 
  Mail, 
  QrCode, 
  CreditCard, 
  Globe, 
  Receipt, 
  FolderCheck, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  Network, 
  Plus, 
  X, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Lock, 
  Share2, 
  Zap, 
  Info,
  GitBranch,
  ShieldCheck
} from 'lucide-react';

export type NodeType = 
  | 'Suspect' 
  | 'Victim' 
  | 'Phone Number' 
  | 'Email' 
  | 'UPI ID' 
  | 'Bank Account' 
  | 'IP Address' 
  | 'Transaction' 
  | 'Case';

export interface NetworkNode {
  id: string;
  label: string;
  type: NodeType;
  subtext: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  associatedCases: string[];
  x: number;
  y: number;
  details: {
    status?: string;
    location?: string;
    registeredOwner?: string;
    bankBranch?: string;
    isp?: string;
    amount?: string;
    timestamp?: string;
    notes?: string;
  };
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  relationship: string;
  isSharedLink?: boolean; // Highlighted if connecting across multiple cases
}

// Generates network graph nodes/links from real case data
// (victim, suspectInfo) instead of hardcoded mock records.
const generateNetworkFromCases = (cases: CaseItem[]): { nodes: NetworkNode[]; links: NetworkLink[] } => {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];

  cases.forEach((c, idx) => {
    const angleStep = (2 * Math.PI) / Math.max(cases.length, 1);
    const baseX = 550 + 380 * Math.cos(idx * angleStep);
    const baseY = 380 + 260 * Math.sin(idx * angleStep);

    const caseNodeId = `node-case-${c.id}`;
    const urgencyToRisk: Record<string, NetworkNode['riskLevel']> = {
      Critical: 'Critical',
      High: 'High',
      Medium: 'Medium',
      Low: 'Low',
    };

    nodes.push({
      id: caseNodeId,
      label: c.id,
      type: 'Case',
      subtext: c.title,
      riskLevel: urgencyToRisk[c.urgency] || 'Medium',
      associatedCases: [c.id],
      x: baseX,
      y: baseY,
      details: {
        status: c.status,
        notes: c.description,
      },
    });

    let victimNodeId: string | null = null;
    if (c.victimName) {
      victimNodeId = `node-victim-${c.id}`;
      nodes.push({
        id: victimNodeId,
        label: `Victim (${c.victimName})`,
        type: 'Victim',
        subtext: c.lossAmount
          ? `Reported Loss: ₹${c.lossAmount.toLocaleString('en-IN')}`
          : 'No reported financial loss',
        riskLevel: 'Low',
        associatedCases: [c.id],
        x: baseX - 160,
        y: baseY - 110,
        details: {
          status: c.status,
          location: c.victimAddress,
          notes: c.victimContact,
        },
      });
      links.push({
        id: `link-${c.id}-victim-case`,
        source: victimNodeId,
        target: caseNodeId,
        relationship: 'Filed Complaint',
      });
    }

    const s = c.suspectInfo;
    const hasSuspectData =
      s && (s.name || s.alias || s.contact || s.ipAddress || s.cryptoWallet || s.paymentDetails);

    if (hasSuspectData && s) {
      const suspectNodeId = `node-suspect-${c.id}`;
      const threatToRisk: Record<string, NetworkNode['riskLevel']> = {
        'Known Syndicate': 'Critical',
        'Automated Botnet': 'High',
        'Lone Actor': 'Medium',
        'Under Investigation': 'Medium',
      };

      nodes.push({
        id: suspectNodeId,
        label: s.name ? `Suspect (${s.name})` : s.alias ? `Suspect (${s.alias})` : 'Unidentified Suspect',
        type: 'Suspect',
        subtext: s.alias ? `Alias: ${s.alias}` : (s.threatLevel || 'Under Investigation'),
        riskLevel: (s.threatLevel && threatToRisk[s.threatLevel]) || 'Medium',
        associatedCases: [c.id],
        x: baseX + 160,
        y: baseY - 110,
        details: {
          status: s.threatLevel,
          location: s.location,
          notes: s.additionalNotes,
        },
      });
      links.push({
        id: `link-${c.id}-suspect-case`,
        source: suspectNodeId,
        target: caseNodeId,
        relationship: 'Named In Complaint',
      });

      if (s.contact) {
        const isEmail = s.contact.includes('@');
        const contactNodeId = `node-contact-${c.id}`;
        nodes.push({
          id: contactNodeId,
          label: s.contact,
          type: isEmail ? 'Email' : 'Phone Number',
          subtext: isEmail ? 'Suspect Email Address' : 'Suspect Phone Number',
          riskLevel: 'Medium',
          associatedCases: [c.id],
          x: baseX + 300,
          y: baseY,
          details: {},
        });
        links.push({
          id: `link-${c.id}-suspect-contact`,
          source: suspectNodeId,
          target: contactNodeId,
          relationship: isEmail ? 'Uses Email' : 'Uses Phone Number',
        });
      }

      if (s.ipAddress) {
        const ipNodeId = `node-ip-${c.id}`;
        nodes.push({
          id: ipNodeId,
          label: s.ipAddress,
          type: 'IP Address',
          subtext: 'Traced IP Address',
          riskLevel: 'High',
          associatedCases: [c.id],
          x: baseX + 160,
          y: baseY + 110,
          details: {
            isp: s.associatedDomain,
          },
        });
        links.push({
          id: `link-${c.id}-suspect-ip`,
          source: suspectNodeId,
          target: ipNodeId,
          relationship: 'Connected From IP',
        });
      }

      const paymentValue = s.cryptoWallet || s.paymentDetails;
      if (paymentValue) {
        const payNodeId = `node-payment-${c.id}`;
        nodes.push({
          id: payNodeId,
          label: paymentValue,
          type: s.cryptoWallet ? 'UPI ID' : 'Bank Account',
          subtext: s.cryptoWallet ? 'Crypto Wallet / VPA' : 'Payment / Bank Details',
          riskLevel: 'High',
          associatedCases: [c.id],
          x: baseX - 160,
          y: baseY + 110,
          details: {
            amount: c.lossAmount ? `₹${c.lossAmount.toLocaleString('en-IN')}` : undefined,
          },
        });
        links.push({
          id: `link-${c.id}-suspect-payment`,
          source: suspectNodeId,
          target: payNodeId,
          relationship: 'Configured Payment Channel',
        });
        if (victimNodeId) {
          links.push({
            id: `link-${c.id}-victim-payment`,
            source: victimNodeId,
            target: payNodeId,
            relationship: 'Transferred Funds To',
          });
        }
      }
    }
  });

  return { nodes, links };
};


export const OfficerSuspectNetwork: React.FC = () => {
  const { cases } = useApp();

  // State - seeded from real case data (victim + suspectInfo), not mock records
  const [nodes, setNodes] = useState<NetworkNode[]>(() => generateNetworkFromCases(cases).nodes);
  const [links, setLinks] = useState<NetworkLink[]>(() => generateNetworkFromCases(cases).links);

  // Re-derive the graph whenever the underlying case data changes
  // (note: this resets manually dragged positions / custom nodes)
  useEffect(() => {
    const generated = generateNetworkFromCases(cases);
    setNodes(generated.nodes);
    setLinks(generated.links);
  }, [cases]);

  const [activeViewMode, setActiveViewMode] = useState<'canvas' | 'tree' | 'matrix'>('canvas');
  const [selectedNodeType, setSelectedNodeType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Zoom & Pan Canvas state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging individual node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Add Custom Node Modal State
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<NodeType>('Phone Number');
  const [newNodeSubtext, setNewNodeSubtext] = useState('');
  const [newNodeRisk, setNewNodeRisk] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newNodeConnectTo, setNewNodeConnectTo] = useState<string>(() => nodes[0]?.id || '');

  // Copy Feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Filtered Nodes based on type and search
  const filteredNodes = nodes.filter(n => {
    const matchesType = selectedNodeType === 'All' || n.type === selectedNodeType;
    const matchesSearch = 
      n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subtext.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.associatedCases.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredLinks = links.filter(l => 
    filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
  );

  // Currently Selected Node Object
  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Helper to get Icon per node type
  const getNodeIcon = (type: NodeType, className = "w-4 h-4") => {
    switch (type) {
      case 'Suspect': return <Users className={`${className} text-rose-400`} />;
      case 'Victim': return <User className={`${className} text-blue-400`} />;
      case 'Phone Number': return <Phone className={`${className} text-cyan-400`} />;
      case 'Email': return <Mail className={`${className} text-purple-400`} />;
      case 'UPI ID': return <QrCode className={`${className} text-amber-400`} />;
      case 'Bank Account': return <CreditCard className={`${className} text-emerald-400`} />;
      case 'IP Address': return <Globe className={`${className} text-rose-400`} />;
      case 'Transaction': return <Receipt className={`${className} text-orange-400`} />;
      case 'Case': return <FolderCheck className={`${className} text-indigo-400`} />;
      default: return <Network className={`${className} text-cyan-400`} />;
    }
  };

  // Helper to get Node Badge/Background Colors
  const getNodeStyle = (type: NodeType) => {
    switch (type) {
      case 'Suspect': return { bg: 'bg-rose-950/90', border: 'border-rose-500', text: 'text-rose-300', fill: '#f43f5e' };
      case 'Victim': return { bg: 'bg-blue-950/90', border: 'border-blue-500', text: 'text-blue-300', fill: '#3b82f6' };
      case 'Phone Number': return { bg: 'bg-cyan-950/90', border: 'border-cyan-500', text: 'text-cyan-300', fill: '#06b6d4' };
      case 'Email': return { bg: 'bg-purple-950/90', border: 'border-purple-500', text: 'text-purple-300', fill: '#a855f7' };
      case 'UPI ID': return { bg: 'bg-amber-950/90', border: 'border-amber-500', text: 'text-amber-300', fill: '#f59e0b' };
      case 'Bank Account': return { bg: 'bg-emerald-950/90', border: 'border-emerald-500', text: 'text-emerald-300', fill: '#10b981' };
      case 'IP Address': return { bg: 'bg-rose-950/90', border: 'border-rose-500', text: 'text-rose-300', fill: '#f43f5e' };
      case 'Transaction': return { bg: 'bg-orange-950/90', border: 'border-orange-500', text: 'text-orange-300', fill: '#f97316' };
      case 'Case': return { bg: 'bg-indigo-950/90', border: 'border-indigo-500', text: 'text-indigo-300', fill: '#6366f1' };
      default: return { bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-slate-300', fill: '#06b6d4' };
    }
  };

  // Handle Canvas Drag / Pan
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      // Dragging a node
      setNodes(prev => prev.map(n => {
        if (n.id === draggedNodeId) {
          return {
            ...n,
            x: (e.clientX - dragOffset.x - panOffset.x) / zoomLevel,
            y: (e.clientY - dragOffset.y - panOffset.y) / zoomLevel
          };
        }
        return n;
      }));
      return;
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Start dragging a specific node
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggedNodeId(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX - node.x * zoomLevel - panOffset.x,
        y: e.clientY - node.y * zoomLevel - panOffset.y
      });
    }
  };

  // Add new Node handler
  const handleAddNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;

    const newId = `node-custom-${Date.now()}`;
    const targetNode = nodes.find(n => n.id === newNodeConnectTo) || nodes[0];

    const newNode: NetworkNode = {
      id: newId,
      label: newNodeLabel.trim(),
      type: newNodeType,
      subtext: newNodeSubtext.trim() || 'Officer Added Entity',
      riskLevel: newNodeRisk,
      associatedCases: targetNode ? targetNode.associatedCases : ['CASE-1024'],
      x: targetNode ? targetNode.x + Math.floor(Math.random() * 120) - 60 : 400,
      y: targetNode ? targetNode.y + 100 : 300,
      details: {
        status: 'Newly Discovered Lead',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: 'Added to threat intelligence map during active officer session.'
      }
    };

    const newLink: NetworkLink = {
      id: `link-${Date.now()}`,
      source: newNodeConnectTo,
      target: newId,
      relationship: 'Linked Entity'
    };

    setNodes(prev => [...prev, newNode]);
    setLinks(prev => [...prev, newLink]);
    setSelectedNodeId(newId);
    setIsAddNodeModalOpen(false);
    setNewNodeLabel('');
    setNewNodeSubtext('');
  };

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Highlight connections for selected / hovered node
  const focusNodeId = hoveredNodeId || selectedNodeId;
  const connectedNodeIds = new Set<string>();
  if (focusNodeId) {
    connectedNodeIds.add(focusNodeId);
    links.forEach(l => {
      if (l.source === focusNodeId) connectedNodeIds.add(l.target);
      if (l.target === focusNodeId) connectedNodeIds.add(l.source);
    });
  }

  // Multi-case shared entities list
  const sharedEntities = nodes.filter(n => n.associatedCases.length > 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0b1324] to-slate-950 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/30 font-mono">
            <GitBranch className="w-3.5 h-3.5" />
            <span>ForensIQ Threat Actor Linkage Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Suspect Network & Cross-Case Correlation
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl font-sans">
            Interactive node-based entity visualizer mapping correlations between suspects, victims, phone numbers, email handles, UPI VPAs, bank accounts, IP nodes, and case files.
          </p>
        </div>

        {/* Action Controls */}
        <div className="z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddNodeModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entity Node</span>
          </button>

          {/* View Mode Switcher */}
          <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveViewMode('canvas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                activeViewMode === 'canvas'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-rose-400" />
              <span>Interactive Graph</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                activeViewMode === 'tree'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-amber-400" />
              <span>Tree View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                activeViewMode === 'matrix'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Shared Matrix ({sharedEntities.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CROSS-CASE CORRELATION ALERT BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-950 to-amber-950/60 border border-rose-500/40 text-xs font-mono text-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <strong className="text-rose-300 uppercase tracking-wider block text-[11px]">
              🚨 Cross-Case Intelligence Alert: Active Syndicate Web Detected
            </strong>
            <p className="text-slate-300 leading-relaxed font-sans">
              Phone Number <strong className="text-cyan-300">+91 98765 43210</strong> and Bank Account <strong className="text-emerald-300">ACC-9048-2819-5501</strong> appear simultaneously in <strong className="text-amber-300">Case #1024</strong>, <strong className="text-amber-300">Case #1089</strong>, and <strong className="text-amber-300">Case #2048</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setSelectedNodeId('node-bank-1'); setActiveViewMode('canvas'); }}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <span>Focus Common Node</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CONTROLS BAR: Node Filters & Search */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 font-bold text-[11px] uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter Node Type:
          </span>
          {[
            'All',
            'Suspect',
            'Victim',
            'Phone Number',
            'Email',
            'UPI ID',
            'Bank Account',
            'IP Address',
            'Transaction',
            'Case'
          ].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedNodeType(type)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                selectedNodeType === type
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search node, account, IP, case..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

      </div>

      {/* VIEW MODE 1: INTERACTIVE NODE GRAPH CANVAS */}
      {activeViewMode === 'canvas' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main SVG Graph Canvas Stage (3 Cols) */}
          <div className="lg:col-span-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[560px]">
            
            {/* Stage Header Controls */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-10">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Network className="w-4 h-4 text-rose-400" />
                <span>Interactive Node Canvas (Drag nodes or pan background)</span>
              </div>

              {/* Zoom & Reset Controls */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2.2))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.5))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 cursor-pointer flex items-center gap-1"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px]">Reset</span>
                </button>
              </div>
            </div>

            {/* Interactive SVG Stage */}
            <div 
              className="relative flex-1 w-full h-[520px] bg-[#050914] rounded-xl border border-slate-800/80 overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDownCanvas}
              onMouseMove={handleMouseMoveCanvas}
              onMouseUp={handleMouseUpCanvas}
            >
              {/* Subtle Grid Background Pattern */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
                  backgroundSize: `${30 * zoomLevel}px ${30 * zoomLevel}px`,
                  backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
                }}
              />

              <svg
                ref={svgRef}
                className="w-full h-full absolute inset-0"
              >
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  
                  {/* Render Links / Edges */}
                  {filteredLinks.map(link => {
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const targetNode = nodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    const isConnectedToFocus = focusNodeId && (link.source === focusNodeId || link.target === focusNodeId);
                    const opacity = focusNodeId ? (isConnectedToFocus ? 1 : 0.15) : 0.7;

                    return (
                      <g key={link.id} className="transition-all duration-300" style={{ opacity }}>
                        {/* Connecting Line */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={link.isSharedLink ? '#f43f5e' : isConnectedToFocus ? '#38bdf8' : '#334155'}
                          strokeWidth={link.isSharedLink ? 3 : isConnectedToFocus ? 2.5 : 1.5}
                          strokeDasharray={link.isSharedLink ? '6,3' : undefined}
                          className={link.isSharedLink ? 'animate-pulse' : ''}
                        />

                        {/* Link Text Label */}
                        <text
                          x={(sourceNode.x + targetNode.x) / 2}
                          y={(sourceNode.y + targetNode.y) / 2 - 6}
                          fill={link.isSharedLink ? '#fda4af' : '#94a3b8'}
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-bold pointer-events-none select-none bg-slate-950 px-1"
                        >
                          {link.relationship}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Nodes */}
                  {filteredNodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isConnected = focusNodeId ? connectedNodeIds.has(node.id) : true;
                    const style = getNodeStyle(node.type);

                    const opacity = focusNodeId ? (isConnected ? 1 : 0.2) : 1;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer transition-opacity duration-300"
                        style={{ opacity }}
                      >
                        {/* Pulsing Aura if Shared / Selected */}
                        {(isSelected || node.associatedCases.length > 1) && (
                          <circle
                            r={32}
                            fill={style.fill}
                            opacity={0.15}
                            className="animate-ping"
                          />
                        )}

                        {/* Node Outer Ring */}
                        <circle
                          r={24}
                          fill="#0b1324"
                          stroke={isSelected ? '#38bdf8' : style.fill}
                          strokeWidth={isSelected ? 4 : 2}
                          className="shadow-xl"
                        />

                        {/* Node Center Badge Icon Circle */}
                        <foreignObject x={-12} y={-12} width={24} height={24} className="pointer-events-none">
                          <div className="w-full h-full flex items-center justify-center">
                            {getNodeIcon(node.type, "w-4 h-4")}
                          </div>
                        </foreignObject>

                        {/* Node Title & Subtext Label Box below node */}
                        <foreignObject x={-80} y={28} width={160} height={50} className="pointer-events-none overflow-visible">
                          <div className={`p-1.5 rounded-lg bg-slate-950/90 border ${
                            isSelected ? 'border-cyan-400 text-white shadow-lg' : 'border-slate-800 text-slate-300'
                          } text-center font-mono space-y-0.5`}>
                            <div className="text-[10px] font-bold truncate">{node.label}</div>
                            <div className="text-[8px] text-slate-400 truncate">{node.subtext}</div>
                          </div>
                        </foreignObject>

                      </g>
                    );
                  })}

                </g>
              </svg>

              {/* Stage Legend Overlay */}
              <div className="absolute bottom-3 left-3 p-3 bg-slate-950/90 border border-slate-800 rounded-xl font-mono text-[10px] space-y-1.5 shadow-xl text-slate-300 pointer-events-none">
                <div className="font-bold uppercase text-slate-400 text-[9px]">Graph Node Legend:</div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 text-rose-400"><Users className="w-3 h-3" /> Suspect</span>
                  <span className="flex items-center gap-1 text-blue-400"><User className="w-3 h-3" /> Victim</span>
                  <span className="flex items-center gap-1 text-cyan-400"><Phone className="w-3 h-3" /> Phone</span>
                  <span className="flex items-center gap-1 text-amber-400"><QrCode className="w-3 h-3" /> UPI ID</span>
                  <span className="flex items-center gap-1 text-emerald-400"><CreditCard className="w-3 h-3" /> Bank</span>
                  <span className="flex items-center gap-1 text-indigo-400"><FolderCheck className="w-3 h-3" /> Case</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Inspector Drawer (1 Col) */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-5 shadow-2xl flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  Node Intelligence Inspector
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  activeNode.riskLevel === 'Critical' 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {activeNode.riskLevel} Risk
                </span>
              </div>

              {/* Node Main Banner */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  {getNodeIcon(activeNode.type)}
                  <span>{activeNode.type}</span>
                </div>

                <div className="text-base font-bold text-white font-sans break-words">
                  {activeNode.label}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {activeNode.subtext}
                </div>
              </div>

              {/* Associated Cases */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-slate-500 font-bold text-[10px] uppercase">Linked Investigation Files:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.associatedCases.map(cId => (
                    <span key={cId} className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold text-[11px]">
                      {cId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Intelligence Key-Values */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs font-mono">
                {activeNode.details.status && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Status:</span>
                    <strong className="text-white">{activeNode.details.status}</strong>
                  </div>
                )}
                {activeNode.details.registeredOwner && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Owner / KYC:</span>
                    <strong className="text-cyan-300">{activeNode.details.registeredOwner}</strong>
                  </div>
                )}
                {activeNode.details.bankBranch && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Bank Branch:</span>
                    <strong className="text-emerald-300">{activeNode.details.bankBranch}</strong>
                  </div>
                )}
                {activeNode.details.isp && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">ISP Carrier:</span>
                    <strong className="text-amber-300">{activeNode.details.isp}</strong>
                  </div>
                )}
                {activeNode.details.location && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Location:</span>
                    <strong className="text-slate-200">{activeNode.details.location}</strong>
                  </div>
                )}
              </div>

              {/* Notes Snippet */}
              {activeNode.details.notes && (
                <div className="space-y-1 font-mono text-xs">
                  <span className="text-slate-500 font-bold text-[10px] uppercase">Officer Forensic Notes:</span>
                  <p className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 text-xs font-sans leading-relaxed">
                    {activeNode.details.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 space-y-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => copyToClipboard(activeNode.label)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {copiedText === activeNode.label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedText === activeNode.label ? 'Value Copied!' : 'Copy Value'}</span>
              </button>

              <button
                type="button"
                onClick={() => alert(`Section 91 CrPC Bank Subpoena request dispatched for ${activeNode.label}`)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Subpoena Node Intelligence</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* VIEW MODE 2: HIERARCHICAL TREE VIEW (Requested Example Structure) */}
      {activeViewMode === 'tree' && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-amber-400" />
                Hierarchical Suspect Network Tree
              </h2>
              <p className="text-xs text-slate-400">
                Structured tree layout detailing suspect handles, phone aliases, UPI VPAs, bank accounts, and multi-case linkages.
              </p>
            </div>

            <span className="text-xs font-mono text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              Syndicate Hierarchy
            </span>
          </div>

          {/* Tree Structure Output matching user example:
              Suspect A
                 |
                 ├── Phone Number
                 ├── UPI ID
                 └── Bank Account
                        |
                     Case #1024 / Case #1089 / Case #2048
          */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs space-y-8">
            
            {/* Suspect Branch 1 */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 font-bold text-sm shadow-md">
                <Users className="w-4 h-4 text-rose-400" />
                <span>Suspect A (Vikram Malhotra / @ShadowOperator)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40">Mastermind</span>
              </div>

              {/* Sub-Branches */}
              <div className="ml-6 border-l-2 border-slate-800 pl-6 space-y-4">
                
                {/* Branch Item: Phone Numbers */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <span className="text-slate-600 font-mono">├──</span>
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>Phone Number: +1 (555) 019-2834 (VOIP Relay)</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300 font-bold ml-6">
                    <span className="text-slate-600 font-mono">├──</span>
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">Phone Number: +91 98765 43210</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                      🚨 SHARED IN CASE #1024 & CASE #1089
                    </span>
                  </div>
                </div>

                {/* Branch Item: UPI ID */}
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <span className="text-slate-600 font-mono">├──</span>
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>UPI ID: paym-fraudster@okaxis (Linked VPA)</span>
                </div>

                {/* Branch Item: Bank Account (Nested to Cases) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <span className="text-slate-600 font-mono">└──</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Bank Account: ACC-9048-2819-5501 (Axis Bank)</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                      🚨 SHARED IN 3 CASES
                    </span>
                  </div>

                  {/* Nested Cases under Bank Account */}
                  <div className="ml-12 border-l-2 border-emerald-500/40 pl-6 space-y-2">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-300">
                        <FolderCheck className="w-4 h-4 text-indigo-400" />
                        <strong className="text-white">Case #1024 — Banking Trojan Extortion</strong>
                      </div>
                      <span className="text-slate-400 text-[10px]">Victim: Alex Rivera (Loss ₹25,000)</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-300">
                        <FolderCheck className="w-4 h-4 text-indigo-400" />
                        <strong className="text-white">Case #1089 — Phishing & Identity Theft</strong>
                      </div>
                      <span className="text-slate-400 text-[10px]">Victim: Elena Rostova (Loss $12,400)</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-300">
                        <FolderCheck className="w-4 h-4 text-indigo-400" />
                        <strong className="text-white">Case #2048 — Investment Fraud Syndicate</strong>
                      </div>
                      <span className="text-slate-400 text-[10px]">Subpoena Active</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Suspect Branch 2 */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 font-bold text-sm shadow-md">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Suspect B (Rajesh Kumar / Mule Account Handler)</span>
              </div>

              <div className="ml-6 border-l-2 border-slate-800 pl-6 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <span className="text-slate-600 font-mono">└──</span>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Account Title Holder: ACC-9048-2819-5501 (Axis Bank Branch #402, Mumbai)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW MODE 3: SHARED MATRIX TABLE */}
      {activeViewMode === 'matrix' && (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-5 shadow-2xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Cross-Case Correlated Entities Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Identified phone numbers, bank accounts, and IP addresses appearing across multiple incident files.
              </p>
            </div>

            <span className="text-xs font-mono text-cyan-400 font-bold">
              {sharedEntities.length} Correlated Nodes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Correlated Value</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Linked Cases</th>
                  <th className="p-3">KYC / Owner Notes</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {sharedEntities.map(ent => (
                  <tr key={ent.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      {getNodeIcon(ent.type)}
                      <span>{ent.type}</span>
                    </td>
                    <td className="p-3 font-bold text-cyan-300">{ent.label}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {ent.riskLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {ent.associatedCases.map(cId => (
                          <span key={cId} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold text-[10px]">
                            {cId}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{ent.details.registeredOwner || ent.details.notes}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => { setSelectedNodeId(ent.id); setActiveViewMode('canvas'); }}
                        className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Inspect Node
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD CUSTOM ENTITY NODE MODAL */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-xs font-mono">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                <span>Add Intelligence Node to Network</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddNodeModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNodeSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block uppercase">Entity Type:</label>
                <select
                  value={newNodeType}
                  onChange={e => setNewNodeType(e.target.value as NodeType)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Phone Number">Phone Number</option>
                  <option value="Bank Account">Bank Account</option>
                  <option value="UPI ID">UPI ID</option>
                  <option value="Email">Email</option>
                  <option value="IP Address">IP Address</option>
                  <option value="Suspect">Suspect Alias</option>
                  <option value="Transaction">Transaction Reference</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block uppercase">Node Value / Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 99887 76655 or ACC-3091-2831"
                  value={newNodeLabel}
                  onChange={e => setNewNodeLabel(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block uppercase">Subtext / Registration Info:</label>
                <input
                  type="text"
                  placeholder="e.g. Airtel Burner SIM / HDFC Branch #102"
                  value={newNodeSubtext}
                  onChange={e => setNewNodeSubtext(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold block uppercase">Connect To Existing Node:</label>
                <select
                  value={newNodeConnectTo}
                  onChange={e => setNewNodeConnectTo(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddNodeModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg cursor-pointer"
                >
                  Add Node
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};