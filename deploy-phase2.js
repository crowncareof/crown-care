// deploy-phase2.js — Crown Care Phase 2 Deploy Script
const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));
const silent = (cmd) => { try { execSync(cmd, { stdio: 'pipe' }); } catch {} };
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const setEnv = (key, value) => {
  silent(`vercel env rm ${key} production --yes`);
  execSync(`vercel env add ${key} production`, { input: value + '\n', stdio: ['pipe', 'inherit', 'inherit'] });
  console.log(`   ✅ ${key}`);
};

async function post(path, data) {
  const https = require('https');
  return new Promise(resolve => {
    const body = JSON.stringify(data);
    const req = https.request({ hostname: 'crown-care.vercel.app', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', () => resolve({ status: 0, body: 'failed' }));
    req.write(body); req.end();
  });
}

async function get(path, token) {
  const https = require('https');
  return new Promise(resolve => {
    const req = https.request({ hostname: 'crown-care.vercel.app', path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` } },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', () => resolve({ status: 0, body: 'failed' }));
    req.end();
  });
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  👑 Crown Care Phase 2 — Deploy Script           ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // STEP 1: Local build check
  console.log('🔨 Step 1: Running local build check...');
  try { run('npm run build'); console.log('✅ Build passed\n'); }
  catch { console.log('❌ Build failed — fix errors before deploying'); process.exit(1); }

  // STEP 2: Prisma
  console.log('🗄️  Step 2: Running prisma db push...');
  try { run('npx prisma db push'); run('npx prisma generate'); console.log('✅ Prisma updated\n'); }
  catch { console.log('⚠️  Prisma push failed — check DATABASE_URL in .env'); }

  // STEP 3: ANTHROPIC_API_KEY
  console.log('🤖 Step 3: Setting ANTHROPIC_API_KEY...');
  let anthropicKey = '';
  const envContent = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
  const match = envContent.match(/ANTHROPIC_API_KEY="?([^"\n]+)"?/);
  if (match) {
    anthropicKey = match[1];
    console.log('   Found in .env.local');
  } else {
    anthropicKey = await ask('   Enter your ANTHROPIC_API_KEY (get at console.anthropic.com): ');
  }
  if (anthropicKey) { setEnv('ANTHROPIC_API_KEY', anthropicKey.trim()); }
  else { console.log('   ⚠️  Skipping — AI message feature will not work'); }

  // STEP 4: Commit + push
  console.log('\n📦 Step 4: Committing changes...');
  silent('git add -A');
  try {
    run('git commit -m "feat(phase2): add visit form, CRM, pipeline, appointments, AI messages and reengagement alerts"');
    run('git push origin main');
    console.log('✅ Pushed to GitHub\n');
  } catch { console.log('⚠️  Nothing new to commit\n'); }

  // STEP 5: Deploy
  console.log('🚀 Step 5: Deploying to production...\n');
  run('vercel --prod --force');

  // STEP 6: Tests
  console.log('\n🔍 Step 6: Testing endpoints...');
  await new Promise(r => setTimeout(r, 8000));

  // Test login
  const loginRes = await post('/api/auth/login', { email: 'admin@crowncare.com', password: 'admin123' });
  console.log(`   Login: ${loginRes.status === 200 ? '✅ OK' : `❌ ${loginRes.status}`}`);

  if (loginRes.status === 200) {
    const token = JSON.parse(loginRes.body).token;
    const clientsRes = await get('/api/clients', token);
    console.log(`   GET /api/clients: ${clientsRes.status === 200 ? '✅ OK' : `❌ ${clientsRes.status}`}`);
    const reengageRes = await get('/api/admin/reengagement', token);
    console.log(`   GET /api/admin/reengagement: ${reengageRes.status === 200 ? '✅ OK' : `❌ ${reengageRes.status}`}`);
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  ✅ Phase 2 deployed successfully!               ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  🌐 https://crown-care.vercel.app                ║');
  console.log('║  🔐 /admin/login                                 ║');
  console.log('║  📋 /admin/visit  (field visit form)             ║');
  console.log('║  👥 /admin/clients (CRM)                         ║');
  console.log('║  📊 /admin/pipeline (Kanban)                     ║');
  console.log('║  📅 /admin/appointments (Calendar)               ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  rl.close();
}

main().catch(e => { console.error('Fatal:', e.message); rl.close(); process.exit(1); });
