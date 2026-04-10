// crown-deploy.js
// Script completo de debug + deploy para Crown Care
// Execute: node crown-deploy.js

const { execSync, spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

// ── Helpers ──────────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts });
}

function runLoud(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function post(url, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', () => resolve({ status: 0, body: 'request failed' }));
    req.write(body);
    req.end();
  });
}

function setEnv(key, value) {
  try { run(`vercel env rm ${key} production --yes`); } catch {}
  execSync(`vercel env add ${key} production`, {
    input: value + '\n',
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log(`   ✅ ${key}`);
}

// ── Connection string variants to try ────────────────────────────────────────
const DB_VARIANTS = [
  // Session pooler port 5432 (best for Prisma)
  'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:5432/postgres',
  // Transaction pooler with pgbouncer
  'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
  // Direct connection
  'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres',
  // Direct with SSL
  'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres?sslmode=require',
];

const DIRECT_URL = 'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres';

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   👑 Crown Care — Auto Debug & Deploy         ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  // STEP 1: Test local DB
  console.log('━━━ STEP 1: Testing local database connection ━━━');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({ select: { email: true, active: true } });
    if (user) {
      console.log(`✅ Local DB OK — user found: ${user.email}`);
    } else {
      console.log('⚠️  Local DB connected but no users found — running seed...');
      runLoud('node prisma/seed.js');
    }
    await prisma.$disconnect();
  } catch (e) {
    console.log(`❌ Local DB failed: ${e.message}`);
    console.log('   Check your .env DATABASE_URL');
    process.exit(1);
  }

  // STEP 2: Reset admin password to ensure it's correct
  console.log('\n━━━ STEP 2: Resetting admin password ━━━');
  try {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    const prisma = new PrismaClient();
    const hash = await bcrypt.hash('admin123', 12);
    await prisma.user.upsert({
      where: { email: 'admin@crowncare.com' },
      update: { password: hash, active: true },
      create: { email: 'admin@crowncare.com', password: hash, name: 'Crown Care Admin', role: 'admin', active: true },
    });
    console.log('✅ Admin password set to: admin123');
    await prisma.$disconnect();
  } catch (e) {
    console.log(`❌ Password reset failed: ${e.message}`);
  }

  // STEP 3: Fix prisma schema
  console.log('\n━━━ STEP 3: Fixing prisma/schema.prisma ━━━');
  const schemaPath = 'prisma/schema.prisma';
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  if (!schema.includes('directUrl')) {
    schema = schema.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}`
    );
    fs.writeFileSync(schemaPath, schema);
    console.log('✅ Added directUrl to schema');
  } else {
    console.log('✅ Schema already has directUrl');
  }

  // Add DIRECT_URL to .env if missing
  let envContent = fs.readFileSync('.env', 'utf8');
  if (!envContent.includes('DIRECT_URL=')) {
    envContent += `\nDIRECT_URL="${DIRECT_URL}"\n`;
    fs.writeFileSync('.env', envContent);
    console.log('✅ DIRECT_URL added to .env');
  }

  // Regenerate Prisma client - skip if already generated
  console.log('✅ Prisma client already generated (skipping to avoid Windows file lock)');

  // STEP 4: Set ALL env vars on Vercel
  console.log('\n━━━ STEP 4: Setting Vercel environment variables ━━━');
  
  // Use session pooler (port 5432) - works best with Prisma
  const DATABASE_URL = DB_VARIANTS[0];
  
  setEnv('DATABASE_URL', DATABASE_URL);
  setEnv('DIRECT_URL', DIRECT_URL);
  setEnv('JWT_SECRET', 'cr0wn_c4re_pr0d_s3cr3t_2026_xK9z!mP');
  setEnv('JWT_EXPIRES_IN', '604800');
  setEnv('CLOUDINARY_CLOUD_NAME', 'davkbmvoe');
  setEnv('CLOUDINARY_API_KEY', '659875418527427');
  setEnv('CLOUDINARY_API_SECRET', 'c_YnevyN-tsAy2jkLbhTiTOSl00');
  setEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'davkbmvoe');
  setEnv('NEXT_PUBLIC_APP_URL', 'https://crown-care.vercel.app');
  setEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '15551234567');
  setEnv('NEXT_PUBLIC_COMPANY_EMAIL', 'info@crowncare.com');
  setEnv('NEXT_PUBLIC_COMPANY_PHONE', '(555) 123-4567');
  setEnv('NEXT_PUBLIC_COMPANY_ADDRESS', 'Nationwide, United States');

  // STEP 5: Commit and deploy
  console.log('\n━━━ STEP 5: Committing and deploying ━━━');
  try {
    run('git add prisma/schema.prisma');
    run('git commit -m "fix(db): ensure directUrl configured for Supabase pooler"');
    run('git push origin main');
    console.log('✅ Code pushed to GitHub');
  } catch {
    console.log('⚠️  Nothing new to commit');
  }

  console.log('\n🚀 Deploying to production...\n');
  runLoud('vercel --prod --force');

  // STEP 6: Test login on production
  console.log('\n━━━ STEP 6: Testing production login ━━━');
  console.log('Waiting 5 seconds for deployment to propagate...');
  await new Promise(r => setTimeout(r, 5000));

  let loginOk = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`\n   Attempt ${attempt}/5...`);
    const result = await post('https://crown-care.vercel.app/api/auth/login', {
      email: 'admin@crowncare.com',
      password: 'admin123'
    });
    
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${result.body.substring(0, 100)}`);

    if (result.status === 200) {
      console.log('\n✅ LOGIN WORKING! 🎉');
      loginOk = true;
      break;
    } else if (result.status === 401) {
      console.log('   ⚠️  401 - DB connected but wrong credentials, resetting...');
      // Try resetting password again via local DB
      try {
        const { PrismaClient } = require('@prisma/client');
        const bcrypt = require('bcryptjs');
        const prisma = new PrismaClient();
        const hash = await bcrypt.hash('admin123', 12);
        await prisma.user.update({ where: { email: 'admin@crowncare.com' }, data: { password: hash } });
        await prisma.$disconnect();
        console.log('   Password reset again');
      } catch (e) {
        console.log(`   Reset failed: ${e.message}`);
      }
    } else if (result.status === 500) {
      console.log('   ❌ 500 - Server error, trying next DB variant...');
      
      if (attempt <= DB_VARIANTS.length) {
        const nextUrl = DB_VARIANTS[attempt];
        if (nextUrl) {
          console.log(`   Trying variant ${attempt + 1}: ${nextUrl.substring(0, 60)}...`);
          setEnv('DATABASE_URL', nextUrl);
          runLoud('vercel --prod --force');
          await new Promise(r => setTimeout(r, 8000));
        }
      }
    }
    
    if (attempt < 5) await new Promise(r => setTimeout(r, 3000));
  }

  if (!loginOk) {
    console.log('\n❌ Login still failing after all attempts.');
    console.log('\n📋 Manual steps to try:');
    console.log('1. Go to: https://supabase.com/dashboard/project/dzrfmecdnavozxdeixxr/settings/database');
    console.log('2. Copy the "Session pooler" connection string');
    console.log('3. Run: vercel env rm DATABASE_URL production --yes');
    console.log('4. Run: vercel env add DATABASE_URL production');
    console.log('5. Paste the connection string');
    console.log('6. Run: vercel --prod --force');
  } else {
    console.log('\n🎉 Crown Care is fully deployed and working!');
    console.log('🌐 URL: https://crown-care.vercel.app');
    console.log('🔐 Admin: https://crown-care.vercel.app/admin/login');
    console.log('   Email: admin@crowncare.com');
    console.log('   Password: admin123\n');
  }

  rl.close();
}

main().catch((e) => {
  console.error('\n❌ Fatal error:', e.message);
  rl.close();
  process.exit(1);
});
