// src/app/cursos/[slug]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import BuyButton from "./BuyButton"; // Ensure you have a BuyButton component

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch the course details by matching the slug
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
      {/* Inline script must have an "id" attribute */}
      <Script id="fb-pixel-viewcontent" strategy="afterInteractive">
        {`
          if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', { content_name: '${course.title}' });
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

      {/* Client-side component to handle Stripe Checkout */}
      <BuyButton course={course} />

      <Link href="/cursos">Volver a Cursos</Link>
    </div>
  );
}
