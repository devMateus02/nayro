"use client";

import { useEffect, useRef, useState } from "react";
import { createVideoUpload } from "@/app/admin/actions";
import { VIDEO_LIMITS, VIDEO_TYPES } from "@/lib/media";
import { UploadIcon } from "../icons";

/** Maior lado do vídeo convertido (1920 = Full HD) */
const MAX_SIDE = 1920;
const MAX_FPS = 30;
/** Bits por pixel por quadro: ~2 Mbps em Full HD a 30 fps, o bastante para telas de site */
const BITS_PER_PIXEL = 0.035;
const AUDIO_BITRATE = 96_000;
/** Folga sobre o limite de 50 MB (o cabeçalho do arquivo e a variação do codificador) */
const SIZE_BUDGET = VIDEO_LIMITS.bytes * 0.88;

type Stage =
  | { kind: "idle" }
  | { kind: "reading" }
  | { kind: "convert"; progress: number }
  | { kind: "upload"; progress: number };

class UploadError extends Error {}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
const mb = (bytes: number) =>
  `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;

type Converted = {
  blob: Blob;
  converted: boolean;
  width?: number;
  height?: number;
  cropped?: boolean;
};

type Crop = { left: number; top: number; width: number; height: number };
type Mediabunny = typeof import("mediabunny");
type VideoTrack = NonNullable<
  Awaited<ReturnType<InstanceType<Mediabunny["Input"]>["getPrimaryVideoTrack"]>>
>;

/** Pixel "preto de gravação": as faixas ficam entre 0 e 5; um site escuro (ex.: #08070D) já passa de 10 */
const BLACK_MAX = 6;

/**
 * Procura faixas pretas nas bordas (comuns em gravações de tela) olhando 8 quadros espalhados pelo vídeo.
 * Devolve o recorte do conteúdo, ou null quando não há faixas que valham o corte.
 */
async function detectBorders(
  m: Mediabunny,
  track: VideoTrack,
  duration: number,
): Promise<Crop | null> {
  // Análise quase na resolução real (até 1280 px de largura): o corte fica preciso, sem sobrar linha preta
  const W = Math.min(track.displayWidth, 1280);
  const H = even((W * track.displayHeight) / track.displayWidth);
  const sink = new m.CanvasSink(track, { width: W, height: H, fit: "fill" });
  const work = document.createElement("canvas");
  work.width = W;
  work.height = H;
  const ctx = work.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const times = Array.from({ length: 8 }, (_, i) => (duration * (i + 0.5)) / 8);
  let top = H,
    bottom = -1,
    left = W,
    right = -1;
  for await (const frame of sink.canvasesAtTimestamps(times)) {
    if (!frame) continue;
    ctx.drawImage(frame.canvas, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);
    const rows = new Uint32Array(H);
    const cols = new Uint32Array(W);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (Math.max(data[i], data[i + 1], data[i + 2]) > BLACK_MAX) {
          rows[y]++;
          cols[x]++;
        }
      }
    }
    // Linha/coluna com conteúdo: mais de 0,5% dos pixels fora do preto
    const rowHas = (y: number) => rows[y] > W * 0.005;
    const colHas = (x: number) => cols[x] > H * 0.005;
    const t = rows.findIndex((_, y) => rowHas(y));
    if (t === -1) continue; // quadro todo preto (fade): não conta
    top = Math.min(top, t);
    for (let y = H - 1; y >= 0; y--)
      if (rowHas(y)) {
        bottom = Math.max(bottom, y);
        break;
      }
    for (let x = 0; x < W; x++)
      if (colHas(x)) {
        left = Math.min(left, x);
        break;
      }
    for (let x = W - 1; x >= 0; x--)
      if (colHas(x)) {
        right = Math.max(right, x);
        break;
      }
  }
  if (bottom < 0 || right < 0) return null;

  // Só corta faixas de verdade (1,5% ou mais) e nunca mais da metade da imagem
  const min = 0.015;
  const cut = [top / H, (H - 1 - bottom) / H, left / W, (W - 1 - right) / W];
  if (cut.every((c) => c < min)) return null;
  const sx = track.displayWidth / W;
  const sy = track.displayHeight / H;
  // Arredonda para dentro, com 4 px de folga: a borda entre a faixa e o conteúdo costuma ter um rastro escuro
  const ceilEven = (n: number) => Math.ceil(n / 2) * 2;
  const floorEven = (n: number) => Math.floor(n / 2) * 2;
  const crop = {
    left: cut[2] >= min ? ceilEven(left * sx + 4) : 0,
    top: cut[0] >= min ? ceilEven(top * sy + 4) : 0,
    width: 0,
    height: 0,
  };
  const r =
    cut[3] >= min
      ? Math.min(track.displayWidth, floorEven((right + 1) * sx - 4))
      : track.displayWidth;
  const b =
    cut[1] >= min
      ? Math.min(track.displayHeight, floorEven((bottom + 1) * sy - 4))
      : track.displayHeight;
  crop.width = r - crop.left;
  crop.height = b - crop.top;
  if (crop.width * crop.height < track.displayWidth * track.displayHeight * 0.5)
    return null;
  return crop;
}

/** Medidas de um vídeo que não passou pela conversão (lidas pelo próprio navegador) */
function probeVideo(file: Blob) {
  return new Promise<{ width: number; height: number } | null>((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (size: { width: number; height: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(size);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      done(
        video.videoWidth
          ? { width: video.videoWidth, height: video.videoHeight }
          : null,
      );
    video.onerror = () => done(null);
    video.src = url;
  });
}

/**
 * Converte para WebM (VP9 + Opus) no próprio navegador, com os codificadores do aparelho (WebCodecs):
 * tira as faixas pretas da gravação (se pedido), reduz para no máximo 1920 px e 30 fps e escolhe a taxa de bits
 * para caber em 50 MB.
 * Sem suporte no navegador, manda o original se já for MP4/WebM dentro dos limites.
 */
async function toWebm(
  file: File,
  trimBorders: boolean,
  onProgress: (p: number) => void,
  register: (cancel: () => Promise<void>) => void,
): Promise<Converted> {
  const original = async (reason: string): Promise<Converted> => {
    if (VIDEO_TYPES[file.type] && file.size <= VIDEO_LIMITS.bytes)
      return { blob: file, converted: false, ...(await probeVideo(file)) };
    throw new UploadError(
      `${reason} Use o Chrome ou o Edge, ou envie um MP4 de até 50 MB.`,
    );
  };
  if (typeof VideoEncoder === "undefined")
    return original("Este navegador não converte vídeos.");

  const m = await import("mediabunny");
  const input = new m.Input({
    source: new m.BlobSource(file),
    formats: m.ALL_FORMATS,
  });
  try {
    const track = await input.getPrimaryVideoTrack().catch(() => null);
    if (!track)
      throw new UploadError(
        `Não foi possível ler "${file.name}". Envie um vídeo MP4, MOV ou WebM.`,
      );
    if (!(await track.canDecode()))
      return original("Este navegador não consegue ler esse formato de vídeo.");

    const duration = await input.computeDuration();
    if (duration > VIDEO_LIMITS.seconds) {
      throw new UploadError(
        `O vídeo tem ${Math.round(duration)} s. Use até ${VIDEO_LIMITS.seconds / 60} minutos (o ideal é de 20 a 60 s).`,
      );
    }

    const crop = trimBorders
      ? await detectBorders(m, track, duration).catch(() => null)
      : null;
    const sourceW = crop?.width ?? track.displayWidth;
    const sourceH = crop?.height ?? track.displayHeight;
    const scale = Math.min(1, MAX_SIDE / Math.max(sourceW, sourceH));
    const width = even(sourceW * scale);
    const height = even(sourceH * scale);
    const stats = await track.computePacketStats(120).catch(() => null);
    const fps = Math.min(
      MAX_FPS,
      Math.round(stats?.averagePacketRate || MAX_FPS),
    );

    const codec = await m.getFirstEncodableVideoCodec(["vp9", "vp8"], {
      width,
      height,
    });
    if (!codec) return original("Este navegador não gera vídeos WebM.");

    const audio =
      (await input.getPrimaryAudioTrack()) && (await m.canEncodeAudio("opus"));
    const ideal = width * height * fps * BITS_PER_PIXEL;
    const fits =
      (SIZE_BUDGET * 8) / Math.max(duration, 1) - (audio ? AUDIO_BITRATE : 0);
    const bitrate = Math.round(Math.min(ideal, fits));
    if (bitrate < 400_000)
      throw new UploadError(
        "O vídeo é longo demais para caber em 50 MB com boa qualidade. Envie um trecho mais curto.",
      );

    const output = new m.Output({
      format: new m.WebMOutputFormat(),
      target: new m.BufferTarget(),
    });
    const conversion = await m.Conversion.init({
      input,
      output,
      tracks: "primary",
      video: {
        ...(crop ? { crop } : {}),
        width,
        height,
        fit: "contain",
        codec,
        quality: new m.Quality({ bitrate }),
        frameRate: fps,
      },
      audio: audio
        ? { codec: "opus", quality: new m.Quality({ bitrate: AUDIO_BITRATE }) }
        : { discard: true },
      showWarnings: false,
    });
    if (
      !conversion.isValid ||
      !conversion.utilizedTracks.some((t) => t.isVideoTrack())
    ) {
      return original("Não foi possível converter esse vídeo.");
    }
    register(() => conversion.cancel());
    conversion.onProgress = (p) => onProgress(p);
    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer) throw new UploadError("A conversão falhou. Tente de novo.");
    return {
      blob: new Blob([buffer], { type: "video/webm" }),
      converted: true,
      width,
      height,
      cropped: Boolean(crop),
    };
  } finally {
    input.dispose();
  }
}

/** Envia direto para o Storage (pelo endereço do site), com progresso */
function put(
  url: string,
  blob: Blob,
  onProgress: (p: number) => void,
  register: (abort: () => void) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    register(() => xhr.abort());
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", blob.type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status < 300
        ? resolve()
        : reject(
            new UploadError(
              "O envio foi recusado pelo armazenamento. Tente de novo.",
            ),
          );
    xhr.onerror = () =>
      reject(new UploadError("A conexão caiu durante o envio. Tente de novo."));
    xhr.onabort = () => reject(new DOMException("Cancelado", "AbortError"));
    xhr.send(blob);
  });
}

/** Botão de envio do vídeo do projeto: converte para WebM, envia e devolve o endereço (/media/....webm) */
export default function VideoUpload({
  label,
  onUploaded,
}: {
  label: string;
  onUploaded: (src: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<(() => unknown) | null>(null);
  const canceled = useRef(false);
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [trimBorders, setTrimBorders] = useState(true);
  const busy = stage.kind !== "idle";

  // Avisa antes de sair da página no meio da conversão ou do envio
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  async function handle(file: File | undefined) {
    if (input.current) input.current.value = "";
    if (!file) return;
    setError(null);
    setInfo(null);
    canceled.current = false;
    setStage({ kind: "reading" });
    try {
      const { blob, converted, width, height, cropped } = await toWebm(
        file,
        trimBorders,
        (progress) => setStage({ kind: "convert", progress }),
        (cancel) => (cancelRef.current = cancel),
      );
      if (canceled.current) return;
      const ticket = await createVideoUpload(
        blob.type,
        blob.size,
        width,
        height,
      );
      if ("error" in ticket) throw new UploadError(ticket.error);
      setStage({ kind: "upload", progress: 0 });
      await put(
        ticket.upload,
        blob,
        (progress) => setStage({ kind: "upload", progress }),
        (abort) => (cancelRef.current = abort),
      );
      onUploaded(ticket.src);
      setInfo(
        converted
          ? `Convertido para WebM: ${mb(blob.size)} (o original tinha ${mb(file.size)})${cropped ? ", sem as faixas pretas da gravação" : ""}.`
          : `Enviado sem conversão: ${mb(blob.size)}.`,
      );
    } catch (e) {
      if (!canceled.current) {
        console.error(e);
        setError(
          e instanceof UploadError
            ? e.message
            : `Não foi possível converter "${file.name}". Tente outro arquivo (MP4, MOV ou WebM).`,
        );
      }
    } finally {
      cancelRef.current = null;
      setStage({ kind: "idle" });
    }
  }

  const progress =
    stage.kind === "convert" || stage.kind === "upload" ? stage.progress : 0;
  const status =
    stage.kind === "reading"
      ? "Lendo o vídeo…"
      : stage.kind === "convert"
        ? `Convertendo para WebM… ${Math.round(progress * 100)}%`
        : stage.kind === "upload"
          ? `Enviando… ${Math.round(progress * 100)}%`
          : null;

  return (
    <div>
      {busy ? (
        <div className="max-w-md" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-4">
            <p className="font-poppins text-[13px] text-branco/85">{status}</p>
            <button
              type="button"
              onClick={() => {
                canceled.current = true;
                cancelRef.current?.();
              }}
              className="font-poppins text-[12px] text-branco/55 transition-colors hover:text-branco"
            >
              Cancelar
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-branco/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#7029D9,#A45BFF)] transition-[width] duration-300"
              style={{ width: `${Math.max(3, progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-branco/40">
            Mantenha esta aba aberta até terminar.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-branco/20 px-4 py-2 font-poppins text-[13px] text-branco/85 transition hover:border-roxo-luminoso hover:text-branco"
          >
            <UploadIcon className="size-4" />
            {label}
          </button>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-branco/60">
            <input
              type="checkbox"
              checked={trimBorders}
              onChange={(e) => setTrimBorders(e.target.checked)}
              className="size-4 accent-violeta"
            />
            Remover faixas pretas da gravação
          </label>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mov,.mkv"
        hidden
        onChange={(e) => handle(e.target.files?.[0])}
      />
      {info && <p className="mt-2 text-[13px] text-lavanda/80">{info}</p>}
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
