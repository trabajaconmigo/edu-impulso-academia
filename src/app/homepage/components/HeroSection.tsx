"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.heroContainer}>
      <picture>
        <source media="(min-width: 768px)" srcSet="/images/hero2.jpg" />
        <Image
          src="/images/hero1.jpg"
          alt="Hero Image"
          width={800}
          height={800}
          className={styles.heroImage}
        />
      </picture>
      <div className={styles.heroContent}>
        <h1>Bienvenido a Escuela 360</h1>
        <p>La mejor plataforma de cursos en línea para expandir tus habilidades.</p>
        <Link href="/cursos">
          <button className={styles.exploreBtn}>Explorar Cursos</button>
        </Link>
      </div>
    </section>
  );
}
