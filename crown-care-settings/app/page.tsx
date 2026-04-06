// app/page.tsx
import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';
import TrustSection from '@/components/sections/TrustSection';
import ServicesSection from '@/components/sections/ServicesSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/sections/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import type { Service, Portfolio, Testimonial } from '@/lib/types';

export const revalidate = 60;

async function getData() {
  const [services, portfolio, testimonials, settings] = await Promise.all([
    prisma.service.findMany({ orderBy: { order: 'asc' } }).catch(() => [] as Service[]),
    prisma.portfolio.findMany({ where: { featured: true }, orderBy: { order: 'asc' }, take: 6 }).catch(() => [] as Portfolio[]),
    prisma.testimonial.findMany({ where: { featured: true }, orderBy: { createdAt: 'desc' }, take: 6 }).catch(() => [] as Testimonial[]),
    getSettings().catch(() => ({} as Record<string, string>)),
  ]);
  return { services, portfolio, testimonials, settings };
}

export default async function HomePage() {
  const { services, portfolio, testimonials, settings } = await getData();
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <TrustSection />
      <ServicesSection services={services} />
      <PortfolioSection items={portfolio} />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection settings={settings} />
      <Footer settings={settings} />
      <WhatsAppButton whatsapp={settings['whatsapp_number']} />
    </main>
  );
}
