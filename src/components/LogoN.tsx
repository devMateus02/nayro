"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import { isLightDevice } from "@/lib/device";
import type { NMotionRef } from "./three/nMotion";

// WebGL só existe no navegador: o canvas 3D não é renderizado no servidor (e no celular nem é baixado)
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

// Mesma regra de DESKTOP_QUERY (lib/device): no computador some a imagem, no celular some o 3D
const ONLY_MOBILE = "[@media(min-width:1024px)_and_(pointer:fine)]:hidden";
const ONLY_DESKTOP = "hidden [@media(min-width:1024px)_and_(pointer:fine)]:block";

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

/** N do celular: foto do próprio N 3D (mesmo enquadramento do canvas), flutuando devagar */
function LogoNImage() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`absolute inset-0 ${ONLY_MOBILE}`}>
      <div className="size-full motion-safe:animate-float">
        <Image
          src="/images/logo-n-3d.webp"
          alt="Símbolo NAYRO"
          width={1024}
          height={1024}
          sizes="(min-width: 768px) 60vw, 100vw"
          onLoad={() => setLoaded(true)}
          className={`size-full object-contain transition-opacity duration-1000 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}

export default function LogoN({ motion }: { motion?: NMotionRef }) {
  // O 3D só é montado (e baixado) no computador
  const [use3d, setUse3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => setFailed(true), []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende da tela, que só existe no navegador
    setUse3d(!isLightDevice());
  }, []);

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
      <LogoNImage />

      {/* Computador, carregando: silhueta do N percorrida por um fluxo de luz */}
      <div
        aria-hidden
        style={maskStyle}
        className={`pointer-events-none absolute inset-[16%] overflow-hidden transition-opacity duration-700 ${ONLY_DESKTOP} ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-violeta/20" />
        {!ready && (
          <div className="absolute inset-y-0 -left-1/2 w-[200%] animate-light-sweep bg-[linear-gradient(100deg,transparent_35%,rgba(164,91,255,0.55)_45%,rgba(247,245,250,0.95)_50%,rgba(164,91,255,0.55)_55%,transparent_65%)]" />
        )}
      </div>
      {use3d && (
        <div className={`size-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <ModelBoundary onError={handleError}>
            <LogoN3D onReady={handleReady} motion={motion} />
          </ModelBoundary>
        </div>
      )}
    </div>
  );
}
