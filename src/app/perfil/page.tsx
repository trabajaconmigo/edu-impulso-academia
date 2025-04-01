"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Define a type for course data
interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  promo_video_url?: string;
}

export default function ProfilePage() {
  const [coursesPurchased, setCoursesPurchased] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPurchases() {
      // Check if the user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      const userId = session.user.id;

      // Query the purchases table and join with courses table
      const { data: purchaseData, error } = await supabase
        .from("purchases")
        .select("*, course:course_id(*)")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching purchases:", error.message);
      } else if (purchaseData) {
        // Map over purchaseData to extract the course details
        const courses = purchaseData.map((item: any) => item.course);
        setCoursesPurchased(courses);
      }
      setLoading(false);
    }
    fetchPurchases();
  }, [router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mi Perfil</h1>
      <h2>Cursos Comprados</h2>
      {coursesPurchased.length === 0 ? (
        <p>No has comprado ningún curso.</p>
      ) : (
        <ul>
          {coursesPurchased.map((course) => (
            <li key={course.id} style={{ marginBottom: "1rem" }}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              {course.promo_video_url && (
                <div style={{ margin: "1rem 0" }}>
                  <iframe
                    width="560"
                    height="315"
                    src={course.promo_video_url}
                    title={course.title}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
