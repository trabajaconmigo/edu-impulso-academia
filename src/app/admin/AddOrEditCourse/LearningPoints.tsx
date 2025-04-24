"use client";

import React from "react";
import styles from "./styles/AddOrEditCourse.module.css";

interface Props {
  learningPoints: string[];
  onChange: (idx: number, v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}

export default function LearningPoints({
  learningPoints,
  onChange,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Lo que aprenderás</h2>
      {learningPoints.map((p, idx) => (
        <div key={idx} className={styles.learningRow}>
          <label>Punto {idx + 1}</label>
          <input
            type="text"
            value={p}
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
        + Agregar Punto
      </button>
    </div>
  );
}
