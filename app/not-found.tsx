// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-premium-gradient flex items-center justify-center text-center px-4">
      <div>
        <div className="font-display text-9xl font-bold text-gold-400 opacity-30 leading-none mb-4">404</div>
        <h1 className="font-display text-4xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-white/60 mb-8 font-body max-w-sm mx-auto">
          The page you're looking for doesn't exist. Let us help you get back on track.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
