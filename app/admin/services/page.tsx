'use client';
// app/admin/services/page.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';
import ImageUploader from '@/components/admin/ImageUploader';

interface Service {
  id: number; title: string; description: string;
  imageUrl?: string; imagePublicId?: string;
  price?: string; duration?: string; featured: boolean; order: number;
}

const EMPTY: Omit<Service, 'id'> = {
  title: '', description: '', imageUrl: '', imagePublicId: '',
  price: '', duration: '', featured: false, order: 0,
};

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Omit<Service, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('crown_token') || '';

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description, imageUrl: s.imageUrl || '', imagePublicId: s.imagePublicId || '', price: s.price || '', duration: s.duration || '', featured: s.featured, order: s.order });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required'); return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/services/${editing.id}` : '/api/services';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? 'Service updated!' : 'Service created!');
      setShowModal(false);
      fetchServices();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving service');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) { toast.success('Service deleted'); fetchServices(); }
    else toast.error('Failed to delete');
  };

  return (
    <AdminShell title="Services">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm font-body">{services.length} service{services.length !== 1 ? 's' : ''} total</p>
        <button onClick={openCreate} className="btn-admin-gold">
          <FiPlus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-body">No services yet. Add your first service!</p>
          <button onClick={openCreate} className="btn-admin-gold mt-4">Add Service</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body">Service</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body hidden md:table-cell">Price</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body hidden lg:table-cell">Duration</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-navy-800 font-body hidden sm:table-cell">Featured</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-navy-800 font-body">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-navy-900 font-body">{s.title}</div>
                      <div className="text-gray-400 text-xs font-body mt-0.5 max-w-xs truncate">{s.description}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-body hidden md:table-cell">{s.price || '—'}</td>
                    <td className="px-5 py-4 text-gray-600 font-body hidden lg:table-cell">{s.duration || '—'}</td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      {s.featured ? <FiStar className="w-4 h-4 text-gold-500 inline" /> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="btn-admin py-1.5 px-3 text-xs">
                          <FiEdit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="btn-admin-danger py-1.5 px-3 text-xs">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-premium-lg w-full max-w-lg overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="font-display font-bold text-navy-900 text-lg">
                  {editing ? 'Edit Service' : 'New Service'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-navy-800 transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Sofa Deep Cleaning" className="input-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe this service..." className="input-base resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Price</label>
                    <input name="price" value={form.price} onChange={handleChange} placeholder="From $89" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Duration</label>
                    <input name="duration" value={form.duration} onChange={handleChange} placeholder="2–3 hours" className="input-base" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Display Order</label>
                  <input type="number" name="order" value={form.order} onChange={handleChange} className="input-base" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="w-4 h-4 accent-gold-500 rounded"
                  />
                  <span className="text-sm font-medium text-navy-800 font-body">Mark as Featured (shows "Popular" badge)</span>
                </label>
                <ImageUploader
                  label="Service Image"
                  currentUrl={form.imageUrl}
                  folder="services"
                  onUpload={(url, publicId) => setForm((p) => ({ ...p, imageUrl: url, imagePublicId: publicId }))}
                />
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-body">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-admin-gold justify-center">
                  {saving ? 'Saving…' : (editing ? 'Update Service' : 'Create Service')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
