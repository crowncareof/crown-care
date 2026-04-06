'use client';
// app/admin/testimonials/page.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

interface Testimonial {
  id: number; name: string; location?: string;
  rating: number; comment: string; featured: boolean;
}

const EMPTY = { name: '', location: '', rating: 5, comment: '', featured: true };

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`transition-colors ${n <= value ? 'text-gold-500' : 'text-gray-200'}`}>
          <FiStar className={`w-6 h-6 ${n <= value ? 'fill-gold-500' : ''}`} />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('crown_token') || '';

  const fetchItems = async () => {
    const res = await fetch('/api/testimonials', { headers: { Authorization: `Bearer ${token()}` } });
    const data = await res.json();
    setItems(data.testimonials || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, location: t.location || '', rating: t.rating, comment: t.comment, featured: t.featured });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.comment.trim()) {
      toast.error('Name and comment are required'); return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/testimonials/${editing.id}` : '/api/testimonials';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? 'Testimonial updated!' : 'Testimonial created!');
      setShowModal(false);
      fetchItems();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return;
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) { toast.success('Deleted'); fetchItems(); }
    else toast.error('Failed to delete');
  };

  return (
    <AdminShell title="Testimonials">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm font-body">{items.length} testimonial{items.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="btn-admin-gold">
          <FiPlus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 font-body mb-4">No testimonials yet.</p>
          <button onClick={openCreate} className="btn-admin-gold">Add First Testimonial</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy-800 text-white rounded-xl flex items-center justify-center font-bold text-sm font-body">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm font-body">{t.name}</div>
                    {t.location && <div className="text-xs text-gray-400 font-body">{t.location}</div>}
                  </div>
                </div>
                {t.featured && (
                  <span className="text-xs bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full font-body border border-gold-200">Featured</span>
                )}
              </div>

              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, n) => (
                  <FiStar key={n} className={`w-3.5 h-3.5 ${n < t.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200'}`} />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed font-body line-clamp-3 mb-4">"{t.comment}"</p>

              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="flex-1 btn-admin py-1.5 text-xs justify-center">
                  <FiEdit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(t.id)} className="btn-admin-danger py-1.5 px-3 text-xs">
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-premium-lg w-full max-w-md overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="font-display font-bold text-navy-900 text-lg">
                  {editing ? 'Edit Testimonial' : 'New Testimonial'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-navy-800">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Client Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Sarah Mitchell" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Location</label>
                    <input name="location" value={form.location} onChange={handleChange} placeholder="Beverly Hills, CA" className="input-base" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Rating</label>
                  <StarSelector value={form.rating} onChange={(n) => setForm((p) => ({ ...p, rating: n }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Comment *</label>
                  <textarea name="comment" value={form.comment} onChange={handleChange} rows={4} placeholder="What did the client say about your service?" className="input-base resize-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-gold-500" />
                  <span className="text-sm font-medium text-navy-800 font-body">Show on homepage</span>
                </label>
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-body">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-admin-gold justify-center">
                  {saving ? 'Saving…' : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
