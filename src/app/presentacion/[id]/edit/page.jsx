// File: src/app/presentacion/[id]/show/page.jsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link           from 'next/link';
import Image          from 'next/image';
import dynamic        from 'next/dynamic';
import html2canvas    from 'html2canvas';
import jsPDF          from 'jspdf';
import { supabase }   from '@/lib/supabaseClient';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft, FiChevronRight, FiMaximize, FiArrowLeft, FiDownload, FiLayers,
  FiCheck, FiStar, FiArrowRight
} from 'react-icons/fi';
import '@/app/presentacion/slides.css';

const DynamicChart = dynamic(
  () => import('@/app/presentacion/Chart'),
  { ssr: false }
);

export default function SlideShow () {
  /* refs y helpers */
  const { id }     = useParams();
  const handleFS   = useFullScreenHandle();
  const slideRef   = useRef(null);

  /* estado principal */
  const [slides,       setSlides]  = useState([]);
  const [loading,      setLoad]    = useState(true);
  const [orientation,  setOri]     = useState('horizontal');
  const [idx,          setIdx]     = useState(0);
  const [reveal,       setReveal]  = useState(0);     // step-by-step
  const [showAll,      setShowAll] = useState(false); // modo completo

  /* mapa iconos → componente */
  const iconMap = useMemo(
    () => ({ FiCheck, FiStar, FiArrowRight }),
    []
  );

  /* ------- fetch presentación + slides ------------------------------- */
  useEffect(() => {
    (async () => {
      const { data: pres } = await supabase
        .from('presentations')
        .select('orientation, reveal_mode')
        .eq('id', id)
        .single();

      if (pres) {
        setOri(pres.orientation);
        setShowAll(pres.reveal_mode === 'full');
      }

      const { data: s } = await supabase
        .from('slides')
        .select('*')
        .eq('presentation_id', id)
        .order('slide_order');

      setSlides(s || []);
      setLoad(false);
    })();
  }, [id]);

  /* -------- derivados ------------------------------------------------ */
  const current     = slides[idx] || {};
  const lines       = (current.content || '').split('\n').filter(l => l.trim());
  const isShort     = lines.length <= 3;
  const Bullet      = current.icon ? iconMap[current.icon] : null;
  const visible     = showAll ? lines.length : reveal;

  /* -------- navegación ---------------------------------------------- */
  const next   = useCallback(() => { setIdx(i => Math.min(slides.length-1,i+1)); setReveal(0); }, [slides.length]);
  const prev   = useCallback(() => { setIdx(i => Math.max(0,i-1));             setReveal(0); }, []);
  const down   = useCallback(() => setReveal(r => Math.min(lines.length, r+1)), [lines.length]);
  const up     = useCallback(() => setReveal(r => Math.max(0, r-1)), []);
  const toggle = useCallback(() => setShowAll(v => !v), []);

  const handleKey = useCallback(e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowDown')  down();
    if (e.key === 'ArrowUp')    up();
    if (e.key.toLowerCase() === 'm') toggle();
    if (e.key === 'Escape' && handleFS.active) handleFS.exit();
  }, [next,prev,down,up,toggle,handleFS]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  /* -------- PDF export --------------------------------------------- */
  const downloadPDF = async () => {
    const pdf = new jsPDF({ orientation:'landscape', unit:'px', format:'a4' });
    for (let i=0;i<slides.length;i++) {
      setIdx(i); setReveal(lines.length);
      await new Promise(r=>setTimeout(r,300));
      const canvas = await html2canvas(slideRef.current,{background:'#fff'});
      const img = canvas.toDataURL('image/png',1);
      const W = pdf.internal.pageSize.getWidth();
      const H = W / (canvas.width/canvas.height);
      if (i>0) pdf.addPage();
      pdf.addImage(img,'PNG',0,0,W,H);
    }
    pdf.save('presentacion.pdf');
  };

  /* -------- render --------------------------------------------------- */
  if (loading) return <p>Cargando…</p>;

  return (
    <>
      {/* --- botones fijos --- */}
      <Link href="/presentacion" className="back-btn"><FiArrowLeft/> Volver</Link>

      <button className="fullscreen-toggle" onClick={handleFS.enter}>
        <FiMaximize size={24}/>
      </button>

      <button onClick={toggle} title="Paso a paso / Completo (M)"
              style={{
                position:'fixed',bottom:'1.2rem',left:'calc(1.2rem + 70px)',
                zIndex:9999,background:'#fff',border:'1px solid #d1d7dc',
                borderRadius:4,padding:'.45rem .6rem',display:'flex',
                alignItems:'center',gap:'.4rem'
              }}>
        <FiLayers/>{showAll ? 'Paso' : 'Todo'}
      </button>

      <button onClick={downloadPDF}
              style={{
                position:'fixed',bottom:'1.2rem',left:'1.2rem',
                zIndex:9999,background:'#fff',border:'1px solid #d1d7dc',
                borderRadius:4,padding:'.45rem .6rem',display:'flex',
                alignItems:'center',gap:'.4rem'
              }}>
        <FiDownload/> PDF
      </button>

      {/* --- presentación --- */}
      <FullScreen handle={handleFS}>
        <div className={`${orientation} w-screen h-screen flex items-center justify-center bg-[#f8f9fa] overflow-hidden`}>
          <AnimatePresence mode="wait">
            <motion.div key={current.id} ref={slideRef}
                        className="slide-wrapper fullscreen-slide relative"
                        initial={{opacity:0,scale:.97}}
                        animate={{opacity:1,scale:1}}
                        exit={{opacity:0,scale:.95}}
                        transition={{duration:.4}}>

              {/* título */}
              {current.title && (
                <div className={`title-container${isShort?' title-short':''}`}>
                  <h1 className="slide-title">{current.title}</h1>
                </div>
              )}

              {/* bullets */}
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                {lines.map((l,i)=>{
                  const isShown   = i < visible;
                  const isCurrent = !showAll && (i === visible-1);
                  return (
                    <div key={i}
                         className={`bullet ${isShown?'shown':''} ${isCurrent?'current':''}`}
                         style={{display:'flex',alignItems:'flex-start'}}>
                      {Bullet && (
                        <Bullet style={{flexShrink:0,marginRight:'.5rem',transform:'translateY(15px)'}}/>
                      )}
                      {l}
                    </div>
                  );
                })}
              </div>

              {/* imagen opcional */}
              {current.image_url && (
                <div style={{marginTop:'1rem'}}>
                  <Image src={current.image_url} alt=""
                         width={1000} height={560}
                         style={{maxWidth:'100%',height:'auto'}}/>
                </div>
              )}

              {/* gráfica opcional */}
              {current.graph_config && visible === lines.length && (
                <DynamicChart config={JSON.parse(current.graph_config)}/>
              )}

              {/* logo */}
              <motion.div className="logo-anim">
                <Image src="/escuela360_logo.jpg" alt="logo"
                       className="slide-logo" width={140} height={45}/>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </FullScreen>

      {/* flechas */}
      {idx>0 && (
        <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-4xl text-[#5833a0]/80">
          <FiChevronLeft/>
        </button>
      )}
      {idx<slides.length-1 && (
        <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-4xl text-[#5833a0]/80">
          <FiChevronRight/>
        </button>
      )}
    </>
  );
}
