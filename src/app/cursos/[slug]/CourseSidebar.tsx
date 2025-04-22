// src/app/components/CourseSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./CourseSidebar.module.css";
import BuyButton from "./BuyButton";
import VideoViewPopup from "../../components/VideoViewPopup";
import { supabase } from "@/lib/supabaseClient";

interface Course {
  id: string;
  title: string;
  price: number;                // Precio original
  thumbnail_url: string;
  discount_percentage: number;  // Nuevo
  discount_active: boolean;     // Nuevo
  course_includes?: string;
  preview_video?: string;
}

interface CourseSidebarProps {
  course: Course;
}

export default function CourseSidebar({ course }: CourseSidebarProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Comprobar si el usuario ya compró
  useEffect(() => {
    async function checkPurchase() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const userId = sessionData.session.user.id;
        const { data, error } = await supabase
          .from("purchases")
          .select("id")
          .eq("course_id", course.id)
          .eq("user_id", userId)
          .single();
        setHasPurchased(!error && !!data);
      } else {
        setHasPurchased(false);
      }
    }
    checkPurchase();
  }, [course.id]);

  // ¿Hay descuento activo?
  const hasValidDiscount =
    course.discount_active && course.discount_percentage > 0;

  // Calcular precio final
  const finalPrice = hasValidDiscount
    ? Number((course.price * (1 - course.discount_percentage / 100)).toFixed(2))
    : course.price;

  const openVideo = () => {
    if (course.preview_video) {
      setShowPopup(true);
    } else {
      console.error("No preview video available");
    }
  };

  return (
    <div className={styles.sidebar}>
      {/* Imagen + preview */}
      <div className={styles.courseImage}>
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          width={600}
          height={400}
          className={styles.someImageClass}
        />
        <div className={styles.playButton} onClick={openVideo}>
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p>Vista previa</p>
        </div>
      </div>

      {/* Precio */}
      {!hasPurchased && (
        <div className={styles.priceSection}>
          {hasValidDiscount ? (
            <>
              <div className={styles.originalPrice}>
                MX${course.price.toFixed(2)}
              </div>
              <div className={styles.currentPrice}>
                MX${finalPrice.toFixed(2)}
              </div>
              <div className={styles.discount}>
                {course.discount_percentage}% de descuento
              </div>
            </>
          ) : (
            <div className={styles.currentPrice}>
              MX${course.price.toFixed(2)}
            </div>
          )}
          <div className={styles.guarantee}>
            Garantía de devolución de 30 días
          </div>
        </div>
      )}

      {/* Botón de compra */}
      {!hasPurchased && (
        <div className={styles.buyButton}>
          <BuyButton course={course} />
        </div>
      )}

      {/* Incluye */}
      {course.course_includes && (
        <div className={styles.courseIncludes}>
          <h4>Este curso incluye:</h4>
          <div
            dangerouslySetInnerHTML={{ __html: course.course_includes }}
          />
        </div>
      )}

      {/* Popup de video */}
      {showPopup && course.preview_video && (
        <VideoViewPopup
          videoUrl={course.preview_video}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
