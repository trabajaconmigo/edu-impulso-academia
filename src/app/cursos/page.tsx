"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./coursesListing.module.css";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  slug: string;
  price: number;
}

export default function CoursesListingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url, slug, price");
      if (error) {
        console.error("Error fetching courses:", error.message);
      } else if (data) {
        setCourses(data as Course[]);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Cursos</h1>
      {loading ? (
        <p className={styles.noCourses}>Cargando cursos...</p>
      ) : courses.length === 0 ? (
        <p className={styles.noCourses}>No hay cursos disponibles.</p>
      ) : (
        <div className={styles.grid}>
          {courses.map((course) => (
            <Link href={`/cursos/${course.slug}`} key={course.id} className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardImageWrapper}>
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{course.title}</h2>
                  <p className={styles.cardDesc}>{course.description}</p>
                  <div className={styles.cardPrice}>
                    ${course.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
