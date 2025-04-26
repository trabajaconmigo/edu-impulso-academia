// src/components/NewsletterForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./NewsletterForm.module.css";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"thanks">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await supabase.from("newsletter").insert({ email });
    setStatus("thanks");
  };

  if (status === "thanks") {
    return <p className={styles.thanks}>¡Gracias por suscribirte!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label htmlFor="newsletter-email">Suscríbete al newsletter</label>
      <div className={styles.controls}>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Suscribirse"}
        </button>
      </div>
    </form>
  );
}
