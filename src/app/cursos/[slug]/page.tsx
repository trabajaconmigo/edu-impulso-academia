"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Hero from "./Hero";
import StaticSection from "./StaticSection";
import CourseContentSection from "./CourseContentSection";
import InstructorSection from "./InstructorSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import CourseSidebar from "./CourseSidebar";
import StickyBasket from "./StickyBasket"; // StickyBasket saved in the same folder
import styles from "./page.module.css";

interface Course {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  thumbnail_url: string;
  slug: string;
  what_you_ll_learn: string;
  student_count: number;
  created_by: string;
  last_updated: string;
  language: string;
  price: number;
  instructor_id?: string | null;
  requirements?: string | null;      // HTML for "Requisitos"
  description_long?: string | null;  // HTML for "Descripción Larga"
}

export default function CoursePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the course from Supabase on mount
  useEffect(() => {
    async function fetchCourse() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error || !data) {
        console.error("Error fetching course:", error);
      } else {
        setCourse(data as Course);
      }
      setLoading(false);
    }
    fetchCourse();
  }, [slug]);

  // Dummy flag for purchase (replace with your real purchase check)
  const hasPurchased = false;

  // Define the buy action – for example, redirect to checkout
  const handleBuyCourse = () => {
    if (course) {
      // Multiply price by 100 for Stripe (amount in cents)
      const priceInCents = course.price * 100;
      window.location.href = `/checkout?courseId=${course.id}&amount=${priceInCents}`;
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!course) return notFound();

  return (
    <>
      <Hero title={course.title} description={course.description} />

      <div className={styles.mainContainer}>
        <div className={styles.leftColumn}>
          <StaticSection whatYoullLearn={course.what_you_ll_learn} />

          <CourseContentSection course_id={course.id} />

          {course.instructor_id && (
            <InstructorSection instructorId={course.instructor_id} />
          )}

          <AdditionalDetailsSection
            requirements={course.requirements}
            descriptionLong={course.description_long}
          />
        </div>
        <div className={styles.sidebarColumn}>
          <CourseSidebar course={course} />
        </div>
      </div>

      {/* Render the sticky basket only on mobile if the course is not already purchased */}
      <StickyBasket 
        onBuy={handleBuyCourse} 
        hasPurchased={hasPurchased} 
        visibleThreshold={400} 
      />
    </>
  );
}
