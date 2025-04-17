import { Metadata } from "next";
import "./globals.css";          // <-- Global styles
import styles from "./layout.module.css"; // local layout module if needed
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Playfair_Display, Open_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escuela 360",
  description: "Plataforma de cursos en línea.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${openSans.variable}`}>
      <body className={styles.bodyLayout}>
        {/* Navbar on every page */}
        <Navbar />
        <main className={styles.mainContent}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
