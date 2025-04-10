"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./EditProfilePopup.module.css";

interface EditProfilePopupProps {
  onClose: () => void;
  initialPhone: string;
  initialImage: string;
}

export default function EditProfilePopup({
  onClose,
  initialPhone,
  initialImage,
}: EditProfilePopupProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  }

  // Delete the old image from the bucket if it exists and is not the fallback image.
  async function deleteOldImage(oldUrl: string): Promise<void> {
    if (!oldUrl || oldUrl === "/favicon.ico") return;

    // Assumption: the URL format is:
    // https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/<filename>
    const parts = oldUrl.split("/courseimg/");
    if (parts.length < 2) return; // cannot determine file name
    const fileName = parts[1];

    const { error } = await supabase.storage.from("courseimg").remove([fileName]);
    if (error) {
      console.error("Error deleting old image:", error.message);
    }
  }

  // Resize and crop image to 300x300 with center crop (cutting edges, not squeezing).
  async function resizeAndCropImage(file: File, targetSize: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = function () {
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          const side = Math.min(naturalWidth, naturalHeight);
          const offsetX = (naturalWidth - side) / 2;
          const offsetY = (naturalHeight - side) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is null"));
            return;
          }
          ctx.drawImage(img, offsetX, offsetY, side, side, 0, 0, targetSize, targetSize);
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

  async function handleUploadImage(): Promise<string | null> {
    if (!selectedFile) return null;
    try {
      const resizedBlob = await resizeAndCropImage(selectedFile, 300);
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from("courseimg").upload(fileName, resizedBlob, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        alert("Error subiendo imagen: " + error.message);
        return null;
      }
      return `https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/${fileName}`;
    } catch (error) {
      console.error("Error resizing/cropping image:", error);
      return null;
    }
  }

  async function handleSave() {
    setLoading(true);
    // Get current session to retrieve user id
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert("No hay sesión activa");
      setLoading(false);
      return;
    }
    const userId = session.user.id;

    // If a new image is selected and initialImage is not the fallback, delete old image.
    if (selectedFile && initialImage !== "/favicon.ico") {
      await deleteOldImage(initialImage);
    }

    // Upload new image if selected.
    const profile_img = selectedFile ? await handleUploadImage() : null;

    // Update the profiles table with phone number and (if available) new profile image.
    const { error } = await supabase
      .from("profiles")
      .update({
        phone_number: phoneNumber,
        ...(profile_img ? { profile_img } : {}),
      })
      .eq("user_id", userId);

    if (error) {
      alert("Error actualizando perfil: " + error.message);
    } else {
      alert("Perfil actualizado exitosamente");
      onClose();
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2>Editar Perfil</h2>
        <label>
          Número de Teléfono:
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ej: 55-1234-5678"
          />
        </label>
        <label>
          Cambiar Imagen de Perfil (300x300):
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {selectedFile && (
          <div className={styles.previewContainer}>
            <p>Vista Previa:</p>
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Vista previa de perfil"
              className={styles.previewImage}
            />
          </div>
        )}
        <div className={styles.buttonRow}>
          <button onClick={handleSave} disabled={loading} className={styles.saveBtn}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
