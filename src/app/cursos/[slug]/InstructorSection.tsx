"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./InstructorSection.module.css";

// Example icons from react-icons
import { FaStar, FaComment, FaUsers, FaBookOpen, FaCalendarAlt } from "react-icons/fa";

interface InstructorSectionProps {
  instructorId: string;
}

interface Instructor {
  id: string;
  full_name: string;
  short_title?: string;
  rating?: number;
  reviews_count?: number;
  students_count?: number;
  courses_count?: number;
  years_of_experience?: number;
  image_url?: string;
  long_bio?: string; // This may contain HTML
}

export default function InstructorSection({ instructorId }: InstructorSectionProps) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchInstructor() {
      const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .eq("id", instructorId)
        .single();
      if (!error && data) {
        setInstructor(data as Instructor);
      }
      setLoading(false);
    }
    fetchInstructor();
  }, [instructorId]);

  if (loading) {
    return <div className={styles.container}>Cargando instructor...</div>;
  }
  if (!instructor) {
    return null; // If not found or no instructor
  }

  const {
    full_name,
    short_title,
    rating,
    reviews_count,
    students_count,
    courses_count,
    years_of_experience,
    image_url,
    long_bio,
  } = instructor;

  function handleToggle() {
    setExpanded(!expanded);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Instructor</h2>

      <div className={styles.instructorCard}>
        {/* Left column: image + "Ver más" button */}
        <div className={styles.leftCol}>
          <div className={styles.imageWrapper}>
            {image_url ? (
              <img
                src={image_url}
                alt={full_name}
                className={styles.instructorImage}
              />
            ) : (
              <div className={styles.placeholder}>Sin imagen</div>
            )}
          </div>

          {long_bio && (
            <button onClick={handleToggle} className={styles.toggleButton}>
              {expanded ? "Ver menos" : "Ver más"}
            </button>
          )}
        </div>

        {/* Right column: name, stats */}
        <div className={styles.rightCol}>
          <h3 className={styles.instructorName}>{full_name}</h3>
          {short_title && <p className={styles.shortTitle}>{short_title}</p>}

          <div className={styles.statsRow}>
            {typeof rating === "number" && (
              <div className={styles.statItem}>
                <FaStar className={styles.icon} />
                <span>{rating.toFixed(1)} de Rating</span>
              </div>
            )}
            {reviews_count && (
              <div className={styles.statItem}>
                <FaComment className={styles.icon} />
                <span>{reviews_count} Reseñas</span>
              </div>
            )}
            {students_count && (
              <div className={styles.statItem}>
                <FaUsers className={styles.icon} />
                <span>{students_count} Estudiantes</span>
              </div>
            )}
            {courses_count && (
              <div className={styles.statItem}>
                <FaBookOpen className={styles.icon} />
                <span>{courses_count} Cursos</span>
              </div>
            )}
            {years_of_experience && (
              <div className={styles.statItem}>
                <FaCalendarAlt className={styles.icon} />
                <span>{years_of_experience} años de experiencia</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The expanded bio text: interpret HTML using dangerouslySetInnerHTML */}
      {long_bio && expanded && (
        <div className={styles.longBio}>
          <div dangerouslySetInnerHTML={{ __html: long_bio }} />
        </div>
      )}
    </div>
  );
}
