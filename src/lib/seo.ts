// SEO: metadados por página e dados estruturados (JSON-LD) para o Google e as IAs
import type { Metadata } from "next";
import { INSTAGRAM_URL, PHONE_LABEL, WHATSAPP_URL } from "./contact";
import { FAQ } from "./content";
import { categoryLabel, projectHref, type Project } from "./projects";
import type { Service } from "./services";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

export const DEFAULT_OG_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: "NAYRO: tecnologia para que ideias ganhem estrutura" };

/**
 * Metadados de uma página: título, descrição, endereço canônico e prévia de link.
 * (O openGraph de uma página substitui o do layout inteiro, por isso ele é montado completo aqui.)
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; width?: number; height?: number; alt?: string };
}): Metadata {
  const images = [image ?? DEFAULT_OG_IMAGE];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "pt_BR", siteName: SITE_NAME, title: `${title} | ${SITE_NAME}`, description, url: path, images },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: images.map((i) => i.url) },
  };
}

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);
const ORG_ID = `${SITE_URL}/#organizacao`;
const SITE_ID = `${SITE_URL}/#site`;

/** A empresa: nome, logo, contato e o que ela faz */
export function organizationLd(services: Service[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: abs("/icon.png"), width: 192, height: 192 },
    image: abs(DEFAULT_OG_IMAGE.url),
    description: SITE_DESCRIPTION,
    slogan: "Tecnologia para que ideias ganhem estrutura.",
    telephone: PHONE_LABEL.replace(/[^\d+]/g, ""),
    // Perfis oficiais: ajudam o Google e as IAs a ligar o site à marca
    sameAs: [INSTAGRAM_URL],
    areaServed: { "@type": "Country", name: "Brasil" },
    knowsLanguage: "pt-BR",
    knowsAbout: [
      "Desenvolvimento de sites",
      "Landing pages",
      "Sistemas web sob medida",
      "Aplicativos mobile",
      "E-commerce",
      "WordPress",
      "Automações e integrações",
      "Next.js",
      "React",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: WHATSAPP_URL,
      telephone: PHONE_LABEL.replace(/[^\d+]/g, ""),
      availableLanguage: "Portuguese",
      areaServed: "BR",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços NAYRO",
      itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, description: s.summary } })),
    },
  };
}

/** O site em si (ligado à empresa) */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "pt-BR",
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORG_ID },
  };
}

/** Trilha de navegação (Início › Projetos › Nome) */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Início", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/** Página comum (Sobre, Contato…) ligada ao site e à empresa */
export function webPageLd({ type = "WebPage", name, description, path }: { type?: string; name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${abs(path)}#pagina`,
    url: abs(path),
    name,
    description,
    inLanguage: "pt-BR",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
  };
}

/** Perguntas frequentes (as mesmas da tela) */
export function faqLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

/** Serviços oferecidos, cada um ligado à empresa */
export function servicesLd(services: Service[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Serviços da NAYRO",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Service", name: s.name, description: s.description || s.summary, provider: { "@id": ORG_ID }, areaServed: { "@type": "Country", name: "Brasil" } },
    })),
  };
}

/** Projeto do portfólio */
export function projectLd(project: Project) {
  const url = abs(projectHref(project.slug));
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#projeto`,
    url,
    name: project.name,
    headline: project.name,
    description: project.description,
    abstract: project.content || project.description,
    inLanguage: "pt-BR",
    genre: project.categories.map(categoryLabel),
    keywords: project.tags.join(", "),
    image: abs(project.cover ?? DEFAULT_OG_IMAGE.url),
    creator: { "@id": ORG_ID },
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.client ? { sourceOrganization: { "@type": "Organization", name: project.client } } : {}),
    ...(project.url ? { sameAs: project.url } : {}),
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
    // Vídeo do projeto (o Google pede miniatura e data: usa a capa e a última alteração)
    ...(project.video
      ? {
          video: {
            "@type": "VideoObject",
            name: `${project.name}: vídeo do projeto`,
            description: project.description,
            contentUrl: abs(project.video),
            thumbnailUrl: abs(project.cover ?? DEFAULT_OG_IMAGE.url),
            ...(project.updatedAt ? { uploadDate: project.updatedAt } : {}),
            inLanguage: "pt-BR",
          },
        }
      : {}),
  };
}

/** Lista de projetos (página de portfólio) */
export function projectsListLd(projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${abs("/projetos")}#pagina`,
    url: abs("/projetos"),
    name: "Projetos da NAYRO",
    inLanguage: "pt-BR",
    isPartOf: { "@id": SITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(projectHref(p.slug)), name: p.name })),
    },
  };
}
