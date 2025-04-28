// --------------------------------------------------------------------
// src/app/admin/consejos/AddOrEditConsejo/page.tsx
// Formulario Crear/Editar Consejo con subida de imágenes y PDF
// --------------------------------------------------------------------

// 1) Siempre primera línea:
"use client";
// 2) Evita prerender estático:
export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { nanoid } from "nanoid";
import styles from "./ConsejoForm.module.css";

interface ConsejoFormData {
  title: string;
  slug: string;
  short_description: string;
  category: string;
  hashtags: string;
  main_photo: string;
  photo2: string;
  content: string;
  published: boolean;
  gift_msg: string;
  gift_pdf_url: string;
}

const empty: ConsejoFormData = {
  title: "",
  slug: "",
  short_description: "",
  category: "",
  hashtags: "",
  main_photo: "",
  photo2: "",
  content: "",
  published: false,
  gift_msg: "",
  gift_pdf_url: "",
};

function AdminConsejoForm() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const [data, setData] = useState<ConsejoFormData>(empty);
  const [loading, setLoading] = useState(false);

  // File selection states
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [photo2File, setPhoto2File] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Upload loading states
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingPhoto2, setUploadingPhoto2] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: c, error } = await supabase
        .from("consejos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        alert(error.message);
      } else if (c) {
        setData({
          ...c,
          hashtags: (c.hashtags || []).join(", "),
        } as any);
      }
    })();
  }, [id]);

  const setField = (key: keyof ConsejoFormData, val: any) =>
    setData((d) => ({ ...d, [key]: val }));

  // Handler for selecting files
  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMainFile(e.target.files?.[0] ?? null);
  const handlePhoto2FileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPhoto2File(e.target.files?.[0] ?? null);
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPdfFile(e.target.files?.[0] ?? null);

  // Resize & compress image to square (800x800) via center crop
  async function resizeImageFile(
    file: File,
    width: number,
    height: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject("Canvas empty")),
            "image/jpeg",
            0.8
          );
        };
        img.onerror = reject;
        if (typeof ev.target?.result === "string") {
          img.src = ev.target.result;
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Upload main image
  async function handleUploadMain() {
    if (!mainFile) return;
    setUploadingMain(true);
    try {
      const blob = await resizeImageFile(mainFile, 800, 800);
      const fileName = `${nanoid()}-${mainFile.name.replace(/\s+/g, "_")}.jpg`;
      const { error } = await supabase.storage
        .from("courseimg")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("courseimg")
        .getPublicUrl(fileName);
      setField("main_photo", urlData.publicUrl);
      setMainFile(null);
    } catch (err: any) {
      alert("Error subiendo imagen principal: " + err.message);
    } finally {
      setUploadingMain(false);
    }
  }

  // Upload photo2
  async function handleUploadPhoto2() {
    if (!photo2File) return;
    setUploadingPhoto2(true);
    try {
      const blob = await resizeImageFile(photo2File, 800, 800);
      const fileName = `${nanoid()}-${photo2File.name.replace(/\s+/g, "_")}.jpg`;
      const { error } = await supabase.storage
        .from("courseimg")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("courseimg")
        .getPublicUrl(fileName);
      setField("photo2", urlData.publicUrl);
      setPhoto2File(null);
    } catch (err: any) {
      alert("Error subiendo imagen secundaria: " + err.message);
    } finally {
      setUploadingPhoto2(false);
    }
  }

  // Upload PDF
  async function handleUploadPDF() {
    if (!pdfFile) return;
    setUploadingPDF(true);
    try {
      const fileName = `${nanoid()}-${pdfFile.name.replace(/\s+/g, "_")}`;
      const { error } = await supabase.storage
        .from("consejos-pdf")
        .upload(fileName, pdfFile, { contentType: "application/pdf" });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("consejos-pdf")
        .getPublicUrl(fileName);
      setField("gift_pdf_url", urlData.publicUrl);
      setPdfFile(null);
    } catch (err: any) {
      alert("Error subiendo PDF: " + err.message);
    } finally {
      setUploadingPDF(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...data,
      hashtags: data.hashtags
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    };

    let error;
    if (id) {
      ({ error } = await supabase
        .from("consejos")
        .update(payload)
        .eq("id", id));
    } else {
      ({ error } = await supabase.from("consejos").insert([payload]));
    }

    setLoading(false);
    if (error) alert(error.message);
    else router.push("/admin/consejos");
  }

  return (
    <main className={styles.formMain}>
      <h1>{id ? "Editar Consejo" : "Nuevo Consejo"}</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.col}>
          <label>Título</label>
          <input
            value={data.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />

          <label>Slug</label>
          <input
            value={data.slug}
            onChange={(e) => setField("slug", e.target.value)}
            required
          />

          <label>Descripción corta</label>
          <textarea
            rows={3}
            value={data.short_description}
            onChange={(e) => setField("short_description", e.target.value)}
            required
          />

          <label>Categoría</label>
          <input
            value={data.category}
            onChange={(e) => setField("category", e.target.value)}
          />

          <label>Hashtags (coma separados)</label>
          <input
            value={data.hashtags}
            onChange={(e) => setField("hashtags", e.target.value)}
          />

          <label>
            Publicado{" "}
            <input
              type="checkbox"
              checked={data.published}
              onChange={(e) => setField("published", e.target.checked)}
            />
          </label>

          <label>Mensaje Regalo</label>
          <input
            value={data.gift_msg}
            onChange={(e) => setField("gift_msg", e.target.value)}
          />

          <label>PDF Regalo</label>
          <div className={styles.uploadRow}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfFileChange}
            />
            <button
              type="button"
              onClick={handleUploadPDF}
              disabled={!pdfFile || uploadingPDF}
            >
              {uploadingPDF ? "Subiendo…" : "Subir PDF"}
            </button>
          </div>
          {data.gift_pdf_url && (
            <a
              href={data.gift_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver PDF
            </a>
          )}
        </div>

        <div className={styles.col}>
          <label>Imagen Principal</label>
          <div className={styles.uploadRow}>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainFileChange}
            />
            <button
              type="button"
              onClick={handleUploadMain}
              disabled={!mainFile || uploadingMain}
            >
              {uploadingMain ? "Subiendo…" : "Subir Imagen"}
            </button>
          </div>
          {data.main_photo && (
            <img
              src={data.main_photo}
              alt="Preview principal"
              className={styles.preview}
            />
          )}

          <label>Imagen Secundaria</label>
          <div className={styles.uploadRow}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto2FileChange}
            />
            <button
              type="button"
              onClick={handleUploadPhoto2}
              disabled={!photo2File || uploadingPhoto2}
            >
              {uploadingPhoto2 ? "Subiendo…" : "Subir Imagen"}
            </button>
          </div>
          {data.photo2 && (
            <img
              src={data.photo2}
              alt="Preview secundaria"
              className={styles.preview}
            />
          )}

          <label>Contenido (HTML)</label>
          <textarea
            rows={18}
            value={data.content}
            onChange={(e) => setField("content", e.target.value)}
          />
        </div>

        <button className={styles.saveBtn} disabled={loading}>
          {loading ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center" }}>Cargando formulario…</p>}>
      <AdminConsejoForm />
    </Suspense>
  );
}
