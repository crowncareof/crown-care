'use client';
// components/admin/AdminSidebar.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiLayers, FiImage, FiMessageSquare, FiLogOut,
  FiMenu, FiX, FiExternalLink, FiMail,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/services', label: 'Services', icon: FiLayers },
  { href: '/admin/portfolio', label: 'Portfolio', icon: FiImage },
  { href: '/admin/testimonials', label: 'Testimonials', icon: FiMessageSquare },
  { href: '/admin/leads', label: 'Leads', icon: FiMail },
];

interface AdminSidebarProps {
  user?: { name: string; email: string } | null;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('crown_token');
    localStorage.removeItem('crown_user');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/">
          <Image
            src="/logo-light.png"
            alt="Crown Care Services"
            width={320}
            height={100}
            className="h-24 w-auto opacity-90"
          />
        </Link>
        <div className="text-white/30 text-[10px] font-body tracking-widest uppercase mt-2 ml-0.5">Admin Panel</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 font-body
                ${active
                  ? 'bg-gold-500 text-navy-900 shadow-gold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-navy-800"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all font-body"
        >
          <FiExternalLink className="w-4 h-4" />
          View Public Site
        </Link>

        {user && (
          <div className="px-4 py-3 rounded-xl bg-white/5">
            <div className="text-white text-sm font-medium font-body truncate">{user.name}</div>
            <div className="text-white/40 text-xs font-body truncate">{user.email}</div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-body"
        >
          <FiLogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-950 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy-950 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo-light.png"
            alt="Crown Care"
            width={180}
            height={56}
            className="h-14 w-auto"
          />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-navy-950 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
