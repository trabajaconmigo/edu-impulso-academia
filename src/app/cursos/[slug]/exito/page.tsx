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

// REMOVE the ExitoPageProps type alias

// Define the props inline in the function signature
export default function ExitoPage({ params }: { params: { slug: string } }) { // <--- CHANGE HERE
  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchase, setHasPurchase] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { slug } = params; // Destructure slug for easier use in useEffect dependency array

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

      // Fetch the course by slug
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, promo_video_url, slug") // Select specific columns
        .eq("slug", slug) // Use the destructured slug variable
        .single();

      if (courseError || !courseData) {
        console.error("Error fetching course or course not found:", courseError);
        // Consider redirecting to a generic course list or a more specific error page
        router.push("/cursos");
        return;
      }
      setCourse(courseData);

      // Check if the user has purchased this course
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("id") // Only need to know if it exists
        .eq("user_id", userId)
        .eq("course_id", courseData.id)
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 result without error

      if (purchaseError) {
        console.error("Error checking purchase:", purchaseError);
        // Handle error appropriately, maybe show an error message
        setLoading(false); // Ensure loading stops even on error
        return;
      }

      setHasPurchase(!!purchaseData); // Set to true if purchaseData is not null/undefined
      setLoading(false);
    }

    fetchData();
    // Use the stable 'slug' variable in the dependency array
  }, [slug, router]);

  if (loading) {
    return <div>Cargando información...</div>;
  }

  // Redirect if no purchase, AFTER loading is complete
  if (!hasPurchase) {
     // It might be better user experience to show a message on *this* page
     // rather than redirecting immediately, but redirecting is also valid.
     // Example message:
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Acceso Denegado</h2>
          <p>Parece que no has comprado este curso todavía o tu sesión ha expirado.</p>
          <p>
            <a href="/auth/login">Inicia sesión</a> o{' '}
            <a href={`/cursos/${slug}`}>visita la página del curso</a> para comprarlo.
          </p>
          {/* Optionally add a button to go back or to the courses page */}
        </div>
      );
    // If you still want to redirect:
    // router.push(`/cursos/${slug}`); // Redirect to course detail page
    // return null; // Render nothing while redirecting
  }


  // Render the unlocked content ONLY if purchase is confirmed and loading is done
  return (
    <div style={{ padding: "2rem" }}>
      <h1>¡Compra Exitosa! Acceso a: {course?.title}</h1>
      <p>{course?.description}</p>
      {course?.promo_video_url && (
        <div style={{ margin: "1rem 0" }}>
           {/* Ensure video URL is correctly embedded. Some URLs need specific formats */}
          <iframe
            width="560"
            height="315"
            src={course.promo_video_url.replace("watch?v=", "embed/")} // Example adjustment for YouTube
            title="Video de Curso"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <div>
        <h2>Contenido Desbloqueado</h2>
        <p>¡Felicidades! Aquí tendrás acceso al contenido completo del curso.</p>
        {/* Add link to the actual content page */}
        <a href={`/cursos/${slug}/contenido`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: 'blue', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Ir al Contenido del Curso
        </a>
      </div>
    </div>
  );
}