// src/app/cursos/[slug]/CourseContentSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import VideoViewPopup from "@/app/components/VideoViewPopup";
import styles from "./CourseContentSection.module.css";

interface CourseContent {
  id: number;
  course_id: string;
  type: "section" | "lecture";
  title: string;
  youtube_link?: string;
  duration?: number; // in seconds
  order_index: number;
  parent_section_id?: number | null;
  paid?: boolean; // indicates if the lecture is paid
}

interface CourseContentSectionProps {
  course_id: string;
}

/** Inline SVG lock icon in gray (#999). Adjust size as needed. */
const LOCK_ICON = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#999"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C9.23858 2 7 4.23858 7 7V9H6C4.34315 9 3 10.3431 3 12V20C3 21.6569 4.34315 23 6 23H18C19.6569 23 21 21.6569 21 20V12C21 10.3431 19.6569 9 18 9H17V7C17 4.23858 14.7614 2 12 2ZM15 9V7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7V9H15ZM8 14C7.44772 14 7 14.4477 7 15V17C7 17.5523 7.44772 18 8 18H16C16.5523 18 17 17.5523 17 17V15C17 14.4477 16.5523 14 16 14H8Z"
    />
  </svg>
);

const CourseContentSection: React.FC<CourseContentSectionProps> = ({ course_id }) => {
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [popupVideo, setPopupVideo] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalSections: 0,
    totalLectures: 0,
    totalDuration: 0,
  });
  const [hasPurchase, setHasPurchase] = useState<boolean>(false);

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase
        .from("course_contents")
        .select("*")
        .eq("course_id", course_id)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching course content:", error.message);
      } else if (data) {
        const contentData = data as CourseContent[];

        // Compute summary
        let totalSections = 0;
        let totalLectures = 0;
        let totalDuration = 0;
        contentData.forEach((item) => {
          if (item.type === "section") totalSections++;
          if (item.type === "lecture") {
            totalLectures++;
            totalDuration += item.duration || 0;
          }
        });
        setSummary({ totalSections, totalLectures, totalDuration });

        // Store contents
        setContents(contentData);

        // <-- NEW: open the very first section by default -->
        const firstSection = contentData.find(item => item.type === "section");
        if (firstSection) {
          setExpandedSections([firstSection.id]);
        }
      }
    }

    async function checkPurchase() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", course_id)
          .single();

        setHasPurchase(!purchaseError && !!purchaseData);
      } else {
        setHasPurchase(false);
      }
    }

    fetchContent();
    checkPurchase();
  }, [course_id]);

  // Format seconds as "Xh Ym"
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const sections = contents.filter((item) => item.type === "section");
  const getLecturesForSection = (sectionId: number) =>
    contents.filter((item) => item.type === "lecture" && item.parent_section_id === sectionId);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleLectureClick = (lecture: CourseContent) => {
    if (lecture.paid && !hasPurchase) {
      alert("Este contenido es de pago. Por favor compra el curso para acceder.");
      return;
    }
    if (lecture.youtube_link) {
      setPopupVideo(lecture.youtube_link);
    }
  };

  const renderLockIcon = (lecture: CourseContent) => {
    if (lecture.paid && !hasPurchase) {
      return (
        <span style={{ marginLeft: "6px", display: "inline-flex", alignItems: "center" }}>
          {LOCK_ICON}
        </span>
      );
    }
    return null;
  };

  return (
    <div className={styles.courseContentWrapper}>
      <h2 className={styles.sectionHeader}>Contenido del curso</h2>
      <p className={styles.summary}>
        {summary.totalSections} secciones • {summary.totalLectures} lecciones •{" "}
        {formatDuration(summary.totalDuration)} de duración total
      </p>
      <div className={styles.accordion}>
        {sections.map((section) => (
          <div key={section.id} className={styles.sectionItem}>
            <button
              className={styles.sectionTitle}
              onClick={() => toggleSection(section.id)}
            >
              <span>{section.title}</span>
              <span
                className={`${styles.dropdownIcon} ${
                  expandedSections.includes(section.id) ? styles.expanded : ""
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M4 6l4 4 4-4H4z" fill="currentColor" />
                </svg>
              </span>
            </button>
            {expandedSections.includes(section.id) && (
              <div className={styles.lectureList}>
                {getLecturesForSection(section.id).map((lecture) => (
                  <div
                    key={lecture.id}
                    className={styles.lectureItem}
                    onClick={() => handleLectureClick(lecture)}
                  >
                    <span>
                      {lecture.title}
                      {renderLockIcon(lecture)}
                    </span>
                    <span className={styles.lectureDuration}>
                      {lecture.duration ? formatDuration(lecture.duration) : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {popupVideo && (
        <VideoViewPopup
          videoUrl={popupVideo}
          onClose={() => setPopupVideo(null)}
        />
      )}
    </div>
  );
};

export default CourseContentSection;
