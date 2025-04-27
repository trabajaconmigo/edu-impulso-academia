"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./NewsletterPopup.module.css";

interface Props {
  category: string;
  giftMsg?: string | null;
  giftPdfUrl?: string | null;
}

export default function NewsletterPopup({ category, giftMsg, giftPdfUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "" });

  /* ---------- Mostrar una sola vez (por recarga) ---------- */
  useEffect(() => {
    let shown = false;                              // no persiste tras refresh

    /* 30 s */
    const timer = setTimeout(() => {
      if (!shown) {
        setOpen(true);
        shown = true;
      }
    }, 30000);

    /* primer scroll-up */
    let lastY = window.scrollY;
    const onScroll = () => {
      const cur = window.scrollY;
      if (cur < lastY && lastY > 400 && !shown) {
        setOpen(true);
        shown = true;
        window.removeEventListener("scroll", onScroll);
        clearTimeout(timer);
      }
      lastY = cur;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ---------- Alta y descarga ---------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("newsletter").insert([
      { name: lead.name, email: lead.email, category, gift_sent: false },
    ]);
    if (!error) {
      setSent(true);
      if (giftPdfUrl) window.open(giftPdfUrl, "_blank"); // descarga inmediata
    } else alert("Error al registrar.");
  }

  const dynamicText = giftMsg || `Descarga gratis nuestro recurso de ${category}`;

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeBtn} onClick={() => setOpen(false)}>
          &times;
        </button>

        {sent ? (
          <>
            <h3 className={styles.thanksTitle}>¡Gracias por suscribirte!</h3>
            <p className={styles.thanksText}>
              Tu PDF se está descargando en una pestaña nueva.
            </p>
          </>
        ) : (
          <>
            <h3 className={styles.title}>🎁 {dynamicText}</h3>
            <p className={styles.subtitle}>Déjanos tu correo y obtén acceso inmediato.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                placeholder="Nombre"
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
                required
              />
              <button type="submit">Descargar ahora</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
