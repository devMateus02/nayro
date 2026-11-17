import type { Metadata } from "next";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import Diferenciais from "@/components/sobre/Diferenciais";
import Historia from "@/components/sobre/Historia";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import SobreHero from "@/components/sobre/SobreHero";

const ABOUT_DESCRIPTION =
  "Conheça a NAYRO, empresa de desenvolvimento de soluções digitais: nossa história, missão, visão, valores e o que nos diferencia em cada projeto.";

export const metadata: Metadata = pageMetadata({
  title: "Sobre nós",
  description: ABOUT_DESCRIPTION,
  path: "/sobre",
});

export default function SobrePage() {
  return (
    <main>
      <JsonLd data={[webPageLd({ type: "AboutPage", name: "Sobre a NAYRO", description: ABOUT_DESCRIPTION, path: "/sobre" }), breadcrumbLd([{ name: "Sobre", path: "/sobre" }])]} />
      {/* Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger */}
      <SmoothScroll />
      <Navbar />
      <SobreHero />
      <Historia />
      <Diferenciais />
      <div className="pb-24 lg:pb-28">
        <CtaBanner
          eyebrow="Vamos conversar?"
          title={
            <>
              Vamos construir
              {" "}<br />
              juntos o seu <span className="text-roxo-luminoso">próximo</span>
              {" "}<br />
              <span className="text-roxo-luminoso">projeto?</span>
            </>
          }
          text="Conte com a NAYRO para transformar sua ideia em uma solução digital de verdade."
          image="/images/sobre-cta.webp"
          imagePosition="center 55%"
          imageLayout="side"
        />
      </div>
      <Footer home={false} />
    </main>
  );
}
