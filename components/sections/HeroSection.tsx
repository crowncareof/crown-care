'use client';
// components/sections/HeroSection.tsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { whatsappLink } from '@/lib/utils';

function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(pos, 2), 98));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-3xl overflow-hidden cursor-ew-resize select-none shadow-premium-lg group before-after-slider"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* AFTER image (base layer) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50" />
          <div className="relative z-10 p-8">
            <div className="w-32 h-24 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl mx-auto mb-3" style={{background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)'}} />
            <p className="text-navy-800 font-display text-2xl font-bold">AFTER</p>
            <p className="text-navy-600 text-sm mt-1">Professionally Restored</p>
          </div>
        </div>
        {/* Realistic "after" placeholder */}
        <div className="absolute inset-0">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(160deg, #f8faff 0%, #e8f0fe 30%, #dbeafe 60%, #bfdbfe 100%)'
          }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-3/4 h-3/5 rounded-2xl shadow-xl" style={{background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 40%, #3b82f6 100%)', opacity: 0.3}} />
            <span className="absolute bottom-6 right-6 bg-white/90 text-navy-800 font-display font-bold text-lg px-4 py-2 rounded-xl shadow-md">AFTER ✓</span>
          </div>
        </div>
      </div>

      {/* BEFORE image (clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <div className="absolute inset-0">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(160deg, #fef9f0 0%, #fef3c7 30%, #fde68a 60%, #d97706 100%)',
            opacity: 0.4
          }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-3/4 h-3/5 rounded-2xl shadow-xl" style={{background: 'linear-gradient(135deg, #d97706 0%, #92400e 50%, #78350f 100%)', opacity: 0.4}} />
            <span className="absolute bottom-6 left-6 bg-white/90 text-navy-800 font-display font-bold text-lg px-4 py-2 rounded-xl shadow-md">BEFORE</span>
          </div>
          {/* Stain effect overlay */}
          <div className="absolute inset-0 opacity-25" style={{
            backgroundImage: 'radial-gradient(ellipse at 40% 50%, #92400e 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, #78350f 0%, transparent 40%)'
          }} />
        </div>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gold-400">
          <svg className="w-5 h-5 text-navy-800" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5l-5 5 5 5M12 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm opacity-80 group-hover:opacity-0 transition-opacity pointer-events-none">
        ← Drag to Compare →
      </div>

      {/* Input range overlay for accessibility */}
      <input
        type="range"
        min={2}
        max={98}
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label="Before/after comparison slider"
      />
    </div>
  );
}

const stats = [
  { value: '500+', label: 'Happy Clients' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '5★', label: 'Average Rating' },
  { value: '8yr', label: 'Experience' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-premium-gradient noise-overlay pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-10"
          style={{background: 'radial-gradient(circle, #d4a017 0%, transparent 70%)'}} />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-5"
          style={{background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'}} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 text-gold-400 text-sm font-medium px-4 py-2 rounded-full mb-6"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                ))}
              </div>
              Trusted by 500+ Homeowners
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6"
            >
              Your Furniture{' '}
              <span className="text-gold-shimmer">Deserves</span>{' '}
              the Crown Treatment
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/70 text-lg sm:text-xl leading-relaxed mb-8 font-body max-w-xl"
            >
              Professional upholstery cleaning that restores your sofas, chairs, and mattresses
              to their original beauty — safe for kids, pets, and the planet.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <a href="#contact" className="btn-primary text-base animate-pulse-gold">
                Get Free Quote <FiArrowRight className="w-5 h-5" />
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.876L0 24l6.292-1.519A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.784 9.784 0 01-5.028-1.386l-.36-.214-3.734.902.934-3.635-.235-.374A9.787 9.787 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182 17.43 2.182 21.818 6.57 21.818 12c0 5.43-4.388 9.818-9.818 9.818z"/></svg>
                WhatsApp Us
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-4 gap-4 pt-8 border-t border-white/10"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-2xl sm:text-3xl font-bold text-gold-400">{stat.value}</div>
                  <div className="text-white/50 text-xs mt-0.5 font-body">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Slider side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative px-4 sm:px-0"
          >
            <BeforeAfterSlider />
            {/* Floating badge — hidden on very small screens to avoid overflow */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex absolute -top-4 -left-4 bg-white rounded-2xl shadow-premium px-4 py-3 items-center gap-3"
            >
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-navy-900 font-semibold text-sm font-body">100% Safe</div>
                <div className="text-gray-500 text-xs">Eco-friendly products</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="hidden sm:flex absolute -bottom-4 -right-4 bg-navy-800 rounded-2xl shadow-premium px-4 py-3 items-center gap-3"
            >
              <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center">
                <span className="text-gold-400 text-xl">⚡</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm font-body">Fast Dry Time</div>
                <div className="text-white/50 text-xs">Ready in 2–4 hours</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 sm:h-20">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
