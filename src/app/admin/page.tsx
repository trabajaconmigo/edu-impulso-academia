/* --------------------------------------------------------------------
   src/app/admin/index.tsx
   Panel de Administración — Restringido solo a usuarios con rol "admin"
-------------------------------------------------------------------- */
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      // 1) Obtener sesión actual
      const { data: { session }, error: sesError } = await supabase.auth.getSession();
      if (sesError || !session) {
        router.replace("/auth/login");
        return;
      }

      // 2) Buscar en profiles usando user_id = session.user.id
      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", session.user.id)    // <-- aquí estaba la comparación mal
        .single();

      if (profError || profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      setAuthorized(true);
    })();
  }, [router]);

  if (authorized === null) {
    return <p className={styles.loading}>Verificando permisos…</p>;
  }

  return (
    <main className={styles.adminMain}>
      <h1>Panel de Administración</h1>
      <div className={styles.buttonContainer}>
        <Link href="/admin/AddOrEditCourse">
          <button className={styles.button}>Crear Nuevo Curso</button>
        </Link>
        <Link href="/admin/edit_cursos">
          <button className={styles.button}>Editar Cursos</button>
        </Link>
        <Link href="/admin/consejos">
          <button className={styles.button}>Gestionar Consejos</button>
        </Link>
      </div>
    </main>
  );
}
