import { LanguageProvider } from '@/lib/context/LanguageContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import './globals.css';
import localFont from 'next/font/local';

export const viewport = {
  themeColor: '#000000',
};

const customFont = localFont({
  src: '../../public/fonts/7.ttf',
  variable: '--font-custom',
  display: 'swap',
});
export const metadata = {
  title: 'Express Service - Smart Logistics Solution',
  description: 'Express Service is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
  metadataBase: new URL('https://forsenex.com'), // ✅ add this
  icons: {
    icon: '/5.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Express Service - Smart Logistics Solution',
    description: 'Express Service is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
    siteName: 'Express Service',
    images: [
      {
        url: '/5.png', // ✅ make it relative to metadataBase
        width: 1200,
        height: 630,
        alt: 'Express Service Dashboard',
      },
    ],
    type: 'website',
  },
};


export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body className={customFont.className}>
        {/* <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            backgroundImage: 'url("/5.png")',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            opacity: 0.2,
            pointerEvents: 'none'
          }}
        /> */}
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}