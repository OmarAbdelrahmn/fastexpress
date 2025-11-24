import "./globals.css";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "موقعي",
  description: "لوحة التحكم",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <header
          style={{
            backgroundColor: "#ff8800",
            color: "white",
            padding: "15px 20px",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          شركه الخدمة السريعة للخدمات اللوجيستية
        </header>

        <div style={{ display: "flex", height: "100vh" }}>
          <Sidebar />

          <main
            style={{
              flexGrow: 1,
              padding: "20px",
              backgroundColor: "#fff",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
