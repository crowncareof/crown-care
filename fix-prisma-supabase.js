// fix-prisma-supabase.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔧 Fixing Prisma + Supabase + Vercel connection...\n');

// 1. Update prisma/schema.prisma
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

const newDatasource = `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`;

const updatedSchema = schema.replace(
  /datasource db \{[\s\S]*?\}/,
  newDatasource
);

fs.writeFileSync(schemaPath, updatedSchema, 'utf8');
console.log('✅ prisma/schema.prisma updated with directUrl');

// 2. Set DATABASE_URL (pooler - port 6543)
const DATABASE_URL = 'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require';
const DIRECT_URL = 'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres';

try { execSync('vercel env rm DATABASE_URL production --yes', { stdio: 'pipe' }); } catch {}
try { execSync('vercel env rm DIRECT_URL production --yes', { stdio: 'pipe' }); } catch {}

execSync('vercel env add DATABASE_URL production', {
  input: DATABASE_URL + '\n',
  stdio: ['pipe', 'inherit', 'inherit'],
});
console.log('✅ DATABASE_URL set (pooler)');

execSync('vercel env add DIRECT_URL production', {
  input: DIRECT_URL + '\n',
  stdio: ['pipe', 'inherit', 'inherit'],
});
console.log('✅ DIRECT_URL set (direct)');

// 3. Commit and deploy
execSync('git add prisma/schema.prisma', { stdio: 'inherit' });
execSync('git commit -m "fix(db): add directUrl for Supabase + Vercel connection pooling"', { stdio: 'inherit' });
execSync('git push origin main', { stdio: 'inherit' });

console.log('\n🚀 Deploying...\n');
execSync('vercel --prod --force', { stdio: 'inherit' });

console.log('\n✅ Done! Test: https://crown-care.vercel.app/admin/login\n');
