/* --------------------------------------------------------------------
   src/app/admin/consejos/AddOrEditConsejo/page.tsx
   (usa bucket 'consejos-images' para fotos)
-------------------------------------------------------------------- */
"use client";

import { useEffect, useState, ChangeEvent } from "react";
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

export default function AddOrEditConsejo() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const [data, setData] = useState<ConsejoFormData>(empty);
  const [loading, setLoading] = useState(false);

  /* -------- fetch si edición -------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: c } = await supabase.from("consejos").select("*").eq("id", id).single();
      if (c) {
        setData({
          ...c,
          hashtags: (c.hashtags || []).join(", "),
        } as unknown as ConsejoFormData);
      }
    })();
  }, [id]);

  const set = (k: keyof ConsejoFormData, v: any) => setData((d) => ({ ...d, [k]: v }));

  /* =================== UPLOAD =================== */
  async function uploadImage(e: ChangeEvent<HTMLInputElement>, field: "main_photo" | "photo2") {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImageBitmap(file);
    const blob = await resizeToBlob(img, 800);
    const fileName = `${nanoid()}-${file.name.replace(/\\s+/g, "_")}.jpg`;

    const { error } = await supabase
      .storage
      .from("consejos-images")        // ← bucket corregido
      .upload(fileName, blob, { contentType: "image/jpeg" });

    if (error) return alert(error.message);

    const { data: urlData } = supabase.storage.from("consejos-images").getPublicUrl(fileName);
    set(field, urlData.publicUrl);
  }

  async function uploadPDF(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${nanoid()}-${file.name.replace(/\\s+/g, "_")}`;

    const { error } = await supabase
      .storage
      .from("consejos-pdf")
      .upload(fileName, file, { contentType: "application/pdf" });

    if (error) return alert(error.message);

    const { data: urlData } = supabase.storage.from("consejos-pdf").getPublicUrl(fileName);
    set("gift_pdf_url", urlData.publicUrl);
  }

  /* utilidades cliente */
  function loadImageBitmap(file: File): Promise<ImageBitmap> {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => createImageBitmap(img).then(res).catch(rej);
        img.src = fr.result as string;
      };
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  function resizeToBlob(img: ImageBitmap, max: number): Promise<Blob> {
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    return new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.8));
  }

  /* ================ guardar ================ */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...data,
      hashtags: data.hashtags.split(",").map((h) => h.trim()).filter(Boolean),
    };

    let error;
    if (id) {
      ({ error } = await supabase.from("consejos").update(payload).eq("id", id));
    } else {
      ({ error } = await supabase.from("consejos").insert([payload]));
    }

    setLoading(false);
    if (!error) router.push("/admin/consejos");
    else alert(error.message);
  }

  /* ================ UI ================ */
  return (
    <main className={styles.formMain}>
      <h1>{id ? "Editar Consejo" : "Nuevo Consejo"}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Columna izquierda */}
        <div className={styles.col}>
          <label>Título</label>
          <input value={data.title} onChange={(e) => set("title", e.target.value)} required />

          <label>Slug</label>
          <input value={data.slug} onChange={(e) => set("slug", e.target.value)} required />

          <label>Descripción corta</label>
          <textarea
            rows={3}
            value={data.short_description}
            onChange={(e) => set("short_description", e.target.value)}
            required
          />

          <label>Categoría</label>
          <input value={data.category} onChange={(e) => set("category", e.target.value)} />

          <label>Hashtags (coma)</label>
          <input value={data.hashtags} onChange={(e) => set("hashtags", e.target.value)} />

          <label>
            Publicado&nbsp;
            <input
              type="checkbox"
              checked={data.published}
              onChange={(e) => set("published", e.target.checked)}
            />
          </label>

          <label>Mensaje Regalo</label>
          <input value={data.gift_msg} onChange={(e) => set("gift_msg", e.target.value)} />

          <label>PDF Regalo</label>
          <input type="file" accept="application/pdf" onChange={uploadPDF} />
          {data.gift_pdf_url && (
            <a href={data.gift_pdf_url} target="_blank" className={styles.fileLink}>
              Ver PDF
            </a>
          )}
        </div>

        {/* Columna derecha */}
        <div className={styles.col}>
          <label>Imagen principal</label>
          <input type="file" accept="image/*" onChange={(e) => uploadImage(e, "main_photo")} />
          {data.main_photo && <img src={data.main_photo} className={styles.preview} />}

          <label>Imagen secundaria</label>
          <input type="file" accept="image/*" onChange={(e) => uploadImage(e, "photo2")} />
          {data.photo2 && <img src={data.photo2} className={styles.preview} />}

          <label>Contenido (HTML permitido)</label>
          <textarea
            rows={18}
            value={data.content}
            onChange={(e) => set("content", e.target.value)}
          />
        </div>

        <button className={styles.saveBtn} disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </main>
  );
}
