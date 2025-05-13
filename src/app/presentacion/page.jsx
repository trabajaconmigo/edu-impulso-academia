'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiExternalLink } from 'react-icons/fi';
import styles from './Editor.module.css'; // Crea este módulo o usa tailwind
import dynamic from 'next/dynamic';

export default function PresentationEditor() {
  const [presentations, setPresentations] = useState([]);

  // Carga presentaciones
  useEffect(() => {
    supabase.from('presentations').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setPresentations(data || []));
  }, []);
  const DynamicChart = dynamic(() => import('@/app/presentacion/Chart'), { ssr: false });


  
  return (
    <div className="container">
      <h1 className="title">Editor de Presentaciones</h1>

      <Link href="/presentacion/new" className={styles.newBtn}>
        <FiPlus /> Nueva presentación
      </Link>

      <div className={styles.grid}>
        {presentations.map(p => (
          <div key={p.id} className={styles.card}>
            <h3>{p.title}</h3>
            <p>Orientación: {p.orientation}</p>
            <div className={styles.cardActions}>
              <Link href={`/presentacion/${p.id}/edit`}><FiEdit2 /> Editar</Link>
              <Link href={`/presentacion/${p.id}/show`} target="_blank"><FiExternalLink /> Ver</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
