// /admin/index.tsx
"use client";

import Link from "next/link";
import styles from "./admin.module.css";

// If you want a single global Navbar / Footer, place them in your layout.js
// or wrap this page. We won't import them here to avoid duplication.

export default function AdminDashboard() {
  // If needed, do an admin role check here.

  return (
    <main className={styles.adminMain}>
      <h1>Panel de Administración</h1>
      <div className={styles.buttonContainer}>
        {/* Create new course (no courseId) */}
        <Link href="/admin/AddOrEditCourse">
          <button className={styles.button}>Crear Nuevo Curso</button>
        </Link>
        {/* Edit existing (for example, with a known courseId or via a selection page) */}
        <Link href="/admin/edit_cursos">
          <button className={styles.button}>Editar Cursos</button>
        </Link>
      </div>
    </main>
  );
}
