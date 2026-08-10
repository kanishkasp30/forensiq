import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoleBadge } from './StatusBadges';
import { NotificationsPopover } from './Notifications';
import { EmergencySOSModal } from './EmergencySOSModal';
import { AIEvidenceModal } from './AIEvidenceModal';
import { UserRole } from '../types';
import { 
  Shield, 
  Search, 
  Bell, 
  Sparkles, 
  PhoneCall, 
  Menu, 
  X, 
  UserCheck, 
  ShieldCheck, 
  ChevronDown, 
  LogOut, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC<{ onToggleMobileSidebar?: () => void; isMobileSidebarOpen?: boolean }> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const { currentUser, currentRole, switchRole, notifications } = useApp();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setRoleMenuOpen(false);
    if (role === 'victim') navigate('/victim');
    else if (role === 'officer') navigate('/officer');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/50 shadow-2xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-950/60 border border-cyan-400/30 group-hover:bg-cyan-500 transition-colors">
                <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <span className="text-xl font-serif italic font-bold tracking-tight text-white flex items-center gap-1">
                  ForensIQ
                </span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800/80 text-[10px] font-mono rounded border border-slate-700/60 text-slate-400 hidden sm:inline-block">
                v4.2.0-STABLE
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case files, IOCs, hashes, wallets..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Role Portal Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch Portal Role View"
              >
                <RoleBadge role={currentRole} />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-1 space-y-0.5">
                  <div className="px-3 py-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    Select Active Portal View
                  </div>
                  <button
                    onClick={() => handleRoleChange('victim')}
                    className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentRole === 'victim' ? 'bg-indigo-950 text-indigo-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      Victim Portal
                    </span>
                    {currentRole === 'victim' && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('officer')}
                    className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentRole === 'officer' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Cybercrime Officer
                    </span>
                    {currentRole === 'officer' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium flex items-center justify-between ${
                      currentRole === 'admin' ? 'bg-purple-950 text-purple-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      Administrator Command
                    </span>
                    {currentRole === 'admin' && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* AI Evidence Tool Trigger Button */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/20 via-cyan-600/20 to-blue-600/20 hover:from-amber-600/30 hover:to-blue-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Launch AI Evidence Scan"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI Inspector</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 relative transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <NotificationsPopover
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setSosOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-red-950/80 border border-rose-400/40 animate-pulse flex items-center gap-1.5 cursor-pointer"
              title="Emergency Incident Lockdown"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SOS</span>
            </button>

            {/* User Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-3 space-y-3">
                  <div className="border-b border-slate-800 pb-2">
                    <p className="text-xs font-bold text-slate-100">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                    {currentUser.badgeId && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-400 border border-slate-700">
                        {currentUser.badgeId}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/roles'); }}
                      className="w-full text-left px-2 py-1.5 text-slate-300 hover:bg-slate-800 rounded-md flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      Role Matrix Portal
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/login'); }}
                      className="w-full text-left px-2 py-1.5 text-red-400 hover:bg-slate-800 rounded-md flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out / Switch Session
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Modals */}
      <EmergencySOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
      <AIEvidenceModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  );
};
