/* --------------------------------------------------------------------
   src/app/admin/index.tsx
-------------------------------------------------------------------- */
"use client";

import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  // Aquí podrías hacer la verificación de rol "admin" si es necesario.

  return (
    <main className={styles.adminMain}>
      <h1>Panel de Administración</h1>

      <div className={styles.buttonContainer}>
        {/* ---------- Cursos ---------- */}
        <Link href="/admin/AddOrEditCourse">
          <button className={styles.button}>Crear Nuevo Curso</button>
        </Link>

        <Link href="/admin/edit_cursos">
          <button className={styles.button}>Editar Cursos</button>
        </Link>

        {/* ---------- Consejos ---------- */}
        <Link href="/admin/consejos">
          <button className={styles.button}>Gestionar Consejos</button>
        </Link>
      </div>
    </main>
  );
}
