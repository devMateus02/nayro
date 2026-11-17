import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { SERVICE_ICONS, type Service, type ServiceIcon } from "./services";

/** Etiqueta do cache dos serviços: o painel a invalida a cada alteração */
export const SERVICES_TAG = "services";

const isIcon = (icon: string): icon is ServiceIcon => SERVICE_ICONS.some((i) => i.id === icon);

/** Serviços publicados, na ordem do painel (em cache até o painel salvar uma alteração) */
export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag(SERVICES_TAG);

  if (!db) {
    cacheLife("max");
    return [];
  }
  try {
    const rows = await db.service.findMany({ where: { published: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
    cacheLife("days");
    return rows.map((r) => ({
      name: r.name,
      summary: r.summary,
      description: r.description || r.summary,
      icon: isIcon(r.icon) ? r.icon : "code",
      featured: r.featured,
    }));
  } catch (error) {
    console.error("Serviços: falha ao ler o banco", error);
    cacheLife("minutes");
    return [];
  }
}

/** Serviços da seção de destaque da home */
export async function getFeaturedServices() {
  return (await getServices()).filter((s) => s.featured);
}
