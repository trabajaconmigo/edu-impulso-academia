/* --------------------------------------------------------------------
   app/mini_cursos/[slug]/page.tsx – DETALLE MINI-CURSO (SERVER COMPONENT)
-------------------------------------------------------------------- */
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/* Reutilizamos componentes ya existentes */
import Hero from "@/app/cursos/[slug]/Hero";
import StaticSection from "@/app/cursos/[slug]/StaticSection";
import CourseContentSection from "@/app/cursos/[slug]/CourseContentSection";
import FreeSidebar from "./FreeSidebar";

import styles from "@/app/cursos/[slug]/page.module.css";

/**
 * Next 15 le pasa props de forma automática:
 *  { params: { slug: string }, searchParams?: { ... } }
 * No necesitamos PageProps; tipamos en línea.
 */
export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  /* --- fetch mini_curso --- */
  const { data: course, error } = await supabase
    .from("mini_cursos")
    .select(
      `
        id,
        slug,
        audio_url,
        title,
        description,
        thumbnail_url,
        what_you_ll_learn,
        requirements,
        description_long,
        course_includes,
        preview_video,
        digital_product_title,
        digital_product_desc,
        digital_product_price,
        digital_product_file_url
      `
    )
    .eq("slug", slug)
    .single();

  if (!course || error) {
    console.error("Error fetching mini_curso:", error?.message);
    return notFound();
  }

  /* --- render --- */
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
