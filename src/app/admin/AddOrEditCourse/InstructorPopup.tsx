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
  show: boolean;                   // Whether the popup is visible
  instructor: InstructorRow | null;  // If editing an existing instructor, otherwise null
  onClose: () => void;             // To close the popup
  onSaved: (newId: string) => void;  // Callback once instructor is created/updated
}

export default function InstructorPopup({
  show,
  instructor,
  onClose,
  onSaved,
}: InstructorPopupProps) {
  const [form, setForm] = useState<Partial<InstructorRow>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (instructor) {
      setForm({ ...instructor });
    } else {
      setForm({});
    }
    setSelectedFile(null);
  }, [instructor]);

  if (!show) return null;

  // Update text fields
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Capture file selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  }

  // Resize image by center-cropping (do not squeeze) and upload to Supabase Storage
  async function handleUploadImage() {
    if (!selectedFile) return;
    setUploadLoading(true);
    try {
      // Resize image to 250x250 by cropping its center
      const resizedBlob = await resizeImageFile(selectedFile, 250, 250);

      // Upload the file to bucket "courseimg"
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `instructor-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("courseimg")
        .upload(fileName, resizedBlob, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) {
        alert("Error subiendo imagen: " + uploadError.message);
        return;
      }

      // Build public URL based on your bucket path
      const url = `https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/${fileName}`;
      setForm((prev) => ({ ...prev, image_url: url }));
      alert("Imagen subida correctamente");
    } finally {
      setUploadLoading(false);
    }
  }

  // Resize image with center crop (maintains aspect ratio by cutting edges)
  async function resizeImageFile(file: File, width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is null"));
            return;
          }
          // Calculate square crop (center crop) from the source image
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          // Draw the cropped region into the canvas, scaled to target width/height
          ctx.drawImage(img, sx, sy, side, side, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas is empty"));
                return;
              }
              resolve(blob);
            },
            "image/jpeg",
            0.8
          );
        };
        if (typeof ev.target?.result === "string") {
          img.src = ev.target.result;
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Submit handler: create or update the instructor
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      alert("No user session found. No se puede crear/editar instructor.");
      return;
    }
    if (instructor) {
      // Update existing instructor
      const updates = { ...form };
      delete updates.id;
      const { error } = await supabase
        .from("instructors")
        .update(updates)
        .eq("id", instructor.id);
      if (error) {
        alert("Error actualizando el instructor: " + error.message);
        return;
      }
      alert("Instructor actualizado con éxito");
      onSaved(instructor.id);
    } else {
      // Create a new instructor row
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
      alert("Instructor creado con éxito");
      onSaved(inserted.id);
    }
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <h2>{instructor ? "Editar Instructor" : "Crear Instructor"}</h2>
        <form onSubmit={handleSubmit} className={styles.popupForm}>
          <div className={styles.formGrid}>
            <div className={styles.gridItem}>
              <label>Nombre Completo</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name || ""}
                onChange={handleChange}
                required
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

              <label>Imagen (se recortará a 250x250)</label>
              <div className={styles.uploadRow}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button
                  type="button"
                  className={styles.blueBtn}
                  onClick={handleUploadImage}
                  disabled={!selectedFile || uploadLoading}
                >
                  Subir Imagen
                </button>
              </div>
              {selectedFile && (
                <p style={{ fontSize: "0.85rem" }}>
                  Archivo seleccionado: {selectedFile.name}
                </p>
              )}
            </div>

            <div className={styles.gridItem}>
              <label>Título Corto</label>
              <input
                type="text"
                name="short_title"
                value={form.short_title || ""}
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
            </div>
          </div>

          {form.image_url && (
            <div className={styles.previewContainer}>
              <img
                src={form.image_url}
                alt="Vista previa del instructor"
                className={styles.previewImage}
              />
              <p style={{ fontSize: "0.85rem" }}>URL: {form.image_url}</p>
            </div>
          )}

          <label>Biografía Larga</label>
          <textarea
            name="long_bio"
            rows={4}
            value={form.long_bio || ""}
            onChange={handleChange}
          />

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.saveBtn}>
              Guardar
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
