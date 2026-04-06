// app/admin/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin Dashboard', template: '%s | Crown Care Admin' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
