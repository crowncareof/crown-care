'use client';
// app/admin/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLayers, FiImage, FiMessageSquare, FiMail, FiUsers, FiCalendar, FiBell, FiStar, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import StatCard from '@/components/admin/StatCard';

interface Stats {
  services: number; portfolio: number; testimonials: number; leads: number;
  completedClients: number; pendingAppointments: number; reengagementAlerts: number; vipClients: number;
}
interface Lead { id: number; name: string; email?: string; phone?: string; service?: string; status: string; createdAt: string }
interface Alert { id: number; name: string; phone?: string; clientProfile?: string; lastServiceDate?: string; daysInactive: number; urgency: string; furnitureType?: string; privateNote?: string }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ services:0, portfolio:0, testimonials:0, leads:0, completedClients:0, pendingAppointments:0, reengagementAlerts:0, vipClients:0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const token = () => localStorage.getItem('crown_token') || '';

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
      fetch('/api/admin/reengagement', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
    ]).then(([statsData, alertsData]) => {
      if (statsData.stats) setStats(statsData.stats);
      if (statsData.recentLeads) setRecentLeads(statsData.recentLeads);
      if (alertsData.alerts) setAlerts(alertsData.alerts.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const PROFILE_COLORS: Record<string, string> = {
    vip: 'bg-green-100 text-green-700', standard: 'bg-blue-100 text-blue-600',
    demanding: 'bg-amber-100 text-amber-700', risk: 'bg-red-100 text-red-600',
  };

  const quickLinks = [
    { href:'/admin/visit',        label:'New Visit',        icon:FiCalendar,      desc:'Log a field service visit' },
    { href:'/admin/clients',      label:'Clients',          icon:FiUsers,         desc:'Manage client profiles' },
    { href:'/admin/pipeline',     label:'Pipeline',         icon:FiLayers,        desc:'Track leads by stage' },
    { href:'/admin/appointments', label:'Appointments',     icon:FiCalendar,      desc:'Schedule and manage bookings' },
    { href:'/admin/services',     label:'Services',         icon:FiLayers,        desc:'Edit cleaning services' },
    { href:'/admin/leads',        label:'Form Leads',       icon:FiMail,          desc:'Website contact submissions' },
  ];

  return (
    <AdminShell title="Dashboard">
      {/* Welcome */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-navy-gradient rounded-3xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{backgroundImage:'radial-gradient(circle, #d4a017 0%, transparent 60%)', backgroundPosition:'right top'}} />
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1">Welcome back! 👑</h2>
        <p className="text-white/60 text-sm font-body">Crown Care Admin Dashboard</p>
        <a href="/" target="_blank" className="inline-flex items-center gap-2 mt-4 text-gold-400 text-sm hover:text-gold-300 transition-colors font-body">
          <FiExternalLink className="w-4 h-4" /> View live website
        </a>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Services" value={loading ? '—' : stats.services} icon={FiLayers} color="navy" delay={0.05} />
        <StatCard title="Portfolio" value={loading ? '—' : stats.portfolio} icon={FiImage} color="gold" delay={0.1} />
        <StatCard title="Completed Clients" value={loading ? '—' : stats.completedClients} icon={FiUsers} color="green" delay={0.15} />
        <StatCard title="VIP Clients" value={loading ? '—' : stats.vipClients} icon={FiStar} color="gold" delay={0.2} />
        <StatCard title="Form Leads" value={loading ? '—' : stats.leads} icon={FiMail} color="purple" delay={0.25} />
        <StatCard title="Testimonials" value={loading ? '—' : stats.testimonials} icon={FiMessageSquare} color="green" delay={0.3} />
        <StatCard title="Pending Appts" value={loading ? '—' : stats.pendingAppointments} icon={FiCalendar} color="navy" delay={0.35} />
        <StatCard title="Re-engagement" value={loading ? '—' : stats.reengagementAlerts} icon={FiBell} color={stats.reengagementAlerts > 0 ? 'purple' : 'green'} delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Quick actions */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-display font-semibold text-navy-900 mb-3">Quick Actions</h3>
          <div className="space-y-1">
            {quickLinks.map(({ href, label, icon:Icon, desc }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-9 h-9 bg-navy-50 rounded-xl flex items-center justify-center group-hover:bg-navy-800 group-hover:text-white transition-all">
                  <Icon className="w-4 h-4 text-navy-700 group-hover:text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900 font-body">{label}</div>
                  <div className="text-xs text-gray-400 font-body">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Re-engagement alerts */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-navy-900">Re-engagement Alerts</h3>
              {stats.reengagementAlerts > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{stats.reengagementAlerts}</span>
              )}
            </div>
            <Link href="/admin/clients?status=completed" className="text-xs text-gold-600 hover:text-gold-700 font-body">View all →</Link>
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <FiBell className="w-8 h-8 mb-2" />
              <p className="text-sm font-body text-gray-400">No alerts — all clients are engaged! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-xl border ${alert.urgency === 'red' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="w-8 h-8 bg-navy-800 text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{alert.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-navy-900 font-body truncate">{alert.name}</span>
                      {alert.clientProfile && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-body ${PROFILE_COLORS[alert.clientProfile] || ''}`}>{alert.clientProfile}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-body">{alert.daysInactive}d inactive{alert.furnitureType ? ` · ${alert.furnitureType}` : ''}</div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {alert.phone && (
                      <a href={`https://wa.me/${alert.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 transition-colors font-body">WA</a>
                    )}
                    <Link href={`/admin/clients`}
                      className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded-lg hover:bg-navy-200 transition-colors font-body">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent form leads */}
      {recentLeads.length > 0 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
          className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-navy-900">Recent Form Leads</h3>
            <Link href="/admin/leads" className="text-xs text-gold-600 hover:text-gold-700 font-body">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentLeads.map(lead => (
              <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-8 h-8 bg-navy-800 text-white rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">{lead.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-navy-900 font-body truncate">{lead.name}</div>
                  <div className="text-xs text-gray-400 font-body truncate">{lead.email}</div>
                </div>
                {lead.service && <span className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full font-body truncate max-w-[120px]">{lead.service}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AdminShell>
  );
}
