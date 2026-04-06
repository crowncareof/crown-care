# 👑 Crown Care — Premium Upholstery Cleaning Website

A production-ready, full-stack marketing website + admin dashboard built with **Next.js 14**, **TailwindCSS**, **Framer Motion**, **Prisma**, **PostgreSQL**, **JWT auth**, and **Cloudinary**.

---

## 📸 Features

### Public Website
- ✅ **Hero Section** — Animated headline, stats, and interactive before/after slider
- ✅ **Trust Section** — Benefits grid with hover animations
- ✅ **Services Section** — Dynamic cards fetched from DB, image, price, duration
- ✅ **Portfolio Section** — Before/After comparison sliders for each item
- ✅ **Testimonials** — Paginated carousel with star ratings
- ✅ **Contact Form** — Saves leads to DB with email + phone
- ✅ **Footer** — Navigation, contacts, social links
- ✅ **Floating WhatsApp Button** — Animated, always visible
- ✅ **Sticky Header** — Transparent → solid on scroll, mobile menu
- ✅ **SEO** — Metadata, Open Graph, page titles

### Admin Dashboard (`/admin`)
- ✅ **JWT Authentication** — Login, cookie + localStorage
- ✅ **Dashboard Overview** — Stats: services, portfolio, testimonials, leads
- ✅ **Services CRUD** — Create/edit/delete with image upload
- ✅ **Portfolio CRUD** — Before + After image upload with Cloudinary
- ✅ **Testimonials CRUD** — Star rating selector
- ✅ **Leads Viewer** — See all contact form submissions
- ✅ **Responsive Sidebar** — Collapsible mobile drawer

---

## 🧱 Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Framework   | Next.js 14 (App Router)                  |
| Styling     | TailwindCSS + custom design system        |
| Animations  | Framer Motion                             |
| Database    | PostgreSQL via Prisma ORM                 |
| Auth        | JWT (jsonwebtoken) + bcrypt               |
| Images      | Cloudinary                               |
| Fonts       | Playfair Display + DM Sans (Google Fonts) |
| Toasts      | react-hot-toast                           |
| Icons       | react-icons (Feather Icons)               |

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd crown-care
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# PostgreSQL (local or Railway/Supabase/Neon)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/crowncare"

# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Cloudinary (create free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# App config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="15551234567"  # No spaces or + sign
NEXT_PUBLIC_COMPANY_PHONE="(555) 123-4567"
NEXT_PUBLIC_COMPANY_EMAIL="info@crowncare.com"
```

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed with sample data (admin user + services + testimonials)
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

**Default credentials:** `admin@crowncare.com` / `admin123`

---

## 🗄️ Database Setup Options

### Option A — Local PostgreSQL
```bash
# Install PostgreSQL, then:
createdb crowncare
# Use: DATABASE_URL="postgresql://postgres:password@localhost:5432/crowncare"
```

### Option B — Neon (free cloud PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Option C — Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a project → Settings → Database
3. Copy the URI connection string

### Option D — Railway
1. Go to [railway.app](https://railway.app)
2. New project → PostgreSQL
3. Copy the connection variable

---

## ☁️ Cloudinary Setup

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → API Keys
3. Copy `Cloud Name`, `API Key`, `API Secret` to `.env.local`

---

## 📁 Project Structure

```
crown-care/
├── app/
│   ├── layout.tsx              # Root layout with fonts & Toaster
│   ├── page.tsx                # Public homepage (SSR + ISR)
│   ├── globals.css             # Design system, utilities, keyframes
│   ├── not-found.tsx           # 404 page
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout
│   │   ├── page.tsx            # Redirect to /admin/dashboard
│   │   ├── login/page.tsx      # JWT login form
│   │   ├── dashboard/page.tsx  # Stats overview + recent leads
│   │   ├── services/page.tsx   # Services CRUD
│   │   ├── portfolio/page.tsx  # Portfolio CRUD
│   │   ├── testimonials/page.tsx # Testimonials CRUD
│   │   └── leads/page.tsx      # Leads viewer
│   └── api/
│       ├── auth/login/route.ts   # POST login → JWT cookie
│       ├── auth/logout/route.ts  # POST clear cookie
│       ├── auth/me/route.ts      # GET current user
│       ├── services/route.ts     # GET all / POST create
│       ├── services/[id]/route.ts # GET / PUT / DELETE
│       ├── portfolio/route.ts    # GET all / POST create
│       ├── portfolio/[id]/route.ts
│       ├── testimonials/route.ts
│       ├── testimonials/[id]/route.ts
│       ├── contact/route.ts      # POST (public) / GET (admin)
│       ├── upload/route.ts       # POST image → Cloudinary
│       └── admin/stats/route.ts  # GET dashboard stats
├── components/
│   ├── sections/               # Public website sections
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx     # Before/After slider + hero
│   │   ├── TrustSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── PortfolioSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── CTASection.tsx      # Contact form
│   │   └── Footer.tsx
│   ├── ui/
│   │   └── WhatsAppButton.tsx  # Floating animated button
│   └── admin/
│       ├── AdminShell.tsx      # Layout wrapper + auth guard
│       ├── AdminSidebar.tsx    # Sidebar with mobile drawer
│       ├── ImageUploader.tsx   # Drag & drop Cloudinary uploader
│       └── StatCard.tsx        # Dashboard metric card
├── lib/
│   ├── prisma.ts               # Prisma singleton
│   ├── auth.ts                 # JWT sign/verify helpers
│   ├── cloudinary.ts           # Upload/delete helpers
│   └── utils.ts                # cn, whatsappLink, etc.
├── prisma/
│   ├── schema.prisma           # DB models: User, Service, Portfolio, Testimonial, Lead
│   └── seed.js                 # Sample data seeder
├── tailwind.config.ts          # Colors, fonts, shadows, animations
├── next.config.js
├── tsconfig.json
└── .env.example
```

---

## 🔐 Admin Security Notes

- JWT stored in HTTP-only cookie (server) and localStorage (client)
- All admin API routes require `Authorization: Bearer <token>`
- Passwords hashed with bcrypt (12 rounds)
- Change `JWT_SECRET` to a strong random string in production

**To change admin password:**
```bash
npm run db:studio
# Edit the User table → update hashed password
# Or re-seed with a new password in prisma/seed.js
```

---

## 📦 Production Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Or: vercel env add DATABASE_URL
```

### Build locally

```bash
npm run build
npm run start
```

---

## 🎨 Customization

### Change company info
Edit `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER="15559876543"
NEXT_PUBLIC_COMPANY_PHONE="(555) 987-6543"
NEXT_PUBLIC_COMPANY_EMAIL="hello@yourcompany.com"
```

### Change colors
Edit `tailwind.config.ts` → `colors` section.

### Add more services
Use the admin panel at `/admin/services` to add/edit services dynamically.

---

## 🧪 Useful Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema changes to DB (no migration file)
npm run db:migrate   # Create migration file + push
npm run db:seed      # Re-seed the database
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## 📄 License

MIT — Free to use for commercial projects.

---

Built with ❤️ for Crown Care. Premium upholstery cleaning, premium digital presence.
