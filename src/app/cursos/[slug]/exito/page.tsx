"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Course {
  id: string;
  title: string;
  description: string;
  promo_video_url?: string;
  slug: string;
}

export default function ExitoPage({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchase, setHasPurchase] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      const userId = session.user.id;

      // Fetch course details by slug
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", params.slug)
        .single();
      if (courseError || !courseData) {
        router.push("/404");
        return;
      }
      setCourse(courseData);

      // Check if the user has purchased this course
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseData.id)
        .single();
      if (!purchaseError && purchaseData) {
        setHasPurchase(true);
      } else {
        setHasPurchase(false);
      }
      setLoading(false);
    }
    fetchData();
  }, [params.slug, router]);

  if (loading) {
    return <div>Cargando información...</div>;
  }
  if (!hasPurchase) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Compra no encontrada</h2>
        <p>No se ha registrado la compra de este curso. Por favor, inténtalo de nuevo o comunícate con soporte.</p>
      </div>
    );
  }
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
