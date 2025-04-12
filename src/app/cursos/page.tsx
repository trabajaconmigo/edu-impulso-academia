"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import styles from "./coursesListing.module.css";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  slug: string;
  price: number;
  category?: string | null;
}

export default function CoursesListingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // For filtering by category
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // For arrow visibility
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Ref for the horizontal category row container
  const categoryRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url, slug, price, category");
      if (error) {
        console.error("Error fetching courses:", error.message);
      } else if (data) {
        setCourses(data as Course[]);

        // Extract unique, sorted categories
        const catSet = new Set<string>();
        data.forEach((course: Course) => {
          if (course.category && course.category.trim() !== "") {
            catSet.add(course.category);
          }
        });
        setCategories([...catSet].sort());
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  // Update arrow visibility on scroll changes
  useEffect(() => {
    const el = categoryRowRef.current;
    if (!el) return;

    const updateArrowVisibility = () => {
      setShowLeftArrow(el.scrollLeft > 0);
      // Check if there is overflow on the right (allow a little tolerance)
      setShowRightArrow(el.scrollWidth - el.scrollLeft > el.clientWidth + 1);
    };

    // Attach scroll listener
    el.addEventListener("scroll", updateArrowVisibility);
    // Also update once after mount
    updateArrowVisibility();

    return () => {
      el.removeEventListener("scroll", updateArrowVisibility);
    };
  }, [categories]);

  // Scroll the category row horizontally
  function scrollCategoryRow(direction: "left" | "right") {
    const el = categoryRowRef.current;
    if (!el) return;
    const scrollAmount = 150; // adjust as needed
    if (direction === "left") {
      el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }

  // Filter courses by selected category (empty string means "Todas")
  const filteredCourses = selectedCategory
    ? courses.filter((course) => course.category === selectedCategory)
    : courses;

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Cursos</h1>

      {/* Category Filter Row */}
      <div className={styles.categoryFilterContainer}>
        {showLeftArrow && (
          <button
            className={styles.arrowButton}
            onClick={() => scrollCategoryRow("left")}
          >
            &#9664;
          </button>
        )}
        <div className={styles.categoryRow} ref={categoryRowRef}>
          <button
            className={
              selectedCategory === "" ? styles.activeCategoryBtn : styles.categoryBtn
            }
            onClick={() => setSelectedCategory("")}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat ? styles.activeCategoryBtn : styles.categoryBtn
              }
            >
              {cat}
            </button>
          ))}
        </div>
        {showRightArrow && (
          <button
            className={styles.arrowButton}
            onClick={() => scrollCategoryRow("right")}
          >
            &#9654;
          </button>
        )}
      </div>

      {loading ? (
        <p className={styles.noCourses}>Cargando cursos...</p>
      ) : filteredCourses.length === 0 ? (
        <p className={styles.noCourses}>No hay cursos disponibles.</p>
      ) : (
        <div className={styles.grid}>
          {filteredCourses.map((course) => (
            <Link
              href={`/cursos/${course.slug}`}
              key={course.id}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <div className={styles.cardImageWrapper}>
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    width={400}
                    height={250}
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
