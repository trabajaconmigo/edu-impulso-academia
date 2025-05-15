// src/app/generar-anuncios/Resultados.tsx
"use client";

import React, { useState } from "react";
import { FiCopy } from "react-icons/fi";
import styles from "./Resultados.module.css";

interface Item {
  headline: string;
  sub: string;
  tecnica: string;
  figura: string;
}

export default function Resultados({
  resultados,
  onRegenerar,
}: {
  resultados: Item[];
  onRegenerar: () => void;
}) {
  const [toast, setToast] = useState("");

  const copiar = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setToast(`${tipo} copiado`);
    setTimeout(() => setToast(""), 2000); // oculta en 2 s
  };

  return (
    <>
      <div className={styles.box}>
        <h2>3 Propuestas Generadas</h2>

        {resultados.map((r, i) => (
          <div key={i} className={styles.item}>
            {/* Titular */}
            <div className={styles.textRow}>
              <p className={styles.headline}>{r.headline}</p>
              <button
                className={styles.copyBtn}
                onClick={() => copiar(r.headline, "Titular")}
                aria-label="Copiar titular"
              >
                <FiCopy />
              </button>
            </div>

            {/* Subtítulo */}
            <div className={styles.textRow}>
              <p className={styles.sub}>{r.sub}</p>
              <button
                className={styles.copyBtn}
                onClick={() => copiar(r.sub, "Subtítulo")}
                aria-label="Copiar subtítulo"
              >
                <FiCopy />
              </button>
            </div>

            <p className={styles.tags}>
              #{r.tecnica}  #{r.figura}
            </p>
          </div>
        ))}

        <button className={styles.btnAgain} onClick={onRegenerar}>
          Generar de nuevo
        </button>
      </div>

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
