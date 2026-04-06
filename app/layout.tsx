// app/layout.tsx
import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Crown Care — Premium Upholstery Cleaning',
    template: '%s | Crown Care',
  },
  description:
    'Professional upholstery cleaning services. We restore sofas, chairs, mattresses, and rugs to their original beauty. Safe for kids & pets. Serving the United States.',
  keywords: [
    'upholstery cleaning',
    'sofa cleaning',
    'couch cleaning',
    'mattress cleaning',
    'professional cleaning',
    'Crown Care',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Crown Care',
    title: 'Crown Care — Premium Upholstery Cleaning',
    description: 'Restore your furniture to its original beauty with our professional cleaning service.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} font-body antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-dm-sans)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(10,27,77,0.15)',
            },
          }}
        />
      </body>
    </html>
  );
}
