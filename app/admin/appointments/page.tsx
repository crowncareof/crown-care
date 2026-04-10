'use client';
// app/admin/appointments/page.tsx
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiChevronLeft, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

interface Service { id: number; title: string }
interface Lead { id: number; name: string; clientProfile?: string; privateNote?: string }
interface Appointment {
  id: number; clientName: string; clientEmail?: string; clientPhone?: string;
  serviceId?: number; service?: { id: number; title: string };
  leadId?: number; lead?: { id: number; name: string; clientProfile?: string; privateNote?: string };
  scheduledDate: string; estimatedDuration: number; address?: string;
  status: string; notes?: string; assignedTo?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-gray-100 text-gray-500',
};

const EMPTY_FORM = {
  clientName: '', clientEmail: '', clientPhone: '', serviceId: '',
  leadId: '', scheduledDate: '', estimatedDuration: '120',
  address: '', notes: '', assignedTo: '', status: 'pending',
};

export default function AppointmentsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [riskConfirm, setRiskConfirm] = useState('');
  const [riskModal, setRiskModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const token = () => localStorage.getItem('crown_token') || '';

  const fetchData = useCallback(async () => {
    const [apptRes, svcRes] = await Promise.all([
      fetch(`/api/appointments?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token()}` } }),
      fetch('/api/services'),
    ]);
    const apptData = await apptRes.json();
    const svcData = await svcRes.json();
    setAppointments(apptData.appointments || []);
    setServices(svcData.services || []);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const apptsByDay = (day: number) =>
    appointments.filter(a => new Date(a.scheduledDate).getDate() === day);

  const doSave = async () => {
    setSaving(true);
    setRiskModal(false);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, serviceId: form.serviceId || undefined, leadId: form.leadId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'RISK_CLIENT') { toast.error('Admin approval required for risk clients'); return; }
        throw new Error(data.error);
      }
      toast.success('Appointment created!');
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally { setSaving(false); }
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.scheduledDate) {
      toast.error('Client name and date are required'); return;
    }
    // Check if lead is risk
    if (form.leadId) {
      const res = await fetch(`/api/clients/${form.leadId}`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (data.client?.clientProfile === 'risk') {
        setPendingSubmit(true);
        setRiskModal(true);
        return;
      }
    }
    await doSave();
  };

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success('Status updated'); fetchData(); }
    else toast.error('Failed to update');
  };

  const dayAppointments = selectedDay ? apptsByDay(selectedDay) : [];

  return (
    <AdminShell title="Appointments">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); }}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-display font-bold text-navy-900 text-lg">{monthName}</h2>
          <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); }}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-admin-gold">
          <FiPlus className="w-4 h-4" /> New Appointment
        </button>
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2 font-body">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="h-20 border-b border-r border-gray-50" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayAppts = apptsByDay(day);
                const isToday = day === now.getDate() && month === now.getMonth()+1 && year === now.getFullYear();
                const isSelected = day === selectedDay;
                return (
                  <button key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className={`h-20 border-b border-r border-gray-50 p-1.5 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-navy-50' : ''}`}>
                    <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 font-body ${isToday ? 'bg-navy-800 text-white' : 'text-gray-600'}`}>{day}</div>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 2).map(a => (
                        <div key={a.id} className={`text-xs px-1 py-0.5 rounded truncate font-body ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}>
                          {a.clientName}
                        </div>
                      ))}
                      {dayAppts.length > 2 && <div className="text-xs text-gray-400 font-body">+{dayAppts.length - 2} more</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day detail */}
        <div className="lg:col-span-2">
          {selectedDay ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-display font-semibold text-navy-900 mb-3">
                {monthName.split(' ')[0]} {selectedDay}
              </h3>
              {dayAppointments.length === 0 ? (
                <p className="text-sm text-gray-400 font-body">No appointments.</p>
              ) : (
                <div className="space-y-3">
                  {dayAppointments.map(a => (
                    <div key={a.id} className="bg-slate-50 rounded-xl p-3">
                      {a.lead?.clientProfile === 'demanding' && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mb-2 font-body">
                          <FiAlertTriangle className="w-3 h-3" /> Demanding client
                          {a.lead.privateNote && <span className="opacity-70">— {a.lead.privateNote}</span>}
                        </div>
                      )}
                      <div className="font-semibold text-navy-900 text-sm font-body">{a.clientName}</div>
                      <div className="text-xs text-gray-400 font-body mt-0.5">
                        {new Date(a.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {a.service && ` · ${a.service.title}`}
                      </div>
                      {a.assignedTo && <div className="text-xs text-gray-400 font-body mt-0.5">👤 {a.assignedTo}</div>}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {['pending','confirmed','completed','cancelled'].map(s => (
                          <button key={s} onClick={() => updateStatus(a.id, s)}
                            className={`text-xs px-2 py-0.5 rounded-full transition-all font-body ${a.status === s ? STATUS_COLORS[s] : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-6 text-center">
              <p className="text-sm text-gray-400 font-body">Click a day to see appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* New appointment modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
              className="relative bg-white rounded-3xl shadow-premium-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="font-display font-bold text-navy-900 text-lg">New Appointment</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-navy-800"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key:'clientName', label:'Client Name *', type:'text', placeholder:'Full name' },
                  { key:'clientPhone', label:'Phone', type:'tel', placeholder:'(555) 000-0000' },
                  { key:'clientEmail', label:'Email', type:'email', placeholder:'email@example.com' },
                  { key:'address', label:'Address', type:'text', placeholder:'Service address' },
                  { key:'scheduledDate', label:'Date & Time *', type:'datetime-local', placeholder:'' },
                  { key:'assignedTo', label:'Technician', type:'text', placeholder:'Name' },
                  { key:'notes', label:'Notes', type:'text', placeholder:'Any special instructions' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">{label}</label>
                    <input type={type} value={(form as Record<string,string>)[key] || ''}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} className="input-base" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Service</label>
                  <select value={form.serviceId} onChange={e => setForm(p => ({ ...p, serviceId: e.target.value }))} className="input-base">
                    <option value="">— Select service —</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Duration (minutes)</label>
                  <input type="number" value={form.estimatedDuration}
                    onChange={e => setForm(p => ({ ...p, estimatedDuration: e.target.value }))} className="input-base" />
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-body">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-admin-gold justify-center">
                  {saving ? 'Saving…' : 'Create Appointment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Risk client confirm modal */}
      <AnimatePresence>
        {riskModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-display font-bold text-navy-900 text-center mb-2">Risk Client — Confirm?</h3>
              <p className="text-sm text-gray-500 text-center mb-4 font-body">Type <strong>CONFIRM</strong> to proceed with this appointment.</p>
              <input value={riskConfirm} onChange={e => setRiskConfirm(e.target.value)}
                placeholder="Type CONFIRM" className="input-base text-center mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { setRiskModal(false); setRiskConfirm(''); }} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-body">Cancel</button>
                <button onClick={() => { if (riskConfirm === 'CONFIRM') doSave(); else toast.error('Type CONFIRM to proceed'); }}
                  className="flex-1 btn-admin-danger justify-center text-sm">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
