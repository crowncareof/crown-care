// debug-db.js
// Testa a conexão com o banco diretamente
// Execute: node debug-db.js

const { execSync } = require('child_process');

async function main() {
  console.log('\n🔍 Crown Care — Database Debug\n');

  // Test 1: Check what DATABASE_URL is actually set in Vercel
  console.log('1️⃣  Checking Vercel env vars...');
  try {
    const result = execSync('vercel env ls production', { encoding: 'utf8' });
    const hasDb = result.includes('DATABASE_URL');
    const hasDirect = result.includes('DIRECT_URL');
    console.log(`   DATABASE_URL: ${hasDb ? '✅ exists' : '❌ MISSING'}`);
    console.log(`   DIRECT_URL:   ${hasDirect ? '✅ exists' : '❌ MISSING'}`);
  } catch (e) {
    console.log('   ❌ Could not check Vercel env vars');
  }

  // Test 2: Test direct DB connection locally
  console.log('\n2️⃣  Testing local DB connection...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, role: true, active: true }
    });
    console.log(`   ✅ DB connected! Found user: ${user?.email || 'none'}`);
    await prisma.$disconnect();
  } catch (e) {
    console.log(`   ❌ DB connection failed: ${e.message}`);
  }

  // Test 3: Check prisma schema has directUrl
  console.log('\n3️⃣  Checking prisma/schema.prisma...');
  const fs = require('fs');
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const hasDirectUrl = schema.includes('directUrl');
  const hasUrl = schema.includes('url = env("DATABASE_URL")');
  console.log(`   url field:       ${hasUrl ? '✅' : '❌ MISSING'}`);
  console.log(`   directUrl field: ${hasDirectUrl ? '✅' : '❌ MISSING - THIS IS THE PROBLEM'}`);
  if (!hasDirectUrl) {
    console.log('\n   🔧 Fix: Add directUrl to datasource block in prisma/schema.prisma');
  }

  // Test 4: Test the actual login API on Vercel
  console.log('\n4️⃣  Testing Vercel login API...');
  try {
    const https = require('https');
    const data = JSON.stringify({ email: 'admin@crowncare.com', password: 'admin123' });
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'crown-care.vercel.app',
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.body}`);
    
    if (response.status === 200) {
      console.log('   ✅ LOGIN WORKING!');
    } else {
      console.log('   ❌ Login failed on Vercel');
    }
  } catch (e) {
    console.log(`   ❌ Request failed: ${e.message}`);
  }

  // Test 5: Check if Prisma generated with correct schema
  console.log('\n5️⃣  Checking Prisma client...');
  try {
    execSync('npx prisma validate', { stdio: 'pipe' });
    console.log('   ✅ Prisma schema is valid');
  } catch (e) {
    console.log(`   ❌ Prisma schema error: ${e.message}`);
  }

  console.log('\n📋 Summary of what to fix:');
  const schema2 = fs.readFileSync('prisma/schema.prisma', 'utf8');
  if (!schema2.includes('directUrl')) {
    console.log('   → Add directUrl = env("DIRECT_URL") to datasource db in schema.prisma');
  }
  console.log('   → Run: node fix-prisma-supabase.js');
  console.log('');
}

main().catch(console.error);
