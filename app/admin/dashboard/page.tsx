'use client';
// app/admin/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLayers, FiImage, FiMessageSquare, FiMail, FiExternalLink, FiClock } from 'react-icons/fi';
import AdminShell from '@/components/admin/AdminShell';
import StatCard from '@/components/admin/StatCard';
import Link from 'next/link';

interface Stats { services: number; portfolio: number; testimonials: number; leads: number }
interface Lead { id: number; name: string; email: string; service: string; status: string; createdAt: string }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ services: 0, portfolio: 0, testimonials: 0, leads: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crown_token');
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) setStats(d.stats);
        if (d.recentLeads) setRecentLeads(d.recentLeads);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { href: '/admin/services', label: 'Manage Services', icon: FiLayers, desc: 'Add or edit cleaning services' },
    { href: '/admin/portfolio', label: 'Manage Portfolio', icon: FiImage, desc: 'Upload before/after photos' },
    { href: '/admin/testimonials', label: 'Manage Reviews', icon: FiMessageSquare, desc: 'Add client testimonials' },
    { href: '/admin/leads', label: 'View Leads', icon: FiMail, desc: 'See contact form submissions' },
  ];

  return (
    <AdminShell title="Dashboard">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-navy-gradient rounded-3xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{backgroundImage: 'radial-gradient(circle, #d4a017 0%, transparent 60%)', backgroundPosition: 'right top'}} />
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Welcome back! 👋</h2>
        <p className="text-white/60 text-sm font-body">Here's what's happening with Crown Care today.</p>
        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 mt-4 text-gold-400 text-sm hover:text-gold-300 transition-colors font-body"
        >
          <FiExternalLink className="w-4 h-4" /> View live website
        </a>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Services" value={loading ? '—' : stats.services} icon={FiLayers} color="navy" delay={0.05} />
        <StatCard title="Portfolio Items" value={loading ? '—' : stats.portfolio} icon={FiImage} color="gold" delay={0.1} />
        <StatCard title="Testimonials" value={loading ? '—' : stats.testimonials} icon={FiMessageSquare} color="green" delay={0.15} />
        <StatCard title="Total Leads" value={loading ? '—' : stats.leads} icon={FiMail} color="purple" delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="font-display font-semibold text-navy-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickLinks.map(({ href, label, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center group-hover:bg-navy-800 group-hover:text-white transition-all">
                  <Icon className="w-5 h-5 text-navy-700 group-hover:text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900 font-body">{label}</div>
                  <div className="text-xs text-gray-400 font-body">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-navy-900">Recent Leads</h3>
            <Link href="/admin/leads" className="text-xs text-gold-600 hover:text-gold-700 font-body font-medium">
              View all →
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <FiMail className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-body">No leads yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-9 h-9 bg-navy-800 text-white rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {lead.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-navy-900 truncate font-body">{lead.name}</div>
                    <div className="text-xs text-gray-400 font-body truncate">{lead.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {lead.service && (
                      <span className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full font-body truncate max-w-[120px]">
                        {lead.service}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-body">
                      <FiClock className="w-3 h-3" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AdminShell>
  );
}
