"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useState, type ReactNode } from "react";
import type { NMotionRef } from "./three/nMotion";

// WebGL só existe no navegador: o canvas 3D não é renderizado no servidor
const LogoN3D = dynamic(() => import("./three/LogoN3D"), { ssr: false });

const maskStyle = {
  maskImage: "url(/images/logo-n.webp)",
  WebkitMaskImage: "url(/images/logo-n.webp)",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
} as const;

/** Se o modelo 3D falhar (rede, WebGL), a página segue normal com a logo 2D no lugar */
class ModelBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function LogoN({ motion }: { motion?: NMotionRef }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <div className="relative size-full">
        <Image
          src="/images/logo-n.webp"
          alt="Símbolo NAYRO"
          width={1254}
          height={1254}
          sizes="(min-width: 1024px) 38vw, 70vw"
          className="absolute inset-[14%] m-auto h-auto max-h-[72%] w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative size-full">
      {/* Carregamento: silhueta do N percorrida por um fluxo de luz */}
      <div
        aria-hidden
        style={maskStyle}
        className={`pointer-events-none absolute inset-[16%] overflow-hidden transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-violeta/20" />
        {!ready && (
          <div className="absolute inset-y-0 -left-1/2 w-[200%] animate-light-sweep bg-[linear-gradient(100deg,transparent_35%,rgba(164,91,255,0.55)_45%,rgba(247,245,250,0.95)_50%,rgba(164,91,255,0.55)_55%,transparent_65%)]" />
        )}
      </div>
      <div className={`size-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
        <ModelBoundary onError={handleError}>
          <LogoN3D onReady={handleReady} motion={motion} />
        </ModelBoundary>
      </div>
    </div>
  );
}
