/* --------------------------------------------------------------------
   src/app/admin/consejos/page.tsx
-------------------------------------------------------------------- */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./ConsejosList.module.css";

interface Consejo {
  id: string;
  title: string;
  category: string;
  short_description: string;
  main_photo?: string;
  slug: string;
  published: boolean;
}

export default function ConsejosAdminList() {
  const [grouped, setGrouped] = useState<Record<string, Consejo[]>>({});

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("consejos")
        .select("id,title,category,short_description,main_photo,slug,published")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const byCat: Record<string, Consejo[]> = {};
        (data as Consejo[]).forEach((c) => {
          (byCat[c.category || "Sin categoría"] ??= []).push(c);
        });
        setGrouped(byCat);
      } else console.error(error?.message);
    })();
  }, []);

  return (
    <main className={styles.listMain}>
      <h1>Consejos – Admin</h1>

      <Link href="/admin/consejos/AddOrEditConsejo">
        <button className={styles.newBtn}>+ Nuevo Consejo</button>
      </Link>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className={styles.catSection}>
          <h2>{cat}</h2>
          <div className={styles.cardsRow}>
            {items.map((c) => (
              <div key={c.id} className={styles.card}>
                <img src={c.main_photo || "/placeholder.jpg"} alt="" />
                <h3 className={styles.cardTitle}>{c.title}</h3>
                <p className={styles.cardDesc}>{c.short_description}</p>
                <p className={styles.pubLabel}>
                  {c.published ? "Publicado" : "Borrador"}
                </p>
                <Link
                  href={`/admin/consejos/AddOrEditConsejo?id=${c.id}`}
                  className={styles.editLink}
                >
                  Editar
                </Link>
                <Link
                  href={`/consejos/${c.slug}`}
                  target="_blank"
                  className={styles.previewLink}
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
