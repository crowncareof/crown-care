'use client';
// components/sections/ServicesSection.tsx
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { FiArrowRight, FiClock, FiDollarSign } from 'react-icons/fi';
import { whatsappLink } from '@/lib/utils';
import type { Service } from '@prisma/client';

// Fallback service images
const SERVICE_IMAGES: Record<string, string> = {
  'Sofa Deep Cleaning': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  'Armchair & Chair Cleaning': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
  'Mattress Sanitization': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  'Area Rug Cleaning': 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
  'Car Upholstery Detailing': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
  'Office Furniture Cleaning': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const imageUrl = service.imageUrl || SERVICE_IMAGES[service.title] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.12 }}
      className="group card-premium overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={imageUrl}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
        {service.featured && (
          <div className="absolute top-3 right-3 bg-gold-500 text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
            ★ Popular
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-navy-900 mb-2 group-hover:text-navy-700 transition-colors">
          {service.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 font-body">
          {service.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-5 text-sm">
          {service.price && (
            <div className="flex items-center gap-1.5 text-gold-600 font-semibold">
              <FiDollarSign className="w-4 h-4" />
              {service.price}
            </div>
          )}
          {service.duration && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <FiClock className="w-4 h-4" />
              {service.duration}
            </div>
          )}
        </div>

        <a
          href={whatsappLink(`Hi! I'm interested in "${service.title}". Can I get a quote?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-navy-800 font-semibold text-sm hover:text-gold-600 transition-colors group/link"
        >
          Book This Service
          <FiArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
        </a>
      </div>
    </motion.div>
  );
}

interface Props {
  services: Service[];
}

export default function ServicesSection({ services }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="services" className="py-20 sm:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-navy-900/5 text-navy-700 text-sm font-semibold px-4 py-2 rounded-full mb-4 tracking-wide uppercase">
            What We Clean
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy-900 mb-4 section-title section-title-center">
            Our Services
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-body">
            From your favorite sofa to your car interior — every surface cleaned with precision
            and care by certified professionals.
          </p>
        </motion.div>

        {services.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 font-body">
            Services coming soon. Check back shortly!
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 mb-4 font-body">Don't see what you need?</p>
          <a
            href={whatsappLink("Hi! I have a custom upholstery cleaning request.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Request Custom Quote <FiArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
