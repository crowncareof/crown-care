'use client';
// components/notifications/NotificationPanel.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiClock, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
  lead?: { id: number; name: string; clientProfile?: string | null } | null;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-500/5',
  high:     'border-l-orange-400 bg-orange-400/5',
  medium:   'border-l-yellow-400 bg-yellow-400/5',
  low:      'border-l-gray-500 bg-gray-700/20',
};

const TYPE_EMOJI: Record<string, string> = {
  inactive: '😴', missing_data: '📋', upsell_opportunity: '💰',
  vip_unattended: '⭐', high_risk: '🚨',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem('crown_token') || '';

  useEffect(() => {
    if (!open) return;
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const updateStatus = async (id: number, status: string, snoozedUntil?: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status, ...(snoozedUntil && { snoozedUntil }) }),
    });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const snooze = (id: number) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    updateStatus(id, 'snoozed', tomorrow);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40" />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-16 right-4 w-96 max-h-[80vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <FiBell className="w-4 h-4 text-yellow-400" />
                <h3 className="font-display font-bold text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{notifications.length}</span>
                )}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-700/30 rounded-xl animate-pulse" />)}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <FiBell className="w-10 h-10 text-gray-600 mb-3" />
                  <p className="text-gray-400 font-body">All caught up! 🎉</p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map((n) => (
                    <motion.div key={n.id} layout exit={{ opacity: 0, height: 0 }}
                      className={`border-l-4 rounded-r-xl p-3 ${PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.low}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-white font-body flex-1">
                          {TYPE_EMOJI[n.type]} {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 font-body mb-3">{n.message}</p>
                      <div className="flex gap-2">
                        {n.lead && (
                          <Link href="/admin/clients" onClick={onClose}
                            className="text-xs text-blue-400 hover:text-blue-300 font-body underline">
                            View client
                          </Link>
                        )}
                        <button onClick={() => snooze(n.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 font-body ml-auto">
                          <FiClock className="w-3 h-3" /> Snooze
                        </button>
                        <button onClick={() => updateStatus(n.id, 'dismissed')}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 font-body">
                          <FiEyeOff className="w-3 h-3" /> Dismiss
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-gray-700 px-4 py-3">
                <button
                  onClick={() => notifications.forEach(n => updateStatus(n.id, 'read'))}
                  className="text-xs text-gray-400 hover:text-white font-body transition-colors w-full text-center"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
