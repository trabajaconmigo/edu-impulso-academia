import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Hero from "./Hero";
import StaticSection from "./StaticSection";
import CourseContentSection from "./CourseContentSection";
import InstructorSection from "./InstructorSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import CourseSidebar from "./CourseSidebar";
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

  // New columns
  requirements?: string | null;      // HTML for "Requisitos"
  description_long?: string | null;  // HTML for "Descripción"
}

interface Props {
  params: {
    slug: string;
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = params;

  // Fetch the course, including the new columns
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching course:", error);
    return notFound();
  }

  const course = data as Course;

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

          {/* The new container for Requisitos y Descripción */}
          <AdditionalDetailsSection
            requirements={course.requirements}
            descriptionLong={course.description_long}
          />
        </div>

        <div className={styles.sidebarColumn}>
          <CourseSidebar course={course} />
        </div>
      </div>
    </>
  );
}
