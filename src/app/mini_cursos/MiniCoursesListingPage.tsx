/* --------------------------------------------------------------------
   app/mini_cursos/MiniCoursesListingPage.tsx  – CLIENT COMPONENT
-------------------------------------------------------------------- */
"use client";

import { useEffect, useRef, useState } from "react";
import Link     from "next/link";
import Image    from "next/image";
import { supabase } from "@/lib/supabaseClient";
import styles   from "../cursos/coursesListing.module.css"; // ¡reutiliza tu CSS!

interface MiniCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  slug: string;
  category?: string | null;
}

export default function MiniCoursesListingPage() {
  const [courses, setCourses]         = useState<MiniCourse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [categories, setCategories]   = useState<string[]>([]);
  const [selectedCategory, setSelCat] = useState<string>("");

  /* --- referencias para scroll horizontal de categorías --- */
  const rowRef = useRef<HTMLDivElement>(null);
  const [showL, setShowL] = useState(false);
  const [showR, setShowR] = useState(false);

  /* --- fetch inicial --- */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("mini_cursos")
        .select("id,title,description,thumbnail_url,slug,category");
      if (error) console.error(error);
      else {
        setCourses(data as MiniCourse[]);
        const setCat = new Set<string>();
        data.forEach(c => c.category && setCat.add(c.category));
        setCategories([...setCat].sort());
      }
      setLoading(false);
    })();
  }, []);

  /* --- visibilidad flechas --- */
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const upd = () => {
      setShowL(el.scrollLeft > 0);
      setShowR(el.scrollWidth - el.scrollLeft > el.clientWidth + 1);
    };
    el.addEventListener("scroll", upd);
    upd();
    return () => el.removeEventListener("scroll", upd);
  }, [categories]);

  const scrollRow = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({
      left: dir === "left" ? -150 : 150,
      behavior: "smooth",
    });
  };

  const filtered = selectedCategory
    ? courses.filter(c => c.category === selectedCategory)
    : courses;

  /* --- render --- */
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Mini-Cursos</h1>

      {/* Filtro por categoría */}
      <div className={styles.categoryFilterContainer}>
        {showL && (
          <button className={styles.arrowButton} onClick={() => scrollRow("left")}>
            &#9664;
          </button>
        )}
        <div className={styles.categoryRow} ref={rowRef}>
          <button
            className={selectedCategory === "" ? styles.activeCategoryBtn : styles.categoryBtn}
            onClick={() => setSelCat("")}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={selectedCategory === cat ? styles.activeCategoryBtn : styles.categoryBtn}
              onClick={() => setSelCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {showR && (
          <button className={styles.arrowButton} onClick={() => scrollRow("right")}>
            &#9654;
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <p className={styles.noCourses}>Cargando mini-cursos...</p>
      ) : filtered.length === 0 ? (
        <p className={styles.noCourses}>No hay mini-cursos disponibles.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(course => (
            <Link
              key={course.id}
              href={`/mini_cursos/${course.slug}`}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <div className={styles.cardImageWrapper}>
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    sizes="400px"
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{course.title}</h2>
                  <p  className={styles.cardDesc}>{course.description}</p>
                  <div className={styles.cardPrice}>Gratis</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
