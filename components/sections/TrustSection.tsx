'use client';
// components/sections/TrustSection.tsx
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const benefits = [
  {
    icon: '🏆',
    title: 'Professional Equipment',
    description: 'Industrial-grade machines that achieve results home equipment simply cannot match.',
  },
  {
    icon: '🌿',
    title: 'Safe for Kids & Pets',
    description: 'All our cleaning solutions are non-toxic, biodegradable, and hypoallergenic.',
  },
  {
    icon: '⚡',
    title: 'Fast Dry Time',
    description: 'Advanced extraction technology leaves your furniture dry and ready in 2–4 hours.',
  },
  {
    icon: '✅',
    title: 'Satisfaction Guaranteed',
    description: "If you're not 100% happy, we come back and re-clean at no extra charge.",
  },
  {
    icon: '🛡️',
    title: 'Licensed & Insured',
    description: 'Full liability insurance and certified technicians protect your home and furniture.',
  },
  {
    icon: '📅',
    title: 'Flexible Scheduling',
    description: 'Same-day appointments available. We work around your schedule, including weekends.',
  },
];

function BenefitCard({ benefit, index }: { benefit: typeof benefits[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card-premium p-6 group cursor-default"
    >
      <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-2xl mb-4
                      group-hover:bg-gold-500/10 group-hover:scale-110 transition-all duration-300">
        {benefit.icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-navy-900 mb-2">{benefit.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-body">{benefit.description}</p>
    </motion.div>
  );
}

export default function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="about" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-gold-500/10 text-gold-600 text-sm font-semibold px-4 py-2 rounded-full mb-4 tracking-wide uppercase">
            Why Crown Care
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy-900 mb-4 section-title section-title-center">
            The Standard of Excellence
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-body">
            We combine decades of expertise with cutting-edge technology to deliver results
            that speak for themselves.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
