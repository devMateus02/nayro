import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Robôs de IA (buscas e assistentes): liberados de forma explícita para que o site possa ser lido e citado
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // O painel fica fora do Google e das IAs
      { userAgent: "*", allow: "/", disallow: "/admin" },
      { userAgent: AI_BOTS, allow: "/", disallow: "/admin" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
