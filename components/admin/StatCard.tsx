// components/admin/StatCard.tsx
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface Props {
  title: string;
  value: number | string;
  icon: IconType;
  color: 'navy' | 'gold' | 'green' | 'purple';
  delay?: number;
}

const colorMap = {
  navy:   { bg: 'bg-navy-50', icon: 'bg-navy-800 text-white', value: 'text-navy-900' },
  gold:   { bg: 'bg-amber-50', icon: 'bg-gold-500 text-navy-900', value: 'text-amber-700' },
  green:  { bg: 'bg-green-50', icon: 'bg-green-600 text-white', value: 'text-green-700' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600 text-white', value: 'text-purple-700' },
};

export default function StatCard({ title, value, icon: Icon, color, delay = 0 }: Props) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`${c.bg} rounded-2xl p-6 border border-white shadow-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 font-body">{title}</span>
        <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className={`font-display text-3xl font-bold ${c.value}`}>{value}</div>
    </motion.div>
  );
}
