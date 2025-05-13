// File: src/app/presentacion/[id]/edit/page.jsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSave,
  FiDownload
} from 'react-icons/fi';
import styles from '../../Editor.module.css';
import '@/app/presentacion/slides.css';  // aplica estilos de pantalla completa

const DynamicChart = dynamic(
  () => import('@/app/presentacion/Chart'),
  { ssr: false }
);

export default function EditPresentation() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [pres, setPres]       = useState(null);
  const [slides, setSlides]   = useState([]);

  // Referencia al contenedor oculto donde renderizar cada slide
  const pdfRef = useRef(null);

  // Carga presentación y diapositivas
  useEffect(() => {
    (async () => {
      const { data: p, error: e1 } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', id)
        .single();
      const { data: s, error: e2 } = await supabase
        .from('slides')
        .select('*')
        .eq('presentation_id', id)
        .order('slide_order');
      if (e1 || e2) {
        setError((e1 || e2).message);
      } else {
        setPres(p);
        setSlides(s);
      }
      setLoading(false);
    })();
  }, [id]);

  // Guardar cambios de presentación
  async function savePresentation() {
    const { error } = await supabase
      .from('presentations')
      .update({ title: pres.title, orientation: pres.orientation })
      .eq('id', id);
    if (error) setError(error.message);
    else alert('¡Presentación guardada!');
  }

  // Añadir nueva diapositiva
  async function addSlide() {
    const nextOrder = slides.length
      ? slides[slides.length - 1].slide_order + 1
      : 1;
    const { data, error } = await supabase
      .from('slides')
      .insert({
        presentation_id: id,
        slide_order: nextOrder,
        title: `Diapositiva ${nextOrder}`,
        content: '',
        image_url: '',
        graph_config: ''
      })
      .select()
      .single();
    if (error) setError(error.message);
    else setSlides([...slides, data]);
  }

  // Guardar cambios de una diapositiva
  async function saveSlide(slide) {
    const { error } = await supabase
      .from('slides')
      .update({
        title: slide.title,
        content: slide.content,
        image_url: slide.image_url,
        graph_config: slide.graph_config
      })
      .eq('id', slide.id);
    if (error) setError(error.message);
    else alert(`Diapositiva ${slide.slide_order} guardada ✔`);
  }

  // Eliminar diapositiva
  async function deleteSlide(slideId) {
    const { error } = await supabase
      .from('slides')
      .delete()
      .eq('id', slideId);
    if (error) setError(error.message);
    else setSlides(slides.filter(s => s.id !== slideId));
  }

  // Exportar todas las diapositivas a PDF con estilos de full-screen
  const exportPDF = async () => {
    if (!pres || slides.length === 0) return;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const container = pdfRef.current;

      // Construir HTML completo de la slide con clases CSS
      const lines = (slide.content || '').split('\n').filter(l => l.trim());
      let html = `
        <div class="${pres.orientation}">
          <div class="slide-wrapper fullscreen-slide relative">
            <div class="title-container">
              <h1 class="slide-title">${slide.title || ''}</h1>
            </div>
            <div style="display:flex;flex-direction:column;gap:1rem;padding-top:2.5rem;">
              ${lines.map(l => `<div class="bullet shown">${l}</div>`).join('')}
            </div>
            ${slide.image_url ? `<img src="${slide.image_url}" style="max-width:100%;margin-top:1rem;"/>` : ''}
            ${slide.graph_config ? '<canvas id="chart-canvas"></canvas>' : ''}
            <img src="/escuela360_logo.jpg" class="slide-logo"/>
          </div>
        </div>`;
      container.innerHTML = html;

      // Si hay gráfica, renderizar Chart.js en el canvas
      if (slide.graph_config) {
        try {
          const config = JSON.parse(slide.graph_config);
          await new Promise(res => {
            setTimeout(() => {
              const ctx = container.querySelector('#chart-canvas').getContext('2d');
              // eslint-disable-next-line no-new
              new (require('chart.js/auto'))(ctx, config);
              res();
            }, 300);
          });
        } catch {}
      }

      // Esperar que CSS se aplique
      await new Promise(r => setTimeout(r, 300));

      // Capturar canvas y añadir a PDF
      const canvas = await html2canvas(container, { backgroundColor: '#fff' });
      const img  = canvas.toDataURL('image/png', 1.0);
      const ratio = canvas.width / canvas.height;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pageW / ratio;
      if (i > 0) pdf.addPage();
      pdf.addImage(img, 'PNG', 0, 0, pageW, pageH);
    }

    pdf.save(`${pres.title || 'presentacion'}.pdf`);
  };

  if (loading) return <p>Cargando…</p>;
  if (error)   return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!pres)   return <p>Presentación no encontrada.</p>;

  return (
    <div className="container" style={{ maxWidth: '980px' }}>
      {/* Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/presentacion" className={styles.newBtn}>
          <FiArrowLeft /> Volver
        </Link>
        <h1 className="title" style={{ margin: 0 }}>Editar presentación</h1>

        <button
          onClick={exportPDF}
          className={styles.newBtn}
          style={{ marginLeft: 'auto' }}
        >
          <FiDownload /> Exportar PDF
        </button>

        <button
          onClick={() => router.push(`/presentacion/${id}/show`)}
          className={styles.newBtn}
          style={{ background: '#2e9c48' }}
        >
          Vista previa
        </button>
      </div>

      {/* Info de la presentación */}
      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <label>
          Título
          <input
            value={pres.title}
            onChange={e => setPres({ ...pres, title: e.target.value })}
            className={styles.input}
          />
        </label>
        <label>
          Orientación
          <select
            value={pres.orientation}
            onChange={e => setPres({ ...pres, orientation: e.target.value })}
            className={styles.select}
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
          <button onClick={savePresentation} className={styles.newBtn}>
            <FiSave /> Guardar presentación
          </button>
        </div>
      </div>

      {/* Lista de diapositivas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Diapositivas</h2>
        <button onClick={addSlide} className={styles.newBtn}>
          <FiPlus /> Nueva diapositiva
        </button>
      </div>

      {slides.map(slide => (
        <div key={slide.id} className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.8rem 0' }}>#{slide.slide_order}</h4>

          <label>
            Título
            <input
              value={slide.title}
              onChange={e =>
                setSlides(slides.map(s => s.id === slide.id ? { ...s, title: e.target.value } : s))
              }
              className={styles.input}
            />
          </label>

          <label>
            Contenido (Markdown / texto)
            <textarea
              rows={4}
              value={slide.content}
              onChange={e =>
                setSlides(slides.map(s => s.id === slide.id ? { ...s, content: e.target.value } : s))
              }
              className={styles.input}
            />
          </label>

          <label>
            URL Imagen (opcional)
            <input
              value={slide.image_url}
              onChange={e =>
                setSlides(slides.map(s => s.id === slide.id ? { ...s, image_url: e.target.value } : s))
              }
              className={styles.input}
            />
          </label>

          <label>
            Gráfica (JSON opcional)
            <textarea
              rows={4}
              value={slide.graph_config}
              onChange={e =>
                setSlides(slides.map(s => s.id === slide.id ? { ...s, graph_config: e.target.value } : s))
              }
              className={styles.input}
            />
          </label>

          <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1rem' }}>
            <button onClick={() => saveSlide(slide)} className={styles.newBtn}>
              <FiSave /> Guardar
            </button>
            <button
              onClick={() => deleteSlide(slide.id)}
              className={styles.newBtn}
              style={{ background: '#d9534f' }}
            >
              <FiTrash2 /> Eliminar
            </button>
          </div>
        </div>
      ))}

      {/* Contenedor oculto usado para capturar cada slide con estilos */}
      <div
        ref={pdfRef}
        style={{
          position: 'fixed',
          top: '-10000px',
          left: '-10000px',
          width: '1800px',
          height: '1000px',
          background: '#fff',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}
