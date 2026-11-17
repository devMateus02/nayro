import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/site";

/** Manifesto do site (nome, cores e ícone ao salvar na tela inicial do celular) */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NAYRO",
    short_name: "NAYRO",
    description: SITE_DESCRIPTION,
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#08070D",
    theme_color: "#08070D",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
