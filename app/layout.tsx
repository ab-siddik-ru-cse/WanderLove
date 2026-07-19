import type { Metadata, Viewport } from 'next';
import { Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeModeScript } from '@/components/ThemeModeScript';

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

// Without this, mobile browsers render the page at desktop width and the
// user has to pinch-zoom — this is what fixes "every screen looks zoomed in".
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className="min-h-screen bg-blush font-body text-ink antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
