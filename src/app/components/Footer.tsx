"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

// Import React Icons from 'react-icons'
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Main Footer Container */}
      <div className={styles.footerContainer}>
        {/* About Us Section */}
        <div className={styles.footerSection}>
          <h4>Sobre Nosotros</h4>
          <p>
            Edu Impulso Academia es una plataforma de cursos en línea 
            dedicada a impulsar el aprendizaje de manera flexible 
            y accesible, ofreciendo conocimientos de alta calidad 
            para todos.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className={styles.footerSection}>
          <h4>Enlaces Rápidos</h4>
          <ul className={styles.linkList}>
            <li>
              <Link href="/AcercaDe">Acerca de</Link>
            </li>
            <li>
              <Link href="/Contacto">Contacto</Link>
            </li>
            <li>
              <Link href="/politica">Política de Privacidad</Link>
            </li>
            <li>
              <Link href="/terminos">Términos de Servicio</Link>
            </li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div className={styles.footerSection}>
          <h4>Síguenos</h4>
          <div className={styles.socialIcons}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

       
      </div>

      {/* Bottom Footer Row */}
      <div className={styles.footerBottom}>
        <p>
          © {new Date().getFullYear()} Edu Impulso Academia. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
