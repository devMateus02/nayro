import type { Metadata } from "next";
import Cta from "@/components/Cta";
import FloatingN from "@/components/FloatingN";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import IntroAnimations from "@/components/IntroAnimations";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import SmoothScroll from "@/components/SmoothScroll";
import WhyNayro from "@/components/WhyNayro";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION } from "@/lib/site";
import { getFeaturedProjects } from "@/lib/projects-data";
import { getFeaturedServices } from "@/lib/services-data";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Desenvolvimento de sites, sistemas e automações",
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: "NAYRO | Desenvolvimento de sites, sistemas e automações" },
};

export default async function Home() {
  // Projetos e serviços em destaque (cache: atualiza quando o painel salva)
  const [projects, services] = await Promise.all([getFeaturedProjects(), getFeaturedServices()]);

  return (
    <main>
      {/* Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger */}
      <SmoothScroll />
      <Navbar />
      <Hero />
      <Services services={services} />
      <Projects projects={projects} />
      <WhyNayro />
      <Cta />
      {/* Símbolo N 3D: viaja da Hero até a seção de serviços conforme a rolagem */}
      <FloatingN />
      <IntroAnimations />
      <Footer />
    </main>
  );
}
