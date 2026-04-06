#!/usr/bin/env bash
# ============================================================
#  Crown Care — Infrastructure & Deployment Setup
#  Migrates: local PostgreSQL + JWT → Supabase (DB + Auth + Storage)
#  Deploy target: Vercel (Next.js) — Railway NOT needed
#
#  Run from inside crown-care/:
#    bash phase_infra.sh
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

# ─── Guard ───────────────────────────────────────────────────
if [ ! -f "package.json" ]; then
  if [ -d "crown-care" ]; then cd crown-care
  else fail "Run this script from inside the crown-care/ directory."; fi
fi

# ─── 1. Remove packages no longer needed ─────────────────────
section "Removing JWT / pg packages (replaced by Supabase)"
npm uninstall bcryptjs jsonwebtoken pg @prisma/adapter-pg
npm uninstall -D @types/bcryptjs @types/jsonwebtoken @types/pg
ok "Legacy auth and pg adapter packages removed."

# ─── 2. Install Supabase packages ────────────────────────────
section "Installing Supabase packages"
npm install @supabase/supabase-js @supabase/ssr
ok "Supabase packages installed."

# ─── 3. Update Prisma schema ─────────────────────────────────
# Supabase uses Postgres with connection pooling via pgBouncer
# Direct URL needed for migrations, pooler URL for runtime
section "Updating prisma/schema.prisma"
cat > prisma/schema.prisma << 'PRISMA'
// Crown Care — Prisma 7 Schema
// Database: Supabase PostgreSQL
// Connection URLs live in prisma.config.ts

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider  = "postgresql"
  // directUrl used by Prisma CLI (migrations/push)
  // url used at runtime via connection pooler (pgBouncer)
}

// ─── Phase 1 placeholder ─────────────────────────────────────
// Full models added in Phase 4
// NOTE: Supabase Auth manages the auth.users table automatically.
// We only store app-specific admin data here.
model AdminProfile {
  id        String   @id // matches Supabase auth.users UUID
  email     String   @unique
  name      String
  role      String   @default("admin")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
PRISMA
ok "prisma/schema.prisma updated"

# ─── 4. Update prisma.config.ts ──────────────────────────────
# Supabase provides two URLs:
#   DATABASE_URL       = pooler URL (port 6543, for app runtime)
#   DIRECT_DATABASE_URL = direct URL (port 5432, for migrations)
section "Updating prisma.config.ts for Supabase"
cat > prisma.config.ts << 'PCONFIG'
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_DATABASE_URL: used by Prisma CLI (migrate/push)
    // Bypasses pgBouncer — required for DDL operations
    url: env("DIRECT_DATABASE_URL"),
  },
});
PCONFIG
ok "prisma.config.ts updated (uses DIRECT_DATABASE_URL for migrations)"

# ─── 5. Update lib/prisma.ts ─────────────────────────────────
# Remove pg adapter — use standard PrismaClient with Supabase pooler URL
section "Updating lib/prisma.ts"
cat > lib/prisma.ts << 'TS'
import { PrismaClient } from "../generated/prisma";

// Prevent multiple PrismaClient instances during Next.js hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
TS
ok "lib/prisma.ts simplified (no pg adapter needed with Supabase)"

# ─── 6. Create lib/supabase/ ─────────────────────────────────
section "Creating Supabase client helpers"
mkdir -p lib/supabase

# ── lib/supabase/client.ts ────────────────────────────────────
# Browser-side client (for public/anon operations)
cat > lib/supabase/client.ts << 'TS'
import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 * Use in Client Components ("use client").
 * Uses the public anon key — safe to expose.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
TS
ok "lib/supabase/client.ts"

# ── lib/supabase/server.ts ────────────────────────────────────
# Server-side client (for API routes, Server Components, middleware)
cat > lib/supabase/server.ts << 'TS'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client.
 * Use in Server Components, API Routes, and Server Actions.
 * Reads auth session from cookies automatically.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from Server Component — safe to ignore
            // Middleware handles session refresh
          }
        },
      },
    }
  );
}
TS
ok "lib/supabase/server.ts"

# ── lib/supabase/middleware.ts ────────────────────────────────
cat > lib/supabase/middleware.ts << 'TS'
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase middleware helper.
 * Refreshes auth sessions and protects admin routes.
 * Called by middleware.ts at the root.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required for Server Components to read auth state
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all /admin routes (except /admin/login)
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // If logged-in user visits login page, redirect to dashboard
  if (isLoginPage && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
TS
ok "lib/supabase/middleware.ts"

# ── lib/supabase/admin.ts ─────────────────────────────────────
# Service-role client — ONLY for server-side admin operations
cat > lib/supabase/admin.ts << 'TS'
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client (service role).
 * ⚠️  NEVER expose this to the browser.
 * Use ONLY in API routes or Server Actions that require
 * admin-level database access (bypasses RLS).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
TS
ok "lib/supabase/admin.ts"

# ─── 7. Create middleware.ts (root) ──────────────────────────
section "Creating app middleware (route protection)"
cat > middleware.ts << 'TS'
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js middleware — runs on every matched request.
 * Handles Supabase session refresh and admin route protection.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
TS
ok "middleware.ts created"

# ─── 8. Create lib/supabase/storage.ts ───────────────────────
section "Creating Supabase Storage helper"
cat > lib/supabase/storage.ts << 'TS'
import { supabaseAdmin } from "./admin";

// Bucket names — must be created in Supabase dashboard
export const BUCKETS = {
  PORTFOLIO: "portfolio",
  SERVICES:  "services",
  GENERAL:   "general",
} as const;

type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

/**
 * Generate a unique file path for uploads.
 * Format: {prefix}/{timestamp}-{random}.{ext}
 */
export function generateFilePath(
  prefix: string,
  originalName: string
): string {
  const ext = originalName.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}/${timestamp}-${random}.${ext}`;
}
TS
ok "lib/supabase/storage.ts"

# ─── 9. Update .env.example ──────────────────────────────────
section "Updating .env.example"
cat > .env.example << 'ENV'
# ─── Supabase ─────────────────────────────────────────────────
# Found at: supabase.com → Project → Settings → API

# Public (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Secret (NEVER expose — server-side only)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ─── Database (Supabase PostgreSQL) ───────────────────────────
# Found at: supabase.com → Project → Settings → Database → Connection string

# Runtime URL — Transaction pooler (port 6543) for Next.js API routes
# Add ?pgbouncer=true&connection_limit=1 at the end
DATABASE_URL="postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct URL — for Prisma migrations (port 5432, bypasses pgBouncer)
DIRECT_DATABASE_URL="postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# ─── App ──────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# ─── Supabase Storage Buckets (created in Supabase dashboard) ─
# portfolio, services, general
# These are public buckets — no key needed to READ
# Upload uses service role key above
ENV
ok ".env.example updated"

# ─── 10. Update .env.local ────────────────────────────────────
section "Updating .env.local template"
if [ -f ".env.local" ]; then
  # Backup existing
  cp .env.local .env.local.backup
  warn "Backed up existing .env.local → .env.local.backup"
fi

cat > .env.local << 'ENV'
# ─── Fill these with your actual Supabase project values ──────
# supabase.com → Project → Settings → API

NEXT_PUBLIC_SUPABASE_URL="https://dzrfmecdnavozxdeixxr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_WiOC4J4HVoDH_tLSiJsixg_5JIKPX8t"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cmZtZWNkbmF2b3p4ZGVpeHhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ3ODg0NSwiZXhwIjoyMDkxMDU0ODQ1fQ.mEDYqBPp36r8HC-5b7J0ihE2J17YwYF6As2QkfmFO5Y"

# supabase.com → Project → Settings → Database → Connection string
# Transaction pooler (port 6543) — for Next.js runtime
DATABASE_URL="postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (port 5432) — for Prisma migrations only
DIRECT_DATABASE_URL="postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV
ok ".env.local reset with Supabase template"

# Also update .env (read by prisma.config.ts via dotenv/config)
cat > .env << 'ENV'
# Prisma CLI needs DIRECT_DATABASE_URL to run migrations
# Copy from .env.local after filling in your Supabase values
DIRECT_DATABASE_URL="postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
DATABASE_URL="postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
ENV
ok ".env updated (Prisma CLI reads this)"

# ─── 11. Update next.config.ts ────────────────────────────────
section "Updating next.config.ts (Supabase image domains)"
cat > next.config.ts << 'NEXT'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Cloudinary (kept as fallback)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Unsplash (dev placeholder images)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@supabase/supabase-js"],
  },
};

export default nextConfig;
NEXT
ok "next.config.ts updated"

# ─── 12. Create vercel.json ───────────────────────────────────
section "Creating vercel.json"
cat > vercel.json << 'JSON'
{
  "framework": "nextjs",
  "buildCommand": "npx prisma generate && npm run build",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "DATABASE_URL": "@database_url",
    "DIRECT_DATABASE_URL": "@direct_database_url"
  }
}
JSON
ok "vercel.json created"

# ─── 13. Update package.json scripts ─────────────────────────
section "Adding production scripts to package.json"
node - << 'NODE'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

pkg.scripts = {
  ...pkg.scripts,
  // Vercel build: generate Prisma client then build Next.js
  "build": "prisma generate && next build",
  // Local DB operations
  "db:push":     "prisma db push",
  "db:migrate":  "prisma migrate dev",
  "db:studio":   "prisma studio",
  "db:generate": "prisma generate",
  // Type checking
  "type-check":  "tsc --noEmit",
};

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
console.log("[✓] package.json scripts updated");
NODE

# ─── 14. Create lib/utils.ts ─────────────────────────────────
section "Creating lib/utils.ts (shared helpers)"
cat > lib/utils.ts << 'TS'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely (resolves conflicts).
 * Usage: cn("px-4 py-2", condition && "bg-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in USD.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * Truncate a string to a max length.
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
TS

# Install clsx and tailwind-merge (used by lib/utils.ts)
npm install clsx tailwind-merge
ok "lib/utils.ts + clsx + tailwind-merge installed"

# ─── 15. Final summary ────────────────────────────────────────
section "Infrastructure Migration Complete ✅"
echo -e "${GREEN}"
cat << 'SUMMARY'
  ┌────────────────────────────────────────────────────────────┐
  │     Crown Care — Infrastructure Setup Done                │
  ├────────────────────────────────────────────────────────────┤
  │  Architecture:                                            │
  │  ✓ Vercel        → Next.js (frontend + API routes)        │
  │  ✓ Supabase      → PostgreSQL + Auth + Storage            │
  │  ✗ Railway       → not needed (API routes handle backend) │
  ├────────────────────────────────────────────────────────────┤
  │  Files changed / created:                                 │
  │  ✓ prisma/schema.prisma    (AdminProfile model, no URL)   │
  │  ✓ prisma.config.ts        (uses DIRECT_DATABASE_URL)     │
  │  ✓ lib/prisma.ts           (no pg adapter, simplified)    │
  │  ✓ lib/supabase/client.ts  (browser client)               │
  │  ✓ lib/supabase/server.ts  (server client + cookies)      │
  │  ✓ lib/supabase/middleware.ts (session + route guard)     │
  │  ✓ lib/supabase/admin.ts   (service role client)          │
  │  ✓ lib/supabase/storage.ts (upload/delete helpers)        │
  │  ✓ lib/utils.ts            (cn, slugify, formatPrice)     │
  │  ✓ middleware.ts           (root — protects /admin/*)     │
  │  ✓ next.config.ts          (Supabase image domain)        │
  │  ✓ vercel.json             (deploy config)                │
  │  ✓ .env.example            (updated)                      │
  │  ✓ .env.local              (template to fill in)          │
  ├────────────────────────────────────────────────────────────┤
  │  Removed:                                                 │
  │  ✗ bcryptjs / jsonwebtoken  (replaced by Supabase Auth)   │
  │  ✗ pg / @prisma/adapter-pg  (not needed with Supabase)    │
  └────────────────────────────────────────────────────────────┘
SUMMARY
echo -e "${RESET}"

echo -e "${BOLD}${CYAN}NEXT STEPS:${RESET}"
echo ""
echo -e "  ${BOLD}1. Create Supabase project${RESET}"
echo "     → supabase.com → New Project → copy credentials"
echo ""
echo -e "  ${BOLD}2. Fill in .env.local${RESET} (and .env) with your Supabase values"
echo "     → NEXT_PUBLIC_SUPABASE_URL"
echo "     → NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "     → SUPABASE_SERVICE_ROLE_KEY"
echo "     → DATABASE_URL        (port 6543 — Transaction pooler)"
echo "     → DIRECT_DATABASE_URL (port 5432 — Direct connection)"
echo ""
echo -e "  ${BOLD}3. Apply schema to Supabase${RESET}"
echo "     → npx prisma db push"
echo ""
echo -e "  ${BOLD}4. Create Storage buckets in Supabase dashboard${RESET}"
echo "     → portfolio (public)"
echo "     → services  (public)"
echo "     → general   (public)"
echo ""
echo -e "  ${BOLD}5. Run locally${RESET}"
echo "     → npm run dev"
echo ""
echo -e "  ${BOLD}6. Deploy to Vercel${RESET}"
echo "     → vercel login"
echo "     → vercel --prod"
echo "     → Add env vars in Vercel dashboard"
echo ""
