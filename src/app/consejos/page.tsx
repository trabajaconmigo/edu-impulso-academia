'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import styles from './ConsejosMain.module.css';

/* ---------- local type for rows returned from the table ---------- */
interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  main_photo?: string;
  short_description: string;
  created_at: string;
  // …add other columns if you need them later
}

export default function ConsejosMainPage() {
  const [groupedPosts, setGroupedPosts] = useState<Record<string, Post[]>>({});
  const [loading, setLoading] = useState(true);

  /* ---------------------------- fetch once --------------------------- */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('consejos')         // ✅ no generic here (v2)
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consejos:', error.message);
      } else {
        /* group by category */
        const byCat: Record<string, Post[]> = {};
        (data as Post[]).forEach((post) => {
          (byCat[post.category || 'Sin categoría'] ??= []).push(post);
        });
        setGroupedPosts(byCat);
      }
      setLoading(false);
    })();
  }, []);

  /* ---------------------- date util (no date-fns needed) --------------------- */
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  /* ------------------------------ render ------------------------------ */
  if (loading) return <p className={styles.loading}>Cargando…</p>;

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Noticias y Consejos</h1>

      {Object.entries(groupedPosts).map(([cat, posts]) => {
        if (!posts.length) return null;
        const [mainPost, ...others] = posts;

        return (
          <section key={cat} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat}</h2>

            <div className={styles.contentRow}>
              {/* ------------ main post ------------ */}
              <Link
                href={`/consejos/${mainPost.slug}`}
                className={styles.mainPost}
              >
                {mainPost.main_photo && (
                  <img
                    src={mainPost.main_photo}
                    alt={mainPost.title}
                    className={styles.mainImage}
                  />
                )}
                <div className={styles.mainDetails}>
                  <h3>{mainPost.title}</h3>
                  <p>{mainPost.short_description}</p>
                  <small>{formatDate(mainPost.created_at)}</small>
                </div>
              </Link>

              {/* ------------ sidebar (max 4) ------------ */}
              <aside className={styles.sidebar}>
                {others.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/consejos/${p.slug}`}
                    className={styles.sidePost}
                  >
                    {p.main_photo && (
                      <img
                        src={p.main_photo}
                        alt={p.title}
                        className={styles.sideImage}
                      />
                    )}
                    <span>{p.title}</span>
                  </Link>
                ))}
              </aside>
            </div>
          </section>
        );
      })}
    </div>
  );
}
