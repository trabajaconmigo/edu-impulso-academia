"use client";

import React, { useState } from "react";
import Image from "next/image"; // ← Replaces <img>
import styles from "./CourseSidebar.module.css";
import BuyButton from "./BuyButton";
import VideoViewPopup from "../../components/VideoViewPopup";

interface Course {
  id: string;
  title: string;
  price: number;
  thumbnail_url: string;
  discount?: number;
  course_includes?: string;
  preview_video?: string;
}

interface CourseSidebarProps {
  course: Course;
}

export default function CourseSidebar({ course }: CourseSidebarProps) {
  const [showPopup, setShowPopup] = useState(false);

  const openVideo = () => {
    if (course.preview_video) {
      setShowPopup(true);
    } else {
      console.error("No preview video available");
    }
  };

  const originalPrice = course.discount
    ? (course.price / (1 - course.discount)).toFixed(2)
    : null;

  return (
    <div className={styles.sidebar}>
      {/* Imagen del curso y botón para reproducir la vista previa */}
      <div className={styles.courseImage}>
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          width={600}
          height={400}
          className={styles.someImageClass} // optional, to style it
        />
        <div className={styles.playButton} onClick={openVideo}>
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p>Vista previa</p>
        </div>
      </div>

      {/* Sección de precios y oferta */}
      <div className={styles.priceSection}>
        <div className={styles.currentPrice}>MX${course.price.toFixed(2)}</div>
        {originalPrice && (
          <>
            <div className={styles.originalPrice}>
              Precio Original: MX$
              {parseFloat(originalPrice).toFixed(2)}
            </div>
            <div className={styles.discount}>
              {Math.round((course.discount || 0) * 100)}% de descuento
            </div>
            <div className={styles.timer}>¡Oferta termina en 4 horas!</div>
          </>
        )}
        <div className={styles.guarantee}>
          Garantía de devolución de 30 días
        </div>
      </div>

      {/* Botón de compra */}
      <div className={styles.buyButton}>
        <BuyButton course={course} />
      </div>

      {/* Sección de características del curso (contenido HTML dinámico) */}
      {course.course_includes && (
        <div className={styles.courseIncludes}>
          <h4>Este curso incluye:</h4>
          <div dangerouslySetInnerHTML={{ __html: course.course_includes }} />
        </div>
      )}

      {/* Popup para la vista previa del video */}
      {showPopup && course.preview_video && (
        <VideoViewPopup
          videoUrl={course.preview_video}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
