// setup-vercel-env.js
// Execute: node setup-vercel-env.js

const { execSync } = require('child_process');

const envs = [
  // Auth
  ['JWT_SECRET',                    'cr0wn_c4re_pr0d_s3cr3t_k3y_2026_x9z!'],
  ['JWT_EXPIRES_IN',                '7d'],

  // Cloudinary
  ['CLOUDINARY_CLOUD_NAME',         'davkbmvoe'],
  ['CLOUDINARY_API_KEY',            '659875418527427'],
  ['CLOUDINARY_API_SECRET',         'c_YnevyN-tsAy2jkLbhTiTOSl00'],
  ['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'davkbmvoe'],

  // App
  ['NEXT_PUBLIC_APP_URL',           'https://crown-care.vercel.app'],
  ['NEXT_PUBLIC_WHATSAPP_NUMBER',   '15551234567'],
  ['NEXT_PUBLIC_COMPANY_EMAIL',     'info@crowncare.com'],
  ['NEXT_PUBLIC_COMPANY_PHONE',     '(555) 123-4567'],
  ['NEXT_PUBLIC_COMPANY_ADDRESS',   'Nationwide, United States'],
];

// Old Supabase vars to remove
const toRemove = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DIRECT_DATABASE_URL',
];

console.log('\n╔══════════════════════════════════════╗');
console.log('║   ⚙️  Vercel Env Setup — Crown Care   ║');
console.log('╚══════════════════════════════════════╝\n');

// Remove old vars
console.log('🗑️  Removing old Supabase variables...');
for (const key of toRemove) {
  try {
    execSync(`vercel env rm ${key} production --yes`, { stdio: 'pipe' });
    console.log(`   ✅ Removed ${key}`);
  } catch {
    console.log(`   ⚠️  ${key} not found (skipping)`);
  }
}

// Also remove NEXT_PUBLIC_APP_URL if it was set wrong before
try {
  execSync(`vercel env rm NEXT_PUBLIC_APP_URL production --yes`, { stdio: 'pipe' });
} catch {}

console.log('\n➕ Adding production environment variables...');
for (const [key, value] of envs) {
  // Remove if exists first to avoid conflict
  try { execSync(`vercel env rm ${key} production --yes`, { stdio: 'pipe' }); } catch {}

  try {
    execSync(`vercel env add ${key} production`, {
      input: value + '\n',
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    console.log(`   ✅ ${key}`);
  } catch {
    console.log(`   ❌ Failed to set ${key}`);
  }
}

console.log('\n🚀 Deploying to production...\n');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('\n✅ Deploy complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Acesse a URL da Vercel acima');
  console.log('   2. Compre seu domínio (ex: crowncare.com)');
  console.log('   3. Vercel Dashboard → Settings → Domains → Add domain');
  console.log('   4. Atualize NEXT_PUBLIC_APP_URL com o domínio real\n');
} catch (e) {
  console.log('\n❌ Deploy failed. Check errors above.');
}
