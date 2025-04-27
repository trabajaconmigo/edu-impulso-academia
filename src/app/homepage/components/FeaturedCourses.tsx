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

  /* ---------- fetch ---------- */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,description,thumbnail_url,slug")
        .order("created_at", { ascending: false })
        .limit(12);                       // obtén hasta 12 destacados

      if (!error && data) setCourses(data as Course[]);
      else console.error("Error fetching courses:", error?.message);
    })();
  }, []);

  const scrollLeft = () => {
    if (rowRef.current) {
      const cardWidth = rowRef.current.clientWidth / 4;
      rowRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (rowRef.current) {
      const cardWidth = rowRef.current.clientWidth / 4;
      rowRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  if (!courses.length) return null;
  const showArrows = courses.length > 4;   // 🔑 flechas solo si hay >4

  return (
    <section className={styles.featuredContainer}>
      <h2 className={styles.sectionTitle}>Cursos Destacados</h2>

      <div className={styles.carouselContainer}>
        {showArrows && (
          <button
            className={`${styles.arrowButton} ${styles.arrowLeft}`}
            onClick={scrollLeft}
            aria-label="Anterior"
          >
            &#8249;
          </button>
        )}

        <div className={styles.coursesRow} ref={rowRef}>
          {courses.map((c) => (
            <Link href={`/cursos/${c.slug}`} key={c.id}>
              <div className={styles.courseCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={c.thumbnail_url}
                    alt={c.title}
                    className={styles.courseImage}
                  />
                </div>
                <h3 className={styles.courseTitle}>{c.title}</h3>
                <p className={styles.courseDesc}>{c.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {showArrows && (
          <button
            className={`${styles.arrowButton} ${styles.arrowRight}`}
            onClick={scrollRight}
            aria-label="Siguiente"
          >
            &#8250;
          </button>
        )}
      </div>
    </section>
  );
}
