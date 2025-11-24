import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "نظام إدارة الخدمات اللوجستية",
  description: "شركة الخدمة السريعة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.className} m-0 bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
