// src/app/cursos/[slug]/CourseSidebar.tsx

"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import styles from "./CourseSidebar.module.css";
import BuyButton from "./BuyButton"; // Adjust the path if needed
import VideoViewPopup from "../../components/VideoViewPopup"; // Adjust the path if needed
import { supabase } from "@/lib/supabaseClient";

interface Course {
  id: string;
  title: string;
  price: number;
  thumbnail_url: string;
  discount?: number;
  course_includes?: string;
  preview_video?: string; // New column added to "courses"
}

interface LessonData {
  video_url: string;
}

interface CourseSidebarProps {
  course: Course;
}

export default function CourseSidebar({ course }: CourseSidebarProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Since we are now using the "courses" table only, we can check the preview_video there.
  const openVideo = async () => {
    // If the course already has the preview video URL, open the popup
    if (course.preview_video) {
      setPreviewUrl(course.preview_video);
      setShowPopup(true);
    } else {
      console.error("No preview video available for this course");
    }
  };

  // Calculate the original price if a discount exists.
  const originalPrice = course.discount
    ? (course.price / (1 - course.discount)).toFixed(2)
    : null;

  return (
    <div className={styles.sidebar}>
      {/* Imagen del curso y botón para reproducir la vista previa */}
      <div className={styles.courseImage}>
        <img src={course.thumbnail_url} alt={course.title} />
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
              Precio Original: MX${parseFloat(originalPrice).toFixed(2)}
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
      {showPopup && previewUrl && (
        <VideoViewPopup videoUrl={previewUrl} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}
