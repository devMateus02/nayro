import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects-data";
import { SITE_URL } from "@/lib/site";

/** Mapa do site para o Google: páginas fixas + uma por projeto publicado */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/servicos`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/projetos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/contato`, changeFrequency: "yearly", priority: 0.8 },
  ];
  return [
    ...pages,
    ...projects.map((p) => ({
      url: `${SITE_URL}/projetos/${p.slug}`,
      ...(p.updatedAt ? { lastModified: p.updatedAt } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      // Capa do projeto no Google Imagens
      ...(p.cover ? { images: [`${SITE_URL}${p.cover}`] } : {}),
    })),
    ...["/privacidade", "/termos"].map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
