"use client";

import React, { useState, FormEvent } from "react";
import styles from "./HeadlineForm.module.css";

interface Props {
  onGenerated: (
    r: { headline: string; sub: string; tecnica: string; figura: string }[]
  ) => void;
}

export default function HeadlineForm({ onGenerated }: Props) {
  /*--------- estado local ---------*/
  const [producto, setProducto] = useState("");
  const [plataforma, setPlataforma] = useState("Facebook");
  const [tecnica, setTecnica] = useState("yes-question");
  const [figura, setFigura] = useState("Aliteración");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  /*--------- submit ---------*/
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!producto.trim()) {
      setError("Describe brevemente tu producto/servicio.");
      return;
    }
    setCargando(true);

    const res = await fetch("/api/generar-anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producto, plataforma, tecnica, figura }),
    });

    if (!res.ok) {
      setError("Error al generar titulares.");
      setCargando(false);
      return;
    }
    const data = await res.json();
    onGenerated(data.headlines);
    setCargando(false);
  }

  /*--------- UI ---------*/
  return (
    <form onSubmit={handleSubmit} className={styles.formBox}>
      <label>¿Qué vendes?
        <input
          type="text"
          placeholder="Ej. Curso de Finanzas Personales"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
          required
        />
      </label>

      <label>Plataforma
        <select value={plataforma} onChange={(e) => setPlataforma(e.target.value)}>
          <option>Facebook</option>
          <option>TikTok</option>
          <option>Instagram</option>
          <option>X / Twitter</option>
          <option>LinkedIn</option>
        </select>
      </label>

      <label>Técnica persuasiva (Hormozi)
        <select value={tecnica} onChange={(e) => setTecnica(e.target.value)}>
          <option value="yes-question">Yes-Question</option>
          <option value="if-then">If-Then</option>
          <option value="ridiculous-result">Resultado Ridículo</option>
          <option value="call-out">Call-Out + Label</option>
        </select>
      </label>

      <label>Figura retórica
        <select value={figura} onChange={(e) => setFigura(e.target.value)}>
          <option>Aliteración</option>
          <option>Asonancia</option>
          <option>Rima</option>
          <option>Paralelismo</option>
          <option>Onomatopeya</option>
        </select>
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.btn} disabled={cargando}>
        {cargando ? "Generando…" : "Generar 3 Titulares"}
      </button>
    </form>
  );
}
