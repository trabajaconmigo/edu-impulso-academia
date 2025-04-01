// src/app/cursos/[slug]/page.tsx
import { supabase } from '@/lib/supabaseClient';

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch the course data from Supabase
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !course) {
    // Handle error or 404
    return <div>Curso no encontrado.</div>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      {/* Free preview video from YouTube */}
      <div>
        <iframe
          width="560"
          height="315"
          src={course.promo_video_url}
          title="Free preview"
          allowFullScreen
        />
      </div>

      {/* Button to buy -> We'll integrate Stripe checkout later */}
      <button>Comprar</button>
    </main>
  );
}
