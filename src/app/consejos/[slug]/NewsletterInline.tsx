"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./NewsletterInline.module.css";

interface Props {
  category: string;
  giftMsg?: string | null;
  giftPdfUrl?: string | null;
}

export default function NewsletterInline({ category, giftMsg, giftPdfUrl }: Props) {
  const [lead, setLead] = useState({ name: "", email: "" });
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("newsletter").insert([
      { name: lead.name, email: lead.email, category, gift_sent: false },
    ]);
    if (!error) {
      setSent(true);
      if (giftPdfUrl) window.open(giftPdfUrl, "_blank");
    } else alert("Error al registrar.");
  }

  const text = giftMsg || `Descarga gratis nuestro recurso de ${category}`;

  return (
    <section className={styles.banner}>
      {sent ? (
        <p className={styles.thanks}>¡Gracias! Tu PDF se abre en una pestaña nueva.</p>
      ) : (
        <>
          <h3 className={styles.hook}>🎁 {text}</h3>
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
            <button type="submit">Suscribirme</button>
          </form>
        </>
      )}
    </section>
  );
}
