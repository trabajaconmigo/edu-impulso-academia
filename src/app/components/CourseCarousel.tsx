// src/app/components/CourseCarousel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./CourseCarousel.module.css";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  slug: string;
  category: string;
}

interface Props {
  category: string;
}

export default function CourseCarousel({ category }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // DEBUG: Comprueba que la categoría llega correctamente
    console.log("CourseCarousel category:", category);

    if (!category) return;

    (async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,description,thumbnail_url,slug,category")
        // .eq("published", true)   <-- eliminado
        .ilike("category", category)   // case-insensitive match
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) {
        console.error("Error fetching courses:", error.message);
      } else {
        setCourses(data as Course[]);
      }
    })();
  }, [category]);

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

  return (
    <section className={styles.carouselWrapper}>
      <h2 className={styles.sectionTitle}>
        Cursos de <span>{category}</span>
      </h2>

      <div className={styles.carouselContainer}>
        <button className={styles.arrowButton} onClick={scrollLeft}>
          &#8249;
        </button>

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

        <button className={styles.arrowButton} onClick={scrollRight}>
          &#8250;
        </button>
      </div>
    </section>
  );
}
