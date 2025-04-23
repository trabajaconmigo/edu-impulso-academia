/* ------------------------------------------------------------------
   Course details page  –  SERVER COMPONENT
   ------------------------------------------------------------------ */

   import { notFound }   from "next/navigation";
   import dynamic        from "next/dynamic";
   import { supabase }   from "@/lib/supabaseClient";
   
   /* server-side children */
   import Hero                     from "./Hero";
   import StaticSection            from "./StaticSection";
   import CourseContentSection     from "./CourseContentSection";
   import InstructorSection        from "./InstructorSection";
   import AdditionalDetailsSection from "./AdditionalDetailsSection";
   import CourseSidebar            from "./CourseSidebar";
   
   /* client-only urgency bar / basket */
   const OfferBar = dynamic(() => import("./OfferBar"), { ssr: false });
   
   /* layout css */
   import styles from "./page.module.css";
   
   /* -------- local props type (do NOT call it `PageProps`) ------------- */
   type CoursePageProps = {
     params: { slug: string };
   };
   
   export default async function CoursePage({ params }: CoursePageProps) {
     const { slug } = params;
   
     /* pull just the columns we actually use */
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
   
     /* ---------- RENDER ------------------------------------------------- */
     return (
       <>
         {/* HERO --------------------------------------------------------- */}
         <Hero title={course.title} description={course.description} />
   
         {/* 2-COLUMN LAYOUT --------------------------------------------- */}
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
   
         {/* urgency bar / floating basket – client-side only */}
         <OfferBar
           discountActive={course.discount_active}
           expiresAt={course.expires_at}          /* ISO string | null */
         />
       </>
     );
   }
   