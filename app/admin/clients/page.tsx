'use client';
// app/admin/clients/page.tsx
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiStar, FiMessageCircle, FiExternalLink, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';
import ImageUploader from '@/components/admin/ImageUploader';

interface Client {
  id: number; name: string; email?: string; phone?: string; address?: string;
  preferredContact: string; furnitureType?: string; fabricType?: string;
  hasPets: boolean; hasChildren: boolean; protectionApplied: boolean;
  service?: string; status: string; source: string;
  lastServiceDate?: string; totalServices: number; totalRevenue: number;
  serviceValue?: number; clientProfile?: string; satisfactionScore?: number;
  internalFlags?: string; privateNote?: string;
  beforePhotoUrl?: string; afterPhotoUrl?: string; createdAt: string;
}

const PROFILE_STYLES: Record<string, string> = {
  vip:       'bg-green-100 text-green-700 border-green-200',
  standard:  'bg-blue-100 text-blue-600 border-blue-200',
  demanding: 'bg-amber-100 text-amber-700 border-amber-200',
  risk:      'bg-red-100 text-red-600 border-red-200',
};

const STATUS_STYLES: Record<string, string> = {
  new_lead:  'bg-gray-100 text-gray-600',
  quoted:    'bg-purple-100 text-purple-600',
  booked:    'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  cold:      'bg-slate-100 text-slate-500',
  churned:   'bg-red-100 text-red-500',
};

function AIMessageCard({ clientId }: { clientId: number }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = () => localStorage.getItem('crown_token') || '';

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate');
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-4">
      <button onClick={generate} disabled={loading}
        className="btn-admin text-xs px-4 py-2 disabled:opacity-60">
        {loading ? '✨ Generating…' : '✨ Generate AI Message'}
      </button>
      {message && (
        <div className="mt-3 bg-slate-50 rounded-xl p-4 text-sm font-body text-navy-900 leading-relaxed border border-slate-200">
          <p className="whitespace-pre-wrap">{message}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { navigator.clipboard.writeText(message); toast.success('Copied!'); }}
              className="text-xs text-navy-600 hover:text-navy-800 underline">Copy</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 underline">Open WhatsApp</a>
            <button onClick={() => setMessage('')} className="text-xs text-gray-400 hover:text-gray-600 underline ml-auto">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientDrawer({ client, onClose, onSave }: { client: Client; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ ...client });
  const [saving, setSaving] = useState(false);
  const token = () => localStorage.getItem('crown_token') || '';

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Client updated!');
      onSave();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving');
    } finally { setSaving(false); }
  };

  const daysInactive = client.lastServiceDate
    ? Math.floor((Date.now() - new Date(client.lastServiceDate).getTime()) / (24*60*60*1000))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-white w-full max-w-lg shadow-2xl overflow-y-auto">

        {/* Alert banner for demanding/risk */}
        {(client.clientProfile === 'demanding' || client.clientProfile === 'risk') && (
          <div className={`px-6 py-3 flex items-center gap-2 text-sm font-medium ${client.clientProfile === 'risk' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
            <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
            {client.clientProfile === 'risk' ? '⚠️ Risk client — admin approval required for appointments.' : '⚡ Demanding client — extra care and time needed.'}
            {client.privateNote && <span className="opacity-70 truncate ml-1">"{client.privateNote}"</span>}
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-800 text-white rounded-xl flex items-center justify-center font-bold">{client.name[0]}</div>
            <div>
              <h2 className="font-display font-bold text-navy-900">{client.name}</h2>
              <div className="flex gap-2 mt-0.5">
                {client.clientProfile && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${PROFILE_STYLES[client.clientProfile] || ''}`}>
                    {client.clientProfile}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-body ${STATUS_STYLES[client.status] || 'bg-gray-100 text-gray-600'}`}>
                  {client.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-navy-800 p-1"><FiX className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            {client.phone && (
              <a href={`https://wa.me/${client.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                className="btn-admin text-xs px-4 py-2 flex items-center gap-1.5">
                <FiMessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
            {daysInactive !== null && (
              <span className={`text-xs px-3 py-1.5 rounded-lg font-body ${daysInactive >= 90 ? 'bg-red-50 text-red-600' : daysInactive >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                {daysInactive}d inactive
              </span>
            )}
            <span className="text-xs px-3 py-1.5 rounded-lg bg-navy-50 text-navy-600 font-body">
              {client.totalServices} services
            </span>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'name',    label: 'Name',    type: 'text',  span: 2 },
              { key: 'phone',   label: 'Phone',   type: 'tel',   span: 1 },
              { key: 'email',   label: 'Email',   type: 'email', span: 1 },
              { key: 'address', label: 'Address', type: 'text',  span: 2 },
            ].map(({ key, label, type, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-navy-800 mb-1 font-body">{label}</label>
                <input type={type} value={(form as Record<string,unknown>)[key] as string || ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder={key === 'email' ? 'client@email.com' : key === 'phone' ? '(555) 000-0000' : ''}
                  className="input-base text-sm" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-800 mb-1 font-body">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-base text-sm">
                {['new_lead','quoted','booked','completed','cold','churned'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-800 mb-1 font-body">Profile</label>
              <select value={form.clientProfile || ''} onChange={e => set('clientProfile', e.target.value)} className="input-base text-sm">
                <option value="">— none —</option>
                {['vip','standard','demanding','risk'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-800 mb-1 font-body">Private Note</label>
            <textarea value={form.privateNote || ''} onChange={e => set('privateNote', e.target.value)}
              rows={2} className="input-base text-sm resize-none" placeholder="Internal note, never shown to client..." />
          </div>

          {/* Photos */}
          <div className="grid grid-cols-2 gap-3">
            <ImageUploader label="Before Photo" currentUrl={form.beforePhotoUrl} folder="clients/before"
              onUpload={(url) => set('beforePhotoUrl', url)} />
            <ImageUploader label="After Photo" currentUrl={form.afterPhotoUrl} folder="clients/after"
              onUpload={(url) => set('afterPhotoUrl', url)} />
          </div>

          {/* AI Message */}
          <AIMessageCard clientId={client.id} />

          <button onClick={handleSave} disabled={saving} className="w-full btn-admin-gold justify-center mt-2">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const token = () => localStorage.getItem('crown_token') || '';

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (profileFilter) params.set('clientProfile', profileFilter);
    try {
      const res = await fetch(`/api/clients?${params}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setClients(data.clients || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  }, [search, statusFilter, profileFilter]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const daysAgo = (date?: string) => {
    if (!date) return null;
    return Math.floor((Date.now() - new Date(date).getTime()) / (24*60*60*1000));
  };

  return (
    <AdminShell title="Clients">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email…"
            className="input-base pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-base text-sm w-auto">
          <option value="">All statuses</option>
          {['new_lead','quoted','booked','completed','cold','churned'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)} className="input-base text-sm w-auto">
          <option value="">All profiles</option>
          {['vip','standard','demanding','risk'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray-400 font-body mb-4">{total} client{total !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" /></div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 font-body">No clients found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body">Client</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body hidden sm:table-cell">Profile</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body hidden lg:table-cell">Last Service</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-navy-800 font-body hidden lg:table-cell">Services</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-navy-800 font-body hidden xl:table-cell">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setSelected(c)}
                    className="border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-10 rounded-full flex-shrink-0 ${c.clientProfile === 'vip' ? 'bg-gold-400' : c.clientProfile === 'risk' ? 'bg-red-400' : c.clientProfile === 'demanding' ? 'bg-amber-400' : 'bg-transparent'}`} />
                        <div className="w-8 h-8 bg-navy-800 text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{c.name[0]}</div>
                        <div>
                          <div className="font-semibold text-navy-900 font-body">{c.name}</div>
                          <div className="text-xs text-gray-400 font-body">{c.phone || c.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      {c.clientProfile ? (
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-body ${PROFILE_STYLES[c.clientProfile] || ''}`}>{c.clientProfile}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-body ${STATUS_STYLES[c.status] || ''}`}>{c.status.replace('_',' ')}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-500 font-body">
                      {c.lastServiceDate ? (
                        <span className={daysAgo(c.lastServiceDate)! >= 90 ? 'text-red-500 font-medium' : daysAgo(c.lastServiceDate)! >= 60 ? 'text-amber-500' : ''}>
                          {daysAgo(c.lastServiceDate)}d ago
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 text-center hidden lg:table-cell text-xs font-body text-navy-700">{c.totalServices || 0}</td>
                    <td className="px-5 py-4 text-center hidden xl:table-cell text-xs text-gold-500">
                      {c.satisfactionScore ? '★'.repeat(c.satisfactionScore) : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ClientDrawer client={selected} onClose={() => setSelected(null)} onSave={() => { setSelected(null); fetchClients(); }} />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
