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

  // Fetch the course (including new columns like requirements, description_long, instructor_id)
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching course:", error);
    return notFound();
  }

  // The course row
  const course = data;

  return (
    <>
      <Hero title={course.title} description={course.description} />

      <div className={styles.mainContainer}>
        <div className={styles.leftColumn}>
          <StaticSection whatYoullLearn={course.what_you_ll_learn} />

          <CourseContentSection course_id={course.id} />

          {/* If there's an instructor_id, render InstructorSection */}
          {course.instructor_id && (
            <InstructorSection instructorId={course.instructor_id} />
          )}

          {/* "Requisitos" & "Descripción" container */}
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
