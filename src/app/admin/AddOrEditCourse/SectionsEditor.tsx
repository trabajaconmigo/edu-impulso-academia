/* --------------------------------------------------------------------
   src/app/admin/SectionsEditor.tsx
   ------------------------------------------------------------------ */
"use client";

import React from "react";
import styles from "./styles/AddOrEditCourse.module.css";

interface LessonInput {
  title: string;
  youtube_link: string;
  paid: boolean;
  order_index: number;
  minutes: number;
  seconds: number;
}

interface SectionInput {
  title: string;
  order_index: number;
  lessons: LessonInput[];
}

interface Props {
  sections: SectionInput[];
  onChange: (secs: SectionInput[]) => void;
}

export default function SectionsEditor({ sections, onChange }: Props) {
  const updateSection = (i: number, sec: SectionInput) => {
    const newSecs = [...sections];
    newSecs[i] = sec;
    onChange(newSecs);
  };
  const addSection = () => onChange([...sections, { title: "", order_index: sections.length + 1, lessons: [] }]);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Secciones & Lecciones</h2>
      {sections.map((sec, si) => (
        <div key={si} className={styles.sectionCard}>
          <input
            type="text"
            placeholder="Título sección"
            value={sec.title}
            onChange={(e) => updateSection(si, { ...sec, title: e.target.value })}
          />
          <button
            type="button"
            onClick={() => onChange(sections.filter((_, idx) => idx !== si))}
          >
            Eliminar Sección
          </button>

          {sec.lessons.map((les, li) => (
            <div key={li} className={styles.lessonCard}>
              <input
                type="text"
                placeholder="Título lección"
                value={les.title}
                onChange={e =>
                  updateSection(si, {
                    ...sec,
                    lessons: sec.lessons.map((l, idx) =>
                      idx === li ? { ...l, title: e.target.value } : l
                    )
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  updateSection(si, {
                    ...sec,
                    lessons: sec.lessons.filter((_, idx) => idx !== li)
                  })
                }
              >
                Eliminar Lección
              </button>
            </div>
          ))}
          <button type="button" onClick={() => {
            updateSection(si, {
              ...sec,
              lessons: sec.lessons.concat({
                title: "",
                youtube_link: "",
                paid: false,
                order_index: sec.lessons.length + 1,
                minutes: 0,
                seconds: 0
              })
            });
          }}>
            + Agregar Lección
          </button>
        </div>
      ))}
      <button type="button" onClick={addSection} className={styles.addSectionBtn}>
        + Agregar Sección
      </button>
    </div>
  );
}
