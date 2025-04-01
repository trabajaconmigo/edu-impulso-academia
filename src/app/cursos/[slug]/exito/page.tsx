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

// Define the full expected Page Props structure inline
// Even if searchParams is unused, including it might satisfy the build check
export default function ExitoPage({ params, searchParams }: { // <-- Include searchParams here
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined }; // Standard type for searchParams
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchase, setHasPurchase] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  // Destructure slug from params for use
  const { slug } = params;

  useEffect(() => {
    // console.log("Current searchParams:", searchParams); // Optional: Check if any searchParams are passed

    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const userId = session.user.id;

      // Fetch the course by slug
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, promo_video_url, slug")
        .eq("slug", slug) // Use the destructured slug
        .single();

      if (courseError || !courseData) {
        console.error(`Error fetching course (${slug}) or not found:`, courseError);
        router.push("/cursos"); // Redirect to a safe place
        return;
      }
      setCourse(courseData);

      // Check if the user has purchased this course
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("id") // Only need existence check
        .eq("user_id", userId)
        .eq("course_id", courseData.id)
        .maybeSingle(); // Handles 0 or 1 result gracefully

      if (purchaseError) {
        console.error("Error checking purchase:", purchaseError);
        // Decide how to handle this - maybe show an error message?
        setLoading(false); // Ensure loading finishes
        return; // Prevent proceeding without purchase status
      }

      setHasPurchase(!!purchaseData); // Convert null/object to boolean
      setLoading(false);
    }

    fetchData();
    // Dependency array uses the stable 'slug' variable
  }, [slug, router]); // Removed searchParams from dependency array unless needed

  if (loading) {
    return <div>Cargando información...</div>;
  }

  if (!hasPurchase) {
    // Show a helpful message instead of just redirecting immediately
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Acceso Denegado</h2>
        <p>No hemos podido verificar tu compra para este curso.</p>
        <p>Asegúrate de haber iniciado sesión con la cuenta correcta.</p>
        <p>
          <a href="/auth/login">Iniciar Sesión</a> | {' '}
          <a href={`/cursos/${slug}`}>Ver Curso</a> | {' '}
          <a href="/cursos">Ver Todos los Cursos</a>
        </p>
        {/* Add contact info if needed */}
      </div>
    );
  }

  // Render content if loading is done AND purchase is confirmed
  return (
    <div style={{ padding: "2rem" }}>
      <h1>¡Compra Exitosa! Acceso a: {course?.title}</h1>
      <p>{course?.description}</p>
      {course?.promo_video_url && (
        <div style={{ margin: "1rem 0" }}>
          <iframe
            width="560"
            height="315"
            // Simple check for embed format, adjust based on your video source
            src={course.promo_video_url.includes('embed') ? course.promo_video_url : course.promo_video_url.replace("watch?v=", "embed/")}
            title="Video de Curso"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <div>
        <h2>Contenido Desbloqueado</h2>
        <p>¡Felicidades! Ahora puedes acceder al contenido completo del curso.</p>
        <a href={`/cursos/${slug}/contenido`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: 'blue', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Ir al Contenido del Curso
        </a>
      </div>
    </div>
  );
}