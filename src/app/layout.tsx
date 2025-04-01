// app/layout.tsx
import { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Edu Impulso Academia",
  description: "Plataforma de cursos en línea de alta calidad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={styles.bodyLayout}>
        <Navbar />
        <main className={styles.mainContent}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
