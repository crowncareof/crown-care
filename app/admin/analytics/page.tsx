'use client';
// app/admin/analytics/page.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiUsers, FiStar, FiTrendingUp, FiRepeat, FiPercent } from 'react-icons/fi';
import AdminShell from '@/components/admin/AdminShell';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { ClientProfileChart, ClientStatusChart } from '@/components/dashboard/ClientsChart';

interface KPIs {
  totalRevenue: number; revenueThisMonth: number; totalClients: number;
  activeClients: number; vipClients: number; atRiskClients: number;
  avgSatisfaction: number; retentionRate: number; upsellRate: number;
}

interface Charts {
  monthlyRevenue: { month: string; revenue: number }[];
  clientsByStatus: { status: string; count: number }[];
  clientsByProfile: { profile: string; count: number }[];
  upsellBreakdown: { status: string; count: number }[];
}

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);
  const token = () => localStorage.getItem('crown_token') || '';

  useEffect(() => {
    fetch('/api/analytics', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { setKpis(d.kpis); setCharts(d.charts); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Analytics" adminOnly>
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Revenue" value={loading ? '—' : `$${(kpis?.totalRevenue || 0).toLocaleString()}`} icon={FiDollarSign} color="gold" delay={0.05} />
        <StatsCard title="This Month" value={loading ? '—' : `$${(kpis?.revenueThisMonth || 0).toLocaleString()}`} icon={FiTrendingUp} color="green" delay={0.1} />
        <StatsCard title="Total Clients" value={loading ? '—' : kpis?.totalClients || 0} icon={FiUsers} color="blue" delay={0.15} />
        <StatsCard title="Active Clients" value={loading ? '—' : kpis?.activeClients || 0} subtitle="Serviced in 60 days" icon={FiRepeat} color="green" delay={0.2} />
        <StatsCard title="Retention Rate" value={loading ? '—' : kpis?.retentionRate || 0} suffix="%" icon={FiPercent} color="purple" delay={0.25} />
        <StatsCard title="Upsell Rate" value={loading ? '—' : kpis?.upsellRate || 0} suffix="%" icon={FiStar} color="gold" delay={0.3} />
        <StatsCard title="VIP Clients" value={loading ? '—' : kpis?.vipClients || 0} icon={FiStar} color="gold" delay={0.35} />
        <StatsCard title="At Risk" value={loading ? '—' : kpis?.atRiskClients || 0} icon={FiUsers} color="red" delay={0.4} />
        <StatsCard title="Avg Satisfaction" value={loading ? '—' : kpis?.avgSatisfaction || 0} suffix="/5" icon={FiStar} color="green" delay={0.45} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-display font-semibold text-white mb-1">Revenue (Last 6 Months)</h3>
          <p className="text-gray-400 text-xs font-body mb-4">Monthly revenue from completed services</p>
          {charts ? <RevenueChart data={charts.monthlyRevenue} /> : <div className="h-48 bg-gray-700/20 rounded-xl animate-pulse" />}
        </motion.div>

        {/* Client Profile Pie */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-display font-semibold text-white mb-1">Client Profiles</h3>
          <p className="text-gray-400 text-xs font-body mb-4">Distribution by profile type</p>
          {charts ? <ClientProfileChart data={charts.clientsByProfile} /> : <div className="h-48 bg-gray-700/20 rounded-xl animate-pulse" />}
          {charts && (
            <div className="flex flex-wrap gap-2 mt-3">
              {charts.clientsByProfile.map(p => (
                <span key={p.profile} className="text-xs text-gray-400 font-body capitalize">
                  {p.profile}: {p.count}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Client Status Bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-display font-semibold text-white mb-1">Clients by Pipeline Stage</h3>
          <p className="text-gray-400 text-xs font-body mb-4">How clients are distributed in your funnel</p>
          {charts ? <ClientStatusChart data={charts.clientsByStatus} /> : <div className="h-48 bg-gray-700/20 rounded-xl animate-pulse" />}
        </motion.div>

        {/* Upsell breakdown */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
          className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-display font-semibold text-white mb-1">Upsell Results</h3>
          <p className="text-gray-400 text-xs font-body mb-4">Offered vs accepted add-ons</p>
          {charts ? (
            <div className="space-y-3 mt-6">
              {charts.upsellBreakdown.map(u => {
                const total = charts.upsellBreakdown.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((u.count / total) * 100) : 0;
                const color = u.status === 'accepted' ? 'bg-emerald-400' : u.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400';
                return (
                  <div key={u.status}>
                    <div className="flex justify-between text-xs text-gray-400 font-body mb-1">
                      <span className="capitalize">{u.status}</span>
                      <span>{u.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.6 }}
                        className={`h-full rounded-full ${color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-32 bg-gray-700/20 rounded-xl animate-pulse" />}
        </motion.div>
      </div>
    </AdminShell>
  );
}
