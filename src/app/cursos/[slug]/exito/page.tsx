// src/app/cursos/[slug]/exito/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link'; // Import Link component
import { supabase } from "@/lib/supabaseClient";

// Interface for the course data structure
interface Course {
  id: string;
  title: string;
  description: string;
  promo_video_url?: string;
  slug: string;
}

// Keep the explicit props type including searchParams for build compatibility
// Add eslint-disable comment to ignore the unused 'searchParams' variable lint error
// Mark the function definition with 'async' as requested by Approach 2
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function ExitoPage({ params, searchParams }: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // --- State Management ---
  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchase, setHasPurchase] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start in loading state

  // --- Hooks ---
  const router = useRouter();
  // Destructure slug from params for easier use and stability in dependency array
  const { slug } = params;

  // --- Data Fetching and Authorization Effect ---
  useEffect(() => {
    // This function runs on the client after the component mounts
    async function fetchDataAndCheckAuth() {
      // 1. Check user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If no active session, redirect to login (client-side)
      if (!session) {
        router.push("/auth/login");
        return; // Stop execution for this effect run
      }

      const userId = session.user.id;

      // 2. Fetch the course details using the slug
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, promo_video_url, slug") // Select specific needed fields
        .eq("slug", slug) // Filter by the slug from URL params
        .single(); // Expect only one course matching the slug

      // Handle course fetch errors or if the course doesn't exist
      if (courseError || !courseData) {
        console.error(`Error fetching course (${slug}) or course not found:`, courseError);
        // Redirect to a general courses page or 404 (client-side)
        router.push("/cursos");
        return; // Stop execution
      }

      // If course found, update state
      setCourse(courseData);

      // 3. Check if the logged-in user has purchased this specific course
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("id") // Only need to know if a record exists, 'id' is sufficient
        .eq("user_id", userId) // Match the current user
        .eq("course_id", courseData.id) // Match the fetched course ID
        .maybeSingle(); // Use maybeSingle to gracefully handle 0 or 1 matching purchase (no error if none found)

      // Handle potential errors during the purchase check
      if (purchaseError) {
        console.error("Error checking purchase status:", purchaseError);
        // Consider showing an error message to the user
        // Still need to finish the loading state even if there's an error
        setLoading(false);
        return; // Prevent potentially showing content if purchase status is unknown
      }

      // 4. Update purchase status and loading state
      setHasPurchase(!!purchaseData); // Set to true if purchaseData is not null/undefined, false otherwise
      setLoading(false); // Data fetching and checks are complete
    }

    // Call the async function defined within the effect
    fetchDataAndCheckAuth();

    // Dependencies for the useEffect hook:
    // - slug: Re-run if the course slug changes
    // - router: Include router instance if used for navigation inside effect
  }, [slug, router]);

  // --- Conditional Rendering ---

  // Display loading indicator while fetching data
  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando información de compra...</div>;
  }

  // Display access denied message if loading is finished but no purchase was found
  if (!hasPurchase) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Acceso Denegado</h2>
        <p>No hemos podido verificar tu compra para este curso.</p>
        <p>Asegúrate de haber iniciado sesión con la cuenta correcta o de haber completado la compra.</p>
        <p style={{ marginTop: '1rem' }}>
          {/* Use Link component for faster, client-side navigation within the app */}
          <Link href="/auth/login">Iniciar Sesión</Link> | {' '}
          <Link href={`/cursos/${slug}`}>Ver Detalles del Curso</Link> | {' '}
          <Link href="/cursos">Ver Todos los Cursos</Link>
        </p>
      </div>
    );
  }

  // Display the success/confirmation content if loading is finished AND purchase is confirmed
  return (
    <div style={{ padding: "2rem" }}>
      <h1>¡Compra Exitosa! Acceso a: {course?.title}</h1>
      <p>{course?.description}</p>

      {/* Display promo video if URL exists */}
      {course?.promo_video_url && (
        <div style={{ margin: "1rem 0", maxWidth: '560px' }}> {/* Optional: Constrain width */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}> {/* Aspect ratio wrapper */}
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={course.promo_video_url.includes('embed') ? course.promo_video_url : course.promo_video_url.replace("watch?v=", "embed/")}
              title="Video de Presentación del Curso"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Section indicating unlocked content and providing access link */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Contenido Desbloqueado</h2>
        <p>¡Felicidades! Ya puedes comenzar a aprender. Haz clic en el botón para acceder al contenido del curso.</p>
        {/* Use Link for the call to action to navigate to the course content page */}
        <Link href={`/cursos/${slug}/contenido`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.8rem 1.5rem', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            Ir al Contenido del Curso
        </Link>
      </div>
    </div>
  );
}