/* --------------------------------------------------------------------
   HTMLContentEditors – handles:
   • Lo que aprenderás
   • Requisitos
   • Descripción larga (párrafos)
-------------------------------------------------------------------- */
"use client";

import React from "react";
import styles from "./styles/AddOrEditCourse.module.css";

/* ---------- helpers ------------------------------------------------ */

const arrToBullets = (a: string[]) =>
  a.length
    ? '<ul style="list-style-type: disc;">\n' +
      a.map((t) => `  <li>${t}</li>`).join("\n") +
      "\n</ul>"
    : "";

const bulletsToArr = (html = "") =>
  html
    .split("<li>")
    .slice(1)
    .map((c) => c.split("</li>")[0].replace(/<[^>]+>/g, ""));

const parasToHtml = (arr: string[]) =>
  arr
    .map((p, i) =>
      i === 0 ? `<p>${p}</p>` : `<p style="margin-top:1rem;">${p}</p>`
    )
    .join("\n");

const htmlToParas = (html = "") =>
  html
    .match(/<p[^>]*>(.*?)<\/p>/g)
    ?.map((p) => p.replace(/<\/?p[^>]*>/g, "")) || [];

/* ---------- simple generic list editor ----------------------------- */

function ListEditor({
  title,
  list,
  onChange,
}: {
  title: string;
  list: string[];
  onChange: (a: string[]) => void;
}) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>

      {list.map((v, i) => (
        <div key={i} className={styles.learningRow}>
          <label>
            {title} {i + 1}
          </label>
          <input
            type="text"
            value={v}
            onChange={(e) => {
              const newArr = [...list];
              newArr[i] = e.target.value;
              onChange(newArr);
            }}
          />
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onChange(list.filter((_, idx) => idx !== i))}
          >
            Eliminar
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...list, ""])}
        className={styles.addLessonBtn}
      >
        + Agregar
      </button>
    </div>
  );
}

/* ---------- exported component ------------------------------------- */

interface Props {
  course: any;
  onCourseChange: (field: string, value: any) => void;
}

export default function HTMLContentEditors({ course, onCourseChange }: Props) {
  const learnArr = (course.what_you_ll_learn || "").split(/\r?\n\n/).filter(Boolean);
  const reqArr   = bulletsToArr(course.requirements);
  const descArr  = htmlToParas(course.description_long);

  return (
    <>
      <ListEditor
        title="Lo que aprenderás"
        list={learnArr}
        onChange={(a) => onCourseChange("what_you_ll_learn", a.join("\n\n"))}
      />

      <ListEditor
        title="Requisitos"
        list={reqArr}
        onChange={(a) => onCourseChange("requirements", arrToBullets(a))}
      />

      <ListEditor
        title="Descripción Larga"
        list={descArr}
        onChange={(a) => onCourseChange("description_long", parasToHtml(a))}
      />
    </>
  );
}
