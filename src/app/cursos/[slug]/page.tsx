/* src/app/cursos/[slug]/page.tsx */
import { notFound } from "next/navigation";
import { supabase }  from "@/lib/supabaseClient";

/* server-side only children */
import Hero                     from "./Hero";
import StaticSection            from "./StaticSection";
import CourseContentSection     from "./CourseContentSection";
import InstructorSection        from "./InstructorSection";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import CourseSidebar            from "./CourseSidebar";

/* now just a plain import — OfferBar is a client component */
import OfferBar from "./OfferBar";

import styles from "./page.module.css";

type Props = { params: { slug: string } };

export default async function CoursePage({ params }: Props) {
  const { slug } = params;

  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      id, slug, title, description, thumbnail_url,
      what_you_ll_learn, requirements, description_long,
      instructor_id, price, course_includes,
      discount_percentage, discount_active, expires_at
    `)
    .eq("slug", slug)
    .single();

  if (error || !course) {
    console.error("Error fetching course:", error);
    return notFound();
  }

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

      {/* Client-only urgency bar / floating basket */}
      <OfferBar
        discountActive={course.discount_active}
        expiresAt={course.expires_at}
      />
    </>
  );
}
