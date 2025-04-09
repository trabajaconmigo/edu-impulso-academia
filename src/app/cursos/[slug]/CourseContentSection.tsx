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
}

interface CourseContentSectionProps {
  course_id: string;
}

const CourseContentSection: React.FC<CourseContentSectionProps> = ({ course_id }) => {
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [popupVideo, setPopupVideo] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalSections: 0,
    totalLectures: 0,
    totalDuration: 0, // in seconds
  });

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
        setContents(contentData);
      }
    }
    fetchContent();
  }, [course_id]);

  // Helper to format seconds as "Xh Ym"
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Filter sections from content
  const sections = contents.filter((item) => item.type === "section");

  // Get lectures under a given section
  const getLecturesForSection = (sectionId: number) =>
    contents.filter((item) => item.type === "lecture" && item.parent_section_id === sectionId);

  // Toggle expanded state for a section – allow multiple open sections
  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      if (prev.includes(sectionId)) {
        // Remove sectionId if already expanded
        return prev.filter((id) => id !== sectionId);
      } else {
        // Add sectionId to expanded list
        return [...prev, sectionId];
      }
    });
  };

  return (
    <div className={styles.courseContentWrapper}>
      <h2 className={styles.sectionHeader}>Contenido del curso</h2>
      <p className={styles.summary}>
        {summary.totalSections} secciones • {summary.totalLectures} lecciones • {formatDuration(summary.totalDuration)} de duración total
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
                className={`${styles.dropdownIcon} ${expandedSections.includes(section.id) ? styles.expanded : ""}`}
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
                    onClick={() =>
                      lecture.youtube_link && setPopupVideo(lecture.youtube_link)
                    }
                  >
                    <span>{lecture.title}</span>
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
