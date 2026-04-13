'use client';
// app/admin/performance/page.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminShell from '@/components/admin/AdminShell';
import PerformanceCard from '@/components/employee/PerformanceCard';

interface Performance {
  id: number;
  user: { name: string; email: string };
  revenueGenerated: number;
  visitsCompleted: number;
  upsellOffered: number;
  upsellAccepted: number;
  upsellRate: number;
  avgTicket: number;
  badge?: string | null;
  month: number;
  year: number;
}

export default function PerformancePage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const token = () => localStorage.getItem('crown_token') || '';

  useEffect(() => {
    fetch('/api/performance', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => {
        setPerformances(d.performances || []);
        if (d.month) setMonth(new Date(d.year, d.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Employee Performance" adminOnly>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-400 text-sm font-body">{month || 'Current month'} — Leaderboard</p>
        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full font-body border border-yellow-500/20">
          🏆 Live Rankings
        </span>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-700/20 rounded-2xl animate-pulse" />)}
        </div>
      ) : performances.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-700">
          <p className="text-gray-400 font-body">No performance data yet for this month.</p>
          <p className="text-gray-500 text-sm font-body mt-1">Data is recorded when visits are completed and upsells are tracked.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {performances.map((p, i) => (
            <PerformanceCard key={p.id} performance={p} rank={i + 1} delay={i * 0.1} />
          ))}
        </div>
      )}

      {/* Tips */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
        className="mt-8 bg-gray-900 rounded-2xl border border-gray-700/50 p-6">
        <h3 className="font-display font-semibold text-white mb-4">🎯 How to improve your score</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: '💰', title: 'Offer every upsell', desc: 'Even if they say no, offering counts. Aim for 100% offer rate.' },
            { icon: '⭐', title: 'Focus on VIP clients', desc: 'VIP clients have higher LTV. Prioritize them for premium add-ons.' },
            { icon: '📋', title: 'Complete the checklist', desc: 'Teams that complete visit checklists have 40% higher satisfaction scores.' },
          ].map(tip => (
            <div key={tip.title} className="bg-gray-800/50 rounded-xl p-4">
              <span className="text-2xl">{tip.icon}</span>
              <p className="font-medium text-white font-body mt-2 mb-1">{tip.title}</p>
              <p className="text-xs text-gray-400 font-body">{tip.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </AdminShell>
  );
}
