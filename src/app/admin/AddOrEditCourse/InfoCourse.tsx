// src/app/admin/InfoCourse.tsx
"use client";

import React from "react";
import { COURSE_CATEGORIES } from "@/app/components/courseCategories";
import InstructorPopup from "./InstructorPopup";
import styles from "./styles/AddOrEditCourse.module.css";
import { InstructorRow } from "./page";
import { CourseData } from "./page";

interface InfoCourseProps {
  course: CourseData;
  instructors: InstructorRow[];
  selectedFile: File | null;
  showInstructorPopup: boolean;
  editingInstructor: InstructorRow | null;
  onCourseChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadImage: () => void;
  onOpenInstructorPopup: (inst: InstructorRow | null) => void;
  onCloseInstructorPopup: () => void;
  onInstructorSaved: (id: string) => void;
}

export default function InfoCourse({
  course,
  instructors,
  selectedFile,
  showInstructorPopup,
  editingInstructor,
  onCourseChange,
  onFileChange,
  onUploadImage,
  onOpenInstructorPopup,
  onCloseInstructorPopup,
  onInstructorSaved,
}: InfoCourseProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Información del Curso</h2>

      {[
        { label: "Título del Curso", name: "title", value: course.title },
        { label: "Slug", name: "slug", value: course.slug },
      ].map((f) => (
        <div className={styles.fieldGroup} key={f.name}>
          <label>{f.label}</label>
          <input
            type="text"
            name={f.name}
            value={f.value}
            onChange={onCourseChange}
            required
          />
        </div>
      ))}

      <div className={styles.fieldGroup}>
        <label>Descripción Breve</label>
        <textarea
          rows={3}
          name="description"
          value={course.description}
          onChange={onCourseChange}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Subtítulo</label>
        <input
          type="text"
          name="subtitle"
          value={course.subtitle || ""}
          onChange={onCourseChange}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Instructor</label>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select
            name="instructor_id"
            value={course.instructor_id || ""}
            onChange={onCourseChange}
          >
            <option value="">-- Seleccionar --</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            style={{
              border: "1px solid blue",
              background: "transparent",
              color: "blue",
              padding: "0.4rem 0.8rem",
            }}
            onClick={() =>
              onOpenInstructorPopup(
                course.instructor_id
                  ? instructors.find((i) => i.id === course.instructor_id) || null
                  : null
              )
            }
          >
            {course.instructor_id ? "Editar Instructor" : "Crear Instructor"}
          </button>
        </div>
      </div>

      {showInstructorPopup && (
        <InstructorPopup
          show={showInstructorPopup}
          instructor={editingInstructor}
          onClose={onCloseInstructorPopup}
          onSaved={onInstructorSaved}
        />
      )}

      <div className={styles.fieldGroup}>
        <label>Thumbnail URL</label>
        <input
          type="text"
          name="thumbnail_url"
          value={course.thumbnail_url}
          onChange={onCourseChange}
          required
        />
      </div>
      <div className={styles.fieldGroup}>
        <label>Subir Imagen (750×500)</label>
        <div className={styles.fileUploadWrapper}>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className={styles.hiddenFileInput}
            onChange={onFileChange}
          />
          <label htmlFor="file-upload" className={styles.fileUploadButton}>
            Seleccionar Archivo
          </label>
        </div>
        <button
          type="button"
          disabled={!selectedFile}
          className={styles.uploadBtn}
          onClick={onUploadImage}
        >
          Subir Imagen
        </button>
        {selectedFile && (
          <div className={styles.previewContainer}>
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              className={styles.previewImage}
            />
            <p>{selectedFile.name}</p>
          </div>
        )}
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldCol}>
          <label>Precio (MXN)</label>
          <input
            type="number"
            name="price"
            value={course.price}
            onChange={onCourseChange}
            required
          />
        </div>
        <div className={styles.fieldCol}>
          <label>Idioma</label>
          <input
            type="text"
            name="language"
            value={course.language}
            onChange={onCourseChange}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label>Categoría</label>
        <select name="category" value={course.category} onChange={onCourseChange}>
          {COURSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldCol}>
          <label>% Descuento</label>
          <input
            type="number"
            name="discount_percentage"
            min={0}
            max={100}
            value={course.discount_percentage}
            onChange={onCourseChange}
          />
        </div>
        <div className={styles.fieldCol} style={{ alignItems: "center" }}>
          <label>Descuento activo</label>
          <input
            type="checkbox"
            name="discount_active"
            checked={course.discount_active}
            onChange={onCourseChange}
            style={{ width: 22, height: 22, marginTop: 4 }}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label>Vence (fecha y hora)</label>
        <input
          type="datetime-local"
          name="expires_at"
          value={course.expires_at || ""}
          onChange={onCourseChange}
        />
        <small style={{ color: "#666" }}>
          Dejar vacío si no quieres un temporizador.
        </small>
      </div>
    </div>
  );
}