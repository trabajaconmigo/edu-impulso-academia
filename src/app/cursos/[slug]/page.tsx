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
import StickyBasketWrapper from "./StickyBasketWrapper"; // New wrapper for sticky basket
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

interface CoursePageProps {
  params: { slug: string };
}

export default function CoursePage({ params }: CoursePageProps) {
  const { slug } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

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

      {/* Render the sticky basket wrapper which handles purchase-check */}
      <StickyBasketWrapper 
        courseId={course.id} 
        coursePrice={course.price} 
        visibleThreshold={400} 
      />
    </>
  );
}
