// deploy-final.js
// THE definitive deploy script for Crown Care
// Run: node deploy-final.js

const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) { execSync(cmd, { stdio: 'inherit' }); }
function silent(cmd) { try { execSync(cmd, { stdio: 'pipe' }); } catch {} }
function setEnv(key, value) {
  silent(`vercel env rm ${key} production --yes`);
  execSync(`vercel env add ${key} production`, {
    input: value + '\n',
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log(`   ✅ ${key}`);
}

async function testLogin() {
  const https = require('https');
  return new Promise((resolve) => {
    const data = JSON.stringify({ email: 'admin@crowncare.com', password: 'admin123' });
    const req = https.request({
      hostname: 'crown-care.vercel.app',
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', () => resolve({ status: 0, body: 'failed' }));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  👑 Crown Care — FINAL Deploy Script   ║');
  console.log('╚════════════════════════════════════════╝\n');

  // 1. Set env vars - DATABASE_URL uses Transaction pooler with pgbouncer
  // DIRECT_URL uses direct connection for migrations
  console.log('⚙️  Setting environment variables...');
  setEnv('DATABASE_URL',
    'postgresql://postgres.dzrfmecdnavozxdeixxr:Sucesso%402026%23@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
  );
  setEnv('DIRECT_URL',
    'postgresql://postgres:Sucesso%402026%23@db.dzrfmecdnavozxdeixxr.supabase.co:5432/postgres'
  );
  setEnv('JWT_SECRET', 'crown_care_jwt_secret_2026_production_key_xK9z');
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

  // 2. Commit all changes
  console.log('\n📦 Committing changes...');
  silent('git add -A');
  try {
    run('git commit -m "fix(db): correct Prisma + Supabase + Vercel configuration with directUrl and pgbouncer"');
    run('git push origin main');
    console.log('✅ Changes pushed to GitHub');
  } catch {
    console.log('⚠️  Nothing to commit or push');
  }

  // 3. Deploy
  console.log('\n🚀 Deploying to production...\n');
  run('vercel --prod --force');

  // 4. Wait and test
  console.log('\n⏳ Waiting 10 seconds for deployment...');
  await new Promise(r => setTimeout(r, 10000));

  console.log('\n🔍 Testing login...');
  const result = await testLogin();
  console.log(`   Status: ${result.status}`);
  console.log(`   Response: ${result.body.substring(0, 120)}`);

  if (result.status === 200) {
    console.log('\n🎉 SUCCESS! Login is working!');
    console.log('   URL: https://crown-care.vercel.app');
    console.log('   Admin: https://crown-care.vercel.app/admin/login');
    console.log('   Email: admin@crowncare.com');
    console.log('   Pass:  admin123\n');
  } else {
    console.log('\n⚠️  Login test failed. Check logs at:');
    console.log('   https://vercel.com/crowncareoficial-7601s-projects/crown-care/logs\n');
  }
}

main().catch(console.error);
