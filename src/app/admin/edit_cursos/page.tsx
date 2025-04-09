// /admin/edit_cursos.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styles from "./editCursos.module.css";

interface Course {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  price: number;
}

export default function EditCursosPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, category, price")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching courses:", error.message);
      } else if (data) {
        setCourses(data as Course[]);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  function handleEdit(courseId: string) {
    // Go to AddOrEditCourse for editing
    router.push(`/admin/AddOrEditCourse?courseId=${courseId}`);
  }

  function goBackAdmin() {
    router.push("/admin");
  }

  return (
    <main className={styles.container}>
      <button onClick={goBackAdmin} className={styles.backAdminBtn}>
        Volver al Panel Admin
      </button>
      <h1 className={styles.pageTitle}>Editar Cursos</h1>
      {loading ? (
        <p>Cargando cursos...</p>
      ) : courses.length === 0 ? (
        <p>No hay cursos disponibles.</p>
      ) : (
        <table className={styles.courseTable}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Slug</th>
              <th>Categoría</th>
              <th>Precio (MXN)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.slug}</td>
                <td>{course.category || "N/A"}</td>
                <td>${course.price}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(course.id)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
