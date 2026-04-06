// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@crowncare.com' },
    update: {},
    create: {
      email: 'admin@crowncare.com',
      password: hashedPassword,
      name: 'Crown Care Admin',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created: admin@crowncare.com / admin123');

  // Create services
  const services = [
    {
      title: 'Sofa Deep Cleaning',
      description: 'Professional deep cleaning for all types of sofas. We remove embedded dirt, allergens, and stains, restoring your sofa to its original beauty.',
      price: 'From $89',
      duration: '2–3 hours',
      featured: true,
      order: 1,
    },
    {
      title: 'Armchair & Chair Cleaning',
      description: 'Specialized cleaning for armchairs and accent chairs. Our process is safe for all fabrics including velvet, leather, and microfiber.',
      price: 'From $49',
      duration: '1–2 hours',
      featured: true,
      order: 2,
    },
    {
      title: 'Mattress Sanitization',
      description: 'Deep sanitization that eliminates dust mites, bacteria, and allergens. Essential for a healthier sleep environment for the whole family.',
      price: 'From $69',
      duration: '2–3 hours',
      featured: true,
      order: 3,
    },
    {
      title: 'Area Rug Cleaning',
      description: 'Expert cleaning for all types of area rugs including Persian, wool, and synthetic. We restore colors and remove tough stains.',
      price: 'From $59',
      duration: '1–2 hours',
      featured: false,
      order: 4,
    },
    {
      title: 'Car Upholstery Detailing',
      description: 'Complete interior upholstery cleaning for cars, trucks, and SUVs. Leave your vehicle feeling brand new with our detailing service.',
      price: 'From $79',
      duration: '2–4 hours',
      featured: false,
      order: 5,
    },
    {
      title: 'Office Furniture Cleaning',
      description: 'Keep your workspace clean and professional. We clean office chairs, sofas, and upholstered partitions with minimal disruption.',
      price: 'Custom Quote',
      duration: 'Varies',
      featured: false,
      order: 6,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: services.indexOf(service) + 1 },
      update: service,
      create: service,
    });
  }
  console.log('✅ Services created');

  // Create testimonials
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      location: 'Beverly Hills, CA',
      rating: 5,
      comment: 'Absolutely incredible results! My 10-year-old sectional looks brand new. The team was professional, on time, and the cleaning was thorough. I could not believe the transformation. Highly recommend Crown Care!',
      featured: true,
    },
    {
      name: 'James Rodriguez',
      location: 'Miami, FL',
      rating: 5,
      comment: 'Best upholstery cleaning service I have ever used. They removed a red wine stain that I thought was permanent. The technician was very knowledgeable and explained every step. Will definitely use again.',
      featured: true,
    },
    {
      name: 'Amanda Chen',
      location: 'New York, NY',
      rating: 5,
      comment: 'My kids and pets had done a number on my living room furniture. Crown Care restored everything beautifully. Safe products, amazing results, and very reasonably priced. Five stars without hesitation!',
      featured: true,
    },
    {
      name: 'David Thompson',
      location: 'Chicago, IL',
      rating: 5,
      comment: 'Used Crown Care for our office furniture cleaning. They came after hours, were incredibly efficient, and the results were outstanding. Our team noticed immediately how fresh everything looked.',
      featured: true,
    },
    {
      name: 'Lisa Martinez',
      location: 'Austin, TX',
      rating: 5,
      comment: 'I was skeptical that anything could save my old velvet sofa, but Crown Care worked miracles. The color came back, the texture is soft again, and the smell is fresh and clean. Truly impressed!',
      featured: true,
    },
    {
      name: 'Robert Kim',
      location: 'Seattle, WA',
      rating: 5,
      comment: 'Professional from start to finish. Arrived on time with all equipment, treated my furniture with obvious care and expertise, and left the place spotless. The before and after difference was dramatic.',
      featured: true,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log('✅ Testimonials created');

  // Create portfolio items (using placeholder image URLs)
  const portfolioItems = [
    {
      title: 'Living Room Sectional Revival',
      description: 'Complete deep cleaning of a 3-piece sectional sofa with years of built-up grime and pet stains.',
      category: 'Sofa',
      beforeUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      afterUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      featured: true,
      order: 1,
    },
    {
      title: 'Velvet Armchair Restoration',
      description: 'Restored a vintage velvet armchair to its original vibrant color and soft texture.',
      category: 'Chair',
      beforeUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      afterUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      featured: true,
      order: 2,
    },
    {
      title: 'Oriental Rug Deep Clean',
      description: 'Removed years of embedded dirt from a precious antique Persian rug, restoring vivid colors.',
      category: 'Rug',
      beforeUrl: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
      afterUrl: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
      featured: true,
      order: 3,
    },
  ];

  for (const item of portfolioItems) {
    await prisma.portfolio.create({ data: item });
  }
  console.log('✅ Portfolio items created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
