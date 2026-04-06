'use client';
// app/admin/team/page.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiMail, FiLock, FiShield, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

interface TeamUser { id: number; name: string; email: string; role: string; active: boolean; createdAt: string }
const EMPTY = { name: '', email: '', password: '', role: 'collaborator' };

export default function TeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const token = () => localStorage.getItem('crown_token') || '';

  useEffect(() => {
    const u = localStorage.getItem('crown_user');
    if (u) setCurrentUserId(JSON.parse(u).id);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/team', { headers: { Authorization: `Bearer ${token()}` } });
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (u: TeamUser) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!editing && !form.password) { toast.error('Password is required'); return; }
    setSaving(true);
    try {
      const body: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;
      const url = editing ? `/api/team/${editing.id}` : '/api/team';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? 'User updated!' : 'User created!');
      setShowModal(false);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally { setSaving(false); }
  };

  const toggleActive = async (u: TeamUser) => {
    if (u.id === currentUserId) { toast.error('Cannot deactivate yourself'); return; }
    const res = await fetch(`/api/team/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ active: !u.active }),
    });
    if (res.ok) { toast.success(u.active ? 'User deactivated' : 'User activated'); fetchUsers(); }
  };

  const handleDelete = async (u: TeamUser) => {
    if (u.id === currentUserId) { toast.error('Cannot delete yourself'); return; }
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/team/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { toast.success('User deleted'); fetchUsers(); }
    else toast.error((await res.json()).error || 'Failed to delete');
  };

  return (
    <AdminShell title="Team" adminOnly>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm font-body">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="btn-admin-gold"><FiPlus className="w-4 h-4" /> Add Member</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body">Member</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body hidden sm:table-cell">Role</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-navy-800 font-body hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-navy-800 font-body hidden lg:table-cell">Joined</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-navy-800 font-body">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-navy-800 text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-navy-900 font-body flex items-center gap-2">
                            {u.name}
                            {u.id === currentUserId && <span className="text-xs text-gray-400">(you)</span>}
                          </div>
                          <div className="text-gray-400 text-xs font-body">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-body border ${
                        u.role === 'admin'
                          ? 'bg-gold-50 text-gold-700 border-gold-200'
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        <FiShield className="w-3 h-3" />
                        {u.role === 'admin' ? 'Admin' : 'Collaborator'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <button onClick={() => toggleActive(u)} className="transition-colors">
                        {u.active
                          ? <FiToggleRight className="w-6 h-6 text-green-500 hover:text-green-600 inline" />
                          : <FiToggleLeft className="w-6 h-6 text-gray-300 hover:text-gray-400 inline" />}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs font-body hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="btn-admin py-1.5 px-3 text-xs">
                          <FiEdit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        {u.id !== currentUserId && (
                          <button onClick={() => handleDelete(u)} className="btn-admin-danger py-1.5 px-3 text-xs">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-premium-lg w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="font-display font-bold text-navy-900 text-lg">
                  {editing ? 'Edit Member' : 'New Team Member'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-navy-800"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" className="input-base pl-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@crowncare.com" className="input-base pl-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">
                    Password {editing && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="input-base pl-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Role *</label>
                  <div className="relative">
                    <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select name="role" value={form.role} onChange={handleChange} className="input-base pl-11">
                      <option value="collaborator">Collaborator — Services, Portfolio, Testimonials</option>
                      <option value="admin">Admin — Full Access</option>
                    </select>
                  </div>
                </div>

                {/* Role info box */}
                <div className={`rounded-xl p-3 text-xs font-body ${form.role === 'admin' ? 'bg-gold-50 text-gold-700' : 'bg-blue-50 text-blue-600'}`}>
                  {form.role === 'admin'
                    ? '⚠️ Admin has full access: settings, team management, leads, and all content.'
                    : '✅ Collaborator can only manage services, portfolio, and testimonials.'}
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-body">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-admin-gold justify-center">
                  {saving ? 'Saving…' : (editing ? 'Update Member' : 'Create Member')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
