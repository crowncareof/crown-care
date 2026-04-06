'use client';
// app/admin/portfolio/page.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';
import ImageUploader from '@/components/admin/ImageUploader';

interface Portfolio {
  id: number; title: string; description?: string;
  beforeUrl: string; beforePublicId?: string;
  afterUrl: string; afterPublicId?: string;
  category?: string; featured: boolean; order: number;
}

const EMPTY = {
  title: '', description: '',
  beforeUrl: '', beforePublicId: '',
  afterUrl: '', afterPublicId: '',
  category: '', featured: false, order: 0,
};

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('crown_token') || '';

  const fetchItems = async () => {
    const res = await fetch('/api/portfolio');
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: Portfolio) => {
    setEditing(item);
    setForm({
      title: item.title, description: item.description || '',
      beforeUrl: item.beforeUrl, beforePublicId: item.beforePublicId || '',
      afterUrl: item.afterUrl, afterPublicId: item.afterPublicId || '',
      category: item.category || '', featured: item.featured, order: item.order,
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSave = async () => {
    if (!form.title || !form.beforeUrl || !form.afterUrl) {
      toast.error('Title, before, and after images are required'); return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/portfolio/${editing.id}` : '/api/portfolio';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? 'Item updated!' : 'Item created!');
      setShowModal(false);
      fetchItems();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this portfolio item?')) return;
    const res = await fetch(`/api/portfolio/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) { toast.success('Deleted'); fetchItems(); }
    else toast.error('Failed to delete');
  };

  return (
    <AdminShell title="Portfolio">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm font-body">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="btn-admin-gold">
          <FiPlus className="w-4 h-4" /> Add Before/After
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 font-body mb-4">No portfolio items yet.</p>
          <button onClick={openCreate} className="btn-admin-gold">Add First Item</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Before/After preview */}
              <div className="grid grid-cols-2 h-36">
                <div className="relative">
                  <Image src={item.beforeUrl} alt="Before" fill className="object-cover" sizes="200px" />
                  <span className="absolute bottom-2 left-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">BEFORE</span>
                </div>
                <div className="relative">
                  <Image src={item.afterUrl} alt="After" fill className="object-cover" sizes="200px" />
                  <span className="absolute bottom-2 right-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">AFTER</span>
                </div>
              </div>

              <div className="p-4">
                <div className="font-semibold text-navy-900 text-sm font-body">{item.title}</div>
                {item.category && (
                  <span className="inline-block mt-1 text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full font-body">{item.category}</span>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(item)} className="flex-1 btn-admin py-1.5 text-xs justify-center">
                    <FiEdit2 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-admin-danger py-1.5 px-3 text-xs">
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
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
              className="relative bg-white rounded-3xl shadow-premium-lg w-full max-w-lg overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="font-display font-bold text-navy-900 text-lg">
                  {editing ? 'Edit Portfolio Item' : 'New Portfolio Item'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-navy-800">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Living Room Sofa Restoration" className="input-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-base resize-none" placeholder="Brief description of the job..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Category</label>
                    <input name="category" value={form.category} onChange={handleChange} placeholder="Sofa, Rug, Chair..." className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Order</label>
                    <input type="number" name="order" value={form.order} onChange={handleChange} className="input-base" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-gold-500" />
                  <span className="text-sm font-medium text-navy-800 font-body">Show on homepage</span>
                </label>

                <ImageUploader
                  label="BEFORE Image *"
                  currentUrl={form.beforeUrl}
                  folder="portfolio/before"
                  onUpload={(url, publicId) => setForm((p) => ({ ...p, beforeUrl: url, beforePublicId: publicId }))}
                />
                <ImageUploader
                  label="AFTER Image *"
                  currentUrl={form.afterUrl}
                  folder="portfolio/after"
                  onUpload={(url, publicId) => setForm((p) => ({ ...p, afterUrl: url, afterPublicId: publicId }))}
                />
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-body">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-admin-gold justify-center">
                  {saving ? 'Saving…' : (editing ? 'Update Item' : 'Create Item')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
