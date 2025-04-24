/* --------------------------------------------------------------------
   FeaturesEditor – full CRUD for “Este curso incluye”
-------------------------------------------------------------------- */
"use client";

import React from "react";
import styles from "./styles/AddOrEditCourse.module.css";

export interface FeatureItem {
  iconUrl: string;
  text: string;
}

const PREDEFINED_FEATURE_ICONS = [
  // (same URLs you already had)
  {
    label: "Ícono de Video",
    url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/video_icon.png",
  },
  {
    label: "Ícono de Descargas",
    url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/download.png",
  },
  {
    label: "Ícono de Tareas",
    url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/certificate-icon.png",
  },
  {
    label: "Ícono de Dispositivos",
    url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/devices-icon.png",
  },
  {
    label: "Ícono de Foros",
    url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/foros.png",
  },
  {
    label: "Ícono de Certificado",
    url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/certificate.png",
  },
];

const listToHtml = (arr: FeatureItem[]) =>
  !arr.length
    ? ""
    : "<ul>\n" +
      arr
        .map(
          (f) => `  <li><img src="${f.iconUrl}" /> ${f.text}</li>`
        )
        .join("\n") +
      "\n</ul>";

const htmlToList = (html = ""): FeatureItem[] => {
  const out: FeatureItem[] = [];
  html
    .split("<li>")
    .slice(1)
    .forEach((chunk) => {
      const inner = chunk.split("</li>")[0];
      const url = (inner.match(/<img[^>]+src="([^"]+)"/) || [])[1] || "";
      const text = inner.replace(/<img[^>]+>/, "").trim();
      out.push({ iconUrl: url, text });
    });
  return out;
};

interface Props {
  html: string;                     // course.course_includes
  onChangeHtml: (v: string) => void;
}

export default function FeaturesEditor({ html, onChangeHtml }: Props) {
  const list = htmlToList(html);

  const update = (arr: FeatureItem[]) => onChangeHtml(listToHtml(arr));

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>"Este curso incluye"</h2>

      {list.map((f, i) => (
        <div key={i} className={styles.featureRow}>
          <div className={styles.featureCol}>
            <label>Ícono</label>
            <select
              value={f.iconUrl}
              onChange={(e) => {
                const arr = [...list];
                arr[i].iconUrl = e.target.value;
                update(arr);
              }}
            >
              <option value="">-- Seleccionar ícono --</option>
              {PREDEFINED_FEATURE_ICONS.map((ic) => (
                <option key={ic.url} value={ic.url}>
                  {ic.label}
                </option>
              ))}
            </select>
            {f.iconUrl && (
              <img
                src={f.iconUrl}
                alt="icon"
                style={{ width: 24, height: 24, marginTop: 4 }}
              />
            )}
          </div>

          <div className={styles.featureCol}>
            <label>Texto</label>
            <input
              type="text"
              value={f.text}
              onChange={(e) => {
                const arr = [...list];
                arr[i].text = e.target.value;
                update(arr);
              }}
            />
          </div>

          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => update(list.filter((_, idx) => idx !== i))}
          >
            Eliminar
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => update([...list, { iconUrl: "", text: "" }])}
        className={styles.addLessonBtn}
      >
        + Agregar Característica
      </button>
    </div>
  );
}
