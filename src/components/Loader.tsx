"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useId, useRef, useState } from "react";
import { setScrollLocked } from "@/lib/lenis";
import { finishLoader } from "@/lib/loader";
import { WORDMARK_LETTERS, WORDMARK_TRIANGLE, WORDMARK_VIEWBOX } from "@/lib/wordmark";

gsap.registerPlugin(useGSAP);

// Depois de escrever a palavra, espera a página carregar (imagens etc.) por no máximo este tempo
const MAX_WAIT_MS = 2500;

/** Palavra NAYRO: cada letra começa só como contorno invisível (é "escrita" pelo traço) e depois é preenchida */
function Wordmark() {
  const id = useId().replace(/[^\w-]/g, "");
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className="relative w-[min(62vw,520px)] overflow-visible">
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="58" x2="0" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dccbff" />
        </linearGradient>
      </defs>
      {WORDMARK_LETTERS.map((d) => (
        <path
          key={d.slice(0, 24)}
          data-loader-letter
          d={d}
          fillRule="evenodd"
          fill={`url(#${id}-fill)`}
          fillOpacity={0}
          stroke="#d9c7ff"
          strokeWidth={1.4}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1}
        />
      ))}
      <path data-loader-tri d={WORDMARK_TRIANGLE} fill="#7029d9" opacity={0} />
    </svg>
  );
}

/**
 * Cena de uma metade da tela. Tem o dobro da largura da metade e fica presa ao lado do corte,
 * então as duas metades juntas mostram a cena inteira, e ao abrir cada uma leva a sua parte da palavra.
 */
function Half({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div data-loader-panel={side} className={`absolute inset-y-0 w-1/2 overflow-hidden bg-[#08070d] ${left ? "left-0" : "right-0"}`}>
      <div className={`absolute inset-y-0 flex w-[200%] items-center justify-center ${left ? "left-0" : "right-0"}`}>
        <div
          data-loader-glow
          className="absolute size-[min(80vw,720px)] rounded-full bg-[radial-gradient(closest-side,rgba(112,41,217,0.2),transparent)] opacity-0"
        />
        <Wordmark />
      </div>
      {/* Borda do corte: continua a linha quando as metades se afastam */}
      <span
        data-loader-edge
        className={`absolute inset-y-0 w-px bg-[linear-gradient(to_bottom,transparent,#a45bff_30%,#d9c7ff_70%,transparent)] opacity-0 ${
          left ? "right-0" : "left-0"
        }`}
      />
    </div>
  );
}

/**
 * Tela de entrada: uma linha desce do topo; ao atravessar o centro, a palavra NAYRO é escrita.
 * A linha chega ao fim da tela e a tela se divide nela: uma metade abre para a esquerda e a outra para a direita.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe) return;
      let cancelled = false;

      // Entrada sempre pelo topo, com a rolagem travada até a tela abrir
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      setScrollLocked(true);

      const open = () => {
        setScrollLocked(false);
        finishLoader();
      };

      // Movimento reduzido: só mostra a palavra e some
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-loader-letter]", { fillOpacity: 1, strokeOpacity: 0 });
        gsap.set("[data-loader-tri]", { opacity: 1 });
        gsap.to(el, { autoAlpha: 0, duration: 0.5, delay: 0.6, onStart: open, onComplete: () => setDone(true) });
        return () => {
          cancelled = true;
          setScrollLocked(false);
        };
      }

      const line = el.querySelector<HTMLElement>("[data-loader-line]");
      const tip = el.querySelector<HTMLElement>("[data-loader-tip]");
      const word = el.querySelector("svg")?.getBoundingClientRect();
      if (!line || !tip || !word) return;

      // Ponta da linha (0 = topo, 1 = fim da tela); ela desacelera enquanto atravessa a palavra
      const head = { p: 0 };
      const draw = () => {
        line.style.transform = `scaleY(${head.p})`;
        tip.style.transform = `translate3d(0, ${head.p * window.innerHeight}px, 0)`;
      };
      const wordTop = Math.max(0.1, word.top / window.innerHeight - 0.04);
      const wordBottom = Math.min(0.9, word.bottom / window.innerHeight + 0.04);
      // Escrita a partir do centro (Y), abrindo para as pontas (N e O); as duas metades andam juntas
      const fromCenter = (i: number) => Math.abs((i % WORDMARK_LETTERS.length) - 2) * 0.14;

      const write = gsap
        .timeline({ delay: 0.35 })
        .set(tip, { autoAlpha: 1 })
        .to(head, { p: wordTop, duration: 0.9, ease: "power2.inOut", onUpdate: draw })
        .addLabel("word")
        .to(head, { p: wordBottom, duration: 1.6, ease: "sine.inOut", onUpdate: draw }, "word")
        .to("[data-loader-letter]", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: fromCenter }, "word")
        .to("[data-loader-letter]", { fillOpacity: 1, duration: 0.7, ease: "power1.out", stagger: fromCenter }, "word+=0.9")
        .to("[data-loader-letter]", { strokeOpacity: 0, duration: 0.6 }, "word+=1.4")
        .fromTo(
          "[data-loader-tri]",
          { opacity: 0, scale: 0.5, transformOrigin: "50% 70%" },
          { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" },
          "word+=1.2",
        )
        .to("[data-loader-glow]", { opacity: 1, duration: 1.2, ease: "power1.out" }, "word+=0.9")
        .to(head, { p: 1, duration: 0.7, ease: "power3.in", onUpdate: draw }, "word+=1.6")
        .to(tip, { autoAlpha: 0, duration: 0.25 }, ">-0.1");

      const pageReady = new Promise<void>((resolve) => {
        if (document.readyState === "complete") return resolve();
        window.addEventListener("load", () => resolve(), { once: true });
        window.setTimeout(resolve, MAX_WAIT_MS);
      });

      // A tela se divide na linha: metades abrem para os lados e revelam o site
      const split = contextSafe(() => {
        if (cancelled) return;
        gsap
          .timeline({ defaults: { ease: "power4.inOut" }, onComplete: () => setDone(true) })
          .to("[data-loader-edge]", { autoAlpha: 1, duration: 0.25, ease: "none" }, 0)
          .to(line, { autoAlpha: 0, duration: 0.3, ease: "none" }, 0.1)
          .to("[data-loader-panel='left']", { xPercent: -100, duration: 1.3 }, 0.05)
          .to("[data-loader-panel='right']", { xPercent: 100, duration: 1.3 }, 0.05)
          .to("[data-loader-edge]", { autoAlpha: 0, duration: 0.4, ease: "none" }, 0.95)
          // O site começa a entrar enquanto as metades se abrem
          .call(open, [], 0.35);
      });
      Promise.all([write.then(), pageReady]).then(split);

      return () => {
        cancelled = true;
        setScrollLocked(false);
      };
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div ref={root} data-loader aria-hidden className="fixed inset-0 z-[100]">
      <Half side="left" />
      <Half side="right" />
      {/* Linha que desce do topo (cresce a partir de cima) e o ponto de luz na ponta */}
      <div
        data-loader-line
        className="absolute inset-y-0 left-1/2 -ml-px w-px origin-top bg-[linear-gradient(to_bottom,transparent,#a45bff_35%,#f7f5fa)]"
        style={{ transform: "scaleY(0)" }}
      />
      <div
        data-loader-tip
        className="invisible absolute left-1/2 top-0 -ml-[3.5px] -mt-[3px] size-1.5 rounded-full bg-branco opacity-0 shadow-[0_0_14px_4px_rgba(164,91,255,0.75)]"
      />
    </div>
  );
}
