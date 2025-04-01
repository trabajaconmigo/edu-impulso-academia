// app/cursos/page.tsx
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function CoursesPage() {
  // Fetch courses from Supabase and order them by creation date (newest first)
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    return <div>Error loading courses: {error.message}</div>;
  }
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Cursos</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {courses?.map((course: any) => (
          <div
            key={course.id}
            style={{
              border: "1px solid #ddd",
              padding: "1rem",
              borderRadius: "4px",
            }}
          >
            <h2>{course.title}</h2>
            <p>{course.description.substring(0, 100)}...</p>
            <Link href={`/cursos/${course.slug}`}>
              Ver Detalles
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
