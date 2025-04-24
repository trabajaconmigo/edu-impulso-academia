"use client";

import React from "react";
import styles from "./styles/AddOrEditCourse.module.css";

interface Props {
  requirements: string[];
  onChange: (idx: number, v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}

export default function Requirements({
  requirements,
  onChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Requisitos</h2>
      {requirements.map((r, idx) => (
        <div key={idx} className={styles.learningRow}>
          <label>Requisito {idx + 1}</label>
          <input
            type="text"
            value={r}
            onChange={(e) => onChange(idx, e.target.value)}
          />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(idx)}
          >
            Eliminar
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className={styles.addLessonBtn}>
        + Agregar Requisito
      </button>
    </div>
  );
}
