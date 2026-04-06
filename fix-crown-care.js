// fix-crown-care.js
// Execute na raiz do projeto: node fix-crown-care.js

const fs = require('fs');
const path = require('path');

const files = {};

// ── prisma/schema.prisma ─────────────────────────────────────────────────────
files['prisma/schema.prisma'] = `// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Setting {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}

model Service {
  id            Int      @id @default(autoincrement())
  title         String
  description   String
  imageUrl      String?
  imagePublicId String?
  price         String?
  duration      String?
  featured      Boolean  @default(false)
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Portfolio {
  id             Int      @id @default(autoincrement())
  title          String
  description    String?
  beforeUrl      String
  beforePublicId String?
  afterUrl       String
  afterPublicId  String?
  category       String?
  featured       Boolean  @default(false)
  order          Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Testimonial {
  id        Int      @id @default(autoincrement())
  name      String
  location  String?
  rating    Int      @default(5)
  comment   String
  avatarUrl String?
  featured  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Lead {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  phone     String?
  service   String?
  message   String
  status    String   @default("new")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

// ── app/api/auth/me/route.ts ─────────────────────────────────────────────────
files['app/api/auth/me/route.ts'] = `// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!user.active) return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });

  return NextResponse.json({ user });
}
`;

// ── app/api/auth/login/route.ts ──────────────────────────────────────────────
files['app/api/auth/login/route.ts'] = `// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    if (!user.active) return NextResponse.json({ error: 'Account deactivated. Contact an admin.' }, { status: 403 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, active: user.active },
      token,
    });

    response.cookies.set('crown_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
`;

// ── app/api/team/route.ts ────────────────────────────────────────────────────
files['app/api/team/route.ts'] = `// app/api/team/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    if (role && !['admin', 'collaborator'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || 'collaborator', active: true },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
`;

// ── app/api/team/[id]/route.ts ───────────────────────────────────────────────
files['app/api/team/[id]/route.ts'] = `// app/api/team/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import bcrypt from 'bcryptjs';

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id);
  const { name, email, role, active, password } = await req.json();

  if (id === payload.userId && role === 'collaborator') {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role) updateData.role = role;
  if (typeof active === 'boolean') updateData.active = active;
  if (password) updateData.password = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = authenticate(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id);
  if (id === payload.userId) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
`;

// ── app/admin/team/page.tsx ──────────────────────────────────────────────────
files['app/admin/team/page.tsx'] = `'use client';
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
    try {
      const res = await fetch('/api/team', { headers: { Authorization: \`Bearer \${token()}\` } });
      const text = await res.text();
      if (!text || !text.trim()) { setLoading(false); return; }
      const data = JSON.parse(text);
      if (data.error) toast.error(data.error);
      else setUsers(data.users || []);
    } catch (err) {
      console.error('fetchUsers error:', err);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
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
      const url = editing ? \`/api/team/\${editing.id}\` : '/api/team';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token()}\` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editing ? 'User updated!' : 'User created!');
      setShowModal(false);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving user');
    } finally { setSaving(false); }
  };

  const toggleActive = async (u: TeamUser) => {
    if (u.id === currentUserId) { toast.error('Cannot deactivate yourself'); return; }
    const res = await fetch(\`/api/team/\${u.id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token()}\` },
      body: JSON.stringify({ active: !u.active }),
    });
    if (res.ok) { toast.success(u.active ? 'User deactivated' : 'User activated'); fetchUsers(); }
    else toast.error('Failed to update status');
  };

  const handleDelete = async (u: TeamUser) => {
    if (u.id === currentUserId) { toast.error('Cannot delete yourself'); return; }
    if (!confirm(\`Delete \${u.name}? This cannot be undone.\`)) return;
    const res = await fetch(\`/api/team/\${u.id}\`, {
      method: 'DELETE',
      headers: { Authorization: \`Bearer \${token()}\` },
    });
    if (res.ok) { toast.success('User deleted'); fetchUsers(); }
    else toast.error('Failed to delete user');
  };

  return (
    <AdminShell title="Team" adminOnly>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm font-body">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="btn-admin-gold">
          <FiPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiUser className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-body mb-4">No team members yet.</p>
          <button onClick={openCreate} className="btn-admin-gold">Add First Member</button>
        </div>
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
                      <span className={\`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-body border \${
                        u.role === 'admin' ? 'bg-gold-50 text-gold-700 border-gold-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                      }\`}>
                        <FiShield className="w-3 h-3" />
                        {u.role === 'admin' ? 'Admin' : 'Collaborator'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <button onClick={() => toggleActive(u)}>
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
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-navy-800">
                  <FiX className="w-5 h-5" />
                </button>
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
                <div className={\`rounded-xl p-3 text-xs font-body \${form.role === 'admin' ? 'bg-gold-50 text-gold-700' : 'bg-blue-50 text-blue-600'}\`}>
                  {form.role === 'admin'
                    ? '⚠️ Admin has full access: settings, team management, leads, and all content.'
                    : '✅ Collaborator can only manage services, portfolio, and testimonials.'}
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-body">
                  Cancel
                </button>
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
`;

// ── Write all files ──────────────────────────────────────────────────────────
let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('✅ ' + filePath);
  count++;
}

console.log('\n🎉 ' + count + ' files written successfully!');
console.log('\nNow run:');
console.log('  npx prisma db push');
console.log('  npx prisma generate');
console.log('  npm run dev');
