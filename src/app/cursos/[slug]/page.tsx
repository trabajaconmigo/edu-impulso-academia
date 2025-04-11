import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Hero from "./Hero";
import StaticSection from "./StaticSection";
import CourseContentSection from "./CourseContentSection";
import InstructorSection from "./InstructorSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import CourseSidebar from "./CourseSidebar";
import styles from "./page.module.css";

export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Fetch the course row from Supabase
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching course:", error);
    return notFound();
  }

  const course = data; // an object with fields like id, title, instructor_id, etc.

  return (
    <>
      {/* Hero: Title + short description */}
      <Hero title={course.title} description={course.description} />

      <div className={styles.mainContainer}>
        <div className={styles.leftColumn}>
          {/* "What you'll learn" */}
          <StaticSection whatYoullLearn={course.what_you_ll_learn} />

          {/* Course content: sections & lectures */}
          <CourseContentSection course_id={course.id} />

          {/* Instructor info, if instructor_id is present */}
          {course.instructor_id && (
            <InstructorSection instructorId={course.instructor_id} />
          )}

          {/* Requirements + Description (HTML) */}
          <AdditionalDetailsSection
            requirements={course.requirements}        // HTML for "Requisitos"
            descriptionLong={course.description_long} // HTML for "Descripción"
          />
        </div>

        {/* Right-hand sidebar: Price, Buy Button, etc. */}
        <div className={styles.sidebarColumn}>
          <CourseSidebar course={course} />
        </div>
      </div>
    </>
  );
}
