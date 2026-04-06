'use client';
// app/admin/settings/page.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiPhone, FiMail, FiMapPin, FiMessageCircle, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

interface Settings { [key: string]: string }

const FIELDS = [
  { section: 'Company Info', items: [
    { key: 'company_name',    label: 'Company Name',    icon: FiMapPin,        placeholder: 'Crown Care Services',   type: 'text' },
    { key: 'company_phone',   label: 'Phone Number',    icon: FiPhone,         placeholder: '(555) 123-4567',        type: 'text' },
    { key: 'company_email',   label: 'Email Address',   icon: FiMail,          placeholder: 'info@crowncare.com',    type: 'email' },
    { key: 'company_address', label: 'Address / Area',  icon: FiMapPin,        placeholder: 'Nationwide, USA',       type: 'text' },
    { key: 'whatsapp_number', label: 'WhatsApp Number', icon: FiMessageCircle, placeholder: '15551234567 (no spaces or +)', type: 'text' },
  ]},
  { section: 'Social Media', items: [
    { key: 'social_facebook',  label: 'Facebook URL',  icon: FiFacebook,  placeholder: 'https://facebook.com/crowncare',  type: 'url' },
    { key: 'social_instagram', label: 'Instagram URL', icon: FiInstagram, placeholder: 'https://instagram.com/crowncare', type: 'url' },
    { key: 'social_twitter',   label: 'Twitter URL',   icon: FiTwitter,   placeholder: 'https://twitter.com/crowncare',   type: 'url' },
    { key: 'social_tiktok',    label: 'TikTok URL',    icon: FiMessageCircle, placeholder: 'https://tiktok.com/@crowncare', type: 'url' },
  ]},
  { section: 'Footer', items: [
    { key: 'copyright_text', label: 'Copyright Text', icon: FiMapPin, placeholder: '© 2025 Crown Care. All rights reserved.', type: 'text' },
  ]},
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('crown_token') || '';

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => { setSettings(d.settings || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Settings saved! Changes appear on the site immediately.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Settings" adminOnly>
      <div className="max-w-2xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {FIELDS.map(({ section, items }, si) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
                  <h3 className="font-display font-semibold text-navy-900">{section}</h3>
                </div>
                <div className="p-6 space-y-4">
                  {items.map(({ key, label, icon: Icon, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={type}
                          value={settings[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={placeholder}
                          className="input-base pl-11"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div className="flex justify-end pb-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-admin-gold text-base px-8 py-3 disabled:opacity-70"
              >
                {saving ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving…</>
                ) : (
                  <><FiSave className="w-4 h-4" /> Save All Settings</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
