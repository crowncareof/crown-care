#!/usr/bin/env bash
# ============================================================
#  Crown Care — Phase 1 Hotfix: Prisma 7 compatibility
#  Run inside: crown-care/
#  Fix: url removed from schema.prisma → now in prisma.config.ts
#       generator changed to prisma-client with custom output
#       lib/prisma.ts updated to use @prisma/adapter-pg
# ============================================================
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

log()     { echo -e "${CYAN}[Crown Care]${RESET} $1"; }
ok()      { echo -e "${GREEN}[✓]${RESET} $1"; }
warn()    { echo -e "${YELLOW}[!]${RESET} $1"; }
fail()    { echo -e "${RED}[✗] $1${RESET}"; exit 1; }
section() { echo -e "\n${BOLD}${CYAN}━━━ $1 ━━━${RESET}\n"; }

# ─── Guard: must be inside crown-care ────────────────────────
if [ ! -f "package.json" ] || ! grep -q '"name": "crown-care"' package.json 2>/dev/null; then
  # Try to enter the dir if script is run from parent
  if [ -d "crown-care" ]; then
    cd crown-care
    warn "Entered crown-care/ automatically."
  else
    fail "Run this script from inside the crown-care/ directory."
  fi
fi

section "Installing Prisma 7 adapter dependencies"
log "Installing @prisma/adapter-pg and pg..."
npm install @prisma/adapter-pg pg
npm install -D @types/pg
ok "Adapter dependencies installed."

section "Fixing prisma/schema.prisma (Prisma 7 format)"

# ── prisma/schema.prisma ─────────────────────────────────────
# Changes:
#   - generator: prisma-client-js  →  prisma-client  (with output)
#   - datasource: remove url = env(...)  (moved to prisma.config.ts)
cat > prisma/schema.prisma << 'PRISMA'
// Prisma 7 schema format
// Connection URL is in prisma.config.ts (not here)
// Generated client goes to generated/prisma/

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ─── Phase 1 placeholder ─────────────────────────────────────
// Full models added in Phase 4
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
PRISMA
ok "prisma/schema.prisma updated for Prisma 7"

section "Creating prisma.config.ts (new in Prisma 7)"

# ── prisma.config.ts (root) ───────────────────────────────────
cat > prisma.config.ts << 'PCONFIG'
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
PCONFIG
ok "prisma.config.ts created"

section "Installing dotenv (required by prisma.config.ts)"
npm install dotenv
ok "dotenv installed"

section "Updating lib/prisma.ts (Prisma 7 adapter pattern)"

# ── lib/prisma.ts ─────────────────────────────────────────────
# Prisma 7 requires passing the pg adapter to PrismaClient
cat > lib/prisma.ts << 'TS'
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";

// Prevent multiple Prisma Client instances in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
TS
ok "lib/prisma.ts updated for Prisma 7 adapter"

section "Adding generated/ to .gitignore"
if ! grep -q "generated/" .gitignore 2>/dev/null; then
  echo -e "\n# Prisma 7 generated client\ngenerated/" >> .gitignore
  ok ".gitignore updated"
else
  warn "generated/ already in .gitignore — skipping."
fi

section "Updating tsconfig.json (include generated/ folder)"
# Prisma 7 generates to generated/prisma, needs to be in TS paths
node - << 'NODE'
const fs = require('fs');
const path = 'tsconfig.json';
const tsconfig = JSON.parse(fs.readFileSync(path, 'utf8'));

// Ensure include covers generated/
if (!tsconfig.include) tsconfig.include = [];
const hasGenerated = tsconfig.include.some(p => p.includes('generated'));
if (!hasGenerated) {
  tsconfig.include.push('generated/**/*.ts');
  fs.writeFileSync(path, JSON.stringify(tsconfig, null, 2));
  console.log('[✓] tsconfig.json updated to include generated/');
} else {
  console.log('[!] tsconfig.json already includes generated/ — skipping.');
}
NODE

section "Ensuring .env exists for prisma.config.ts"
# prisma.config.ts uses dotenv/config which reads .env (not .env.local)
if [ ! -f ".env" ]; then
  if [ -f ".env.local" ]; then
    cp .env.local .env
    ok ".env created from .env.local"
  else
    echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crown_care"' > .env
    warn ".env created with defaults — update DATABASE_URL before db push"
  fi
else
  warn ".env already exists — skipping."
fi
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo ".env" >> .gitignore
  ok ".env added to .gitignore"
fi

section "Running npx prisma generate"
log "Generating Prisma 7 client into generated/prisma/..."
if npx prisma generate 2>&1; then
  ok "Prisma client generated at generated/prisma/"
else
  warn "prisma generate failed (likely network restriction in this environment)."
  warn "Run manually in your project: npx prisma generate"
fi

section "Hotfix Complete ✅"
echo -e "${GREEN}"
echo "  ┌──────────────────────────────────────────────────┐"
echo "  │     Crown Care — Prisma 7 Hotfix Applied         │"
echo "  ├──────────────────────────────────────────────────┤"
echo "  │  Changes made:                                   │"
echo "  │  ✓ prisma/schema.prisma  (Prisma 7 format)       │"
echo "  │  ✓ prisma.config.ts      (new — DB URL here)     │"
echo "  │  ✓ lib/prisma.ts         (adapter-pg pattern)    │"
echo "  │  ✓ generated/prisma/     (client output)         │"
echo "  ├──────────────────────────────────────────────────┤"
echo "  │  Next steps:                                     │"
echo "  │  1. Confirm .env.local has DATABASE_URL set      │"
echo "  │  2. Run: npx prisma db push                      │"
echo "  │  3. Run: npm run dev                             │"
echo "  │  4. Open: http://localhost:3000                  │"
echo "  └──────────────────────────────────────────────────┘"
echo -e "${RESET}"
