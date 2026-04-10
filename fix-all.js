// fix-all.js
const { execSync } = require('child_process');

console.log('\n🔧 Fixing all remaining issues...\n');

const vars = {
  DATABASE_URL: 'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
  DIRECT_URL:   'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres',
  JWT_SECRET:   'cr0wn_c4re_pr0d_s3cr3t_k3y_2026_x9z',
  JWT_EXPIRES_IN: '604800',  // 7 days in seconds (not "7d" string)
};

for (const [key, value] of Object.entries(vars)) {
  try { execSync(`vercel env rm ${key} production --yes`, { stdio: 'pipe' }); } catch {}
  execSync(`vercel env add ${key} production`, {
    input: value + '\n',
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log(`✅ ${key} set`);
}

console.log('\n🚀 Deploying...\n');
execSync('vercel --prod --force', { stdio: 'inherit' });

console.log('\n✅ Done! Now run: node prisma/seed.js');
console.log('Then test: https://crown-care.vercel.app/admin/login\n');
