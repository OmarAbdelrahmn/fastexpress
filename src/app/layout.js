import { LanguageProvider } from '@/lib/context/LanguageContext';
import './globals.css';

export const metadata = {
  title: 'Fast Express',
  description: 'Logistics Management System',
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}