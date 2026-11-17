import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import ProjectDetail from "@/components/projetos/ProjectDetail";
import JsonLd from "@/components/JsonLd";
import { categoryLabel } from "@/lib/projects";
import { getProject, getProjects } from "@/lib/projects-data";
import { breadcrumbLd, pageMetadata, projectLd } from "@/lib/seo";

// Endereço usado só quando não há nenhum projeto (o Next exige ao menos um na geração estática)
const PLACEHOLDER_SLUG = "em-breve";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/projetos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProject(slug);
  if (!found) return { title: "Projeto não encontrado", robots: { index: false } };
  const { project } = found;
  return pageMetadata({
    title: `${project.name}: ${project.categories.map(categoryLabel).join(", ")}`,
    description: project.description,
    path: `/projetos/${project.slug}`,
    // Capa do projeto na prévia de link; sem capa, a imagem padrão do site
    image: project.cover ? { url: project.cover, alt: `Tela do projeto ${project.name}` } : undefined,
  });
}

async function ProjectContent({ params }: Pick<PageProps<"/projetos/[slug]">, "params">) {
  const { slug } = await params;
  const found = await getProject(slug);
  if (!found) notFound();
  const { project, next } = found;
  return (
    <>
      <JsonLd
        data={[
          projectLd(project),
          breadcrumbLd([
            { name: "Projetos", path: "/projetos" },
            { name: project.name, path: `/projetos/${project.slug}` },
          ]),
        ]}
      />
      <ProjectDetail project={project} next={next} />
    </>
  );
}

export default function ProjectPage({ params }: PageProps<"/projetos/[slug]">) {
  return (
    <main>
      {/* Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger */}
      <SmoothScroll />
      <Navbar />
      {/* Projetos novos (fora da geração estática) aparecem na hora e são guardados depois da primeira visita */}
      <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
        <ProjectContent params={params} />
      </Suspense>
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
