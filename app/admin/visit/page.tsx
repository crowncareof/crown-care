'use client';
// app/admin/visit/page.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';
import UpsellEngine from '@/components/upsell/UpsellEngine';

const FURNITURE = ['Sofa','Armchair','Mattress','Sectional','Ottoman','Other'];
const FABRICS   = ['Fabric','Velvet','Leather','Microfiber','Suede','Not sure'];
const VALUES    = ['$50–99','$100–149','$150–199','$200–299','$300+'];
const CONTACTS  = ['WhatsApp','Phone call','Email'];
const PROFILES  = [
  { key:'vip',       label:'VIP',       color:'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', desc:'Easy, loyal, pays well' },
  { key:'standard',  label:'Standard',  color:'bg-blue-500/20 text-blue-400 border-blue-500/40',          desc:'Normal client' },
  { key:'demanding', label:'Demanding', color:'bg-amber-500/20 text-amber-400 border-amber-500/40',       desc:'High expectations' },
  { key:'risk',      label:'At Risk',   color:'bg-red-500/20 text-red-400 border-red-500/40',             desc:'Issues or disputes' },
];
const FLAGS = [
  { key:'askedDiscount',    label:'Asked for discount' },
  { key:'complainedDuring', label:'Complained during service' },
  { key:'difficultAccess',  label:'Difficult access/parking' },
  { key:'delayedPayment',   label:'Delayed payment' },
  { key:'referredSomeone',  label:'Referred someone' },
  { key:'leftReview',       label:'Left a review' },
  { key:'tippedTechnician', label:'Tipped the technician' },
];

const STEPS = ['Client Info','Service Details','Upsells','Internal Eval','Review & Submit'];

interface FormData {
  name: string; phone: string; email: string; preferredContact: string;
  furnitureType: string; fabricType: string;
  hasPets: boolean; hasChildren: boolean; protectionApplied: boolean;
  serviceValue: string; satisfactionScore: number;
  notes: string; clientProfile: string;
  flags: string[]; privateNote: string;
}

const EMPTY: FormData = {
  name:'', phone:'', email:'', preferredContact:'WhatsApp',
  furnitureType:'', fabricType:'',
  hasPets:false, hasChildren:false, protectionApplied:false,
  serviceValue:'', satisfactionScore:5,
  notes:'', clientProfile:'standard',
  flags:[], privateNote:'',
};

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all font-body ${selected ? 'bg-yellow-500 text-navy-900 border-yellow-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}`}>
      {label}
    </button>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all ${value ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
      <span className="text-sm font-medium font-body text-white">{label}</span>
      <div className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-yellow-500' : 'bg-gray-600'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
      </div>
    </button>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-3 justify-center">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`text-4xl transition-transform hover:scale-110 ${n <= value ? 'text-yellow-400' : 'text-gray-700'}`}>★</button>
      ))}
    </div>
  );
}

export default function VisitPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const token = () => localStorage.getItem('crown_token') || '';
  const set = (k: keyof FormData, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const toggleFlag = (key: string) => {
    setForm(p => ({ ...p, flags: p.flags.includes(key) ? p.flags.filter(f => f !== key) : [...p.flags, key] }));
  };

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.phone.trim();
    if (step === 1) return form.furnitureType && form.fabricType;
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, internalFlags: JSON.stringify(form.flags) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      toast.success('Visit saved!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving visit');
    } finally { setSaving(false); }
  };

  if (done) {
    return (
      <AdminShell title="Field Visit">
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Visit Saved!</h2>
          <p className="text-gray-400 font-body mb-8">Client record updated successfully.</p>
          <button onClick={() => { setForm(EMPTY); setStep(0); setDone(false); }}
            className="btn-admin-gold">New Visit</button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Field Visit">
      <div className="max-w-lg mx-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-yellow-500 flex-1' : i < step ? 'bg-yellow-500/40 w-6' : 'bg-gray-700 w-6'}`} />
          ))}
        </div>

        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-white">{STEPS[step]}</h2>
          <p className="text-gray-500 text-sm font-body">Step {step + 1} of {STEPS.length}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>

            {/* STEP 0 — Client Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Client full name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg font-body focus:outline-none focus:border-yellow-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Phone / WhatsApp *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" type="tel"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg font-body focus:outline-none focus:border-yellow-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Email <span className="text-gray-500 font-normal">(optional)</span></label>
                  <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@email.com" type="email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg font-body focus:outline-none focus:border-yellow-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Preferred contact</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTACTS.map(c => <Chip key={c} label={c} selected={form.preferredContact === c} onClick={() => set('preferredContact', c)} />)}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 — Service Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Item cleaned *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {FURNITURE.map(f => (
                      <button key={f} type="button" onClick={() => set('furnitureType', f)}
                        className={`p-4 rounded-2xl border text-sm font-medium transition-all font-body ${form.furnitureType === f ? 'bg-yellow-500 text-navy-900 border-yellow-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Fabric type *</label>
                  <div className="flex flex-wrap gap-2">
                    {FABRICS.map(f => <Chip key={f} label={f} selected={form.fabricType === f} onClick={() => set('fabricType', f)} />)}
                  </div>
                </div>
                <Toggle label="🐾 Pets at home" value={form.hasPets} onChange={v => set('hasPets', v)} />
                <Toggle label="👶 Children at home" value={form.hasChildren} onChange={v => set('hasChildren', v)} />
                <Toggle label="🛡️ Protection applied (Scotchgard)" value={form.protectionApplied} onChange={v => set('protectionApplied', v)} />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Service value</label>
                  <div className="flex flex-wrap gap-2">
                    {VALUES.map(v => <Chip key={v} label={v} selected={form.serviceValue === v} onClick={() => set('serviceValue', v)} />)}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Upsells */}
            {step === 2 && (
              <div className="space-y-5">
                <UpsellEngine technicianName={user?.name} />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Client satisfaction ⭐</label>
                  <StarSelector value={form.satisfactionScore} onChange={n => set('satisfactionScore', n)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                    placeholder="Stain type, access code, special instructions..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-yellow-500 transition-colors resize-none" />
                </div>
              </div>
            )}

            {/* STEP 3 — Internal Eval */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Client profile</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PROFILES.map(p => (
                      <button key={p.key} type="button" onClick={() => set('clientProfile', p.key)}
                        className={`p-4 rounded-2xl border text-left transition-all ${form.clientProfile === p.key ? p.color + ' border-2' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                        <div className="font-semibold text-sm text-white">{p.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Flags</label>
                  <div className="space-y-2">
                    {FLAGS.map(f => (
                      <button key={f.key} type="button" onClick={() => toggleFlag(f.key)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${form.flags.includes(f.key) ? 'bg-yellow-500/10 border-yellow-500/30 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${form.flags.includes(f.key) ? 'bg-yellow-500' : 'border border-gray-600'}`}>
                          {form.flags.includes(f.key) && <FiCheck className="w-3 h-3 text-navy-900" />}
                        </div>
                        <span className="font-body">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 font-body">Private note for next visit</label>
                  <textarea value={form.privateNote} onChange={e => set('privateNote', e.target.value)} rows={3}
                    placeholder="e.g. Very picky about corners. Large dog. Gate code: 4821."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-yellow-500 transition-colors resize-none" />
                </div>
              </div>
            )}

            {/* STEP 4 — Summary */}
            {step === 4 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 space-y-3 text-sm font-body">
                {[
                  ['Name', form.name], ['Phone', form.phone], ['Email', form.email || '—'],
                  ['Contact', form.preferredContact], ['Furniture', form.furnitureType],
                  ['Fabric', form.fabricType], ['Pets', form.hasPets ? 'Yes' : 'No'],
                  ['Children', form.hasChildren ? 'Yes' : 'No'],
                  ['Protection', form.protectionApplied ? 'Yes' : 'No'],
                  ['Service Value', form.serviceValue || '—'],
                  ['Satisfaction', '★'.repeat(form.satisfactionScore)],
                  ['Profile', form.clientProfile],
                  ['Flags', form.flags.length > 0 ? form.flags.join(', ') : '—'],
                  ['Notes', form.notes || '—'],
                  ['Private Note', form.privateNote || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-gray-500 w-28 flex-shrink-0">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-body hover:bg-gray-700 transition-all">
              <FiChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-navy-900 font-semibold rounded-xl px-6 py-3 text-sm hover:bg-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-body">
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-navy-900 font-semibold rounded-xl px-6 py-3 text-sm hover:bg-yellow-400 transition-all disabled:opacity-70 font-body">
              {saving ? 'Saving…' : <><FiCheck className="w-4 h-4" /> Submit Visit</>}
            </button>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

// Need user in visit form for upsell tech name
declare const user: { name: string } | undefined;
