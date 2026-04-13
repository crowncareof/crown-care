'use client';
// components/dashboard/ClientsChart.tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PROFILE_COLORS: Record<string, string> = {
  vip: '#10b981', standard: '#3b82f6', demanding: '#f59e0b', risk: '#ef4444', unknown: '#6b7280',
};

const STATUS_COLORS: Record<string, string> = {
  new_lead: '#6b7280', quoted: '#8b5cf6', booked: '#3b82f6', completed: '#10b981', cold: '#374151', churned: '#ef4444',
};

interface ProfileData { profile: string; count: number }
interface StatusData  { status: string; count: number }

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl px-3 py-2 shadow-2xl">
        <p className="text-white text-sm font-body capitalize">{payload[0].name}: <span className="font-bold">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
}

export function ClientProfileChart({ data }: { data: ProfileData[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="count" nameKey="profile">
          {data.map((entry) => (
            <Cell key={entry.profile} fill={PROFILE_COLORS[entry.profile] || '#6b7280'} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ClientStatusChart({ data }: { data: StatusData[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="status" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<PieTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
