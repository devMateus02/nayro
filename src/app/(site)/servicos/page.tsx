import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import CtaBanner from "@/components/CtaBanner";
import Faq from "@/components/servicos/Faq";
import Process from "@/components/Process";
import ServicesGrid from "@/components/servicos/ServicesGrid";
import { breadcrumbLd, faqLd, pageMetadata, servicesLd, webPageLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ServicosHero from "@/components/servicos/ServicosHero";
import { getServices } from "@/lib/services-data";

const SERVICES_DESCRIPTION =
  "Desenvolvimento de sites, landing pages, sistemas web sob medida, aplicativos, lojas virtuais e WordPress, com suporte contínuo depois da entrega.";

export const metadata: Metadata = pageMetadata({
  title: "Serviços: sites, sistemas, aplicativos e e-commerce",
  description: SERVICES_DESCRIPTION,
  path: "/servicos",
});

export default async function ServicosPage() {
  const services = await getServices();

  return (
    <main>
      <JsonLd data={[webPageLd({ name: "Serviços da NAYRO", description: SERVICES_DESCRIPTION, path: "/servicos" }), servicesLd(services), faqLd(), breadcrumbLd([{ name: "Serviços", path: "/servicos" }])]} />
      {/* Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger */}
      <SmoothScroll />
      <Navbar />
      <ServicosHero />
      <ServicesGrid services={services} />
      <Process
        eyebrow="Como funciona"
        title={
          <>
            Do planejamento
            {" "}<br />à entrega, <span className="text-roxo-luminoso">com você o tempo todo.</span>
          </>
        }
        steps={[
          { title: "Conversa", text: "Entendemos sua necessidade e objetivos." },
          { title: "Planejamento", text: "Definimos a melhor solução e o escopo." },
          { title: "Desenvolvimento", text: "Colocamos o projeto em prática com qualidade." },
          { title: "Entrega", text: "Seu projeto no ar, pronto para gerar resultados." },
        ]}
      />
      <CtaBanner
        eyebrow="Vamos conversar?"
        title={
          <>
            Transforme sua ideia
            {" "}<br />
            em um <span className="text-roxo-luminoso">projeto real.</span>
          </>
        }
        text="Conte com a Nayro para criar a solução ideal para o seu negócio."
      />
      <Faq />
      <Footer home={false} />
    </main>
  );
}
