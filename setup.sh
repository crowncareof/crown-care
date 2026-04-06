#!/usr/bin/env bash
# setup.sh — Crown Care local setup script
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   👑 Crown Care — Project Setup      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. Current: $(node -v 2>/dev/null || echo 'not found')"
  exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Setup environment
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo ""
  echo "📋 Created .env.local from .env.example"
  echo "⚠️  Please edit .env.local with your values before continuing:"
  echo "   - DATABASE_URL (PostgreSQL connection string)"
  echo "   - JWT_SECRET (random string, min 32 chars)"
  echo "   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
  echo ""
  echo "Then run: npm run db:generate && npm run db:push && npm run db:seed"
  echo "Then run: npm run dev"
  exit 0
else
  echo "✅ .env.local already exists"
fi

# Prisma
echo ""
echo "🗄️  Setting up database..."
npm run db:generate
npm run db:push
npm run db:seed

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   🎉 Setup complete!                  ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  Run: npm run dev"
echo "  Open: http://localhost:3000"
echo "  Admin: http://localhost:3000/admin"
echo "  Login: admin@crowncare.com / admin123"
echo ""
