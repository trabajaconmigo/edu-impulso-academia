/* --------------------------------------------------------------------
   src/app/consejos/[slug]/page.tsx   (versión con render condicional)
-------------------------------------------------------------------- */

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "dompurify";

import { supabase } from "@/lib/supabaseClient";
import CourseCarousel from "@/app/components/CourseCarousel";
import NewsletterPopup from "./NewsletterPopup";
import NewsletterInline from "./NewsletterInline";
import styles from "./ConsejoDetail.module.css";

/* ----- Tipo de consejo ----- */
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
  gift_msg?: string | null;
  gift_pdf_url?: string | null;
}

export default function ConsejoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Consejo | null>(null);
  const [related, setRelated] = useState<Consejo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const allPostsContainerRef = useRef<HTMLDivElement>(null);

  /* ---------- Helper imagen ---------- */
  const safeUrl = (url?: string) =>
    url &&
    !url.startsWith("https://via.placeholder") &&
    !url.startsWith("http://via.placeholder")
      ? url
      : "/trabaja_conmigo_1.jpg";

  /* ---------- Fetch ---------- */
  useEffect(() => {
    if (!slug) return;

    (async () => {
      /* post */
      const { data: p, error } = await supabase
        .from("consejos")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error || !p) {
        router.push("/consejos");
        return;
      }
      setPost(p as Consejo);

      /* relacionados */
      if (p.category) {
        const { data } = await supabase
          .from("consejos")
          .select("id,title,slug,main_photo")
          .eq("category", p.category)
          .neq("id", p.id)
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(6);
        setRelated(data as Consejo[]);
      }

      /* categorías populares */
      const { data: cats } = await supabase
        .from("consejos")
        .select("category")
        .eq("published", true);
      setCategories(
        Array.from(new Set((cats ?? []).map((c) => c.category).filter(Boolean)))
      );
    })();
  }, [slug, router]);

  if (!post) return null;

  const html = DOMPurify.sanitize(
    post.content +
      (post.photo2
        ? `<div class="${styles.photo2Wrap}"><img src="${safeUrl(
            post.photo2
          )}" class="${styles.photo2}" alt="" /></div>`
        : "")
  );

  /* Mostrar newsletter solo si hay mensaje o PDF */
  const showNewsletter = !!(post.gift_msg || post.gift_pdf_url);

  return (
    <div className={styles.wrapper}>
      {/* -------- Artículo -------- */}
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

        {/* -------- Sidebar -------- */}
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

      {/* -------- Newsletter permanente -------- */}
      {showNewsletter && (
        <NewsletterInline
          category={post.category}
          giftMsg={post.gift_msg}
          giftPdfUrl={post.gift_pdf_url}
        />
      )}

      {/* -------- Carrusel de cursos -------- */}
      <CourseCarousel category={post.category} />

      {/* -------- Popup Newsletter -------- */}
      {showNewsletter && (
        <NewsletterPopup
          category={post.category}
          giftMsg={post.gift_msg}
          giftPdfUrl={post.gift_pdf_url}
        />
      )}

      {/* -------- Popup compartir -------- */}
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
                  "_blank"
                )
              }
            >
              Facebook
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(location.href)}`,
                  "_blank"
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
