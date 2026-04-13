'use client';
// components/dashboard/StatsCard.tsx
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  trend?: number;
  color: 'blue' | 'gold' | 'green' | 'red' | 'purple';
  prefix?: string;
  suffix?: string;
  delay?: number;
}

const COLORS = {
  blue:   { bg: 'bg-blue-500/10',   icon: 'bg-blue-500',   text: 'text-blue-400',   border: 'border-blue-500/20' },
  gold:   { bg: 'bg-yellow-500/10', icon: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  green:  { bg: 'bg-emerald-500/10',icon: 'bg-emerald-500',text: 'text-emerald-400',border: 'border-emerald-500/20' },
  red:    { bg: 'bg-red-500/10',    icon: 'bg-red-500',    text: 'text-red-400',    border: 'border-red-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/20' },
};

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color, prefix, suffix, delay = 0 }: Props) {
  const c = COLORS[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-5 backdrop-blur-sm`}
    >
      {/* Glow effect */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.icon} opacity-10 blur-2xl`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full font-body ${trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-gray-400 text-xs font-medium font-body uppercase tracking-wider">{title}</p>
        <p className={`font-display text-3xl font-bold ${c.text}`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        {subtitle && <p className="text-gray-500 text-xs font-body">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
