import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PolePost',
  description: 'Flyer-first local event discovery.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
