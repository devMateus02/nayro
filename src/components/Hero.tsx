import Image from "next/image";
import HeroLight from "./HeroLight";
import HeroWater from "./HeroWater";
import { ArrowDown, ArrowRight } from "./icons";

const stats = [
  { value: "+50", label: ["Projetos", "entregues"], highlight: false },
  { value: "100%", label: ["Foco em", "resultados"], highlight: false },
  { value: "Suporte", label: ["Durante e", "após o projeto"], highlight: true },
];

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex h-svh flex-col overflow-hidden lg:block"
    >
      {/* Fundo: ambiente desfocado se aproximando devagar (o zoom também esconde as bordas do blur) */}
      <Image
        src="/images/hero-bg.webp"
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-30 animate-approach object-cover object-center blur-[6px] will-change-transform"
      />
      {/* Água calma sobre o fundo: o mouse/dedo cria ondulações (a foto acima fica por baixo como reserva) */}
      <HeroWater sectionId="inicio" />
      {/* Luz branca que segue o mouse, por baixo dos escurecimentos */}
      <HeroLight sectionId="inicio" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,rgba(8,7,13,0.35)_55%,rgba(8,7,13,0.85)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-preto/70 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-preto to-transparent" />

      {/* Encaixe do símbolo N: o N 3D é uma camada flutuante (FloatingN) que viaja daqui para os serviços */}
      <div data-intro="logo" data-n-slot="hero" className="relative order-2 mx-auto min-h-0 w-full flex-1 lg:absolute lg:left-1/2 lg:top-[52%] lg:aspect-square lg:w-[min(38vw,74vh)] lg:flex-none lg:-translate-x-1/2 lg:-translate-y-1/2">
        <div className="pointer-events-none absolute inset-[22%] -z-10 animate-glow will-change-[transform,opacity] rounded-full bg-violeta/45 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-[2%] left-1/2 -z-10 hidden h-[12%] w-[70%] -translate-x-1/2 rounded-[100%] bg-roxo-luminoso/30 blur-[50px] lg:block" />
      </div>

      {/* Título da página para o Google, IAs e leitores de tela: a frase que a tela mostra separada em dois blocos */}
      <h1 className="sr-only">NAYRO: desenvolvimento de sites, sistemas e automações. Tecnologia para que ideias ganhem estrutura.</h1>

      {/* Bloco esquerdo (visual; o texto está no título acima) */}
      <div className="relative z-20 order-1 px-6 pt-24 md:px-12 lg:absolute lg:left-[6%] lg:top-[19%] lg:p-0">
        <p aria-hidden data-intro="eyebrow" className="font-poppins text-xs uppercase leading-[1.6] tracking-[0.42em] text-lavanda/85 md:text-sm lg:text-[clamp(12px,0.95vw,17px)]">
          Tecnologia
          {" "}<br />
          para que
        </p>
        <p aria-hidden data-intro="title" className="font-poppins text-branco text-[clamp(56px,6.4vw,124px)] font-bold leading-[1.05] tracking-[-0.045em]">
          ideias
        </p>
        <span data-intro="divider" className="mt-3 block h-px w-12 bg-branco/70 max-lg:[@media(max-height:720px)]:hidden" />
        <p data-intro="text" className="mt-3 max-w-[260px] text-base leading-snug tracking-wide text-branco/80 max-lg:[@media(max-height:720px)]:hidden md:max-w-[340px] md:text-lg lg:mt-4 lg:max-w-[16ch] lg:text-[clamp(15px,1.2vw,22px)]">
          se transformem em soluções reais.
        </p>
      </div>

      {/* Bloco direito */}
      <div className="relative z-20 order-3 px-6 md:px-12 lg:absolute lg:right-[5.5%] lg:top-[39%] lg:w-[min(24vw,420px)] lg:p-0">
        <p aria-hidden data-intro="eyebrow" className="font-poppins text-xs uppercase tracking-[0.42em] text-lavanda/85 md:text-sm lg:text-[clamp(12px,0.95vw,17px)]">
          Ganham
        </p>
        <p aria-hidden data-intro="title" className="font-poppins text-[clamp(44px,4.6vw,90px)] font-bold leading-[1.05] tracking-[-0.05em]">
          <span className="text-branco">estrutura</span>
          <span className="text-violeta drop-shadow-[0_0_10px_#7029d9]">.</span>
        </p>
        <span data-intro="divider" className="mt-3 block h-px w-12 bg-branco/70 lg:mt-4" />
        <p data-intro="text" className="mt-3 max-w-[330px] text-sm leading-[1.5] text-branco/75 md:max-w-[420px] md:text-base lg:mt-4 lg:max-w-[19em] lg:text-[clamp(14px,1.05vw,19px)]">
          Desenvolvemos sites, sistemas e automações para transformar ideias em
          resultados.
        </p>
        <a
          data-intro="cta"
          href="#servicos"
          className="group mt-5 inline-flex items-center gap-6 rounded-2xl border border-roxo-luminoso/60 bg-gradient-to-r from-violeta to-[#7f3cf0] px-6 py-3 font-poppins text-sm font-medium text-branco shadow-[0_0_30px_rgba(112,41,217,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:shadow-[0_0_44px_rgba(164,91,255,0.75)] lg:mt-6 lg:px-7 lg:py-3.5 lg:text-[clamp(14px,0.95vw,17px)]"
        >
          Conheça nossos serviços
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 lg:size-5" />
        </a>
      </div>

    

      {/* Role para explorar */}
      <a
        data-intro="scroll"
        href="#servicos"
        className="absolute bottom-0 left-[5.7%] z-10 hidden flex-col items-center gap-3 lg:flex"
      >
        <span className="flex size-11 items-center justify-center rounded-full border border-branco/70 text-branco transition hover:border-roxo-luminoso hover:text-lavanda">
          <ArrowDown className="size-5" />
        </span>
        <span className="font-poppins text-[10px] uppercase tracking-[0.28em] text-branco/75">
          Role para explorar
        </span>
        <span className="relative mt-1 h-[8vh] w-px overflow-hidden bg-branco/15">
          <span className="absolute inset-0 animate-scroll-line bg-branco" />
          <span className="absolute left-1/2 top-0 size-1 -translate-x-1/2 rounded-full bg-branco" />
        </span>
      </a>
    </section>
  );
}
