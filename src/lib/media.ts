// Imagens e vídeos enviados pelo painel: ficam no Storage do Supabase (bucket "projetos"), mas o site os entrega
// pelo próprio endereço, em /media/... (reescrita no next.config), sem expor o Supabase no navegador.
export const MEDIA_BUCKET = "projetos";
export const MEDIA_PREFIX = "/media/";
/** Envio assinado de vídeos (vai direto para o Storage, sem passar pela action) */
export const MEDIA_UPLOAD_PREFIX = "/media-upload/";

/** Vídeo: até 50 MB (limite por arquivo do plano gratuito do Supabase) e até 3 minutos */
export const VIDEO_LIMITS = { bytes: 50 * 1024 * 1024, seconds: 180 };
export const VIDEO_TYPES: Record<string, string> = { "video/webm": "webm", "video/mp4": "mp4" };

/** Caminho do arquivo no bucket a partir do endereço público (/media/...) */
export const mediaPath = (src: string) => (src.startsWith(MEDIA_PREFIX) ? src.slice(MEDIA_PREFIX.length) : null);

/** Endereço aceito para imagens de projeto: enviado pelo painel ou do próprio site (/images/...) */
export const isProjectImage = (src: string) => /^\/(media|images)\/[\w./-]+\.(webp|png|jpe?g|avif)$/i.test(src) && !src.includes("..");

/** Endereço aceito para o vídeo do projeto: enviado pelo painel */
export const isProjectVideo = (src: string) => /^\/media\/[\w./-]+\.(webm|mp4)$/i.test(src) && !src.includes("..");

/** Tipo do arquivo pelo endereço (para o <source type>) */
export const videoType = (src: string) => (src.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/webm");

/** Medidas válidas para gravar no nome do arquivo (evita valores absurdos vindos do navegador) */
export const validSize = (w: unknown, h: unknown) =>
  Number.isInteger(w) && Number.isInteger(h) && (w as number) >= 16 && (h as number) >= 16 && (w as number) <= 10000 && (h as number) <= 10000;

/**
 * Largura e altura gravadas no nome do arquivo pelo painel (ex.: /media/2026/<id>-1366x607.webp).
 * Assim o site sabe o formato da imagem ou do vídeo antes de carregar, e a página não "pula".
 */
export function mediaSize(src: string | null | undefined): { width: number; height: number } | null {
  const match = src?.match(/-(\d{2,5})x(\d{2,5})\.\w+$/);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}
