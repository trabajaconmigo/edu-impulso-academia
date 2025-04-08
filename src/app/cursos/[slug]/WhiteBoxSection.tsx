"use client";

import Link from "next/link";
import styles from "./WhiteBoxSection.module.css";

interface WhiteBoxSectionProps {
  slug: string;
}

export default function WhiteBoxSection({ slug }: WhiteBoxSectionProps) {
  return (
    <div className={styles.whiteBox}>
      <h2>Descripción</h2>
      <p>
        Aprende técnicas de fotografía, edición y composición para capturar
        momentos únicos con tu cámara digital.
      </p>

      <h3>Lo que aprenderás</h3>
      <ul>
        <li>Principios de composición fotográfica</li>
        <li>Edición digital con software profesional</li>
        <li>Técnicas avanzadas de iluminación</li>
        <li>Configuración manual de la cámara</li>
      </ul>

      <Link href={`/cursos/${slug}/contenido`}>
        <button className={styles.courseButton}>Ver Contenido del Curso</button>
      </Link>
    </div>
  );
}
