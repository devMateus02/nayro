import type { Metadata } from "next";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Process from "@/components/Process";
import SmoothScroll from "@/components/SmoothScroll";
import ProjectsGallery from "@/components/projetos/ProjectsGallery";
import ProjetosHero from "@/components/projetos/ProjetosHero";
import { breadcrumbLd, pageMetadata, projectsListLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { PROCESS } from "@/lib/content";
import { getProjects } from "@/lib/projects-data";

export const metadata: Metadata = pageMetadata({
  title: "Projetos e portfólio",
  description:
    "Conheça projetos da NAYRO: sites institucionais, landing pages, sistemas de reservas, aplicativos e plataformas desenvolvidos sob medida para cada cliente.",
  path: "/projetos",
});

export default async function ProjetosPage() {
  const projects = await getProjects();

  return (
    <main>
      <JsonLd data={[projectsListLd(projects), breadcrumbLd([{ name: "Projetos", path: "/projetos" }])]} />
      {/* Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger */}
      <SmoothScroll />
      <Navbar />
      <ProjetosHero projects={projects} />
      <ProjectsGallery projects={projects} />
      <Process
        eyebrow="Como trabalhamos"
        title={
          <>
            Da ideia ao projeto
            {" "}<br />
            no ar, com <span className="text-roxo-luminoso">clareza e transparência.</span>
          </>
        }
        steps={[...PROCESS]}
      />
      <div className="pb-24 lg:pb-28">
        <CtaBanner
          eyebrow="Vamos construir o próximo?"
          title={
            <>
              Tem um projeto em mente?
              {" "}<br />
              Vamos <span className="text-roxo-luminoso">tirar do papel.</span>
            </>
          }
          text="Fale com a nossa equipe e descubra como a Nayro pode transformar a sua ideia em um projeto real."
        />
      </div>
      <Footer home={false} />
    </main>
  );
}
