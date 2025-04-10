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
  price: number;
  thumbnail_url: string;
  discount?: number;
  course_includes?: string; // HTML containing custom icons and text
  preview_video?: string;
}

interface CourseSidebarProps {
  course: Course;
}

export default function CourseSidebar({ course }: CourseSidebarProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Function to open preview video popup
  const openVideo = () => {
    if (course.preview_video) {
      setShowPopup(true);
    } else {
      console.error("No preview video available");
    }
  };

  // Check if the current user has already purchased this course
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
        if (!error && data) {
          setHasPurchased(true);
        } else {
          setHasPurchased(false);
        }
      } else {
        setHasPurchased(false);
      }
    }
    checkPurchase();
  }, [course.id]);

  // Calculate original price if discount exists.
  const originalPrice = course.discount
    ? (course.price / (1 - course.discount)).toFixed(2)
    : null;

  return (
    <div className={styles.sidebar}>
      {/* Course Thumbnail + Preview Button */}
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

      {/* Price & Discount Section (only if user has NOT purchased the course) */}
      {!hasPurchased && (
        <div className={styles.priceSection}>
          <div className={styles.currentPrice}>
            MX${course.price.toFixed(2)}
          </div>
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
      )}

      {/* Buy Button: Only display if user has NOT purchased the course */}
      {!hasPurchased && (
        <div className={styles.buyButton}>
          <BuyButton course={course} />
        </div>
      )}

      {/* "Este curso incluye:" Section */}
      {course.course_includes && (
        <div className={styles.courseIncludes}>
          <h4>Este curso incluye:</h4>
          <div
            dangerouslySetInnerHTML={{ __html: course.course_includes }}
          />
        </div>
      )}

      {/* Video Popup */}
      {showPopup && course.preview_video && (
        <VideoViewPopup
          videoUrl={course.preview_video}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
