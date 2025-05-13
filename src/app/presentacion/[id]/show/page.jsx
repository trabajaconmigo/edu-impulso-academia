// File: src/app/presentacion/[id]/show/page.jsx

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { supabase } from '@/lib/supabaseClient';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMaximize,
  FiArrowLeft,
  FiDownload,
  FiCheck,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';

import '@/app/presentacion/slides.css';

const DynamicChart = dynamic(
  () => import('@/app/presentacion/Chart'),
  { ssr: false }
);

export default function SlideShow() {
  const { id } = useParams();
  const handleFS = useFullScreenHandle();
  const slideRef = useRef(null);

  const [slides, setSlides] = useState([]);
  const [orientation, setOrientation] = useState('horizontal');
  const [idx, setIdx] = useState(0);
  const [reveal, setReveal] = useState(0);

  // map slide.icon to actual component
  const iconMap = {
    FiCheck: FiCheck,
    FiStar: FiStar,
    FiArrowRight: FiArrowRight
  };

  // Load orientation and slides
  useEffect(() => {
    (async () => {
      const { data: pres } = await supabase
        .from('presentations')
        .select('orientation')
        .eq('id', id)
        .single();
      if (pres?.orientation) setOrientation(pres.orientation);

      const { data } = await supabase
        .from('slides')
        .select('*')
        .eq('presentation_id', id)
        .order('slide_order');
      setSlides(data || []);
    })();
  }, [id]);

  // Current slide and its content lines
  const current = slides[idx] || {};
  const currentLines = (current.content || '')
    .split('\n')
    .filter((l) => l.trim().length);

  const isShort = currentLines.length <= 3;

  const nextSlide = useCallback(() => {
    setIdx((i) => Math.min(slides.length - 1, i + 1));
    setReveal(0);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
    setReveal(0);
  }, []);

  const revealNext = useCallback(() => {
    setReveal((r) => Math.min(currentLines.length, r + 1));
  }, [currentLines.length]);

  const revealPrev = useCallback(() => {
    setReveal((r) => Math.max(0, r - 1));
  }, []);

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowDown') revealNext();
      if (e.key === 'ArrowUp') revealPrev();
      if (e.key === 'Escape' && handleFS.active) handleFS.exit();
    },
    [nextSlide, prevSlide, revealNext, revealPrev, handleFS]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const downloadPDF = async () => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
    for (let i = 0; i < slides.length; i++) {
      setIdx(i);
      setReveal(currentLines.length);
      await new Promise((r) => setTimeout(r, 300));
      const canvas = await html2canvas(slideRef.current, { backgroundColor: '#fff' });
      const img = canvas.toDataURL('image/png', 1.0);
      const ratio = canvas.width / canvas.height;
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pageW / ratio;
      if (i > 0) pdf.addPage();
      pdf.addImage(img, 'PNG', 0, 0, pageW, pageH);
    }
    pdf.save('presentacion.pdf');
  };

  if (!slides.length) return <p>Cargando…</p>;

  // pick the icon component or null
  const BulletIcon = current.icon ? iconMap[current.icon] : null;

  return (
    <>
      {/* Fixed UI buttons */}
      <Link href="/presentacion" className="back-btn">
        <FiArrowLeft /> Volver
      </Link>
      <button className="fullscreen-toggle" onClick={handleFS.enter}>
        <FiMaximize size={24} />
      </button>
      <button
        style={{
          position: 'fixed',
          bottom: '1.2rem',
          left: '1.2rem',
          zIndex: 9999,
          background: '#fff',
          border: '1px solid #d1d7dc',
          borderRadius: 4,
          padding: '.45rem .6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '.4rem'
        }}
        onClick={downloadPDF}
      >
        <FiDownload /> PDF
      </button>

      <FullScreen handle={handleFS}>
        <div
          className={`${orientation} w-screen h-screen flex items-center justify-center bg-[#f8f9fa] overflow-hidden`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              ref={slideRef}
              className="slide-wrapper fullscreen-slide relative"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              {current.title && (
                <div className={`title-container${isShort ? ' title-short' : ''}`}>
                  <h1 className="slide-title">{current.title}</h1>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentLines.map((line, i) => (
                  <div
                    key={i}
                    className={`bullet ${
                      i < reveal ? 'shown' : ''
                    } ${i === reveal - 1 ? 'current' : ''}`}
                    style={{ display: 'flex', alignItems: 'flex-start' }}
                  >
                   {BulletIcon && (
  <BulletIcon
    style={{
      flexShrink: 0,
      marginRight: '0.5rem',
      transform: 'translateY(15px)'
    }}
  />
)}

                    {line}
                  </div>
                ))}
              </div>

              {current.image_url && (
                <div style={{ marginTop: '1rem' }}>
                  <Image
                    src={current.image_url}
                    alt=""
                    width={1000}
                    height={560}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}

              {current.graph_config && reveal === currentLines.length && (
                <DynamicChart config={JSON.parse(current.graph_config)} />
              )}

              <motion.div className="logo-anim">
                <Image
                  src="/escuela360_logo.jpg"
                  alt="logo"
                  className="slide-logo"
                  width={140}
                  height={45}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </FullScreen>

      {/* Navigation arrows */}
      {idx > 0 && (
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-4xl text-[#5833a0]/80"
        >
          <FiChevronLeft />
        </button>
      )}
      {idx < slides.length - 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-4xl text-[#5833a0]/80"
        >
          <FiChevronRight />
        </button>
      )}
    </>
  );
}
