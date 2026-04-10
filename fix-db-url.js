// fix-db-url.js
const { execSync } = require('child_process');

const DATABASE_URL = 'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require';

console.log('\n🔧 Fixing DATABASE_URL and redeploying...\n');

try {
  execSync('vercel env rm DATABASE_URL production --yes', { stdio: 'pipe' });
  console.log('✅ Old DATABASE_URL removed');
} catch { console.log('⚠️  DATABASE_URL not found, adding fresh'); }

try {
  execSync(`vercel env add DATABASE_URL production`, {
    input: DATABASE_URL + '\n',
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log('✅ New DATABASE_URL set');
} catch (e) {
  console.error('❌ Failed to set DATABASE_URL:', e.message);
  process.exit(1);
}

console.log('\n🚀 Deploying to production...\n');
execSync('vercel --prod --force', { stdio: 'inherit' });
console.log('\n✅ Done! Test login at https://crown-care.vercel.app/admin/login\n');
