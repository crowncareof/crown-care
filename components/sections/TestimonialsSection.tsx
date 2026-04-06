'use client';
// components/sections/TestimonialsSection.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getStars } from '@/lib/utils';
import type { Testimonial } from '@prisma/client';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {getStars(rating).map((type, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${type === 'full' ? 'star-filled' : 'star-empty'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="card-premium p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-navy-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0 font-body">
          {initials}
        </div>
        <div>
          <div className="font-semibold text-navy-900 font-body">{testimonial.name}</div>
          {testimonial.location && (
            <div className="text-gray-400 text-xs font-body">{testimonial.location}</div>
          )}
        </div>
        <div className="ml-auto">
          <StarRating rating={testimonial.rating} />
        </div>
      </div>

      <blockquote className="text-gray-600 leading-relaxed font-body text-sm flex-1 italic">
        "{testimonial.comment}"
      </blockquote>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
        <span className="text-xs text-gray-400 font-body">Verified Client</span>
      </div>
    </div>
  );
}

// Fallback testimonials
const FALLBACK: Partial<Testimonial>[] = [
  { id: 1, name: 'Sarah Mitchell', location: 'Beverly Hills, CA', rating: 5, comment: 'Absolutely incredible results! My 10-year-old sectional looks brand new. I could not believe the transformation. Highly recommend Crown Care!' },
  { id: 2, name: 'James Rodriguez', location: 'Miami, FL', rating: 5, comment: 'Best upholstery cleaning service I have ever used. They removed a red wine stain I thought was permanent. Will definitely use again.' },
  { id: 3, name: 'Amanda Chen', location: 'New York, NY', rating: 5, comment: 'My kids and pets had done a number on my living room furniture. Crown Care restored everything beautifully. Five stars without hesitation!' },
  { id: 4, name: 'David Thompson', location: 'Chicago, IL', rating: 5, comment: 'Used Crown Care for our office furniture. They came after hours, were incredibly efficient, and the results were outstanding.' },
  { id: 5, name: 'Lisa Martinez', location: 'Austin, TX', rating: 5, comment: 'Crown Care worked miracles on my old velvet sofa. The color came back, the texture is soft again, and the smell is fresh and clean.' },
  { id: 6, name: 'Robert Kim', location: 'Seattle, WA', rating: 5, comment: 'Professional from start to finish. Arrived on time with all equipment, treated my furniture with obvious care. The before and after difference was dramatic.' },
];

interface Props { testimonials: Testimonial[] }

export default function TestimonialsSection({ testimonials }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const display = testimonials.length > 0 ? testimonials : (FALLBACK as Testimonial[]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(display.length / itemsPerPage);

  const visibleItems = display.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  const prev = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const next = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-navy-950 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-5"
          style={{background: 'radial-gradient(ellipse, #d4a017 0%, transparent 70%)'}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="inline-block bg-gold-500/15 text-gold-400 text-sm font-semibold px-4 py-2 rounded-full mb-4 tracking-wide uppercase">
            Client Stories
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 section-title section-title-center">
            What Our Clients Say
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-body">
            Real results, real clients, real transformations. Don't just take our word for it.
          </p>
        </motion.div>

        {/* Desktop: 3-column grid */}
        <div className="hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {visibleItems.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile: single card carousel */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <TestimonialCard testimonial={display[currentPage]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              disabled={currentPage === 0}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === currentPage
                      ? 'w-8 h-2.5 bg-gold-500'
                      : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={currentPage === totalPages - 1}
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
