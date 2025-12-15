import { LanguageProvider } from '@/lib/context/LanguageContext';
import './globals.css';
import localFont from 'next/font/local';

const customFont = localFont({
  src: './fonts/7.ttf',
  variable: '--font-custom',
  display: 'swap',
});
export const metadata = {
  title: 'Fast Express - Smart Logistics Solution',
  description: 'Fast Express is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Fast Express - Smart Logistics Solution',
    description: 'Fast Express is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
    url: 'https://forsenex.com',
    siteName: 'Fast Express',
    images: [
      {
        url: '/2.png',
        width: 1200,
        height: 630,
        alt: 'Fast Express Dashboard',
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