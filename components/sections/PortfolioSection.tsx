'use client';
// components/sections/PortfolioSection.tsx
import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Portfolio } from '@prisma/client';

function PortfolioSlider({ item }: { item: Portfolio }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(Math.max(p, 2), 98));
  };

  return (
    <div className="group cursor-pointer">
      <div
        ref={ref}
        className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none before-after-slider"
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* AFTER */}
        <div className="absolute inset-0">
          <Image
            src={item.afterUrl}
            alt={`${item.title} — After`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <span className="absolute bottom-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            AFTER
          </span>
        </div>

        {/* BEFORE */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={item.beforeUrl}
            alt={`${item.title} — Before`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            BEFORE
          </span>
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gold-400">
            <svg className="w-4 h-4 text-navy-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
            </svg>
          </div>
        </div>

        <input
          type="range" min={2} max={98} value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>

      <div className="mt-3 px-1">
        <h3 className="font-display font-semibold text-navy-900 text-base">{item.title}</h3>
        {item.description && (
          <p className="text-gray-500 text-sm mt-1 font-body">{item.description}</p>
        )}
        {item.category && (
          <span className="inline-block mt-2 text-xs bg-navy-50 text-navy-600 px-2.5 py-1 rounded-full font-medium">
            {item.category}
          </span>
        )}
      </div>
    </div>
  );
}

// Fallback items for when DB is empty
const FALLBACK_ITEMS: Partial<Portfolio>[] = [
  {
    id: 1,
    title: 'Living Room Sectional',
    description: 'Deep cleaning removed years of built-up grime',
    category: 'Sofa',
    beforeUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  },
  {
    id: 2,
    title: 'Velvet Armchair',
    description: 'Restored original color and soft texture',
    category: 'Chair',
    beforeUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  },
  {
    id: 3,
    title: 'Persian Area Rug',
    description: 'Vivid colors brought back to life',
    category: 'Rug',
    beforeUrl: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
  },
];

interface Props {
  items: Portfolio[];
}

export default function PortfolioSection({ items }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const displayItems = items.length > 0 ? items : (FALLBACK_ITEMS as Portfolio[]);

  return (
    <section id="portfolio" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-gold-500/10 text-gold-600 text-sm font-semibold px-4 py-2 rounded-full mb-4 tracking-wide uppercase">
            Our Work
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy-900 mb-4 section-title section-title-center">
            See the Difference
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-body">
            Drag the slider on each image to see the dramatic before and after transformation.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <PortfolioSlider item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
