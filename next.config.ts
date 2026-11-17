import type { NextConfig } from "next";

const supabaseUrl = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // next/image entrega AVIF quando o navegador aceita (menor que WebP) e WebP nos demais
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Imagens do painel chegam pela action de envio (uma por vez, já em WebP; o limite real é 5 MB).
    // Vídeos não passam por aqui: vão direto para o Storage por /media-upload (envio assinado)
    serverActions: { bodySizeLimit: "6mb" },
  },
  // Imagens e vídeos dos projetos: o site entrega pelo próprio endereço (/media/...) o que está no Storage do
  // Supabase, sem expor o Supabase no navegador. /media-upload recebe o envio assinado de vídeos do painel
  // (só funciona com o token de uso único que a action createVideoUpload gera para um administrador).
  async rewrites() {
    if (!supabaseUrl) return [];
    return [
      { source: "/media/:path*", destination: `${supabaseUrl}/storage/v1/object/public/projetos/:path*` },
      { source: "/media-upload/:path*", destination: `${supabaseUrl}/storage/v1/object/upload/sign/projetos/:path*` },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
