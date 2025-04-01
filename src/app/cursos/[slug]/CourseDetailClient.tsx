"use client";

import { useState } from "react";
import Script from "next/script";
import { loadStripe } from "@stripe/stripe-js";

// Example minimal shape for a Course
interface Course {
  title: string;
  description: string;
  promo_video_url?: string;
  // Add other fields as needed
}

// If you're fetching data client-side, you might do it with `useEffect` here.
export default function CourseDetailClient({ slug }: { slug: string }) {
  const [course, setCourse] = useState<Course | null>(null);

  // If you're fetching supabase data, you might do so in a useEffect.
  // For a quick example:
  // useEffect(() => {
  //   supabase.from("courses").select("*").eq("slug", slug).single().then(...)
  // }, [slug])

  return (
    <div style={{ padding: "2rem" }}>
      {/* Example FB Pixel script usage with an ID */}
      <Script id="fb-pixel-viewcontent" strategy="afterInteractive">
        {`
          if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', { content_name: 'Example Course Title' });
          }
        `}
      </Script>

      {course ? (
        <>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          {course.promo_video_url && (
            <iframe
              width="560"
              height="315"
              src={course.promo_video_url}
              title="Video de Presentación"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          )}
        </>
      ) : (
        <div>Loading course data...</div>
      )}
    </div>
  );
}
