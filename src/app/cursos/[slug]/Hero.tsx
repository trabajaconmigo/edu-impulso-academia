"use client";

import styles from "./Hero.module.css";

interface HeroProps {
  title: string;
  description: string;
}

export default function Hero({ title, description }: HeroProps) {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroSubtitle}>{description}</p>
      </div>
    </div>
  );
}
