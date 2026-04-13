'use client';
// components/admin/AdminShell.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiBell } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import NotificationPanel from '@/components/notifications/NotificationPanel';

interface User { id: number; name: string; email: string; role: string }
interface Props { children: React.ReactNode; title?: string; adminOnly?: boolean }

export default function AdminShell({ children, title, adminOnly = false }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reengagementCount, setReengagementCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('crown_user');
    const token = localStorage.getItem('crown_token');
    if (!token || !stored) { router.replace('/admin/login'); return; }

    try {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (!d.user || d.user.active === false) {
            localStorage.removeItem('crown_token');
            localStorage.removeItem('crown_user');
            router.replace('/admin/login');
            return;
          }
          const u = d.user;
          setUser(u);
          localStorage.setItem('crown_user', JSON.stringify(u));
          if (adminOnly && u.role !== 'admin') { router.replace('/admin/dashboard'); return; }
          setLoading(false);

          if (u.role === 'admin') {
            // Fetch counts in parallel
            Promise.all([
              fetch('/api/admin/reengagement', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
              fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            ]).then(([re, notif]) => {
              setReengagementCount(re.total || 0);
              setNotificationCount(notif.unreadCount || 0);
            }).catch(() => {});
          }
        })
        .catch(() => { setLoading(false); });
    } catch {
      router.replace('/admin/login');
    }
  }, [router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-body text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-body">
      <AdminSidebar user={user} reengagementCount={reengagementCount} notificationCount={notificationCount} />

      <div className="lg:pl-60">
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4 mt-14 lg:mt-0 flex items-center justify-between sticky top-0 z-30">
          <div>{title && <h1 className="font-display text-xl font-bold text-white">{title}</h1>}</div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all">
              <FiBell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">{user?.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-body ${user?.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {user?.role === 'admin' ? 'Admin' : 'Collaborator'}
              </span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-navy-900 text-sm font-bold shadow-lg">
              {user?.name?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">{children}</main>
      </div>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
