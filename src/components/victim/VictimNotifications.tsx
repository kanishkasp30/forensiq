import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VictimNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'updates' | 'alerts'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'unread') return !n.read;
    if (filterTab === 'updates') return n.type === 'case_update';
    if (filterTab === 'alerts') return n.type === 'alert' || n.type === 'ai_flag';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Bell className="w-3.5 h-3.5" />
            <span>Investigation Alerts & System Updates</span>
          </div>
          <h1 className="text-2xl font-serif italic text-white mt-1">Notifications Hub</h1>
          <p className="text-xs text-slate-400">
            Real-time alerts for officer case progress, evidence verification, and AI threat findings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
              {unreadCount} Unread Alerts
            </span>
          )}

          <button
            onClick={() => markAllNotificationsRead()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        {[
          { id: 'all', label: `All Notifications (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'updates', label: 'Case Progress Updates' },
          { id: 'alerts', label: 'Security & AI Flags' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              filterTab === tab.id ? 'border-amber-400 text-amber-400 bg-slate-900/50 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="p-6 rounded-2xl bg-[#0a0d14] border border-slate-800 space-y-3 shadow-2xl">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No notifications matching this filter.
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) markNotificationRead(n.id);
                if (n.caseId) navigate('/victim/cases');
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                n.read 
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' 
                  : 'bg-slate-900 border-amber-500/30 text-slate-100 shadow-md'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'alert' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                n.type === 'ai_flag' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              }`}>
                {n.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                 n.type === 'ai_flag' ? <Sparkles className="w-4 h-4" /> :
                 <FileText className="w-4 h-4" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white">{n.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>

                {n.caseId && (
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-cyan-400 font-bold">Case Ref: {n.caseId}</span>
                    <span className="text-amber-400 hover:underline flex items-center gap-1">
                      View Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>

              {!n.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
