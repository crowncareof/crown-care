'use client';
// components/client/NextBestAction.tsx
import { motion } from 'framer-motion';
import { FiPhone, FiStar, FiCalendar, FiEdit2, FiMessageCircle } from 'react-icons/fi';

interface Action {
  type: 'call' | 'premium' | 'schedule' | 'update' | 'message';
  label: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  clientProfile?: string | null;
  lastServiceDate?: string | null;
  phone?: string | null;
  missingFields?: string[];
  onAction?: (type: string) => void;
}

const ICONS: Record<string, React.ElementType> = {
  call: FiPhone, premium: FiStar, schedule: FiCalendar, update: FiEdit2, message: FiMessageCircle,
};

const PRIORITY_COLORS = {
  high:   'border-red-500/30 bg-red-500/5',
  medium: 'border-yellow-500/30 bg-yellow-500/5',
  low:    'border-gray-600/30 bg-gray-700/5',
};

const PRIORITY_DOT = {
  high: 'bg-red-400', medium: 'bg-yellow-400', low: 'bg-gray-500',
};

export default function NextBestAction({ clientProfile, lastServiceDate, phone, missingFields = [], onAction }: Props) {
  const actions: Action[] = [];

  const daysInactive = lastServiceDate
    ? Math.floor((Date.now() - new Date(lastServiceDate).getTime()) / 86400000)
    : null;

  if (daysInactive !== null && daysInactive >= 60) {
    actions.push({ type: 'call', label: 'Call this client', description: `Inactive for ${daysInactive} days`, priority: daysInactive >= 90 ? 'high' : 'medium' });
  }

  if (clientProfile === 'vip') {
    actions.push({ type: 'premium', label: 'Offer premium service', description: 'VIP clients deserve the best treatment', priority: 'high' });
  }

  if (daysInactive !== null && daysInactive >= 30) {
    actions.push({ type: 'schedule', label: 'Schedule next visit', description: 'Keep the momentum going', priority: 'medium' });
  }

  if (missingFields.length > 0) {
    actions.push({ type: 'update', label: 'Update missing info', description: `Missing: ${missingFields.slice(0, 2).join(', ')}`, priority: 'low' });
  }

  if (phone) {
    actions.push({ type: 'message', label: 'Send AI message', description: 'Personalized re-engagement message', priority: 'medium' });
  }

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider font-body">Next Best Action</p>
      {actions.slice(0, 3).map((action, i) => {
        const Icon = ICONS[action.type];
        return (
          <motion.button
            key={action.type}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onAction?.(action.type)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] text-left ${PRIORITY_COLORS[action.priority]}`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[action.priority]}`} />
            <div className={`w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white font-body">{action.label}</p>
              <p className="text-xs text-gray-400 font-body truncate">{action.description}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
