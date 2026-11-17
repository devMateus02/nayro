// Endereço oficial do site (Google, prévias de link e sitemap)
export const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "NAYRO";
export const SITE_DESCRIPTION =
  "A NAYRO desenvolve sites, landing pages, sistemas web, aplicativos, lojas virtuais e automações sob medida para transformar ideias em resultados.";
