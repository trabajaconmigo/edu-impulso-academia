'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import styles from './RelatedCourses.module.css';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  category: string;
}

export default function RelatedCourses({ category }: { category: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, slug, thumbnail_url, category')
        .eq('category', category)
        .limit(10);

      if (!error && data) setCourses(data as Course[]);
    })();
  }, [category]);

  if (!courses.length) return null;

  /* simple scroll helpers */
  const scroll = (dir: 'left' | 'right') => {
    if (rowRef.current) {
      const amount = rowRef.current.clientWidth / 2;
      rowRef.current.scrollBy({
        left: dir === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className={styles.container}>
      <h2>Cursos en “{category}”</h2>

      <button onClick={() => scroll('left')} className={styles.arrow}>
        ‹
      </button>

      <div className={styles.row} ref={rowRef}>
        {courses.map((c) => (
          <Link key={c.id} href={`/cursos/${c.slug}`} className={styles.card}>
            <img src={c.thumbnail_url} alt={c.title} />
            <span>{c.title}</span>
          </Link>
        ))}
      </div>

      <button onClick={() => scroll('right')} className={styles.arrow}>
        ›
      </button>
    </section>
  );
}
