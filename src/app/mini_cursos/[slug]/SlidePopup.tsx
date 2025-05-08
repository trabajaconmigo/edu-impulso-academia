// src/app/mini_cursos/[slug]/SlidePopup.tsx
"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FiPlay, FiPause, FiStopCircle, FiX } from "react-icons/fi";
import styles from "./SlidePopup.module.css";

/** Row shape returned from mini_curso_slides */
interface SlideRow {
  title: string;
  content: string;
  start_time: number;
  duration: number;
}

/** Row shape for mini_cursos when only audio_url is selected */
interface MiniCursoRow {
  audio_url: string | null;
}

interface SlidePopupProps {
  miniCursoId: string;
  onClose: () => void;
}

export default function SlidePopup({ miniCursoId, onClose }: SlidePopupProps) {
  /* ------------------------------- state ------------------------------ */
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* reference to <audio> */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ---------------------- fetch slides + audio url -------------------- */
  useEffect(() => {
    (async () => {
      /* Slides */
      const { data: slideData, error: slideErr } = await supabase
        .from<SlideRow>("mini_curso_slides")
        .select("title, content, start_time, duration")
        .eq("mini_curso_id", miniCursoId)
        .order("order_index", { ascending: true });
      if (slideErr) console.error(slideErr.message);
      else if (slideData) setSlides(slideData);

      /* Audio URL */
      const { data: cursoData, error: cursoErr } = await supabase
        .from<MiniCursoRow>("mini_cursos")
        .select("audio_url")
        .eq("id", miniCursoId)
        .single();
      if (cursoErr) console.error(cursoErr.message);
      else if (cursoData?.audio_url) setAudioUrl(cursoData.audio_url);
    })();

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [miniCursoId]);

  /* ----------------- register audio listeners once ready ------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration || 0);
    };

    const onTime = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      const idx = slides.findIndex(
        (s) => t >= s.start_time && t < s.start_time + s.duration
      );
      if (idx >= 0 && idx !== currentIdx) setCurrentIdx(idx);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);

    // cleanup
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [slides, currentIdx, audioUrl]);

  /* ----------------------------- helpers ----------------------------- */
  const format = (t: number) => {
    if (!Number.isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const play = () => audioRef.current?.play();
  const pause = () => audioRef.current?.pause();
  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setCurrentIdx(0);
  };

  const seek = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  /* ------------------------------ render ----------------------------- */
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* close */}
        <button className={styles.closeBtn} onClick={() => { stop(); onClose(); }}>
          <FiX size={24} />
        </button>

        {/* audio element */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

        {/* slide content */}
        {slides[currentIdx] ? (
          <div key={currentIdx} className={styles.slide}>
            <h2 className={styles.title}>{slides[currentIdx].title}</h2>
            <p className={styles.text}>{slides[currentIdx].content}</p>
            <img src="/logo.svg" alt="Logo Escuela360" className={styles.logo} />
          </div>
        ) : (
          <p className={styles.loading}>Cargando diapositivas…</p>
        )}

        {/* progress bar */}
        <div className={styles.progressContainer}>
          <span className={styles.time}>{format(currentTime)}</span>
          <input
            type="range"
            className={styles.progress}
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={seek}
          />
          <span className={styles.time}>{format(duration)}</span>
        </div>

        {/* controls */}
        <div className={styles.controls}>
          <button className={styles.iconButton} onClick={play} disabled={!audioUrl}><FiPlay size={20} /></button>
          <button className={styles.iconButton} onClick={pause} disabled={!audioUrl}><FiPause size={20} /></button>
          <button className={styles.iconButton} onClick={stop}  disabled={!audioUrl}><FiStopCircle size={20} /></button>
        </div>
      </div>
    </div>
  );
}