"use client";

import React from "react";
import styles from "./ResultsBox.module.css";

interface Props {
  results: { headline: string; sub: string; tecnica: string; figura: string }[];
}

export default function ResultsBox({ results }: Props) {
  return (
    <div className={styles.box}>
      <h2>Resultados</h2>
      {results.map((h, i) => (
        <div key={i} className={styles.item}>
          <p className={styles.headline}>{h.headline}</p>
          <p className={styles.sub}>{h.sub}</p>
          <p className={styles.tags}>
            #{h.tecnica}  |  #{h.figura}
          </p>
        </div>
      ))}
    </div>
  );
}
