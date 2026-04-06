'use client';
// components/admin/AdminShell.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

interface User { id: number; name: string; email: string; role: string }

interface Props { children: React.ReactNode; title?: string }

export default function AdminShell({ children, title }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('crown_user');
    const token = localStorage.getItem('crown_token');
    if (!token || !stored) {
      router.replace('/admin/login');
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      router.replace('/admin/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-body text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <AdminSidebar user={user} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 lg:py-5 mt-14 lg:mt-0 flex items-center justify-between sticky top-0 z-30">
          <div>
            {title && <h1 className="font-display text-xl font-bold text-navy-900">{title}</h1>}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-navy-900">{user?.name}</span>
              <span className="text-xs text-gray-400">{user?.email}</span>
            </div>
            <div className="w-9 h-9 bg-navy-800 rounded-xl flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
