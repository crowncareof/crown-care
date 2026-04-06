'use client';
// components/sections/CTASection.tsx
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiSend, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { whatsappLink } from '@/lib/utils';

const SERVICES_LIST = [
  'Sofa Deep Cleaning',
  'Armchair & Chair Cleaning',
  'Mattress Sanitization',
  'Area Rug Cleaning',
  'Car Upholstery Detailing',
  'Office Furniture Cleaning',
  'Other / Custom',
];

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('🎉 Message sent! We\'ll contact you within 24 hours.');
      setForm({ name: '', email: '', phone: '', service: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try WhatsApp instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="inline-block bg-gold-500/10 text-gold-600 text-sm font-semibold px-4 py-2 rounded-full mb-4 tracking-wide uppercase">
            Get Started
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy-900 mb-4 section-title section-title-center">
            Request Your Free Quote
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-body">
            Fill out the form below and we'll get back to you within 24 hours with a
            no-obligation quote tailored to your needs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-navy-gradient rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10"
                style={{background: 'radial-gradient(circle, #d4a017 0%, transparent 70%)'}} />

              <h3 className="font-display text-2xl font-bold mb-2">Crown Care</h3>
              <p className="text-white/60 text-sm mb-8 font-body">Premium Upholstery Cleaning</p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiPhone className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">Phone</div>
                    <a href="tel:+15551234567" className="text-white font-medium hover:text-gold-400 transition-colors font-body">
                      (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">Email</div>
                    <a href="mailto:info@crowncare.com" className="text-white font-medium hover:text-gold-400 transition-colors font-body">
                      info@crowncare.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">Service Area</div>
                    <p className="text-white font-medium font-body">Nationwide, USA</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/50 text-xs mb-3 font-body">Prefer instant messaging?</p>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-whatsapp text-white font-semibold px-5 py-3 rounded-2xl hover:opacity-90 transition-opacity font-body text-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.876L0 24l6.292-1.519A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.784 9.784 0 01-5.028-1.386l-.36-.214-3.734.902.934-3.635-.235-.374A9.787 9.787 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182 17.43 2.182 21.818 6.57 21.818 12c0 5.43-4.388 9.818-9.818 9.818z"/></svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Working hours */}
            <div className="card-premium p-6">
              <h4 className="font-display font-semibold text-navy-900 mb-4">Working Hours</h4>
              <div className="space-y-2 text-sm font-body">
                {[
                  { day: 'Mon – Fri', hours: '7:00 AM – 7:00 PM' },
                  { day: 'Saturday', hours: '8:00 AM – 5:00 PM' },
                  { day: 'Sunday', hours: '9:00 AM – 3:00 PM' },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between text-gray-600">
                    <span className="font-medium text-navy-800">{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="card-premium p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="input-base"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 000-0000"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Service Needed</label>
                  <select name="service" value={form.service} onChange={handleChange} className="input-base">
                    <option value="">Select a service...</option>
                    {SERVICES_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5 font-body">Your Message *</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your furniture, any specific stains or concerns, and your preferred schedule..."
                  className="input-base resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <FiSend className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center font-body">
                We typically respond within 2–4 business hours. No spam, ever.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
