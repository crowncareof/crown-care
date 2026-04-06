'use client';
// components/admin/AdminShell.tsx
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

interface User { id: number; name: string; email: string; role: string }
interface Props { children: React.ReactNode; title?: string; adminOnly?: boolean }

export default function AdminShell({ children, title, adminOnly = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('crown_user');
    const token = localStorage.getItem('crown_token');
    if (!token || !stored) { router.replace('/admin/login'); return; }

    try {
      const u: User = JSON.parse(stored);

      // Check active status via API
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (!d.user || d.user.active === false) {
            localStorage.removeItem('crown_token');
            localStorage.removeItem('crown_user');
            router.replace('/admin/login');
            return;
          }
          setUser(d.user);
          setLoading(false);
        })
        .catch(() => {
          setUser(u);
          setLoading(false);
        });

      // Block collaborators from admin-only pages
      if (adminOnly && u.role !== 'admin') {
        router.replace('/admin/dashboard');
        return;
      }
    } catch {
      router.replace('/admin/login');
    }
  }, [router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-body text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <AdminSidebar user={user} />
      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-200 px-6 py-4 lg:py-5 mt-14 lg:mt-0 flex items-center justify-between sticky top-0 z-30">
          <div>{title && <h1 className="font-display text-xl font-bold text-navy-900">{title}</h1>}</div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-navy-900">{user?.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-body ${
                user?.role === 'admin'
                  ? 'bg-gold-50 text-gold-700 border border-gold-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'Collaborator'}
              </span>
            </div>
            <div className="w-9 h-9 bg-navy-800 rounded-xl flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0] ?? 'A'}
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
