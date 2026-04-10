// fix-final.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔧 Final fix — Crown Care DB connection\n');

// 1. Add DIRECT_URL to .env local so prisma validate works
const envPath = path.join(process.cwd(), '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const DIRECT_URL = 'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres';

if (!envContent.includes('DIRECT_URL')) {
  envContent += `\nDIRECT_URL="${DIRECT_URL}"\n`;
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ DIRECT_URL added to .env');
} else {
  console.log('✅ DIRECT_URL already in .env');
}

// 2. Regenerate Prisma client
console.log('\n🔄 Regenerating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// 3. Set both env vars on Vercel
console.log('\n⚙️  Setting Vercel env vars...');

const DATABASE_URL = 'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require';

try { execSync('vercel env rm DATABASE_URL production --yes', { stdio: 'pipe' }); } catch {}
try { execSync('vercel env rm DIRECT_URL production --yes', { stdio: 'pipe' }); } catch {}

execSync('vercel env add DATABASE_URL production', {
  input: DATABASE_URL + '\n',
  stdio: ['pipe', 'inherit', 'inherit'],
});
console.log('✅ DATABASE_URL set (pooler port 6543)');

execSync('vercel env add DIRECT_URL production', {
  input: DIRECT_URL + '\n',
  stdio: ['pipe', 'inherit', 'inherit'],
});
console.log('✅ DIRECT_URL set (direct port 5432)');

// 4. Commit schema + .env changes
console.log('\n📦 Committing...');
execSync('git add prisma/schema.prisma', { stdio: 'inherit' });
try {
  execSync('git commit -m "fix(db): add directUrl to schema for Supabase pooler on Vercel"', { stdio: 'inherit' });
} catch {
  console.log('Nothing new to commit in schema');
}
execSync('git push origin main', { stdio: 'inherit' });

// 5. Deploy
console.log('\n🚀 Deploying to production...\n');
execSync('vercel --prod --force', { stdio: 'inherit' });

console.log('\n✅ Done! Test: https://crown-care.vercel.app/admin/login\n');
