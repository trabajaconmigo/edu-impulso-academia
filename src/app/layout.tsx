// src/app/layout.tsx
import { Metadata } from "next";
import Script from "next/script";
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
      <head>
        {/*
          === Google Tag Manager ===
          This snippet loads GTM on every page. We then
          configure your GA4 tag *inside* the GTM UI.
        */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N47392MZ');
          `}
        </Script>
      </head>

      <body className={styles.bodyLayout}>
        {/*
          === Google Tag Manager (noscript) ===
          This iframe fallback ensures GTM still collects a pageview
          if the user has disabled JavaScript.
        */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N47392MZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Navbar on every page */}
        <Navbar />

        <main className={styles.mainContent}>{children}</main>

        <Footer />
      </body>
    </html>
  );
}
