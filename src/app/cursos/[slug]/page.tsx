/* ------------------------------------------------------------------
   Course details page  –  SERVER COMPONENT
   ------------------------------------------------------------------ */
   import { notFound }     from "next/navigation";
   import { supabase }     from "@/lib/supabaseClient";
   
   /* server-side children */
   import Hero                     from "./Hero";
   import StaticSection            from "./StaticSection";
   import CourseContentSection     from "./CourseContentSection";
   import InstructorSection        from "./InstructorSection";
   import AdditionalDetailsSection from "./AdditionalDetailsSection";
   import CourseSidebar            from "./CourseSidebar";
   
   /* client-only urgency bar / basket */
   import OfferBar                 from "./OfferBar";
   
   /* css */
   import styles from "./page.module.css";
   
   /* ------------------------------------------------------------------ */
   /* NOTE ­–  **NO explicit PageProps generic** → lets Next.js provide it */
   export default async function CoursePage({ params }: { params: { slug: string } }) {
     const { slug } = params;
   
     /* --- fetch course row (only needed columns) ----------------------- */
     const { data, error } = await supabase
       .from("courses")
       .select(`
         id, slug, title, description, thumbnail_url, price,
         discount_percentage, discount_active, expires_at,
         course_includes, what_you_ll_learn, requirements,
         description_long, instructor_id, preview_video
       `)
       .eq("slug", slug)
       .single();
   
     if (error || !data) {
       console.error("Error fetching course:", error);
       return notFound();
     }
   
     /* -------- normalise object for Sidebar (smaller payload) ---------- */
     const sidebarCourse = {
       id:                data.id,
       title:             data.title,
       price:             data.price,
       thumbnail_url:     data.thumbnail_url,
       discount_percentage: data.discount_percentage ?? 0,
       discount_active:     !!data.discount_active,
       course_includes:     data.course_includes ?? undefined,
       preview_video:       data.preview_video ?? undefined,
     };
   
     /* ------------------------------ render --------------------------- */
     return (
       <>
         {/* HERO */}
         <Hero title={data.title} description={data.description} />
   
         {/* ----- 2-column layout --------------------------------------- */}
         <div className={styles.mainContainer}>
           {/* LEFT column */}
           <div className={styles.leftColumn}>
             <StaticSection whatYoullLearn={data.what_you_ll_learn ?? ""} />
             <CourseContentSection course_id={data.id} />
   
             {data.instructor_id && (
               <InstructorSection instructorId={data.instructor_id} />
             )}
   
             <AdditionalDetailsSection
               requirements={data.requirements}
               descriptionLong={data.description_long}
             />
           </div>
   
           {/* RIGHT column – sticky sidebar */}
           <div className={styles.sidebarColumn}>
             <CourseSidebar course={sidebarCourse} />
           </div>
         </div>
   
         {/* urgency bar / floating basket */}
         <OfferBar
           discountActive={!!data.discount_active}
           expiresAt={data.expires_at}        /* ISO string or null */
         />
       </>
     );
   }
   