"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./CourseSidebar.module.css";
import BuyButton from "./BuyButton";
import VideoViewPopup from "../../components/VideoViewPopup";

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

      {/* Price & Discount Section */}
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
        <div className={styles.guarantee}>Garantía de devolución de 30 días</div>
      </div>

      {/* Buy Button */}
      <div className={styles.buyButton}>
        <BuyButton course={course} />
      </div>

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
