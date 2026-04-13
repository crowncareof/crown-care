'use client';
// components/admin/AdminSidebar.tsx
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiLayers, FiImage, FiMessageSquare, FiLogOut,
  FiMenu, FiX, FiExternalLink, FiMail, FiSettings, FiUsers,
  FiCalendar, FiClipboard, FiBarChart2, FiBell, FiAward, FiBook,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  role: 'all' | 'admin';
}

const NAV: NavItem[] = [
  { href: '/admin/dashboard',     label: 'Dashboard',     icon: FiGrid,          role: 'admin' },
  { href: '/admin/visit',         label: 'New Visit',     icon: FiClipboard,     role: 'all'   },
  { href: '/admin/clients',       label: 'Clients',       icon: FiUsers,         role: 'all'   },
  { href: '/admin/pipeline',      label: 'Pipeline',      icon: FiBarChart2,     role: 'all'   },
  { href: '/admin/appointments',  label: 'Appointments',  icon: FiCalendar,      role: 'all'   },
  { href: '/admin/analytics',     label: 'Analytics',     icon: FiBarChart2,     role: 'admin' },
  { href: '/admin/performance',   label: 'Performance',   icon: FiAward,         role: 'admin' },
  { href: '/admin/training',      label: 'Training',      icon: FiBook,          role: 'all'   },
  { href: '/admin/notifications',  label: 'Notifications', icon: FiBell,         role: 'admin' },
  { href: '/admin/services',      label: 'Services',      icon: FiLayers,        role: 'all'   },
  { href: '/admin/portfolio',     label: 'Portfolio',     icon: FiImage,         role: 'all'   },
  { href: '/admin/testimonials',  label: 'Testimonials',  icon: FiMessageSquare, role: 'all'   },
  { href: '/admin/leads',         label: 'Form Leads',    icon: FiMail,          role: 'admin' },
  { href: '/admin/settings',      label: 'Settings',      icon: FiSettings,      role: 'admin' },
  { href: '/admin/team',          label: 'Team',          icon: FiUsers,         role: 'admin' },
];

interface Props {
  user?: { name: string; email: string; role: string } | null;
  reengagementCount?: number;
  notificationCount?: number;
}

export default function AdminSidebar({ user, reengagementCount = 0, notificationCount = 0 }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const navItems = NAV.filter(n => n.role === 'all' || isAdmin);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('crown_token');
    localStorage.removeItem('crown_user');
    toast.success('Logged out');
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/">
          <Image src="/logo-light.png" alt="Crown Care" width={160} height={50} className="h-10 w-auto opacity-90" />
        </Link>
        <div className="text-white/30 text-[10px] font-body tracking-widest uppercase mt-1">Admin Panel</div>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const badge = href === '/admin/dashboard' && reengagementCount > 0 ? reengagementCount
                      : href === '/admin/notifications' && notificationCount > 0 ? notificationCount
                      : 0;
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all font-body relative
                ${active ? 'bg-yellow-500 text-navy-900' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/10 space-y-0.5">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all font-body">
          <FiExternalLink className="w-4 h-4" /> View Public Site
        </Link>
        {user && (
          <div className="px-3 py-2.5 rounded-xl bg-white/5 mx-0">
            <div className="text-white text-sm font-medium font-body truncate">{user.name}</div>
            <div className="flex items-center justify-between mt-0.5">
              <div className="text-white/40 text-xs font-body truncate">{user.email}</div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1 ${isAdmin ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {isAdmin ? 'Admin' : 'Collab'}
              </span>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-body">
          <FiLogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-navy-950 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy-950 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo-light.png" alt="Crown Care" width={120} height={38} className="h-8 w-auto" />
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2 rounded-lg hover:bg-white/10">
          {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 z-40" />
            <motion.aside initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-navy-950 z-50 overflow-y-auto">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
