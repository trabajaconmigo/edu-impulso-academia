"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DigitalProductShowcase from "./DigitalProductShowcase";
import SlidePopup from "./SlidePopup";
import styles from "@/app/cursos/[slug]/CourseSidebar.module.css";

interface MiniCourse {
  id: string;
  title: string;
  thumbnail_url: string;
  preview_video?: string;           // opcional si aún quieres mostrar video
  digital_product_title?: string;
  digital_product_desc?: string;
  digital_product_price?: number;
  digital_product_file_url?: string;
}

interface FreeSidebarProps {
  course: MiniCourse;
}

export default function FreeSidebar({ course }: FreeSidebarProps) {
  const [logged, setLogged] = useState(false);
  const [showSlides, setShowSlides] = useState(false);

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      setLogged(!!sess.session);
    })();
  }, []);

  const openSlides = () => setShowSlides(true);

  return (
    <div className={styles.sidebar}>
      {/* Imagen del curso */}
      <div className={styles.courseImage}>
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          width={600}
          height={400}
          className={styles.someImageClass}
        />
        {/* Botón para iniciar las diapositivas narradas */}
        <div className={styles.playButton} onClick={openSlides}>
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p>Comenzar curso</p>
        </div>
      </div>

      {/* Llamado a registro si no está logueado */}
      {!logged ? (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <Link href="/auth/registro" className="btn-primary">
            Regístrate gratis para acceder al mini-curso
          </Link>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <p>🎉 Tienes acceso completo al mini-curso. ¡Disfrútalo!</p>
        </div>
      )}

      {/* Showcase de producto digital (PDF) */}
      {course.digital_product_title && (
        <DigitalProductShowcase
          title={course.digital_product_title}
          desc={course.digital_product_desc || ""}
          price={course.digital_product_price || 0}
          fileUrl={course.digital_product_file_url || ""}
          courseId={course.id}
        />
      )}

      {/* Popup de slides narradas */}
      {showSlides && (
        <SlidePopup
          miniCursoId={course.id}
          onClose={() => setShowSlides(false)}
        />
      )}
    </div>
  );
}
