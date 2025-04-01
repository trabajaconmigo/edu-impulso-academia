"use client";
import React from "react";
import Link from "next/link";
import styles from "./ClientLayout.module.css";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      {/* NAVBAR */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logo}>
            EDU IMPULSO
          </Link>
          <nav className={styles.navLinks}>
            <Link href="/cursos">Cursos</Link>
            <Link href="/concejos">Concejos</Link>
          </nav>
        </div>
        <div className={styles.navRight}>
          <Link href="/auth/login" className={styles.loginButton}>
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>{children}</main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <p>© 2025 Edu Impulso Academia. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
