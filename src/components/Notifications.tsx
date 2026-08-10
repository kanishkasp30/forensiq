import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, ShieldAlert, Sparkles, AlertCircle, FileText, X } from 'lucide-react';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsProps> = ({ isOpen, onClose, onSelectCase }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'ai_flag':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'case_update':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-cyan-950/50 glow-cyan z-50 overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-100">Cyber Intelligence Alerts</h4>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-mono font-bold text-[10px]">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-cyan-400 hover:underline font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No system notifications.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.caseId && onSelectCase) {
                  onSelectCase(n.caseId);
                  onClose();
                }
              }}
              className={`p-3.5 hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                !n.read ? 'bg-cyan-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className={`text-xs font-semibold ${!n.read ? 'text-cyan-300' : 'text-slate-200'} truncate`}>
                    {n.title}
                  </h5>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-slate-400 leading-snug line-clamp-2">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
