// src/app/layout.tsx

import { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import styles from "./layout.module.css";
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
        {/* === Google Analytics (GA4) === */}
        {/* 1) Load the gtag.js library */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7H0Y5YPLXJ"
          strategy="afterInteractive"
        />
        {/* 2) Initialize it */}
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7H0Y5YPLXJ', { page_path: window.location.pathname });
          `}
        </Script>

        {/* === Meta Pixel === */}
        {/* 1) Load the Facebook Pixel base code */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              // Initialize your pixel with your own ID:
              fbq('init', '1669960123320655');
              fbq('track', 'PageView');
            `,
          }}
        />
        {/* 2) NoScript fallback */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1669960123320655&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className={styles.bodyLayout}>
        <Navbar />
        <main className={styles.mainContent}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

