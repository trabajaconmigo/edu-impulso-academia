"use client";

import React from "react";
import styles from "./AdditionalDetailsSection.module.css";

interface AdditionalDetailsProps {
  requirements?: string | null;
  descriptionLong?: string | null;
}

export default function AdditionalDetailsSection({
  requirements,
  descriptionLong,
}: AdditionalDetailsProps) {
  // If both fields are empty, render nothing
  if (!requirements && !descriptionLong) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* If "requirements" is present, show the "Requisitos" heading */}
      {requirements && (
        <div className={styles.sectionBlock}>
          <h2 className={styles.title}>Requisitos</h2>
          <div
            dangerouslySetInnerHTML={{ __html: requirements }}
          />
        </div>
      )}

      {/* If "description_long" is present, show the "Descripción" heading */}
      {descriptionLong && (
        <div className={styles.sectionBlock}>
          <h2 className={styles.title}>Descripción</h2>
          <div
            dangerouslySetInnerHTML={{ __html: descriptionLong }}
          />
        </div>
      )}
    </div>
  );
}
