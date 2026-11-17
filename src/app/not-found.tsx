import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = { title: "Página não encontrada", robots: { index: false } };

/** 404: endereço que não existe (ou projeto que saiu do ar) */
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(112,41,217,0.3),transparent)] blur-2xl" />
      </div>
      <Link href="/" aria-label="NAYRO — início" className="absolute left-6 top-6 md:left-12 md:top-8">
        <Image src="/images/logo-navbar.webp" alt="NAYRO" width={2172} height={724} sizes="156px" className="-ml-3.5 h-11 w-auto md:h-[52px]" />
      </Link>

      <Image src="/images/logo-n.webp" alt="" width={1254} height={1254} sizes="160px" className="size-28 opacity-90 drop-shadow-[0_0_40px_rgba(164,91,255,0.45)] md:size-36" />
      <p className="mt-8 font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso">Erro 404</p>
      <h1 className="mt-4 font-poppins text-[clamp(30px,8vw,56px)] font-semibold leading-[1.08] tracking-[-0.025em] text-branco">
        Esta página <span className="text-roxo-luminoso">não existe.</span>
      </h1>
      <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-branco/70">
        O endereço pode ter mudado ou o conteúdo saiu do ar. Que tal voltar para o início ou ver os nossos projetos?
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 rounded-full bg-violeta px-6 py-3 font-poppins text-sm font-medium text-branco shadow-[0_0_24px_rgba(112,41,217,0.45)] transition hover:bg-[#7d34ea]"
        >
          Voltar ao início
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/projetos"
          className="inline-flex items-center rounded-full border border-branco/40 px-6 py-3 font-poppins text-sm font-medium text-branco transition hover:border-roxo-luminoso"
        >
          Ver projetos
        </Link>
      </div>
    </main>
  );
}
