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

  // Fetch from Supabase
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching course:", error);
    return notFound();
  }

  // 'data' is your course row
  const course = data;

  return (
    <>
      <Hero title={course.title} description={course.description} />

      <div className={styles.mainContainer}>
        <div className={styles.leftColumn}>
          <StaticSection whatYoullLearn={course.what_you_ll_learn} />

          <CourseContentSection course_id={course.id} />

          {/* If there's an instructor, show it */}
          {course.instructor_id && (
            <InstructorSection instructorId={course.instructor_id} />
          )}

          {/* Requirements / Description container */}
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
