// src/app/homepage/components/FeaturedCourses.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./FeaturedCourses.module.css";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  slug: string;
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url, slug");
      if (error) {
        console.error("Error fetching courses:", error.message);
      } else if (data) {
        setCourses(data as Course[]);
      }
    }
    fetchCourses();
  }, []);

  // Scroll one card width
  const scrollLeft = () => {
    if (rowRef.current) {
      const cardWidth = rowRef.current.clientWidth / 4; // 4 cards on desktop
      rowRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (rowRef.current) {
      const cardWidth = rowRef.current.clientWidth / 4;
      rowRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.featuredContainer}>
      <h2>Cursos Destacados</h2>
      <div className={styles.carouselContainer}>
        {/* Arrow button: visible on desktop */}
        <button className={styles.arrowButton} onClick={scrollLeft}>
          &#8249;
        </button>
        <div className={styles.coursesRow} ref={rowRef}>
          {courses.map((course) => (
            <Link href={`/cursos/${course.slug}`} key={course.id}>
              <div className={styles.courseCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className={styles.courseImage}
                  />
                </div>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseDesc}>{course.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <button className={styles.arrowButton} onClick={scrollRight}>
          &#8250;
        </button>
      </div>
    </section>
  );
}
