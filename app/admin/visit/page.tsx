'use client';
// app/admin/visit/page.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminShell from '@/components/admin/AdminShell';

const FURNITURE = ['Sofa','Armchair','Mattress','Sectional','Ottoman','Other'];
const FABRICS   = ['Fabric','Velvet','Leather','Microfiber','Suede','Not sure'];
const VALUES    = ['$50–99','$100–149','$150–199','$200–299','$300+'];
const CONTACTS  = ['WhatsApp','Phone call','Email'];
const PROFILES  = [
  { key:'vip',       label:'VIP',       color:'bg-green-100 text-green-700 border-green-300',  desc:'Easy, loyal, pays well' },
  { key:'standard',  label:'Standard',  color:'bg-blue-100 text-blue-700 border-blue-300',     desc:'Normal client' },
  { key:'demanding', label:'Demanding', color:'bg-amber-100 text-amber-700 border-amber-300',  desc:'High expectations' },
  { key:'risk',      label:'At Risk',   color:'bg-red-100 text-red-700 border-red-300',        desc:'Issues or disputes' },
];
const FLAGS = [
  { key:'askedDiscount',       label:'Asked for discount' },
  { key:'complainedDuring',    label:'Complained during service' },
  { key:'difficultAccess',     label:'Difficult access/parking' },
  { key:'delayedPayment',      label:'Delayed payment' },
  { key:'referredSomeone',     label:'Referred someone' },
  { key:'leftReview',          label:'Left a review' },
  { key:'tippedTechnician',    label:'Tipped the technician' },
];

const STEPS = ['Client Info','Furniture','Service Details','Internal Eval','Review & Submit'];

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

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-gold-500 flex-1' : i < step ? 'bg-gold-300 w-6' : 'bg-gray-200 w-6'}`} />
      ))}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selected ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-gray-600 border-gray-200 hover:border-navy-400'}`}>
      {label}
    </button>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all ${value ? 'bg-navy-50 border-navy-300' : 'bg-white border-gray-200'}`}>
      <span className="text-sm font-medium text-navy-800 font-body">{label}</span>
      <div className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-navy-800' : 'bg-gray-200'}`}>
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
          className={`text-4xl transition-transform hover:scale-110 ${n <= value ? 'text-gold-500' : 'text-gray-200'}`}>★</button>
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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Visit Saved!</h2>
          <p className="text-gray-500 font-body mb-8">Client record updated successfully.</p>
          <button onClick={() => { setForm(EMPTY); setStep(0); setDone(false); }}
            className="btn-admin-gold">New Visit</button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Field Visit">
      <div className="max-w-lg mx-auto">
        <StepDots step={step} total={STEPS.length} />
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-navy-900">{STEPS[step]}</h2>
          <p className="text-gray-400 text-sm font-body">Step {step + 1} of {STEPS.length}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.2 }}>

            {/* STEP 0 */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Client full name" className="input-base text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Phone / WhatsApp *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" className="input-base text-lg" type="tel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@email.com" className="input-base text-lg" type="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Preferred contact</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTACTS.map(c => <Chip key={c} label={c} selected={form.preferredContact === c} onClick={() => set('preferredContact', c)} />)}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Item cleaned *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {FURNITURE.map(f => (
                      <button key={f} type="button" onClick={() => set('furnitureType', f)}
                        className={`p-4 rounded-2xl border text-sm font-medium transition-all ${form.furnitureType === f ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Fabric type *</label>
                  <div className="flex flex-wrap gap-2">
                    {FABRICS.map(f => <Chip key={f} label={f} selected={form.fabricType === f} onClick={() => set('fabricType', f)} />)}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <Toggle label="🐾 Pets at home" value={form.hasPets} onChange={v => set('hasPets', v)} />
                <Toggle label="👶 Children at home" value={form.hasChildren} onChange={v => set('hasChildren', v)} />
                <Toggle label="🛡️ Protection applied (Scotchgard)" value={form.protectionApplied} onChange={v => set('protectionApplied', v)} />
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Service value</label>
                  <div className="flex flex-wrap gap-2">
                    {VALUES.map(v => <Chip key={v} label={v} selected={form.serviceValue === v} onClick={() => set('serviceValue', v)} />)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Client satisfaction ⭐</label>
                  <StarSelector value={form.satisfactionScore} onChange={n => set('satisfactionScore', n)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Stain type, access code, special instructions..." className="input-base resize-none" />
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Client profile</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PROFILES.map(p => (
                      <button key={p.key} type="button" onClick={() => set('clientProfile', p.key)}
                        className={`p-4 rounded-2xl border text-left transition-all ${form.clientProfile === p.key ? p.color + ' border-2' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <div className="font-semibold text-sm">{p.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2 font-body">Flags</label>
                  <div className="space-y-2">
                    {FLAGS.map(f => (
                      <button key={f.key} type="button" onClick={() => toggleFlag(f.key)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${form.flags.includes(f.key) ? 'bg-navy-50 border-navy-300 text-navy-800' : 'bg-white border-gray-200 text-gray-600'}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${form.flags.includes(f.key) ? 'bg-navy-800' : 'border border-gray-300'}`}>
                          {form.flags.includes(f.key) && <FiCheck className="w-3 h-3 text-white" />}
                        </div>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Private note for next visit</label>
                  <textarea value={form.privateNote} onChange={e => set('privateNote', e.target.value)} rows={3} placeholder="e.g. Very picky about corners. Large dog. Gate code: 4821." className="input-base resize-none" />
                </div>
              </div>
            )}

            {/* STEP 4 — Summary */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 space-y-3 text-sm font-body">
                  {[
                    ['Name', form.name],
                    ['Phone', form.phone],
                    ['Contact', form.preferredContact],
                    ['Furniture', form.furnitureType],
                    ['Fabric', form.fabricType],
                    ['Pets', form.hasPets ? 'Yes' : 'No'],
                    ['Children', form.hasChildren ? 'Yes' : 'No'],
                    ['Protection', form.protectionApplied ? 'Yes' : 'No'],
                    ['Service Value', form.serviceValue],
                    ['Satisfaction', '★'.repeat(form.satisfactionScore)],
                    ['Profile', form.clientProfile],
                    ['Flags', form.flags.join(', ') || '—'],
                    ['Notes', form.notes || '—'],
                    ['Private Note', form.privateNote || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                      <span className="text-gray-400 w-28 flex-shrink-0">{label}</span>
                      <span className="text-navy-900 font-medium">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-admin flex items-center gap-2 px-6">
              <FiChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex-1 btn-admin-gold justify-center disabled:opacity-50">
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="flex-1 btn-admin-gold justify-center disabled:opacity-70">
              {saving ? 'Saving…' : '✓ Submit Visit'}
            </button>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
