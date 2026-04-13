'use client';
// components/upsell/UpsellEngine.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiDollarSign, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Suggestion {
  id: number;
  title: string;
  priceValue: number;
  description: string;
  script: string;
  priority: 'high' | 'normal';
}

interface Props {
  clientId?: number;
  appointmentId?: number;
  technicianName?: string;
  onUpsellAction?: (accepted: boolean, service: string, price: number) => void;
}

export default function UpsellEngine({ clientId, appointmentId, technicianName, onUpsellAction }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScript, setActiveScript] = useState<number | null>(null);
  const [tracked, setTracked] = useState<Record<number, 'accepted' | 'rejected'>>({});

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('crown_token') || '' : '';

  useEffect(() => {
    fetch('/api/upsells', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ clientId, currentServiceId: null }),
    })
      .then(r => r.json())
      .then(d => setSuggestions(d.suggestions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  const track = async (suggestion: Suggestion, status: 'accepted' | 'rejected') => {
    setTracked(p => ({ ...p, [suggestion.id]: status }));

    try {
      await fetch('/api/upsells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          leadId: clientId,
          appointmentId,
          serviceId: suggestion.id,
          serviceName: suggestion.title,
          price: suggestion.priceValue,
          status,
          offeredBy: technicianName,
        }),
      });

      if (status === 'accepted') {
        toast.success(`✅ Upsell accepted: ${suggestion.title} (+$${suggestion.priceValue})`);
      }

      onUpsellAction?.(status === 'accepted', suggestion.title, suggestion.priceValue);
    } catch {
      toast.error('Failed to track upsell');
    }
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2].map(i => <div key={i} className="h-24 bg-gray-700/30 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <FiDollarSign className="w-4 h-4 text-yellow-400" />
        <p className="text-sm font-semibold text-white font-body">Recommended Add-ons</p>
        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-body">Upsell</span>
      </div>

      {suggestions.map((s, i) => {
        const status = tracked[s.id];
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border p-4 transition-all ${
              status === 'accepted' ? 'border-emerald-500/40 bg-emerald-500/10' :
              status === 'rejected' ? 'border-gray-600/20 bg-gray-700/10 opacity-50' :
              s.priority === 'high' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-gray-600/20 bg-gray-700/20'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white font-body">{s.title}</p>
                <p className="text-xs text-gray-400 font-body mt-0.5">{s.description}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-lg font-bold text-yellow-400 font-display">${s.priceValue}</p>
                {s.priority === 'high' && <span className="text-xs text-yellow-400/70 font-body">🔥 Hot</span>}
              </div>
            </div>

            {/* Script toggle */}
            {!status && (
              <button
                onClick={() => setActiveScript(activeScript === s.id ? null : s.id)}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mb-2 font-body"
              >
                <FiMessageSquare className="w-3 h-3" />
                {activeScript === s.id ? 'Hide script' : 'Show sales script'}
              </button>
            )}

            <AnimatePresence>
              {activeScript === s.id && !status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-900/30 border border-blue-500/20 rounded-xl p-3 mb-3"
                >
                  <p className="text-xs text-gray-300 font-body italic">"{s.script}"</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!status ? (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => track(s, 'accepted')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-medium hover:bg-emerald-500/30 transition-all font-body"
                >
                  <FiCheck className="w-3.5 h-3.5" /> Accepted
                </button>
                <button
                  onClick={() => track(s, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-all font-body"
                >
                  <FiX className="w-3.5 h-3.5" /> Declined
                </button>
              </div>
            ) : (
              <div className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-body ${status === 'accepted' ? 'text-emerald-400' : 'text-gray-500'}`}>
                {status === 'accepted' ? <><FiCheck className="w-4 h-4" /> Added to visit</> : <><FiX className="w-4 h-4" /> Declined</>}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
