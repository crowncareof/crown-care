'use client';
// app/admin/training/page.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiBook, FiList, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

interface Module {
  id: number;
  title: string;
  category: string;
  content: string;
  order: number;
  active: boolean;
}

const CATEGORY_STYLES: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  sales:     { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: FiMessageSquare, label: 'Sales Script' },
  service:   { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       icon: FiBook,          label: 'Best Practice' },
  checklist: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: FiList,       label: 'Checklist' },
};

const DEFAULT_MODULES = [
  { title: 'Opening Script', category: 'sales', content: '1. Greet client by name\n2. Confirm the service to be done\n3. Walk through the area together\n4. Set expectations on time', order: 1 },
  { title: 'Upsell Script', category: 'sales', content: '"Since we\'re already here, we can add [service] for just $[price]. It takes 15 extra minutes and makes a huge difference — want me to include it?"\n\nTip: Offer early, before starting the main service.', order: 2 },
  { title: 'Visit Checklist', category: 'checklist', content: 'BEFORE:\n☐ Confirm service with client\n☐ Check for pets/children\n☐ Inspect furniture condition\n☐ Take before photo\n\nDURING:\n☐ Identify upsell opportunities\n☐ Offer add-ons naturally\n☐ Update client profile\n\nAFTER:\n☐ Take after photo\n☐ Ask for satisfaction rating\n☐ Mention referral program', order: 1 },
  { title: 'Handling Objections', category: 'sales', content: 'Client: "It\'s too expensive"\nResponse: "I completely understand. This service lasts 3-6 months, so it\'s actually just $X/month for fresh, clean furniture."\n\nClient: "I\'ll think about it"\nResponse: "Of course! I can add it now while I have everything set up — saves you another visit fee."', order: 3 },
  { title: 'VIP Client Protocol', category: 'service', content: '- Always greet by name\n- Reference their last visit\n- Proactively offer seasonal services\n- Leave a handwritten thank-you note\n- Follow up within 48h after visit', order: 1 },
  { title: 'Post-Visit Closing', category: 'sales', content: '1. Show the after result together\n2. Ask: "Are you happy with the result?"\n3. Ask: "Would you like to schedule your next service?"\n4. Ask: "Do you know anyone who could benefit from this?"', order: 4 },
];

export default function TrainingPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [form, setForm] = useState({ title: '', category: 'sales', content: '', order: '0' });
  const token = () => localStorage.getItem('crown_token') || '';

  const fetchModules = async () => {
    const res = await fetch('/api/training', { headers: { Authorization: `Bearer ${token()}` } });
    const data = await res.json();
    setModules(data.modules || []);
    setLoading(false);
  };

  useEffect(() => { fetchModules(); }, []);

  const seedDefaults = async () => {
    for (const m of DEFAULT_MODULES) {
      await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(m),
      });
    }
    toast.success('Default training modules loaded!');
    fetchModules();
  };

  const handleSave = async () => {
    const url = editing ? `/api/training/${editing.id}` : '/api/training';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...form, order: parseInt(form.order) }),
    });
    if (res.ok) {
      toast.success(editing ? 'Module updated!' : 'Module created!');
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', category: 'sales', content: '', order: '0' });
      fetchModules();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this module?')) return;
    await fetch(`/api/training/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    toast.success('Deleted');
    fetchModules();
  };

  const openEdit = (m: Module) => {
    setEditing(m);
    setForm({ title: m.title, category: m.category, content: m.content, order: String(m.order) });
    setShowModal(true);
  };

  const filtered = activeCategory === 'all' ? modules : modules.filter(m => m.category === activeCategory);

  return (
    <AdminShell title="Training">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'sales', 'service', 'checklist'].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-body transition-all capitalize ${activeCategory === cat ? 'bg-yellow-500 text-navy-900 font-semibold' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
              {cat === 'all' ? 'All Modules' : CATEGORY_STYLES[cat]?.label || cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {modules.length === 0 && (
            <button onClick={seedDefaults} className="px-4 py-2 rounded-xl text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 font-body transition-all">
              📚 Load defaults
            </button>
          )}
          <button onClick={() => { setEditing(null); setForm({ title:'', category:'sales', content:'', order:'0' }); setShowModal(true); }}
            className="btn-admin-gold text-sm">
            <FiPlus className="w-4 h-4" /> New Module
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-700/20 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-700">
          <p className="text-gray-400 font-body">No modules found.</p>
          {modules.length === 0 && (
            <button onClick={seedDefaults} className="mt-4 text-yellow-400 text-sm underline font-body">Load default training modules</button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const cat = CATEGORY_STYLES[m.category] || CATEGORY_STYLES.service;
            const Icon = cat.icon;
            return (
              <motion.div key={m.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 flex flex-col hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-body ${cat.color}`}>
                    <Icon className="w-3 h-3" /> {cat.label}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-600 transition-all">
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{m.title}</h3>
                <p className="text-gray-400 text-sm font-body flex-1 whitespace-pre-line leading-relaxed line-clamp-6">{m.content}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
              className="relative bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
                <h2 className="font-display font-bold text-white">{editing ? 'Edit Module' : 'New Training Module'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Title</label>
                  <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm font-body focus:outline-none focus:border-yellow-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm font-body focus:outline-none focus:border-yellow-500 transition-colors">
                    <option value="sales">Sales Script</option>
                    <option value="service">Best Practice</option>
                    <option value="checklist">Checklist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Content</label>
                  <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} rows={8}
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm font-body focus:outline-none focus:border-yellow-500 transition-colors resize-none" />
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-5 py-2.5 rounded-xl border border-gray-600 text-sm text-gray-400 hover:text-white hover:bg-gray-700 font-body transition-all">Cancel</button>
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-navy-900 font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-yellow-400 transition-all font-body">
                  <FiCheck className="w-4 h-4" /> Save Module
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
