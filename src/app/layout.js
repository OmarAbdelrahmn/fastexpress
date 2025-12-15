import { LanguageProvider } from '@/lib/context/LanguageContext';
import './globals.css';
import localFont from 'next/font/local';

const customFont = localFont({
  src: './fonts/7.ttf',
  variable: '--font-custom',
  display: 'swap',
});
export const metadata = {
  title: 'Express Service - Smart Logistics Solution',
  description: 'Express Service is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Express Service - Smart Logistics Solution',
    description: 'Express Service is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
    url: 'https://forsenex.com',
    siteName: 'Express Service',
    images: [
      {
        url: '/2.png',
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
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}