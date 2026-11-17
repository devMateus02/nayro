import type { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import SmoothScroll from "./SmoothScroll";

/** Página de texto (política de privacidade, termos): título, data de atualização e seções */
export default function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: { title: string; body: ReactNode }[];
}) {
  return (
    <main>
      <SmoothScroll />
      <Navbar />
      <article className="relative isolate px-6 pb-24 pt-36 md:px-12 lg:pb-32 lg:pt-44">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[60vh] bg-[radial-gradient(60%_70%_at_50%_0%,rgba(112,41,217,0.22),transparent)]" />
        <div className="mx-auto max-w-[760px]">
          <p className="font-poppins text-[12px] font-medium uppercase tracking-[0.35em] text-roxo-luminoso lg:text-[13px]">{eyebrow}</p>
          <h1 className="mt-4 font-poppins text-[clamp(32px,9vw,44px)] font-semibold leading-[1.08] tracking-[-0.025em] text-branco lg:text-[56px]">{title}</h1>
          <p className="mt-4 text-[14px] text-branco/50">Atualizada em {updated}</p>

          <div className="mt-14 space-y-12">
            {sections.map((section, i) => (
              <section key={section.title}>
                <h2 className="font-poppins text-xl font-semibold text-branco">
                  <span className="mr-2 text-roxo-luminoso">{String(i + 1).padStart(2, "0")}</span>{" "}
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[16px] leading-[1.8] text-branco/75 [&_a]:text-lavanda [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
      <Footer home={false} />
    </main>
  );
}
