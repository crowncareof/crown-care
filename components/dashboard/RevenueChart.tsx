'use client';
// components/dashboard/RevenueChart.tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint { month: string; revenue: number }

interface Props { data: DataPoint[] }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-gray-400 text-xs font-body mb-1">{label}</p>
        <p className="text-white font-bold font-display text-lg">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
}

export default function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#d4a017" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#d4a017', strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
