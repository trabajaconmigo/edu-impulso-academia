"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./InstructorPopup.module.css";

interface InstructorRow {
  id: string;
  user_id: string;
  full_name: string;
  short_title?: string;
  rating?: number;
  reviews_count?: number;
  students_count?: number;
  courses_count?: number;
  years_of_experience?: number;
  image_url?: string;
  long_bio?: string;
}

interface InstructorPopupProps {
  show: boolean;        // whether the popup is visible
  instructor: InstructorRow | null;  // if editing an existing instructor
  onClose: () => void;  // to close the popup
  onSaved: (newId: string) => void;  // callback once we create or update
}

export default function InstructorPopup({
  show,
  instructor,
  onClose,
  onSaved
}: InstructorPopupProps) {
  const [form, setForm] = useState<Partial<InstructorRow>>({});

  useEffect(() => {
    if (instructor) {
      setForm({ ...instructor });
    } else {
      setForm({});
    }
  }, [instructor]);

  if (!show) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // We can do "user_id" or not, depending if you want to store references
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      alert("No user session found. No se puede crear/editar instructor.");
      return;
    }

    if (instructor) {
      // update existing
      const updates = { ...form };
      delete updates.id; // we can't update "id" PK
      const { error } = await supabase
        .from("instructors")
        .update(updates)
        .eq("id", instructor.id);
      if (error) {
        alert("Error actualizando el instructor: " + error.message);
        return;
      }
      alert("Instructor actualizado exitosamente");
      onSaved(instructor.id);
    } else {
      // create new
      const newData = { ...form, user_id: userId };
      const { data: inserted, error } = await supabase
        .from("instructors")
        .insert(newData)
        .select()
        .single();
      if (error || !inserted) {
        alert("Error creando el instructor: " + error?.message);
        return;
      }
      alert("Instructor creado exitosamente");
      onSaved(inserted.id);
    }
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <h2>{instructor ? "Editar Instructor" : "Crear Instructor"}</h2>
        <form onSubmit={handleSubmit} className={styles.popupForm}>
          <label>Nombre Completo</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name || ""}
            onChange={handleChange}
            required
          />

          <label>Título Corto</label>
          <input
            type="text"
            name="short_title"
            value={form.short_title || ""}
            onChange={handleChange}
          />

          <label>Rating</label>
          <input
            type="number"
            step="0.1"
            name="rating"
            value={form.rating || ""}
            onChange={handleChange}
          />

          <label>Cantidad de Reseñas</label>
          <input
            type="number"
            name="reviews_count"
            value={form.reviews_count || ""}
            onChange={handleChange}
          />

          <label>Cantidad de Estudiantes</label>
          <input
            type="number"
            name="students_count"
            value={form.students_count || ""}
            onChange={handleChange}
          />

          <label>Cantidad de Cursos</label>
          <input
            type="number"
            name="courses_count"
            value={form.courses_count || ""}
            onChange={handleChange}
          />

          <label>Años de Experiencia</label>
          <input
            type="number"
            name="years_of_experience"
            value={form.years_of_experience || ""}
            onChange={handleChange}
          />

          <label>URL de Imagen (400x400)</label>
          <input
            type="text"
            name="image_url"
            value={form.image_url || ""}
            onChange={handleChange}
          />

          <label>Biografía Larga</label>
          <textarea
            name="long_bio"
            rows={4}
            value={form.long_bio || ""}
            onChange={handleChange}
          />

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.saveBtn}>Guardar</button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
