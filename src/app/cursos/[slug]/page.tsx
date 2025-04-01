// app/cursos/[slug]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Script from "next/script";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  
  // Fetch the course details from Supabase using the provided slug
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();
  
  if (error || !course) {
    return notFound();
  }
  
  return (
    <div style={{ padding: "2rem" }}>
      {/* Facebook Pixel event: Track ViewContent event */}
      <Script strategy="afterInteractive">
        {`
          if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', {
              content_name: '${course.title}',
              content_category: 'Cursos'
            });
          }
        `}
      </Script>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      
      {course.promo_video_url && (
        <div style={{ margin: "1rem 0" }}>
          <iframe 
            width="560" 
            height="315" 
            src={course.promo_video_url} 
            title="Video de Presentación" 
            frameBorder="0" 
            allowFullScreen
          ></iframe>
        </div>
      )}
      
      <button
        style={{
          padding: "0.8rem 1.5rem",
          backgroundColor: "#a435f0",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Comprar
      </button>
    </div>
  );
}
