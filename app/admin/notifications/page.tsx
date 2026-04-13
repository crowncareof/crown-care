'use client';
// app/admin/notifications/page.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiClock, FiEyeOff, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

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
  critical: 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10',
  high:     'border-l-orange-400 bg-orange-400/5 hover:bg-orange-400/10',
  medium:   'border-l-yellow-400 bg-yellow-400/5 hover:bg-yellow-400/10',
  low:      'border-l-gray-500 bg-gray-700/20 hover:bg-gray-700/30',
};

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:      'bg-gray-600/20 text-gray-400 border-gray-600/30',
};

const TYPE_EMOJI: Record<string, string> = {
  inactive: '😴', missing_data: '📋', upsell_opportunity: '💰',
  vip_unattended: '⭐', high_risk: '🚨',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('unread');
  const [unreadCount, setUnreadCount] = useState(0);
  const token = () => localStorage.getItem('crown_token') || '';

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch(`/api/notifications?status=${filter}`, { headers: { Authorization: `Bearer ${token()}` } });
    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const generateNotifications = async () => {
    setGenerating(true);
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data = await res.json();
    toast.success(`${data.created} new notifications generated`);
    fetchNotifications();
    setGenerating(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    setNotifications(prev => filter === 'all' ? prev.map(n => n.id === id ? {...n, status} : n) : prev.filter(n => n.id !== id));
    if (status === 'dismissed' || status === 'read') setUnreadCount(p => Math.max(0, p - 1));
  };

  const snooze = (id: number) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status: 'snoozed', snoozedUntil: tomorrow }),
    });
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Snoozed until tomorrow');
  };

  return (
    <AdminShell title="Notifications" adminOnly>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {['unread', 'all', 'snoozed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-body capitalize transition-all ${filter === f ? 'bg-yellow-500 text-navy-900 font-semibold' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
                {f} {f === 'unread' && unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{unreadCount}</span>}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generateNotifications} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm hover:bg-blue-500/30 transition-all font-body disabled:opacity-50">
          <FiRefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : 'Generate Smart Alerts'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-700/20 rounded-xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-700">
          <FiBell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-body">No {filter} notifications.</p>
          <button onClick={generateNotifications} className="mt-4 text-yellow-400 text-sm underline font-body">
            Generate smart alerts now
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
              className={`border-l-4 rounded-r-2xl p-4 transition-all ${PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.low}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${PRIORITY_BADGE[n.priority] || ''}`}>
                      {n.priority}
                    </span>
                    <span className="text-xs text-gray-500 font-body">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-medium text-white font-body">{TYPE_EMOJI[n.type]} {n.title}</p>
                  <p className="text-sm text-gray-400 font-body mt-0.5">{n.message}</p>
                  {n.lead && (
                    <Link href="/admin/clients" className="text-xs text-blue-400 hover:text-blue-300 font-body underline mt-1 inline-block">
                      View {n.lead.name} →
                    </Link>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => snooze(n.id)} title="Snooze 24h"
                    className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all">
                    <FiClock className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateStatus(n.id, 'dismissed')} title="Dismiss"
                    className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <FiEyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
