/* ------------------------------------------------------------------
   Course details page  –  SERVER COMPONENT
   ------------------------------------------------------------------ */
   import { notFound } from "next/navigation";
   import { supabase } from "@/lib/supabaseClient";
   
   /* server-side children that already exist */
   import Hero                     from "./Hero";
   import StaticSection            from "./StaticSection";
   import CourseContentSection     from "./CourseContentSection";
   import InstructorSection        from "./InstructorSection";
   import AdditionalDetailsSection from "./AdditionalDetailsSection";
   import CourseSidebar            from "./CourseSidebar";
   
   /* client-only urgency bar / floating basket
      (⚠️ OfferBar.tsx MUST start with "use client") */
   import OfferBar                 from "./OfferBar";
   
   /* page-specific styles */
   import styles from "./page.module.css";
   
   /* ================================================================== */
   export default async function CoursePage({ params }: any) {
     const { slug } = params;
   
     /* -------- fetch course row -------------------------------------- */
     const { data: course, error } = await supabase
       .from("courses")
       .select(`
         id, slug, title, description, thumbnail_url,
         what_you_ll_learn, requirements, description_long,
         course_includes, preview_video,
         instructor_id, price,
         discount_percentage, discount_active, expires_at
       `)
       .eq("slug", slug)
       .single();
   
     if (error || !course) {
       console.error("Error fetching course:", error);
       return notFound();
     }
   
     /* -------- render ------------------------------------------------ */
     return (
       <>
         {/* HERO */}
         <Hero title={course.title} description={course.description} />
   
         {/* MAIN 2-column layout */}
         <div className={styles.mainContainer}>
           {/* LEFT column */}
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
   
           {/* RIGHT column – sticky sidebar */}
           <div className={styles.sidebarColumn}>
             <CourseSidebar course={course} />
           </div>
         </div>
   
         {/* urgency bar / basket (client) */}
         <OfferBar
  courseId={course.id}            // ✓ add this
  discountActive={course.discount_active}
  expiresAt={course.expires_at}
/>

       </>
     );
   }
   