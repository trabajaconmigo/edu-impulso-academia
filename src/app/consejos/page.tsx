'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './ConsejosMain.module.css';

/* ---------- Tipo local ---------- */
interface PostData {
  id: string;
  title: string;
  short_description: string;
  category: string;
  main_photo?: string;
  slug: string;
  created_at: string;
}

export default function ConsejosMainPage() {
  const [postsByCategory, setPostsByCategory] = useState<Record<string, PostData[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /* ----------- fetch ----------- */
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('consejos')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const grouped: Record<string, PostData[]> = {};
        (data ?? []).forEach((p) => {
          const cat = (p as any).category || 'Sin categoría';
          (grouped[cat] ??= []).push(p as PostData);
        });
        setPostsByCategory(grouped);
      } catch (err: any) {
        console.error('Error fetching consejos:', err.message);
        setError('Ocurrió un error al cargar los consejos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Noticias y Consejos</h1>

      {loading ? (
        <p className={styles.loading}>Cargando…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        Object.entries(postsByCategory).map(([cat, posts]) => {
          const [mainPost, ...others] = posts;
          return (
            <section key={cat} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>{cat}</h2>

              <div className={styles.contentRow}>
                {/* Post principal */}
                <Link href={`/consejos/${mainPost.slug}`} className={styles.mainPost}>
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

                {/* Posts secundarios */}
                <aside className={styles.sidebar}>
                  {others.slice(0, 4).map((p) => (
                    <Link key={p.id} href={`/consejos/${p.slug}`} className={styles.sidePost}>
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
        })
      )}

      {/* Botón volver (opcional) */}
      {!loading && !error && (
        <button onClick={() => router.back()} className={styles.backButton}>
          &larr; Volver
        </button>
      )}
    </div>
  );
}
