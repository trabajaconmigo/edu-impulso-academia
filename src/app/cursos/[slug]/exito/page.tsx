"use client";  // <--- Makes this a client component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Type for route props
type PageProps = {
  params: Record<string, string>; // e.g. { slug: "diseno-grafico" }
};

// Optional interface for your course data
interface Course {
  id: string;
  title: string;
  description: string;
  promo_video_url?: string;
  slug: string;
}

export default function ExitoPage({ params }: PageProps) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [loading, setLoading] = useState(true);

  // The slug we need for lookups
  const slug = params.slug;

  useEffect(() => {
    async function fetchData() {
      // 1. Check if user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }
      const userId = session.user.id;

      // 2. Fetch the course by slug
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (courseError || !courseData) {
        router.push("/404");
        return;
      }
      setCourse(courseData);

      // 3. Check if user purchased this course
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseData.id)
        .single();

      if (!purchaseError && purchaseData) {
        setHasPurchase(true);
      }

      setLoading(false);
    }

    fetchData();
  }, [slug, router]);

  if (loading) {
    return <div>Cargando información...</div>;
  }

  if (!hasPurchase) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Compra no encontrada</h2>
        <p>No se ha registrado la compra de este curso.</p>
      </div>
    );
  }

  // If purchase is found, show unlocked content
  return (
    <div style={{ padding: "2rem" }}>
      <h1>{course?.title}</h1>
      <p>{course?.description}</p>
      {course?.promo_video_url && (
        <div style={{ margin: "1rem 0" }}>
          <iframe
            width="560"
            height="315"
            src={course.promo_video_url}
            title="Video de Curso"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <div>
        <h2>Contenido Desbloqueado</h2>
        <p>Aquí se muestran los videos y recursos del curso.</p>
      </div>
    </div>
  );
}
