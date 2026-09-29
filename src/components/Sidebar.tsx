import React from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FolderLock, 
  PlusCircle,
  Clock,
  Bell,
  User,
  LogOut,
  Sparkles, 
  ShieldAlert, 
  Users, 
  Activity, 
  Lock, 
  Home, 
  Globe, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  ChevronRight,
  Database,
  Cpu,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentRole, cases, notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const pendingVictimCases = cases.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const criticalOfficerCases = cases.filter(c => c.urgency === 'Critical').length;

  const getMenuItems = () => {
    switch (currentRole) {
      case 'victim':
        return [
          { label: 'Dashboard', path: '/victim', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'My Cases', path: '/victim/cases', icon: <FileText className="w-4 h-4" />, badge: pendingVictimCases ? `${pendingVictimCases} active` : undefined },
          { label: 'File Complaint', path: '/victim/file-complaint', icon: <PlusCircle className="w-4 h-4 text-cyan-400" /> },
          { label: 'Upload Evidence', path: '/victim/evidence', icon: <FolderLock className="w-4 h-4 text-emerald-400" /> },
          { label: 'Case Timeline', path: '/victim/timeline', icon: <Clock className="w-4 h-4 text-indigo-400" /> },
          { label: 'Notifications', path: '/victim/notifications', icon: <Bell className="w-4 h-4 text-amber-400" />, badge: unreadNotifs ? `${unreadNotifs} new` : undefined, badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
          { label: 'Profile', path: '/victim/profile', icon: <User className="w-4 h-4 text-purple-400" /> },
          { label: 'Logout', path: '/login', icon: <LogOut className="w-4 h-4 text-rose-400" /> },
        ];
      case 'officer':
        return [
          { label: 'Dashboard', path: '/officer', icon: <LayoutDashboard className="w-4 h-4" />, badge: criticalOfficerCases ? `${criticalOfficerCases} Critical` : undefined, badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40' },
          { label: 'Cases', path: '/officer/cases', icon: <FileText className="w-4 h-4" /> },
          { label: 'Evidence Vault', path: '/officer/evidence-vault', icon: <FolderLock className="w-4 h-4 text-emerald-400" /> },
          { label: 'AI Analysis', path: '/officer/ai-analysis', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
          { label: 'Timeline', path: '/officer/timeline', icon: <Clock className="w-4 h-4 text-indigo-400" /> },
          { label: 'Reports', path: '/officer/reports', icon: <BarChart3 className="w-4 h-4 text-purple-400" /> },
          { label: 'Notifications', path: '/officer/notifications', icon: <Bell className="w-4 h-4 text-amber-400" />, badge: unreadNotifs ? `${unreadNotifs} new` : undefined, badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
          { label: 'Profile', path: '/officer/profile', icon: <User className="w-4 h-4 text-blue-400" /> },
          { label: 'Logout', path: '/login', icon: <LogOut className="w-4 h-4 text-rose-400" /> },
        ];
      
    }
  };

  const menuItems = getMenuItems();

  const navTo = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <aside className="w-64 bg-[#0a0d14] border-r border-slate-800/50 flex flex-col h-full min-h-[calc(100vh-4rem)] text-slate-300 select-none">
      
      {/* Active Portal Header Banner */}
      <div className="p-4 border-b border-slate-800/50 bg-slate-900/40">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-1">
          Active Workspace
        </div>
        <div className="flex items-center gap-2">
          {currentRole === 'victim' && <UserCheck className="w-4 h-4 text-indigo-400" />}
          {currentRole === 'officer' && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
          <span className="text-sm font-bold text-white font-serif italic capitalize">
{currentRole === 'victim' ? 'Victim Assistance' : 'Cybercrime Bureau'}          </span>
        </div>
      </div>

      {/* Main Role Navigation */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
          Intelligence Hub
        </div>

        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navTo(item.path)}
              className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                  item.badgeColor || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
              ) : null}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
          General Access
        </div>

        <button
          onClick={() => navTo('/')}
          className={`w-full px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-3 transition-colors ${
            location.pathname === '/' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>Platform Overview</span>
        </button>

        
      </nav>

      {/* Footer System Network Integrity Banner */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-slate-900/50 rounded-xl p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Network Integrity</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-emerald-500 w-[94%]" />
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex justify-between">
            <span>SHA-256 Vault</span>
            <span>99.9% Safe</span>
          </div>
        </div>
      </div>

    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        {content}
      </div>

      {/* Mobile Slide-over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full bg-slate-950 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};