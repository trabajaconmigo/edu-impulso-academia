// src/app/generar-anuncios/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Formulario from "./Formulario";
import Resultados from "./Resultados";
import UserLoginRegistrationForm from "../checkout/UserLoginRegistrationForm";
import styles from "./page.module.css";

export default function GenerarAnunciosPage() {
  /* ---------------- estado ---------------- */
  const [sesion, setSesion] = useState<boolean | null>(null);
  const [cargando, setCargando] = useState(true);
  const [resultados, setResultados] = useState<any[]>([]);

  /* ---------------- sesión ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(!!data.session);
      setCargando(false);
    });
  }, []);

  /* ---------------- callback principal ---------------- */
  function handleGenerar(res: any[]) {
    setResultados(res);

    // Desplaza suavemente al inicio para que el usuario vea los resultados
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /* ---------------- render ---------------- */
  if (cargando || sesion === null) {
    return <div className={styles.container}>Cargando…</div>;
  }

  if (!sesion) {
    return (
      <div className={styles.container}>
        <UserLoginRegistrationForm
          onLoginSuccess={() => setSesion(true)}
          courseId=""
          amount={0}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Generador de Titulares y Subtítulos</h1>

      {resultados.length > 0 ? (
        <Resultados
          resultados={resultados}
          onRegenerar={() => {
            setResultados([]);
            // Opcional: vuelve a mostrar el formulario arriba
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : (
        <Formulario onGenerar={handleGenerar} />
      )}
    </div>
  );
}
