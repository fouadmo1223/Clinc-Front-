import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const fontSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontSansAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-ar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Clinic OS',
  description: 'Clinic management operating system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSansAr.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
