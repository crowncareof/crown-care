'use client';
// app/admin/pipeline/page.tsx
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

interface Client {
  id: number; name: string; phone?: string; furnitureType?: string;
  source: string; clientProfile?: string; status: string;
  updatedAt: string; createdAt: string;
}

const COLUMNS = [
  { key: 'new_lead',  label: 'New Lead',  color: 'border-t-gray-400' },
  { key: 'quoted',    label: 'Quoted',    color: 'border-t-purple-400' },
  { key: 'booked',    label: 'Booked',    color: 'border-t-blue-400' },
  { key: 'completed', label: 'Completed', color: 'border-t-green-400' },
  { key: 'cold',      label: 'Cold',      color: 'border-t-slate-300' },
];

const PROFILE_COLORS: Record<string, string> = {
  vip: 'bg-green-100 text-green-700', standard: 'bg-blue-100 text-blue-600',
  demanding: 'bg-amber-100 text-amber-700', risk: 'bg-red-100 text-red-600',
};

const SOURCE_COLORS: Record<string, string> = {
  website: 'bg-navy-50 text-navy-600', whatsapp: 'bg-green-50 text-green-600',
  referral: 'bg-purple-50 text-purple-600', social: 'bg-pink-50 text-pink-600',
  other: 'bg-gray-50 text-gray-500', field_visit: 'bg-gold-50 text-gold-700',
};

const NEXT_STATUS: Record<string, string> = {
  new_lead: 'quoted', quoted: 'booked', booked: 'completed', completed: 'cold',
};
const PREV_STATUS: Record<string, string> = {
  quoted: 'new_lead', booked: 'quoted', completed: 'booked', cold: 'completed',
};

export default function PipelinePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileFilter, setProfileFilter] = useState('');
  const token = () => localStorage.getItem('crown_token') || '';

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (profileFilter) params.set('clientProfile', profileFilter);
    try {
      const res = await fetch(`/api/clients?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setClients(data.clients || []);
    } catch { toast.error('Failed to load pipeline'); }
    finally { setLoading(false); }
  }, [profileFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const moveClient = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch { toast.error('Failed to move client'); }
  };

  const daysInStage = (updatedAt: string) =>
    Math.floor((Date.now() - new Date(updatedAt).getTime()) / (24*60*60*1000));

  const byStatus = (status: string) => clients.filter(c => c.status === status);

  if (loading) return (
    <AdminShell title="Pipeline">
      <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" /></div>
    </AdminShell>
  );

  return (
    <AdminShell title="Pipeline">
      <div className="flex gap-3 mb-6">
        <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)} className="input-base text-sm w-auto">
          <option value="">All profiles</option>
          {['vip','standard','demanding','risk'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <div key={col.key} className="flex-shrink-0 w-72">
            <div className={`bg-white rounded-2xl border-t-4 ${col.color} shadow-sm overflow-hidden`}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-display font-semibold text-navy-900 text-sm">{col.label}</h3>
                <span className="w-6 h-6 bg-slate-100 rounded-full text-xs font-bold text-navy-700 flex items-center justify-center">
                  {byStatus(col.key).length}
                </span>
              </div>
              <div className="p-3 space-y-2 min-h-[200px]">
                {byStatus(col.key).map((client, i) => {
                  const days = daysInStage(client.updatedAt);
                  const isUrgent = days >= 7;
                  return (
                    <motion.div key={client.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`bg-slate-50 rounded-xl p-3 border-l-4 ${client.clientProfile === 'risk' ? 'border-l-red-400' : client.clientProfile === 'vip' ? 'border-l-gold-400' : 'border-l-transparent'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-semibold text-navy-900 text-xs font-body leading-tight">{client.name}</div>
                          {client.phone && <div className="text-gray-400 text-xs font-body">{client.phone}</div>}
                        </div>
                        {client.clientProfile && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-body ${PROFILE_COLORS[client.clientProfile] || ''}`}>{client.clientProfile}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {client.furnitureType && <span className="text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-body">{client.furnitureType}</span>}
                        <span className={`text-xs px-1.5 py-0.5 rounded font-body ${SOURCE_COLORS[client.source] || 'bg-gray-50 text-gray-500'}`}>{client.source}</span>
                        {isUrgent && <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-body">⚡ {days}d</span>}
                      </div>
                      <div className="flex gap-1 justify-end">
                        {PREV_STATUS[col.key] && (
                          <button onClick={() => moveClient(client.id, PREV_STATUS[col.key])}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <FiChevronLeft className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        )}
                        {NEXT_STATUS[col.key] && (
                          <button onClick={() => moveClient(client.id, NEXT_STATUS[col.key])}
                            className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center hover:bg-navy-700 transition-colors">
                            <FiChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {byStatus(col.key).length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-300 font-body">Empty</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
