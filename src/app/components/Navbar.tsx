// app/components/Navbar.tsx
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
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
  );
}
