// src/app/cursos/[slug]/CourseSidebar.tsx

"use client";

import React, { useState, useEffect } from "react";
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

  const openVideo = async () => {
    try {
      console.log("Fetching preview video for course ID:", course.id);
      const { data, error } = await supabase
        .from<LessonData>("lessons")
        .select("video_url")
        .eq("course_id", course.id)
        .eq("preview_video", true)
        .order("lesson_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      console.log("Resultado de lessons:", { data, error });

      if (error || !data) {
        console.error("Error fetching preview video:", error || "No data returned");
        return;
      }
      setPreviewUrl(data.video_url);
      setShowPopup(true);
    } catch (err: any) {
      console.error("Error fetching preview video:", err.message);
    }
  };

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
