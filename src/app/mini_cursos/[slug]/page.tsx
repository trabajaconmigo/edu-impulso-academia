/* --------------------------------------------------------------------
   app/mini_cursos/[slug]/page.tsx
-------------------------------------------------------------------- */
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import Hero from "@/app/cursos/[slug]/Hero";
import StaticSection from "@/app/cursos/[slug]/StaticSection";
import CourseContentSection from "@/app/cursos/[slug]/CourseContentSection";
import FreeSidebar from "./FreeSidebar";

import styles from "@/app/cursos/[slug]/page.module.css";

export default async function Page({ params }: any) {
  const { slug } = params;               // slug recibido de la URL

  const { data: course, error } = await supabase
    .from("mini_cursos")
    .select(`
      id, slug, audio_url, title, description, thumbnail_url,
      what_you_ll_learn, requirements, description_long,
      course_includes, preview_video,
      digital_product_title, digital_product_desc,
      digital_product_price, digital_product_file_url
    `)
    .eq("slug", slug)
    .single();

  if (error || !course) return notFound();

  return (
    <>
      <Hero title={course.title} description={course.description} />

      <div className={styles.mainContainer}>
        <div className={styles.leftColumn}>
          <StaticSection whatYoullLearn={course.what_you_ll_learn} />
          <CourseContentSection course_id={course.id} />
        </div>

        <div className={styles.sidebarColumn}>
          <FreeSidebar course={course} />
        </div>
      </div>
    </>
  );
}
