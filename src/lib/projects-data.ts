import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Project as ProjectRow } from "@/generated/prisma/client";
import { db } from "./db";
import type { Project, ProjectCategory, ProjectScreenSpec } from "./projects";

/** Etiqueta do cache dos projetos: o painel a invalida a cada alteração */
export const PROJECTS_TAG = "projects";

/** Linha do banco → projeto usado pelas telas */
function toProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    content: row.content,
    categories: row.categories as ProjectCategory[],
    tags: row.tags,
    client: row.client,
    year: row.year,
    url: row.url,
    cover: row.cover,
    video: row.video,
    screen: (row.screen as ProjectScreenSpec | null) ?? null,
    featured: row.featured,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Projetos publicados, na ordem definida no painel.
 * Fica em cache (entra na página estática) até o painel salvar uma alteração.
 */
export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag(PROJECTS_TAG);

  if (!db) {
    cacheLife("max");
    return [];
  }
  try {
    const rows = await db.project.findMany({ where: { published: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
    cacheLife("days");
    return rows.map(toProject);
  } catch (error) {
    // Banco fora do ar: a página sai sem projetos e tenta de novo em poucos minutos
    console.error("Projetos: falha ao ler o banco", error);
    cacheLife("minutes");
    return [];
  }
}

/** Projetos do carrossel da home: os marcados como destaque (ou os primeiros, se nenhum estiver marcado) */
export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  return (featured.length ? featured : projects).slice(0, 8);
}

/** Um projeto pelo endereço, com o seguinte da lista (para o "próximo projeto") */
export async function getProject(slug: string) {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  return { project: projects[index], next };
}
