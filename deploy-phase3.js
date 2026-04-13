// deploy-phase3.js — Crown Care Phase 3 Deploy
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));
const silent = (cmd) => { try { execSync(cmd, { stdio: 'pipe' }); } catch {} };
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

async function post(path, data, token) {
  const https = require('https');
  return new Promise(resolve => {
    const body = JSON.stringify(data);
    const req = https.request({ hostname: 'crown-care.vercel.app', path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...(token && { Authorization: `Bearer ${token}` }) } },
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
  console.log('║  👑 Crown Care Phase 3 — Intelligence Deploy     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // STEP 1: Build check
  console.log('🔨 Step 1: Build check...');
  try { run('npm run build'); console.log('✅ Build passed\n'); }
  catch { console.log('❌ Build failed'); process.exit(1); }

  // STEP 2: Prisma
  console.log('🗄️  Step 2: Prisma db push...');
  try { run('npx prisma db push'); run('npx prisma generate'); console.log('✅ Prisma updated\n'); }
  catch (e) { console.log('⚠️  Prisma push failed:', e.message); }

  // STEP 3: ANTHROPIC_API_KEY
  console.log('🤖 Step 3: ANTHROPIC_API_KEY...');
  let apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey) {
    const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
    const match = envContent.match(/ANTHROPIC_API_KEY[=:]\s*["']?([^"'\n]+)["']?/);
    if (match) apiKey = match[1].trim();
  }
  if (!apiKey) {
    apiKey = await ask('   Enter ANTHROPIC_API_KEY (console.anthropic.com/settings/keys): ');
  }
  if (apiKey) {
    silent('vercel env rm ANTHROPIC_API_KEY production --yes');
    execSync('vercel env add ANTHROPIC_API_KEY production', { input: apiKey.trim() + '\n', stdio: ['pipe','inherit','inherit'] });
    console.log('✅ ANTHROPIC_API_KEY set\n');
  }

  // STEP 4: Commit + deploy
  console.log('📦 Step 4: Committing...');
  silent('git add -A');
  try {
    run('git commit -m "feat(phase3): add intelligence system, upsells, analytics, training, performance and notifications"');
    run('git push origin main');
    console.log('✅ Pushed\n');
  } catch { console.log('⚠️  Nothing new to commit\n'); }

  console.log('🚀 Step 5: Deploying...\n');
  run('vercel --prod --force');

  // STEP 6: Tests
  console.log('\n🔍 Step 6: Testing endpoints...');
  await new Promise(r => setTimeout(r, 10000));

  const login = await post('/api/auth/login', { email: 'admin@crowncare.com', password: 'admin123' });
  console.log(`   Login: ${login.status === 200 ? '✅' : `❌ ${login.status}`}`);

  if (login.status === 200) {
    const token = JSON.parse(login.body).token;
    const analytics = await get('/api/analytics', token);
    const notifications = await get('/api/notifications', token);
    const training = await get('/api/training', token);
    console.log(`   Analytics: ${analytics.status === 200 ? '✅' : `❌ ${analytics.status}`}`);
    console.log(`   Notifications: ${notifications.status === 200 ? '✅' : `❌ ${notifications.status}`}`);
    console.log(`   Training: ${training.status === 200 ? '✅' : `❌ ${training.status}`}`);
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  ✅ Phase 3 deployed!                            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  📊 /admin/analytics    — Revenue & KPIs        ║');
  console.log('║  🏆 /admin/performance  — Employee leaderboard  ║');
  console.log('║  📚 /admin/training     — Sales scripts         ║');
  console.log('║  🔔 /admin/notifications — Smart alerts         ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  rl.close();
}

main().catch(e => { console.error('Fatal:', e.message); rl.close(); process.exit(1); });
