// app/cursos/[slug]/contenido/page.tsx
import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function CourseContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in
    redirect("/auth/login");
  }

  // Further checks for purchase, etc.

  return <div>Contenido del curso {params.slug}</div>;
}
