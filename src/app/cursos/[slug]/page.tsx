import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import BuyButton from "./BuyButton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function CourseDetailPage(props: any) {
  const { slug } = props.params;

  // Fetch the course details from Supabase
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

      <BuyButton course={course} />

      <Link href="/cursos">Volver a Cursos</Link>
    </div>
  );
}
