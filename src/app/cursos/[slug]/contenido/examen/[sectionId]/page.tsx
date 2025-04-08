import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./examPage.module.css";

interface ExamPageProps {
  params: { sectionId: string; slug: string };
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { sectionId, slug } = params;
  // Fetch exam questions for the section from Supabase if available.
  // For demonstration, we use static sample data.
  const examQuestions = [
    { id: "q1", question: "¿Qué es HTML?", options: ["Lenguaje de marcado", "Lenguaje de programación", "Base de datos"], correct: 0 },
    { id: "q2", question: "¿Qué significa CSS?", options: ["Cascading Style Sheets", "Computer Style System", "Creative Style Solution"], correct: 0 },
  ];

  if (!examQuestions) {
    return notFound();
  }

  return (
    <section className={styles.examContainer}>
      <h1>Examen del Curso</h1>
      <ul className={styles.questionList}>
        {examQuestions.map((q) => (
          <li key={q.id} className={styles.questionItem}>
            <h2>{q.question}</h2>
            <ul className={styles.options}>
              {q.options.map((option, index) => (
                <li key={index} className={styles.option}>
                  {option}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
