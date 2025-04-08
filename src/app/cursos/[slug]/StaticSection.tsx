// src/app/cursos/[slug]/StaticSection.tsx

"use client"; // Ensure this directive is uncommented

import { useState } from "react"; // Import useState from react
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import styles from "./StaticSection.module.css";

interface StaticSectionProps {
  whatYoullLearn?: string;
}

export default function StaticSection({ whatYoullLearn }: StaticSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Check if whatYoullLearn is defined and not null before proceeding
  const features = whatYoullLearn && typeof whatYoullLearn === "string"
    ? whatYoullLearn.split("\n").map(line => line.trim()).filter(line => line !== "")
    : [];

  return (
    <div className={styles.staticContainer}>
      <h2 className={styles.title}>Lo que aprenderás</h2>
      <div className={`${styles.content} ${expanded ? styles.expanded : styles.collapsed}`}>
        {features.length > 0 ? (
          <ul className={styles.featureList}>
            {features.map((feature, index) => (
              <li key={index} className={styles.featureItem}>
                <span className={styles.checkIcon}>✔</span> {feature}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay información disponible.</p>
        )}
      </div>
      {features.length > 3 && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className={styles.toggleButton}
        >
          {expanded ? (
            <>
              Ocultar <ChevronUpIcon className={styles.icon} />
            </>
          ) : (
            <>
              Mostrar más <ChevronDownIcon className={styles.icon} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
