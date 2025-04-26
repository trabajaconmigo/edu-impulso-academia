/* --------------------------------------------------------------------
   src/app/consejos/[slug]/page.tsx
-------------------------------------------------------------------- */

"use client";

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { supabase } from '@/lib/supabaseClient';
import HomeNavbar from '@/app/components/Navbar';
import CourseCarousel from '@/app/components/CourseCarousel'; // NEW: Slider de cursos por categoría

import DOMPurify from 'dompurify';
import styles from './ConsejoDetail.module.css';

/* ----------------------- Interfaces ----------------------- */
interface Consejo {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  category: string;
  main_photo?: string;
  photo2?: string;
  content: string;
  created_at: string;
}

/* -------------------- Página de detalle -------------------- */
export default function ConsejoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Consejo | null>(null);
  const [related, setRelated] = useState<Consejo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);

  const [lead, setLead] = useState({ name: '', email: '', job: '', state: '' });
  const allPostsContainerRef = useRef<HTMLDivElement>(null);

  /* -------------------- URL segura para imágenes -------------------- */
  const safeUrl = (url?: string) =>
    url && !/^https?:\/\/via\.placeholder/.test(url)
      ? url
      : '/trabaja_conmigo_1.jpg';

  /* -------------------- Fetch de datos -------------------- */
  useEffect(() => {
    if (!slug) return;

    (async () => {
      // Obtener el post principal
      const { data: p, error: e1 } = await supabase
        .from('consejos')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (e1 || !p) {
        router.push('/consejos');
        return;
      }
      setPost(p as Consejo);

      // Obtener consejos relacionados
      if (p.category) {
        const { data: rel } = await supabase
          .from('consejos')
          .select('id,title,slug,main_photo')
          .eq('category', p.category)
          .neq('id', p.id)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(6);
        setRelated(rel as Consejo[]);
      }

      // Obtener lista de categorías para el sidebar
      const { data: cats } = await supabase
        .from('consejos')
        .select('category')
        .eq('published', true);
      setCategories(
        Array.from(
          new Set((cats ?? []).map((c) => c.category).filter(Boolean))
        )
      );
    })();
  }, [slug, router]);

  /* -------------------- Manejar envío de lead -------------------- */
  async function handleLead(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('newsletter').insert([
      { name: lead.name, email: lead.email, job_category: lead.job, state: lead.state }
    ]);
    if (!error) {
      router.push(`/register?name=${encodeURIComponent(lead.name)}`);
    }
  }

  if (!post) return null;

  /* -------------------- Sanitizar HTML + photo2 -------------------- */
  const html = DOMPurify.sanitize(
    post.content +
      (post.photo2
        ? `<div class=\"${styles.photo2Wrap}\"><img src=\"${safeUrl(
            post.photo2
          )}\" class=\"${styles.photo2}\" alt=\"\" /></div>`
        : '')
  );

  return (
    <div className={styles.wrapper}>
      <HomeNavbar />

      <article className={styles.article}>
        <section className={styles.mainCol}>
          <h1 className={styles.title}>{post.title}</h1>
          <img
            src={safeUrl(post.main_photo)}
            alt={post.title}
            className={styles.hero}
            loading="lazy"
          />
          <p className={styles.excerpt}>{post.short_description}</p>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>

        <aside className={styles.sidebar}>
          <button
            className={styles.shareBtn}
            onClick={() => setShareOpen(true)}
            aria-label="Compartir"
          >
            <Image src="/icons/share-icon.svg" alt="" width={24} height={24} />
          </button>

          <section className={styles.topics}>
            <h3>Temas populares</h3>
            <ul>
              {categories.map((c) => (
                <li key={c} onClick={() => router.push(`/consejos?category=${c}`)}>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.desktopBanner}>
            <Image
              src="/gifs/desktop-banner.gif"
              alt="Banner Comercial"
              width={300}
              height={600}
              priority
            />
          </div>
        </aside>
      </article>

      {/* ===== Slider de cursos misma categoría ===== */}
      <CourseCarousel category={post.category} />

      {/* ===== Consejos relacionados ===== */}
      {related.length > 0 && (
        <section className={styles.relatedWrap}>
          <h2>También puede interesarte</h2>
          <div className={styles.relatedRow} ref={allPostsContainerRef}>
            {related.map((r) => (
              <Link key={r.id} href={`/consejos/${r.slug}`} className={styles.card}>
                <img src={safeUrl(r.main_photo)} alt={r.title} />
                <span>{r.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Formulario newsletter ===== */}
      <section className={styles.leadForm}>
        <h3>Únete a nuestra newsletter</h3>
        <form onSubmit={handleLead}>
          <input
            placeholder="Nombre"
            value={lead.name}
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Correo"
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
            required
          />
          <button type="submit">Suscribirme</button>
        </form>
      </section>

      {/* ===== Popup compartir ===== */}
      {shareOpen && (
        <div className={styles.shareOverlay} onClick={() => setShareOpen(false)}>
          <div className={styles.shareBox} onClick={(e) => e.stopPropagation()}>
            <h4>Compartir</h4>
            <button
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    location.href
                  )}`,
                  '_blank'
                )
              }
            >
              Facebook
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(location.href)}`,
                  '_blank'
                )
              }
            >
              WhatsApp
            </button>
            <button onClick={() => navigator.clipboard.writeText(location.href)}>
              Copiar enlace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
