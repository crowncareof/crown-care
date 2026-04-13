'use client';
// components/client/ClientScoreBadge.tsx
import { motion } from 'framer-motion';

interface Props {
  score: number;
  profile?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number) {
  if (score >= 80) return { ring: 'stroke-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' };
  if (score >= 60) return { ring: 'stroke-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-400/10' };
  if (score >= 40) return { ring: 'stroke-yellow-400',  text: 'text-yellow-400',  bg: 'bg-yellow-400/10' };
  return              { ring: 'stroke-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10' };
}

const PROFILE_EMOJI: Record<string, string> = {
  vip: '⭐', standard: '✓', demanding: '⚡', risk: '⚠️',
};

export default function ClientScoreBadge({ score, profile, size = 'md' }: Props) {
  const c = getScoreColor(score);
  const radius = size === 'lg' ? 28 : size === 'md' ? 22 : 16;
  const stroke = size === 'lg' ? 4 : 3;
  const dim = (radius + stroke) * 2 + 4;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className={`flex items-center gap-2`}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim/2} cy={dim/2} r={radius} fill="none" stroke="#1f2937" strokeWidth={stroke} />
          <motion.circle
            cx={dim/2} cy={dim/2} r={radius} fill="none"
            strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={c.ring}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold font-display ${size === 'lg' ? 'text-base' : size === 'md' ? 'text-sm' : 'text-xs'} ${c.text}`}>
            {score}
          </span>
        </div>
      </div>
      {profile && (
        <span className={`text-xs px-2 py-1 rounded-full font-body ${c.bg} ${c.text} border border-current/20`}>
          {PROFILE_EMOJI[profile]} {profile}
        </span>
      )}
    </div>
  );
}
