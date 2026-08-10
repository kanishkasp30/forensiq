import React from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FolderLock, 
  Sparkles, 
  Menu, 
  PlusCircle, 
  Users, 
  Globe, 
  Activity 
} from 'lucide-react';

interface BottomNavProps {
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMobileMenu }) => {
  const { currentRole, cases, notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const criticalOfficerCases = cases.filter(c => c.urgency === 'Critical').length;

  const getNavItems = () => {
    switch (currentRole) {
      case 'victim':
        return [
          { label: 'Overview', path: '/victim', icon: LayoutDashboard },
          { label: 'My Cases', path: '/victim/cases', icon: FileText },
          { label: 'File Claim', path: '/victim/file-complaint', icon: PlusCircle, isPrimary: true },
          { label: 'Vault', path: '/victim/evidence', icon: FolderLock },
        ];
      case 'officer':
        return [
          { label: 'Dashboard', path: '/officer', icon: LayoutDashboard, badge: criticalOfficerCases ? criticalOfficerCases : undefined },
          { label: 'Cases', path: '/officer/cases', icon: FileText },
          { label: 'Vault', path: '/officer/evidence-vault', icon: FolderLock },
          { label: 'AI Scan', path: '/officer/ai-analysis', icon: Sparkles },
        ];
      case 'admin':
        return [
          { label: 'Command', path: '/admin', icon: LayoutDashboard },
          { label: 'Workload', path: '/admin/workload', icon: Users },
          { label: 'Threats', path: '/admin/threats', icon: Globe },
          { label: 'Audit', path: '/admin/audit', icon: Activity },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d14]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center p-1 cursor-pointer -mt-4"
                aria-label={item.label}
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/60 border border-cyan-400/40">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-cyan-400 mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors cursor-pointer relative min-h-[44px] ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-slate-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}

        {/* Menu drawer button */}
        <button
          onClick={onOpenMobileMenu}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer min-h-[44px]"
          aria-label="More Options Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </div>
  );
};
