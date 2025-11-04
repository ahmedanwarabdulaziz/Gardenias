import type { Metadata } from 'next';
import ThemeProvider from '@/components/ThemeProvider';
import ConditionalLayout from '@/components/shared/ConditionalLayout';
import CacheBuster from '@/components/shared/CacheBuster';
import '@/styles/globals.css';
import '@/styles/accessibility.css';

export const metadata: Metadata = {
  title: 'Gardenias Healthcare - Professional Medical Services',
  description: 'Professional healthcare services with modern medical facilities. Expert doctors, advanced treatments, and compassionate care for all your medical needs.',
  keywords: 'healthcare, medical, doctor, hospital, clinic, medical treatment, healthcare provider, medical consultation, emergency care, specialized medicine',
  icons: {
    icon: [
      { 
        url: '/images/logoo.png', 
        type: 'image/png',
        sizes: '512x512',
        rel: 'icon',
      },
      { 
        url: '/images/logoo.png', 
        type: 'image/png',
        sizes: '192x192',
        rel: 'icon',
      },
      { 
        url: '/images/logoo.png', 
        type: 'image/png',
        sizes: '32x32',
        rel: 'icon',
      },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { 
        url: '/images/logoo.png', 
        type: 'image/png',
        sizes: '180x180',
      },
    ],
    shortcut: [
      { url: '/images/logoo.png', type: 'image/png' },
    ],
  },
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/images/logoo.png" />
        <meta name="theme-color" content="#008d80" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="build-version" content="1.0.0" />
        
        {/* Google Fonts - Preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Source+Sans+Pro:wght@300;400;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body suppressHydrationWarning={true} style={{ fontFamily: '"Source Sans Pro", sans-serif' }}>
        <CacheBuster />
        <ThemeProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
