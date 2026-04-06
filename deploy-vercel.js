// deploy-vercel.js
// Execute na raiz do projeto: node deploy-vercel.js
// Requer: npm i -g vercel (já instalado globalmente)

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

function run(cmd, opts = {}) {
  console.log(`\n▶ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function tryRun(cmd) {
  try { run(cmd); return true; }
  catch { return false; }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   🚀 Crown Care — Vercel Deploy Script   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ── Step 1: Check vercel CLI ─────────────────────────────────────────────
  console.log('📦 Checking Vercel CLI...');
  const hasVercel = tryRun('vercel --version');
  if (!hasVercel) {
    console.log('Installing Vercel CLI globally...');
    run('npm install -g vercel');
  }

  // ── Step 2: Open Firefox for login ──────────────────────────────────────
  console.log('\n🌐 Opening Vercel login in Firefox...');
  console.log('   After logging in on the browser, come back here.\n');

  // Try to open Firefox with vercel login URL
  const loginUrl = 'https://vercel.com/login';
  try {
    // Windows
    execSync(`start firefox "${loginUrl}"`, { stdio: 'ignore' });
  } catch {
    try {
      execSync(`"C:\\Program Files\\Mozilla Firefox\\firefox.exe" "${loginUrl}"`, { stdio: 'ignore' });
    } catch {
      console.log(`   ➜ Open manually: ${loginUrl}`);
    }
  }

  // ── Step 3: Vercel login via CLI ─────────────────────────────────────────
  console.log('\n🔐 Running vercel login...');
  console.log('   (This will ask you to confirm in the browser)\n');
  run('vercel login');

  // ── Step 4: Read .env.local for values ───────────────────────────────────
  console.log('\n📋 Reading your .env.local...');
  const envPath = path.join(process.cwd(), '.env.local');
  const envValues = {};

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (val) envValues[key] = val;
    }
    console.log(`   ✅ Found ${Object.keys(envValues).length} variables in .env.local`);
  } else {
    console.log('   ⚠️  No .env.local found. Will ask for values manually.');
  }

  // ── Step 5: Link / create project ────────────────────────────────────────
  console.log('\n🔗 Linking project to Vercel...');
  run('vercel link --yes');

  // ── Step 6: Set env variables ─────────────────────────────────────────────
  console.log('\n🔧 Setting environment variables in Vercel...\n');

  const requiredEnvs = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_WHATSAPP_NUMBER',
    'NEXT_PUBLIC_COMPANY_EMAIL',
    'NEXT_PUBLIC_COMPANY_PHONE',
    'NEXT_PUBLIC_COMPANY_ADDRESS',
  ];

  for (const key of requiredEnvs) {
    let value = envValues[key];

    if (!value) {
      value = await ask(`   Enter value for ${key}: `);
    } else {
      const preview = value.length > 40 ? value.substring(0, 40) + '...' : value;
      const confirm = await ask(`   ${key} = "${preview}" — use this? (Y/n): `);
      if (confirm.toLowerCase() === 'n') {
        value = await ask(`   Enter new value for ${key}: `);
      }
    }

    if (!value) {
      console.log(`   ⚠️  Skipping ${key} (empty)`);
      continue;
    }

    // Add to all environments
    try {
      execSync(
        `vercel env add ${key} production`,
        { input: value + '\n', stdio: ['pipe', 'inherit', 'inherit'] }
      );
      console.log(`   ✅ ${key} set`);
    } catch {
      // Might already exist — try remove and re-add
      try {
        execSync(`vercel env rm ${key} production --yes`, { stdio: 'ignore' });
        execSync(
          `vercel env add ${key} production`,
          { input: value + '\n', stdio: ['pipe', 'inherit', 'inherit'] }
        );
        console.log(`   ✅ ${key} updated`);
      } catch (e) {
        console.log(`   ⚠️  Could not set ${key} automatically. Set it manually in Vercel dashboard.`);
      }
    }
  }

  // ── Step 7: Deploy to production ─────────────────────────────────────────
  console.log('\n🚀 Deploying to production...\n');
  run('vercel --prod');

  // ── Step 8: Get deployment URL ────────────────────────────────────────────
  console.log('\n✅ Deploy complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Copy your Vercel URL from above');
  console.log('   2. Buy your domain (e.g. crowncare.com)');
  console.log('   3. In Vercel dashboard → Settings → Domains → Add domain');
  console.log('   4. Point your domain DNS to Vercel');
  console.log('   5. Update NEXT_PUBLIC_APP_URL env var with your real domain');
  console.log('\n🎉 Crown Care is live!\n');

  rl.close();
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
