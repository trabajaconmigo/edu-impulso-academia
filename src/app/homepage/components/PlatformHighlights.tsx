"use client";

import React from "react";
import { FaQuoteLeft, FaStar, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import styles from "./PlatformHighlights.module.css";

export default function PlatformHighlights() {
  return (
    <section className={styles.highlightsContainer}>
      <h2 className={styles.sectionTitle}>
        Mira lo que otros están logrando con el aprendizaje en línea
      </h2>

      {/* Principal highlight about popularity/stats */}
      <div className={styles.highlightBlock}>
        <p className={styles.highlightText}>
          Edu Impulso Academia fue calificada como la plataforma de cursos en línea
          más popular para desarrollar nuevas habilidades, según nuestra encuesta 
          a miles de estudiantes en 2025.
        </p>
        <p className={styles.smallNote}>Más de 37,000 respuestas recopiladas</p>
      </div>

      {/* Testimonials */}
      <div className={styles.testimonialsWrapper}>
        {/* First Testimonial */}
        <blockquote className={styles.testimonial}>
          <FaQuoteLeft className={styles.quoteIcon} />
          <p className={styles.testimonialQuote}>
            "Edu Impulso fue un verdadero cambio de juego y una gran guía para mí 
            mientras construíamos nuestra startup tecnológica. Aprendí exactamente 
            lo que necesitaba para lanzarla con éxito."
          </p>
          <footer className={styles.testimonialAuthor}>
            <strong>Alvin Lim</strong><br />
            Co-Fundador Técnico, CTO en Dimensional
          </footer>
        </blockquote>

        {/* Second Testimonial */}
        <blockquote className={styles.testimonial}>
          <FaQuoteLeft className={styles.quoteIcon} />
          <p className={styles.testimonialQuote}>
            "La plataforma me dio la persistencia que necesitaba. Aprendí justo lo 
            necesario para cambiar de carrera. Me ayudó a destacar y a obtener un nuevo puesto."
          </p>
          <footer className={styles.testimonialAuthor}>
            <strong>William A. Wachlin</strong><br />
            Gerente de Cuentas en Amazon Web Services
          </footer>
        </blockquote>

        {/* Third Testimonial */}
        <blockquote className={styles.testimonial}>
          <FaQuoteLeft className={styles.quoteIcon} />
          <p className={styles.testimonialQuote}>
            "Con Edu Impulso nuestros empleados conectaron habilidades técnicas 
            con las habilidades suaves de consultoría... impulsando sus carreras 
            y el desarrollo de la empresa."
          </p>
          <footer className={styles.testimonialAuthor}>
            <strong>Ian Stevens</strong><br />
            Jefe de Desarrollo de Capacidades en Publicis Sapient
          </footer>
        </blockquote>
      </div>

      {/* Additional highlight about future of learning */}
      <div className={styles.highlightBlock}>
        <div className={styles.iconHeading}>
          <FaStar className={styles.headingIcon} />
          <h3 className={styles.smallHeading}>Tendencias para el futuro del trabajo</h3>
        </div>
        <p className={styles.highlightText}>
          Nuestro Informe Global de Tendencias de Aprendizaje y Habilidades 2025 
          ya está disponible. ¡Descubre cómo desarrollar las habilidades clave 
          para mantenerte al día con los cambios!
        </p>
      </div>

     
       
    
    </section>
  );
}
