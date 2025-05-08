/* --------------------------------------------------------------------
   app/mini_cursos/[slug]/DigitalProductShowcase.tsx
-------------------------------------------------------------------- */
"use client";

import styles from "./DigitalProductShowcase.module.css";
import BuyButton from "@/app/cursos/[slug]/BuyButton";

interface Props {
  title: string;
  desc: string;
  price: number;      // 0 = gratis
  fileUrl: string;
  courseId: string;   // para analytics
}

export default function DigitalProductShowcase({
  title,
  desc,
  price,
  fileUrl,
  courseId,
}: Props) {
  const isFree = price === 0;

  /* Objeto que espera BuyButton (sólo los campos necesarios) */
  const miniCourse = {
    id: courseId,
    title: title,
    price: price,
    thumbnail_url: "",
    discount_percentage: 0,
    discount_active: false,
  } as const;

  return (
    <div className={styles.box}>
      <h4 className={styles.h4}>{title}</h4>
      <p className={styles.desc}>{desc}</p>

      {isFree ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener"
          className={styles.freeBtn}
        >
          Descargar gratis
        </a>
      ) : (
        <BuyButton course={miniCourse} />
      )}
    </div>
  );
}
