// Phase 1 placeholder — will be replaced in Phase 3
export default function HomePage() {
  return (
    <main className="min-h-screen gradient-hero flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">

        {/* Crown logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center shadow-gold-lg animate-float">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M5 28L10 15L20 22L30 10L35 28H5Z"
                fill="white" strokeLinejoin="round"
              />
              <rect x="5" y="28" width="30" height="5" rx="2" fill="white" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
          Crown Care
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-gold-500/60" />
          <span className="text-gold-400 text-sm font-medium tracking-widest uppercase">
            Premium Upholstery Cleaning
          </span>
          <div className="h-px w-16 bg-gold-500/60" />
        </div>

        {/* Subtitle */}
        <p className="text-primary-200 text-lg md:text-xl mb-10 animate-slide-up">
          Phase 1 complete — project structure initialized.
        </p>

        {/* Status badges */}
        <div className="flex flex-wrap justify-center gap-3 animate-slide-up">
          {[
            "✅ Next.js App Router",
            "✅ TailwindCSS",
            "✅ Framer Motion",
            "✅ Prisma ORM",
            "✅ TypeScript",
            "✅ Design System",
          ].map((item) => (
            <span
              key={item}
              className="px-4 py-2 rounded-full glass text-white text-sm font-medium
                         hover:bg-white/20 transition-colors duration-200"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
