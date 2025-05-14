'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link           from 'next/link';
import dynamic        from 'next/dynamic';
import html2canvas    from 'html2canvas';
import jsPDF          from 'jspdf';
import { supabase }   from '@/lib/supabaseClient';
import {
  FiArrowLeft, FiPlus, FiTrash2, FiSave, FiDownload,
  FiCheck, FiStar, FiArrowRight
} from 'react-icons/fi';
import styles from '../../Editor.module.css';
import '@/app/presentacion/slides.css';

const DynamicChart = dynamic(() => import('@/app/presentacion/Chart'), { ssr:false });

export default function EditPresentation() {
  const { id }          = useParams();
  const router          = useRouter();
  const [loading,setLoading] = useState(true);
  const [error,setError]     = useState('');
  const [pres,setPres]       = useState(null);
  const [slides,setSlides]   = useState([]);
  const pdfRef = useRef(null);

  /* ---------- LOAD presentation + slides ---------- */
  useEffect(()=>{ (async()=>{
      const { data:p, error:e1 } = await supabase
        .from('presentations').select('*').eq('id',id).single();
      const { data:s, error:e2 } = await supabase
        .from('slides').select('*').eq('presentation_id',id).order('slide_order');
      if(e1||e2){ setError((e1||e2).message); }
      else { setPres(p); setSlides(s); }
      setLoading(false);
  })(); },[id]);

  /* ---------- SAVE presentation meta -------------- */
  async function savePresentation(){
    const { error } = await supabase.from('presentations')
      .update({
        title       : pres.title,
        orientation : pres.orientation,
        reveal_mode : pres.reveal_mode
      })
      .eq('id',id);
    if(error) setError(error.message); else alert('¡Presentación guardada!');
  }

  /* ---------- CRUD slides (icon incluido) --------- */
  async function addSlide(){
    const nextOrder = slides.length ? slides[slides.length-1].slide_order+1 : 1;
    const { data, error } = await supabase.from('slides').insert({
      presentation_id: id,
      slide_order   : nextOrder,
      title         : `Diapositiva ${nextOrder}`,
      content       : '',
      image_url     : '',
      graph_config  : '',
      icon          : ''
    }).select().single();
    if(error) setError(error.message); else setSlides([...slides,data]);
  }
  async function saveSlide(slide){
    const { error } = await supabase.from('slides').update({
      title       : slide.title,
      content     : slide.content,
      image_url   : slide.image_url,
      graph_config: slide.graph_config,
      icon        : slide.icon
    }).eq('id',slide.id);
    if(error) setError(error.message); else alert(`Diapositiva ${slide.slide_order} guardada ✔`);
  }
  async function deleteSlide(idS){
    const { error } = await supabase.from('slides').delete().eq('id',idS);
    if(!error) setSlides(slides.filter(s=>s.id!==idS)); else setError(error.message);
  }

  /* ---------- EXPORT PDF (mismo código) ----------- */
  const exportPDF = async()=>{
    if(!pres||!slides.length) return;
    const pdf = new jsPDF({orientation:'landscape',unit:'px',format:'a4'});
    for(let i=0;i<slides.length;i++){
      const slide = slides[i];
      const cont  = pdfRef.current;
      const lines = (slide.content||'').split('\n').filter(l=>l.trim());
      cont.innerHTML = `
        <div class="${pres.orientation}">
          <div class="slide-wrapper fullscreen-slide relative">
            <div class="title-container"><h1 class="slide-title">${slide.title||''}</h1></div>
            <div style="display:flex;flex-direction:column;gap:1rem;padding-top:2.5rem;">
              ${lines.map(l=>`
                   <div class="bullet shown" style="display:flex;align-items:flex-start">
                     ${slide.icon?`<span style="margin-right:.5rem;">${slide.icon==='FiCheck'?'✔':slide.icon==='FiStar'?'★':'→'}</span>`:''}
                     ${l}
                   </div>`).join('')}
            </div>
            ${slide.image_url?`<img src="${slide.image_url}" style="max-width:100%;margin-top:1rem;" />`:''}
            ${slide.graph_config?'<canvas id="chart-canvas"></canvas>':''}
            <img src="/escuela360_logo.jpg" class="slide-logo"/>
          </div>
        </div>`;
      if(slide.graph_config){
        try{
          const cfg = JSON.parse(slide.graph_config);
          await new Promise(res=>setTimeout(res,300));
          const ctx = cont.querySelector('#chart-canvas').getContext('2d');
          // eslint-disable-next-line no-new
          new (require('chart.js/auto'))(ctx,cfg);
        }catch{}
      }
      await new Promise(r=>setTimeout(r,300));
      const canvas = await html2canvas(cont,{backgroundColor:'#fff'});
      const img    = canvas.toDataURL('image/png',1);
      const W      = pdf.internal.pageSize.getWidth();
      const H      = W/(canvas.width/canvas.height);
      if(i>0) pdf.addPage();
      pdf.addImage(img,'PNG',0,0,W,H);
    }
    pdf.save(`${pres.title||'presentacion'}.pdf`);
  };

  /* ---------- render --------------------------------------- */
  if(loading) return <p>Cargando…</p>;
  if(error)   return <p style={{color:'red'}}>Error: {error}</p>;
  if(!pres)   return <p>No encontrado</p>;

  return (
    <div className="container" style={{maxWidth:'980px'}}>
      {/* NAVBAR */}
      <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
        <Link href="/presentacion" className={styles.newBtn}><FiArrowLeft/> Volver</Link>
        <h1 className="title" style={{margin:0}}>Editar presentación</h1>
        <button onClick={()=>router.push(`/presentacion/${id}/show`)} className={styles.newBtn} style={{background:'#2e9c48'}}>Vista previa</button>
        <button onClick={exportPDF} className={styles.newBtn}><FiDownload/> Exportar PDF</button>
      </div>

      {/* META */}
      <div className={styles.card} style={{marginBottom:'2rem'}}>
        <label>Título
          <input className={styles.input}
                 value={pres.title}
                 onChange={e=>setPres({...pres,title:e.target.value})}/>
        </label>

        <label>Orientación
          <select className={styles.select}
                  value={pres.orientation}
                  onChange={e=>setPres({...pres,orientation:e.target.value})}>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>

        <label>Estilo de visualización
          <select className={styles.select}
                  value={pres.reveal_mode}
                  onChange={e=>setPres({...pres,reveal_mode:e.target.value})}>
            <option value="step">Paso a paso</option>
            <option value="full">Completa</option>
          </select>
        </label>

        <div style={{display:'flex',gap:'.8rem',marginTop:'1rem'}}>
          <button onClick={savePresentation} className={styles.newBtn}><FiSave/> Guardar presentación</button>
        </div>
      </div>

      {/* LISTA DE SLIDES */}
      <div style={{display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'1rem'}}>
        <h2 style={{margin:0}}>Diapositivas</h2>
        <button onClick={addSlide} className={styles.newBtn}><FiPlus/> Nueva diapositiva</button>
      </div>

      {slides.map(slide=>(
        <div key={slide.id} className={styles.card} style={{marginBottom:'1.5rem'}}>
          <h4 style={{margin:'0 0 .8rem 0'}}>#{slide.slide_order}</h4>

          <label>Título
            <input className={styles.input}
                   value={slide.title}
                   onChange={e=>setSlides(slides.map(s=>s.id===slide.id?{...s,title:e.target.value}:s))}/>
          </label>

          <label>Contenido
            <textarea rows={4} className={styles.input}
                      value={slide.content}
                      onChange={e=>setSlides(slides.map(s=>s.id===slide.id?{...s,content:e.target.value}:s))}/>
          </label>

          <label>URL Imagen
            <input className={styles.input}
                   value={slide.image_url}
                   onChange={e=>setSlides(slides.map(s=>s.id===slide.id?{...s,image_url:e.target.value}:s))}/>
          </label>

          <label>Gráfica (JSON)
            <textarea rows={4} className={styles.input}
                      value={slide.graph_config}
                      onChange={e=>setSlides(slides.map(s=>s.id===slide.id?{...s,graph_config:e.target.value}:s))}/>
          </label>

          <label>Icono
            <select className={styles.select}
                    value={slide.icon||''}
                    onChange={e=>setSlides(slides.map(s=>s.id===slide.id?{...s,icon:e.target.value}:s))}>
              <option value="">Ninguno</option>
              <option value="FiCheck">✔ Check</option>
              <option value="FiStar" >★ Star</option>
              <option value="FiArrowRight">→ Arrow</option>
            </select>
          </label>

          <div style={{display:'flex',gap:'.7rem',marginTop:'1rem'}}>
            <button onClick={()=>saveSlide(slide)}         className={styles.newBtn}><FiSave/> Guardar</button>
            <button onClick={()=>deleteSlide(slide.id)}    className={styles.newBtn} style={{background:'#d9534f'}}><FiTrash2/> Eliminar</button>
          </div>
        </div>
      ))}

      {/* Hidden container for PDF */}
      <div ref={pdfRef}
           style={{position:'fixed',top:'-10000px',left:'-10000px',width:'1800px',height:'1000px',background:'#fff'}}/>
    </div>
  );
}
