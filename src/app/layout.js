// File: src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "نظام إدارة الخدمات اللوجستية",
  description: "شركة الخدمة السريعة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}