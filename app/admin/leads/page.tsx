'use client';
// app/admin/leads/page.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiClock, FiTag, FiMessageSquare } from 'react-icons/fi';
import AdminShell from '@/components/admin/AdminShell';

interface Lead {
  id: number; name: string; email: string; phone?: string;
  service?: string; message: string; status: string; createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-600 border-blue-200',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  converted: 'bg-green-50 text-green-600 border-green-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  const token = () => localStorage.getItem('crown_token') || '';

  useEffect(() => {
    fetch('/api/contact', { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((d) => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Leads">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm font-body">{leads.length} lead{leads.length !== 1 ? 's' : ''} total</p>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-body bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          {leads.filter((l) => l.status === 'new').length} new
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FiMail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-body">No leads yet. They'll appear here when clients submit the contact form.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Lead list */}
          <div className="lg:col-span-2 space-y-3">
            {leads.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(lead)}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-sm
                  ${selected?.id === lead.id ? 'border-gold-400 shadow-gold' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-navy-800 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {lead.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-navy-900 text-sm font-body">{lead.name}</div>
                      <div className="text-xs text-gray-400 font-body">{lead.email}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-body flex-shrink-0 ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-body">
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {lead.service && (
                    <span className="flex items-center gap-1 truncate">
                      <FiTag className="w-3 h-3 flex-shrink-0" />
                      {lead.service}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lead detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-navy-800 text-white rounded-2xl flex items-center justify-center text-xl font-bold">
                      {selected.name[0]}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-navy-900 text-xl">{selected.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${STATUS_COLORS[selected.status] || STATUS_COLORS.new}`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-body">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMail className="w-4 h-4 text-navy-600" />
                    </div>
                    <a href={`mailto:${selected.email}`} className="text-navy-700 hover:text-gold-600 transition-colors">
                      {selected.email}
                    </a>
                  </div>

                  {selected.phone && (
                    <div className="flex items-center gap-3 text-sm font-body">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiPhone className="w-4 h-4 text-navy-600" />
                      </div>
                      <a href={`tel:${selected.phone}`} className="text-navy-700 hover:text-gold-600 transition-colors">
                        {selected.phone}
                      </a>
                    </div>
                  )}

                  {selected.service && (
                    <div className="flex items-center gap-3 text-sm font-body">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiTag className="w-4 h-4 text-navy-600" />
                      </div>
                      <span className="text-navy-700">{selected.service}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 text-sm font-body">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiClock className="w-4 h-4 text-navy-600" />
                    </div>
                    <span className="text-gray-500">
                      {new Date(selected.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-medium text-navy-800 mb-2 font-body">
                      <FiMessageSquare className="w-4 h-4" /> Message
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed bg-slate-50 rounded-xl p-4 font-body">
                      {selected.message}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a
                      href={`mailto:${selected.email}?subject=Re: Your Crown Care Inquiry`}
                      className="flex-1 btn-admin-gold justify-center text-sm"
                    >
                      <FiMail className="w-4 h-4" /> Reply by Email
                    </a>
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} className="btn-admin text-sm px-4">
                        <FiPhone className="w-4 h-4" /> Call
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                <FiMail className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-body">Select a lead to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
