"use client";

import React, { useState, FormEvent } from "react";
import styles from "./Formulario.module.css";

interface Props { onGenerar: (r: any[]) => void; }

export default function Formulario({ onGenerar }: Props) {
  const [producto, setProducto]      = useState("");
  const [plataforma, setPlataforma]  = useState("Facebook");
  const [tecnica, setTecnica]        = useState("");
  const [competidorOn, setCompetidorOn] = useState(false);
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [puntosDolor, setPuntosDolor] = useState("");
  const [problema, setProblema]      = useState("");
  const [sexoAvatar, setSexoAvatar]  = useState("Indistinto");
  const [edadAvatar, setEdadAvatar]  = useState("30-45");
  const [extraIfThen, setExtraIfThen]= useState("");
  const [extraYesQuestion, setExtraYesQuestion]=useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!producto.trim()) return setError("Describe tu producto.");
    if (!tecnica)         return setError("Elige una técnica.");
    setError(""); setCargando(true);

    const body = {
      producto, plataforma, tecnica,
      competitorUrl: competidorOn ? competitorUrl : "",
      puntosDolor, problema, sexoAvatar, edadAvatar,
      extraIfThen, extraYesQuestion,
    };

    const res = await fetch("/api/generar-anuncios", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) { setError("Error al generar."); setCargando(false); return; }
    const { headlines } = await res.json();
    onGenerar(headlines);
    setCargando(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        ¿Qué vendes?
        <input value={producto} onChange={e=>setProducto(e.target.value)}
               placeholder="Curso de Finanzas" required />
      </label>

      <label>
        Plataforma
        <select value={plataforma} onChange={e=>setPlataforma(e.target.value)}>
          {["Facebook","TikTok","Instagram","LinkedIn"].map(p=><option key={p}>{p}</option>)}
        </select>
      </label>

      <label>
  Técnica persuasiva
  <select value={tecnica} onChange={e=>setTecnica(e.target.value)} required>
    <option value="">– Elige –</option>
    <option value="pregunta-si">Pregunta “Sí”</option>
    <option value="si-entonces">Condicional Si-Entonces</option>
    <option value="resultado-ridiculo">Resultado Ridículo</option>
    <option value="llamado-etiqueta">Llamado / Etiqueta</option>
  </select>
</label>

      {tecnica==="si-entonces" && (
        <label> Frases "si-entonces"
          <input value={extraIfThen} onChange={e=>setExtraIfThen(e.target.value)}
                 placeholder="Si inviertes 10 min/día, entonces…" />
        </label>
      )}
      {tecnica==="pregunta-si" && (
        <label> Pregunta clave
          <input value={extraYesQuestion} onChange={e=>setExtraYesQuestion(e.target.value)}
                 placeholder="¿Te gustaría duplicar tus ahorros?" />
        </label>
      )}

      <fieldset className={styles.avatar}>
        <legend>Avatar</legend>
        <label>Puntos de dolor
          <input value={puntosDolor} onChange={e=>setPuntosDolor(e.target.value)}
                 placeholder="Vive al día, miedo a deudas…" />
        </label>
        <label>Problema a resolver
          <input value={problema} onChange={e=>setProblema(e.target.value)}
                 placeholder="No sabe controlar gastos" />
        </label>
        <label>Sexo
          <select value={sexoAvatar} onChange={e=>setSexoAvatar(e.target.value)}>
            {["Indistinto","Masculino","Femenino"].map(s=><option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Edad
          <select value={edadAvatar} onChange={e=>setEdadAvatar(e.target.value)}>
            {["18-29","30-45","46-60","60+"].map(a=><option key={a}>{a}</option>)}
          </select>
        </label>
      </fieldset>

      <label className={styles.switch}>
        <input type="checkbox" checked={competidorOn}
               onChange={()=>setCompetidorOn(!competidorOn)} />
        <span>Usar URL de competidor</span>
      </label>

      {competidorOn && (
        <label>URL competidor
          <input type="url" value={competitorUrl}
                 onChange={e=>setCompetitorUrl(e.target.value)}
                 placeholder="https://…" />
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.btn} disabled={cargando}>
        {cargando ? "Generando…" : "Generar titulares"}
      </button>
    </form>
  );
}
