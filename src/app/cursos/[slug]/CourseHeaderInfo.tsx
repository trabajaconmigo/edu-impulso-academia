"use client";

import styles from "./CourseHeaderInfo.module.css";

interface CourseHeaderInfoProps {
  category: string;
  title: string;
  studentCount: number;
  createdBy: string;
  lastUpdated: string;
  language: string;
}

export default function CourseHeaderInfo({
  category,
  title,
  studentCount,
  createdBy,
  lastUpdated,
  language,
}: CourseHeaderInfoProps) {
  return (
    <header className={styles.headerInfo}>
      <div className={styles.headerContent}>
        <span className={styles.category}>{category}</span>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.meta}>
          <span>{studentCount} estudiantes</span>
          <span>Creado por {createdBy}</span>
          <span>Última actualización {lastUpdated}</span>
          <span>{language} [CC]</span>
        </div>
      </div>
    </header>
  );
}
