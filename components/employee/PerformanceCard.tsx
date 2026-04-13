'use client';
// components/employee/PerformanceCard.tsx
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward } from 'react-icons/fi';

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
}

interface Props {
  performance: Performance;
  rank: number;
  delay?: number;
}

const RANK_STYLES = [
  'border-yellow-400/40 bg-yellow-400/5',
  'border-gray-400/40 bg-gray-400/5',
  'border-orange-400/40 bg-orange-400/5',
];

const RANK_CROWN = ['👑', '🥈', '🥉'];

export default function PerformanceCard({ performance, rank, delay = 0 }: Props) {
  const rankStyle = RANK_STYLES[rank - 1] || 'border-gray-700/40 bg-gray-700/5';
  const crown = RANK_CROWN[rank - 1] || `#${rank}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border p-5 ${rankStyle}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-white font-bold font-display">
              {performance.user.name[0]}
            </div>
            <span className="absolute -top-2 -right-2 text-base">{crown}</span>
          </div>
          <div>
            <p className="font-semibold text-white font-body">{performance.user.name}</p>
            <p className="text-xs text-gray-400 font-body">{performance.user.email}</p>
          </div>
        </div>
        {performance.badge && (
          <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-body border border-yellow-500/20">
            <FiAward className="w-3 h-3" /> {performance.badge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Revenue', value: `$${performance.revenueGenerated.toLocaleString()}`, accent: 'text-emerald-400' },
          { label: 'Visits', value: performance.visitsCompleted, accent: 'text-blue-400' },
          { label: 'Upsell Rate', value: `${performance.upsellRate}%`, accent: performance.upsellRate >= 60 ? 'text-emerald-400' : 'text-yellow-400' },
          { label: 'Avg Ticket', value: `$${Math.round(performance.avgTicket)}`, accent: 'text-purple-400' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-gray-800/50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-body">{label}</p>
            <p className={`font-bold font-display text-lg ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Upsell progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 font-body mb-1">
          <span>Upsell conversion</span>
          <span>{performance.upsellAccepted}/{performance.upsellOffered}</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${performance.upsellRate}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
            className={`h-full rounded-full ${performance.upsellRate >= 60 ? 'bg-emerald-400' : 'bg-yellow-400'}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
