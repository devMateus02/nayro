"use client";

import { useEffect, useRef, useState } from "react";
import { videoType } from "@/lib/media";
import { PauseIcon, PlayIcon, SoundOffIcon, SoundOnIcon } from "../icons";

const control =
  "flex size-7 items-center justify-center rounded-full border border-branco/15 bg-[#08070d]/55 md:size-9 text-branco/85 backdrop-blur-md transition hover:border-roxo-luminoso/70 hover:text-branco focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roxo-luminoso";

/** Quem pediu menos movimento ou economia de dados não recebe o vídeo tocando sozinho */
function canAutoplay() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return !reduced && !saveData;
}

/**
 * Vídeo do projeto sobre a capa, dentro do quadro de navegador: toca sem som e em loop enquanto está na tela,
 * entra com um fade quando começa (a capa fica por baixo até lá) e tem botões discretos de pausa e som.
 */
export default function ProjectVideo({
  src,
  name,
  onSize,
}: {
  src: string;
  name: string;
  /** Avisa as medidas reais do vídeo (para vídeos sem as medidas no nome do arquivo) */
  onSize?: (width: number, height: number) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  // Pausa pedida pela pessoa: o vídeo não volta sozinho ao reaparecer na tela
  const userPaused = useRef(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    userPaused.current = !canAutoplay();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) el.play().catch(() => {});
        else if (!entry.isIntersecting) el.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (failed) return null;

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      el.play().catch(() => {});
    } else {
      userPaused.current = true;
      el.pause();
    }
  };

  const toggleSound = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted && el.paused) toggle();
  };

  return (
    <>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`Vídeo do projeto ${name}`}
        onPlaying={() => {
          setPlaying(true);
          setShown(true);
        }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => e.currentTarget.videoWidth && onSize?.(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
        onError={() => setFailed(true)}
        className={`absolute inset-0 size-full object-cover object-top transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src={src} type={videoType(src)} onError={() => setFailed(true)} />
      </video>

      <div className="absolute bottom-2 right-2 flex gap-1.5 md:bottom-5 md:right-5 md:gap-2">
        <button type="button" onClick={toggle} aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"} className={control}>
          {playing ? <PauseIcon className="size-3.5 md:size-4" /> : <PlayIcon className="size-3.5 md:size-4" />}
        </button>
        <button type="button" onClick={toggleSound} aria-label={muted ? "Ligar o som" : "Desligar o som"} aria-pressed={!muted} className={control}>
          {muted ? <SoundOffIcon className="size-3.5 md:size-4" /> : <SoundOnIcon className="size-3.5 md:size-4" />}
        </button>
      </div>
    </>
  );
}
