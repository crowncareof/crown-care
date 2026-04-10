// fix-pgbouncer.js
const { execSync } = require('child_process');

console.log('\n🔧 Fixing pgbouncer prepared statements issue...\n');

const DATABASE_URL = 'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';
const DIRECT_URL   = 'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres';

try { execSync('vercel env rm DATABASE_URL production --yes', { stdio: 'pipe' }); } catch {}
try { execSync('vercel env rm DIRECT_URL production --yes', { stdio: 'pipe' }); } catch {}

execSync('vercel env add DATABASE_URL production', {
  input: DATABASE_URL + '\n',
  stdio: ['pipe', 'inherit', 'inherit'],
});
console.log('✅ DATABASE_URL set with pgbouncer=true');

execSync('vercel env add DIRECT_URL production', {
  input: DIRECT_URL + '\n',
  stdio: ['pipe', 'inherit', 'inherit'],
});
console.log('✅ DIRECT_URL set');

console.log('\n🚀 Deploying...\n');
execSync('vercel --prod --force', { stdio: 'inherit' });
console.log('\n✅ Done! Test: https://crown-care.vercel.app/admin/login\n');
