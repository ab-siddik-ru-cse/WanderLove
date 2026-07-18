import type { Metadata } from 'next';
import { Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'WanderLove — Couple Travel Command Center',
  description: 'Plan your trips together, one love story at a time. 💕'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-blush font-body text-ink antialiased">{children}</body>
    </html>
  );
}
