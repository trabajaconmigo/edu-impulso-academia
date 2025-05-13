'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from '../Editor.module.css';  // reutilizamos botones

export default function NewPresentation() {
  const router = useRouter();
  const [title, setTitle]       = useState('');
  const [orientation, setOr]    = useState('horizontal');
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('Pon un título');

    setLoading(true);
    const { data, error } = await supabase
      .from('presentations')
      .insert({ title, orientation })
      .select()
      .single();

    setLoading(false);
    if (error) return setError(error.message);

    router.push(`/presentacion/${data.id}/edit`);
  }

  return (
    <div className="container">
      <h1 className="title">Nueva presentación</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Título
          <input value={title} onChange={e=>setTitle(e.target.value)}
                 className={styles.input} />
        </label>

        <label>Orientación
          <select value={orientation} onChange={e=>setOr(e.target.value)}
                  className={styles.select}>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>

        {error && <p style={{color:'#d9534f'}}>{error}</p>}

        <button className={styles.newBtn} disabled={loading}>
          {loading ? 'Creando…' : 'Crear'}
        </button>
      </form>
    </div>
  );
}
