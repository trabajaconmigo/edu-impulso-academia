"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import type { NextPage } from 'next'; // <-- Import NextPage type

interface Course {
  id: string;
  title: string;
  description: string;
  promo_video_url?: string;
  slug: string;
}

// Define the expected props shape for this specific page
interface ExitoPageProps {
  params: { slug: string };
  // Include searchParams even if unused, matching the common PageProps structure
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Use the NextPage generic with your props interface
const ExitoPage: NextPage<ExitoPageProps> = ({ params, searchParams }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unusedSearchParams = searchParams; // Acknowledge use to satisfy linter if needed

  const [course, setCourse] = useState<Course | null>(null);
  const [hasPurchase, setHasPurchase] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { slug } = params;

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

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, promo_video_url, slug")
        .eq("slug", slug)
        .single();

      if (courseError || !courseData) {
        console.error(`Error fetching course (${slug}) or not found:`, courseError);
        router.push("/cursos");
        return;
      }
      setCourse(courseData);

      // Check purchase
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseData.id)
        .maybeSingle();

      if (purchaseError) {
        console.error("Error checking purchase:", purchaseError);
        setLoading(false);
        return;
      }

      setHasPurchase(!!purchaseData);
      setLoading(false);
    }

    fetchData();
  }, [slug, router]); // Dependencies seem correct

  // Loading state JSX
  if (loading) {
    return <div>Cargando información...</div>;
  }

  // No purchase state JSX
  if (!hasPurchase) {
     return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Acceso Denegado</h2>
        <p>No hemos podido verificar tu compra para este curso.</p>
        <p>Asegúrate de haber iniciado sesión con la cuenta correcta.</p>
        <p>
          <Link href="/auth/login">Iniciar Sesión</Link> | {' '}
          <Link href={`/cursos/${slug}`}>Ver Curso</Link> | {' '}
          <Link href="/cursos">Ver Todos los Cursos</Link>
        </p>
      </div>
    );
  }

  // Success state JSX (only reached if loading=false and hasPurchase=true)
  return (
    <div style={{ padding: "2rem" }}>
       <h1>¡Compra Exitosa! Acceso a: {course?.title}</h1>
      <p>{course?.description}</p>
      {course?.promo_video_url && (
        <div style={{ margin: "1rem 0" }}>
          <iframe
             width="560"
             height="315"
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
        <Link href={`/cursos/${slug}/contenido`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: 'blue', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
             Ir al Contenido del Curso
        </Link>
      </div>
    </div>
  );
}; // <--- End of component definition

export default ExitoPage; // <--- Export the component