/* ------------------------------------------------------------------
   src/app/checkout/ReferralPopup.tsx
   ------------------------------------------------------------------ */
   "use client";

   import { useEffect } from "react";
   import styles from "./ReferralPopup.module.css";
   
   interface Props {
     slug: string;                    // e.g. "fotografia-digital"
     halfPrice: boolean;              // true → 50 % off; false → 100 % free
     onDone: (shared: boolean) => void;
   }
   
   export default function ReferralPopup({ slug, halfPrice, onDone }: Props) {
     const baseUrl = `https://www.escuela360.com.mx/cursos/${slug}`;
     const shareMsg = halfPrice
       ? "¡Consigue este curso con 50 % de descuento! 🚀 Únete desde aquí:"
       : "¡Obtén este curso totalmente GRATIS! 🎁 Únete desde aquí:";
     const waLink = `https://wa.me/?text=${encodeURIComponent(
       `${shareMsg} ${baseUrl}`
     )}`;
   
     // cerrar con ESC
     useEffect(() => {
       const esc = (e: KeyboardEvent) => e.key === "Escape" && onDone(false);
       window.addEventListener("keydown", esc);
       return () => window.removeEventListener("keydown", esc);
     }, [onDone]);
   
     return (
       <div className={styles.overlay}>
         <div className={styles.box}>
           <h2 className={styles.title}>
             {halfPrice
               ? "¡Comparte y obtén 50 % de descuento!"
               : "¡Comparte y obtén el curso gratis!"}
           </h2>
           <p className={styles.text}>
             Comparte el enlace con 1–3 amigos por WhatsApp (te tomará sólo 5 segundos).
           </p>
   
           <div className={styles.btnRow}>
             <a
               href={waLink}
               target="_blank"
               rel="noopener noreferrer"
               className={styles.shareBtn}
               onClick={() => onDone(true)}
             >
               Compartir por WhatsApp
             </a>
   
             <button
               className={styles.skipBtn}
               onClick={() => onDone(false)}
             >
               Prefiero pagar/pagar ahora
             </button>
           </div>
         </div>
       </div>
     );
   }
   