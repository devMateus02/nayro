"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { scrollToY } from "@/lib/lenis";
import { SERVICES_PAGE } from "@/lib/nav";
import { revealOnView } from "@/lib/reveal";
import { serviceTitleLines, type Service } from "@/lib/services";
import { ArrowLeft, ArrowRight } from "./icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Os serviços em destaque vêm do banco (painel /admin/servicos)

// Bússola em volta do N: geometria gerada uma vez (viewBox centrado em 0,0; ângulo 0 = norte, sentido horário)
const pt = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
};
const xy = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: +(r * Math.cos(a)).toFixed(2), y: +(r * Math.sin(a)).toFixed(2) };
};

/** Escala de graus: marcação a cada 5°, maior a cada 30° */
function degreeTicks(r: number) {
  let minor = "";
  let major = "";
  for (let deg = 0; deg < 360; deg += 5) {
    if (deg % 30 === 0) major += `M${pt(r, deg)} L${pt(r - 12, deg)}`;
    else minor += `M${pt(r, deg)} L${pt(r - (deg % 10 === 0 ? 7 : 4), deg)}`;
  }
  return { minor, major };
}

/** Rosa dos ventos de 8 pontas (cardeais longas, colaterais curtas) */
function compassRose(long: number, short: number, width: number) {
  let d = "";
  for (let deg = 0; deg < 360; deg += 45) {
    const len = deg % 90 === 0 ? long : short;
    d += `M${pt(width, deg - 45)} L${pt(len, deg)} L${pt(width, deg + 45)} L0 0Z`;
  }
  return d;
}

const DEGREE_TICKS = degreeTicks(186);
const DEGREE_LABELS = Array.from({ length: 12 }, (_, i) => ({ deg: i * 30, ...xy(198, i * 30) }));
const CARDINALS = [
  { label: "N", deg: 0 },
  { label: "L", deg: 90 },
  { label: "S", deg: 180 },
  { label: "O", deg: 270 },
].map((c) => ({ ...c, ...xy(146, c.deg) }));
const CARDINAL_ARROWS = [0, 90, 180, 270].map((deg) => `M${pt(158, deg - 2.2)} L${pt(170, deg)} L${pt(158, deg + 2.2)}Z`).join("");
const INTERCARDINAL_DIAMONDS = [45, 135, 225, 315]
  .map((deg) => `M${pt(158, deg)} L${pt(164, deg - 1.6)} L${pt(170, deg)} L${pt(164, deg + 1.6)}Z`)
  .join("");
const ROSE = compassRose(128, 84, 14);

/** Três anéis de bússola independentes; cada um gira num sentido conforme a rolagem */
function CompassRings() {
  return (
    <div data-svc-compass aria-hidden className="pointer-events-none absolute -inset-[12%] text-branco">
      {/* Externo: escala de graus com números */}
      <svg data-ring="outer" viewBox="-215 -215 430 430" className="absolute inset-0 size-full">
        <circle r="186" fill="none" stroke="currentColor" strokeOpacity="0.16" />
        <path d={DEGREE_TICKS.minor} stroke="currentColor" strokeOpacity="0.22" />
        <path d={DEGREE_TICKS.major} stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
        {DEGREE_LABELS.map(({ deg, x, y }) => (
          <text
            key={deg}
            x={x}
            y={y}
            transform={`rotate(${deg} ${x} ${y})`}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7.5"
            fill="currentColor"
            fillOpacity="0.4"
            className="font-poppins"
          >
            {deg}
          </text>
        ))}
        <circle cx={xy(186, -36).x} cy={xy(186, -36).y} r="3.5" fill="currentColor" className="drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
      </svg>
      {/* Meio: pontos cardeais, setas e losangos */}
      <svg data-ring="middle" viewBox="-215 -215 430 430" className="absolute inset-0 size-full">
        <circle r="164" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 5" />
        <path d={CARDINAL_ARROWS} fill="currentColor" fillOpacity="0.45" />
        <path d={INTERCARDINAL_DIAMONDS} fill="currentColor" fillOpacity="0.25" />
        {CARDINALS.map(({ label, deg, x, y }) => (
          <text
            key={label}
            x={x}
            y={y}
            transform={`rotate(${deg} ${x} ${y})`}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fontWeight="600"
            fill={label === "N" ? "#a45bff" : "currentColor"}
            fillOpacity={label === "N" ? 1 : 0.5}
            className="font-poppins"
          >
            {label}
          </text>
        ))}
      </svg>
      {/* Interno: rosa dos ventos sutil atrás do N */}
      <svg data-ring="inner" viewBox="-215 -215 430 430" className="absolute inset-0 size-full">
        <circle r="132" fill="none" stroke="currentColor" strokeOpacity="0.07" />
        <path d={ROSE} fill="currentColor" fillOpacity="0.035" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

export default function Services({ services: featured }: { services: Service[] }) {
  // Nome em duas linhas (a última palavra em roxo), igual no título e na aba
  const services = featured.map((s) => ({ title: serviceTitleLines(s.name), tab: serviceTitleLines(s.name), text: s.description }));
  // Pontos de parada da rolagem: um por serviço (o primeiro já começa na tela)
  const STEPS = Math.max(1, services.length - 1);
  const section = useRef<HTMLElement>(null);
  const progressBars = useRef<(HTMLSpanElement | null)[]>([]);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!section.current) return;
      const blocks = gsap.utils.toArray<HTMLElement>("[data-service]");
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const reduce = ctx.conditions?.reduce;
          gsap.set(blocks.slice(1), { autoAlpha: 0 });

          // Troca de texto com blur: o atual se desfoca e some, o próximo surge saindo do desfoque.
          // A timeline dura exatamente STEPS: no tempo i o serviço i está inteiro na tela (pontos de parada).
          const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
          for (let i = 0; i < services.length - 1; i++) {
            tl.to(blocks[i], reduce ? { autoAlpha: 0, duration: 0.3 } : { autoAlpha: 0, y: -24, filter: "blur(14px)", duration: 0.45 }, i + 0.3)
              .fromTo(
                blocks[i + 1],
                reduce ? { autoAlpha: 0 } : { autoAlpha: 0, y: 24, filter: "blur(14px)" },
                reduce ? { autoAlpha: 1, duration: 0.3 } : { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45 },
                i + 0.55,
              );
          }

          // Seção fixa enquanto os 4 serviços passam
          triggerRef.current = ScrollTrigger.create({
            trigger: section.current,
            start: "top top",
            end: `+=${services.length * 75}%`,
            pin: true,
            scrub: 0.6,
            animation: tl,
            // Sem inércia: para sempre no serviço mais próximo, sem "arremessar" até o primeiro/último
            snap: { snapTo: (v) => Math.round(v * STEPS) / STEPS, inertia: false, duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" },
            onUpdate: (self) => {
              const pos = self.progress * STEPS;
              const index = Math.min(services.length - 1, Math.round(pos));
              setActive((prev) => (prev === index ? prev : index));
              // Barra da aba ativa: avança junto com a rolagem dentro do serviço
              progressBars.current.forEach((bar, i) => {
                if (!bar) return;
                const fill = i < index ? 1 : i === index ? Math.min(1, 0.25 + Math.max(0, pos - i + 0.5) * 0.75) : 0;
                bar.style.transform = `scaleX(${fill})`;
              });
            },
          });

          // Anéis da bússola giram com a rolagem, cada um num sentido: alinhados (N no topo) quando a seção encaixa na tela
          if (!reduce) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: section.current,
                  start: "top top",
                  end: `+=${(services.length * 0.75 + 1) * 100}%`,
                  scrub: 1,
                },
                defaults: { ease: "none" },
              })
              .to("[data-ring='outer']", { rotation: 120 }, 0)
              .to("[data-ring='middle']", { rotation: -200 }, 0)
              .to("[data-ring='inner']", { rotation: 70 }, 0);

            // Entrada: a bússola abre e os textos sobem; desfaz ao sair da seção
            const intro = gsap
              .timeline({ defaults: { ease: "power3.out" } })
              .fromTo("[data-svc-compass]", { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: "expo.out" }, 0)
              .fromTo("[data-svc-reveal]", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.1);
            // A seção fica fixa durante a troca dos serviços: a saída conta a partir do fim da fixação
            // (quando ela já subiu 60% da tela, como nas outras seções)
            if (section.current) {
              revealOnView(intro, section.current, {
                end: () => (triggerRef.current?.end ?? 0) + window.innerHeight * 0.6,
              });
            }
          }

          return () => {
            triggerRef.current = null;
          };
        },
      );
    },
    { scope: section },
  );

  // Abas e setas levam a rolagem até o serviço escolhido
  const goTo = (index: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const target = Math.max(0, Math.min(STEPS, index));
    scrollToY(st.start + (st.end - st.start) * (target / STEPS));
  };

  if (!services.length) return null;

  return (
    <section ref={section} id="servicos" className="relative h-svh overflow-hidden bg-[#0b0a10]">
      {/* Fundo: brilho âmbar no topo e violeta no canto inferior */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[30%] left-1/2 h-[60%] w-[55%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(184,116,63,0.32),transparent)] blur-2xl" />
        <div className="absolute -bottom-[25%] -left-[12%] h-[55%] w-[40%] rounded-full bg-[radial-gradient(closest-side,rgba(112,41,217,0.45),transparent)] blur-2xl" />
      </div>

      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col px-6 pb-8 pt-24 md:px-5 lg:px-[8%] lg:pb-[6vh] lg:pt-[18vh]">
        <div className="grid flex-1 grid-cols-1 grid-rows-[auto_1fr] gap-6 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1 lg:items-center lg:gap-10">
          {/* Textos dos serviços (empilhados; a rolagem troca qual aparece) */}
          <div className="order-2 lg:order-1">
            <p data-svc-reveal className="font-poppins text-xs font-medium uppercase tracking-[0.32em] text-roxo-luminoso lg:text-[clamp(12px,0.9vw,15px)]">
              O que nós oferecemos
            </p>
            <div data-svc-reveal className="mt-4 grid grid-cols-1 lg:mt-6">
              {services.map((s, i) => (
                <div key={s.title.join(" ")} data-service={i} className="col-start-1 row-start-1" aria-hidden={i !== active}>
                  <h2 className="font-poppins text-[clamp(30px,9.5vw,44px)] font-semibold lg:text-[clamp(40px,4.6vw,88px)] leading-[1.05] tracking-[-0.03em] text-branco">
                    {s.title[0]}
                    {" "}<br />
                    <span className="text-roxo-luminoso">{s.title[1]}</span>
                  </h2>
                  <p className="mt-5 max-w-[34ch] text-base leading-relaxed text-branco/80 lg:mt-7 lg:text-[clamp(16px,1.3vw,23px)]">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
            <div data-svc-reveal className="mt-6 flex flex-wrap items-center gap-5 lg:mt-8 lg:gap-8">
              <Link
                href={SERVICES_PAGE}
                className="group inline-flex items-center gap-3 rounded-full border border-roxo-luminoso/70 bg-roxo-escuro/60 px-5 py-2.5 font-poppins text-[13px] font-medium text-branco transition hover:border-roxo-luminoso hover:bg-roxo-escuro lg:text-[clamp(13px,0.85vw,15px)]"
              >
                Conheça nossos serviços
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#contato"
                className="group inline-flex items-center gap-3 font-poppins text-[13px] font-medium text-branco lg:text-[clamp(13px,0.85vw,15px)]"
              >
                Fale com a gente
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Encaixe do N (o símbolo vem flutuando da Hero) com os anéis de bússola */}
          <div className="relative order-1 h-[30vh] min-h-0 lg:order-2 lg:h-full">
            <div className="absolute left-1/2 top-1/2 aspect-square h-full max-h-[min(42vw,62vh)] -translate-x-1/2 -translate-y-1/2 lg:max-h-[min(40vw,64vh)]">
              <CompassRings />
              <div className="absolute inset-[18%] rounded-full bg-violeta/25 blur-[80px]" />
              <div data-n-slot="servicos" className="absolute inset-0" />
            </div>
          </div>
        </div>

        {/* Abas dos serviços + setas */}
        <div data-svc-reveal className="mt-6 flex items-center gap-4 lg:mt-0 lg:gap-8">
          <ol className="grid max-w-[46rem] flex-1" style={{ gridTemplateColumns: `repeat(${services.length}, minmax(0, 1fr))` }}>
            {services.map((s, i) => (
              <li key={s.tab.join(" ")} className={i > 0 ? "border-l border-branco/15" : ""}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  className="group flex w-full min-w-0 flex-col items-start px-2 text-left lg:px-[1.4vw]"
                >
                  <span className="font-poppins text-[10px] font-medium text-roxo-luminoso lg:text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  <span
                    className={`mt-0.5 hidden whitespace-nowrap font-poppins text-[clamp(11px,0.85vw,14px)] leading-snug transition-colors md:block ${
                      i === active ? "font-medium text-branco" : "text-branco/65 group-hover:text-branco/90"
                    }`}
                  >
                    {s.tab[0]}
                    {" "}<br />
                    {s.tab[1]}
                  </span>
                  <span className="relative mt-2 block h-0.5 w-full max-w-[9rem] overflow-hidden rounded-full bg-branco/10">
                    <span
                      ref={(el) => {
                        progressBars.current[i] = el;
                      }}
                      style={{ transform: "scaleX(0)" }}
                      className="absolute inset-0 origin-left rounded-full bg-roxo-luminoso"
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="ml-auto flex shrink-0 gap-2 lg:gap-3">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Serviço anterior"
              className="flex size-9 items-center justify-center rounded-full border border-branco/40 text-branco transition hover:border-roxo-luminoso disabled:opacity-35 lg:size-10"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active >= services.length - 1}
              aria-label="Próximo serviço"
              className="flex size-9 items-center justify-center rounded-full border border-branco/80 text-branco transition hover:border-roxo-luminoso disabled:opacity-35 lg:size-10"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
