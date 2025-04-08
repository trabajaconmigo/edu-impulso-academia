import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Hero from "./Hero";                 
import StaticSection from "./StaticSection"; // Now dynamic!
import WhiteBoxSection from "./WhiteBoxSection";
import CourseSidebar from "./CourseSidebar";
import styles from "./page.module.css";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail_url: string;
  slug: string;
  what_you_ll_learn: string;
  student_count: number;
  created_by: string;
  last_updated: string;
  language: string;
  price: number; // Required for dynamic BuyButton
}


export default async function CoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Fetch course data from Supabase
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
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
          <WhiteBoxSection slug={slug} />
        </div>

        <div className={styles.sidebarColumn}>
          {/* ✅ Pass full course object including price */}
          <CourseSidebar course={course} />
        </div>
      </div>
    </>
  );
}
