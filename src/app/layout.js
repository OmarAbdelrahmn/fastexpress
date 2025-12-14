import { LanguageProvider } from '@/lib/context/LanguageContext';
import './globals.css';
import localFont from 'next/font/local';

const customFont = localFont({
  src: './fonts/7.ttf',
  variable: '--font-custom',
  display: 'swap',
});
export const metadata = {
  title: 'Fast Express',
  description: 'Logistics Management System',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Fast Express',
    description: 'Logistics Management System',
    url: 'https://forsenex.com',
    siteName: 'Fast Express',
    images: [
      {
        url: '/favicon.ico',
        width: 1200,
        height: 630,
        alt: 'Fast Express',
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