import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Hero from "./Hero";
import StaticSection from "./StaticSection";
import CourseContentSection from "./CourseContentSection";
import InstructorSection from "./InstructorSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import CourseSidebar from "./CourseSidebar";
import styles from "./page.module.css";

// If you see type errors regarding "params", you can use the following signature:
// export default async function CoursePage({ params }: any) { ... }

export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Fetch the course (including new columns like requirements, description_long and instructor_id)
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching course:", error);
    return notFound();
  }

  const course = data;

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

          {/* Additional details for "Requisitos" and "Descripción" */}
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
