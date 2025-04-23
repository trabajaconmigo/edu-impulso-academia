/* ------------------------------------------------------------------
   Course details page         ( SERVER COMPONENT )
   ------------------------------------------------------------------ */
   import { notFound }       from "next/navigation";
   import { supabase }       from "@/lib/supabaseClient";
   
   /* ─ server-side children ─ */
   import Hero                     from "./Hero";
   import StaticSection            from "./StaticSection";
   import CourseContentSection     from "./CourseContentSection";
   import InstructorSection        from "./InstructorSection";
   import AdditionalDetailsSection from "./AdditionalDetailsSection";
   import CourseSidebar            from "./CourseSidebar";
   
   /* ─ client component ─ */
   import OfferBar                 from "./OfferBar";
   
   /* css */
   import styles                   from "./page.module.css";
   
   /* ---------- typing --------------------------------------------------- */
   type CourseRow = {
     id:               string;
     slug:             string;
     title:            string;
     description:      string;
     thumbnail_url:    string;
     price:            number;
     discount_percentage: number | null;
     discount_active:  boolean | null;
     expires_at:       string | null;
     course_includes:  string | null;
     what_you_ll_learn:string | null;
     requirements:     string | null;
     description_long: string | null;
     instructor_id:    string | null;
     preview_video:    string | null;
   };
   
   interface PageProps {
     params: { slug: string };
   }
   
   /* ==================================================================== */
   export default async function CoursePage({ params }: PageProps) {
     const { slug } = params;
   
     /* fetch only what we actually use */
     const { data, error } = await supabase
       .from("courses")
       .select(`
         id, slug, title, description, thumbnail_url, price,
         discount_percentage, discount_active, expires_at,
         course_includes, what_you_ll_learn, requirements,
         description_long, instructor_id, preview_video
       `)
       .eq("slug", slug)
       .single<CourseRow>();
   
     if (error || !data) {
       console.error("Error fetching course:", error);
       return notFound();
     }
   
     const course = data; /* ────────────── fully-typed row ───────────── */
   
     /* cast/normalise for CourseSidebar to satisfy its stricter interface */
     const sidebarCourse = {
       id:                course.id,
       title:             course.title,
       price:             course.price,
       thumbnail_url:     course.thumbnail_url,
       discount_percentage: course.discount_percentage ?? 0,
       discount_active:     !!course.discount_active,
       course_includes:   course.course_includes ?? undefined,
       preview_video:     course.preview_video ?? undefined,
     };
   
     /* ------------------------------------------------------------------ */
     return (
       <>
         {/* HERO */}
         <Hero title={course.title} description={course.description} />
   
         {/* 2-column layout */}
         <div className={styles.mainContainer}>
           {/* LEFT */}
           <div className={styles.leftColumn}>
             <StaticSection            /* ⬅️  row 89 fix */
               whatYoullLearn={course.what_you_ll_learn ?? ""} 
             />
   
             <CourseContentSection course_id={course.id} />
   
             {course.instructor_id && (
               <InstructorSection instructorId={course.instructor_id} />
             )}
   
             <AdditionalDetailsSection
               requirements={course.requirements}
               descriptionLong={course.description_long}
             />
           </div>
   
           {/* RIGHT – sticky sidebar */}
           <div className={styles.sidebarColumn}>
             <CourseSidebar course={sidebarCourse} />  {/* ⬅️ row 104 fix */}
           </div>
         </div>
   
         {/* urgency bar / basket */}
         <OfferBar
           discountActive={!!course.discount_active}
           expiresAt={course.expires_at}
         />
       </>
     );
   }
   