import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./courseContent.module.css";

interface Lesson {
  id: string;
  title: string;
  content: string;
  // Additional fields if needed
}

interface CourseContentProps {
  params: { slug: string };
}

export default async function CourseContentPage({ params }: CourseContentProps) {
  const { slug } = params;
  // Here you would fetch the course lessons/content from Supabase
  // For demonstration, using static data:
  const lessons: Lesson[] = [
    { id: "1", title: "Introducción", content: "Contenido de la lección 1" },
    { id: "2", title: "Conceptos Básicos", content: "Contenido de la lección 2" },
    { id: "3", title: "Avanzado", content: "Contenido de la lección 3" },
  ];

  return (
    <section className={styles.contentContainer}>
      <h1>Contenido del Curso</h1>
      <ul className={styles.lessonList}>
        {lessons.map((lesson) => (
          <li key={lesson.id} className={styles.lessonItem}>
            <h2>{lesson.title}</h2>
            <p>{lesson.content}</p>
            <Link href={`/cursos/${slug}/contenido/examen/${lesson.id}`}>
              <button className={styles.examButton}>Realizar Examen</button>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
