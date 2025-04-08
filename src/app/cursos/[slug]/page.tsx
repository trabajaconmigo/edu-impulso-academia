import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Hero from "./Hero";
import StaticSection from "./StaticSection";
import WhiteBoxSection from "./WhiteBoxSection";
import CourseSidebar from "./CourseSidebar";
import styles from "./page.module.css";

interface Course {
  id: string;
  title: string;          // Make sure this is present
  description: string;    // And this
  subtitle?: string;      // If you need it
  thumbnail_url: string;
  slug: string;
  what_you_ll_learn: string;
  student_count: number;
  created_by: string;
  last_updated: string;
  language: string;
  price: number;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function CoursePage(props: any) {
  const { slug } = props.params;

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching course:", error);
    return notFound();
  }

  const course = data as Course;

  return (
    <>
      <Hero title={course.title} description={course.description} />
      <div className={styles.mainContainer}>
        <div className={styles.leftColumn}>
          <StaticSection whatYoullLearn={course.what_you_ll_learn} />
          <WhiteBoxSection slug={slug} />
        </div>
        <div className={styles.sidebarColumn}>
          <CourseSidebar course={course} />
        </div>
      </div>
    </>
  );
}
