import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Check,
  ShieldAlert,
  FileText,
  Brain,
  Settings,
} from 'lucide-react';

export const OfficerNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <ShieldAlert className="w-5 h-5" />;

      case 'ai_flag':
        return <Brain className="w-5 h-5" />;

      case 'system':
        return <Settings className="w-5 h-5" />;

      case 'case_update':
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-500/20 text-red-400';

      case 'ai_flag':
        return 'bg-purple-500/20 text-purple-400';

      case 'system':
        return 'bg-amber-500/20 text-amber-400';

      case 'case_update':
      default:
        return 'bg-cyan-500/20 text-cyan-400';
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">

        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Officer Alert Desk</span>
          </div>

          <h1 className="text-2xl font-serif italic text-white">
            Bureau Notifications & Subpoena Alerts
          </h1>

          <p className="text-xs text-slate-400">
            Real-time updates on critical complaints, evidence uploads,
            and legal warrant deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications */}
      <div className="space-y-3">

        {notifications.length === 0 ? (
          <div className="p-10 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />

            <p className="text-sm font-semibold text-slate-300">
              No notifications
            </p>

            <p className="text-xs text-slate-500 mt-1">
              New case updates, evidence alerts and AI flags will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                !n.read
                  ? 'bg-slate-900 border-amber-500/30 text-slate-100 shadow-md'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 opacity-80'
              }`}
            >

              {/* Notification icon */}
              <div
                className={`p-2 rounded-lg shrink-0 ${getNotificationStyle(
                  n.type
                )}`}
              >
                {getNotificationIcon(n.type)}
              </div>

              {/* Notification content */}
              <div className="flex-1 space-y-1">

                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-xs text-white">
                    {n.title}
                  </span>

                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                    {n.time}
                  </span>
                </div>

                <p className="text-xs leading-relaxed">
                  {n.message}
                </p>

                {/* Case reference */}
                {n.caseId && (
                  <div className="pt-1">
                    <span className="text-[10px] font-mono text-cyan-400">
                      Case: {n.caseId}
                    </span>
                  </div>
                )}

                {/* Read status */}
                <div className="flex items-center gap-1 pt-1">
                  {n.read ? (
                    <span className="text-[9px] text-slate-600">
                      Read
                    </span>
                  ) : (
                    <span className="text-[9px] text-amber-400 font-semibold">
                      Unread
                    </span>
                  )}
                </div>

              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
};