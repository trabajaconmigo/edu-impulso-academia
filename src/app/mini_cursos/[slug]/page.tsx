/* --------------------------------------------------------------------
   app/mini_cursos/[slug]/page.tsx – DETALLE MINI-CURSO (SERVER COMPONENT)
   -------------------------------------------------------------------- */

   import { notFound } from "next/navigation";
   import { supabase } from "@/lib/supabaseClient";
   
   /* Reutilizamos bloques que ya existen del módulo de cursos de pago */
   import Hero from "@/app/cursos/[slug]/Hero";
   import StaticSection from "@/app/cursos/[slug]/StaticSection";
   import CourseContentSection from "@/app/cursos/[slug]/CourseContentSection";
   import FreeSidebar from "./FreeSidebar";
   
   import styles from "@/app/cursos/[slug]/page.module.css";
   
   /**
    * Este componente se ejecuta en el servidor (Server Component).
    * Recibe el parámetro [slug] desde la ruta /mini_cursos/[slug].
    */
   export default async function Page({
     params,
   }: {
     params: { slug: string };
   }) {
     const { slug } = params;
   
     /* -----------------------------------------------------------
        1) Obtener la fila del mini-curso desde Supabase
        ----------------------------------------------------------- */
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
   
     if (error || !course) {
       console.error("Error fetching mini_curso:", error?.message);
       return notFound();
     }
   
     /* -----------------------------------------------------------
        2) Renderizar la página usando componentes reutilizados
        ----------------------------------------------------------- */
     return (
       <>
         {/* HERO con título y descripción */}
         <Hero title={course.title} description={course.description} />
   
         {/* Layout principal en dos columnas */}
         <div className={styles.mainContainer}>
           {/* Columna izquierda: secciones estáticas y contenido */}
           <div className={styles.leftColumn}>
             <StaticSection whatYoullLearn={course.what_you_ll_learn} />
             <CourseContentSection course_id={course.id} />
           </div>
   
           {/* Columna derecha: sidebar gratuito + upsell de PDF */}
           <div className={styles.sidebarColumn}>
             <FreeSidebar course={course} />
           </div>
         </div>
       </>
     );
   }
   