// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@crowncare.com' },
    update: {},
    create: { email: 'admin@crowncare.com', password: hashedPassword, name: 'Crown Care Admin', role: 'admin', active: true },
  });
  console.log('✅ Admin: admin@crowncare.com / admin123');

  const defaults = [
    { key: 'company_name',    value: 'Crown Care Services' },
    { key: 'company_phone',   value: '(555) 123-4567' },
    { key: 'company_email',   value: 'info@crowncare.com' },
    { key: 'company_address', value: 'Nationwide, United States' },
    { key: 'whatsapp_number', value: '15551234567' },
    { key: 'social_facebook',  value: '' },
    { key: 'social_instagram', value: '' },
    { key: 'social_twitter',   value: '' },
    { key: 'social_tiktok',    value: '' },
    { key: 'copyright_text',  value: `© ${new Date().getFullYear()} Crown Care Services. All rights reserved.` },
  ];
  for (const s of defaults) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log('✅ Settings created');

  console.log('🎉 Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
