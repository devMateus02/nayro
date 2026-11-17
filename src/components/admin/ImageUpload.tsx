"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";
import { UploadIcon } from "../icons";

const MAX_WIDTH = 2400;

/** Reduz para no máximo 2400 px de largura e converte para WebP antes de enviar (bem menor que PNG/JPG) */
async function toWebp(file: File): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const original = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  // Navegador sem WebP no canvas: manda o arquivo original (o servidor aceita JPG/PNG)
  if (!blob || blob.type !== "image/webp") return { file, ...original };
  return {
    file: new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" }),
    width: canvas.width,
    height: canvas.height,
  };
}

/** Botão de envio de imagens: converte, envia uma por vez e devolve os endereços (/media/...) */
export default function ImageUpload({
  label,
  multiple = false,
  disabled = false,
  onUploaded,
}: {
  label: string;
  multiple?: boolean;
  disabled?: boolean;
  onUploaded: (src: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ busy: boolean; error?: string; progress?: string }>({ busy: false });

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files];
    setStatus({ busy: true });
    for (const [i, file] of list.entries()) {
      setStatus({ busy: true, progress: list.length > 1 ? `${i + 1} de ${list.length}` : undefined });
      try {
        const data = new FormData();
        const image = await toWebp(file);
        data.append("file", image.file);
        // As medidas vão no nome do arquivo: o site sabe o formato da capa antes de carregar
        data.append("width", String(image.width));
        data.append("height", String(image.height));
        const result = await uploadImage(data);
        if ("error" in result) {
          setStatus({ busy: false, error: result.error });
          return;
        }
        onUploaded(result.src);
      } catch {
        setStatus({ busy: false, error: `Não foi possível ler "${file.name}". Use uma imagem JPG, PNG ou WebP.` });
        return;
      }
    }
    setStatus({ busy: false });
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled || status.busy}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-branco/20 px-4 py-2 font-poppins text-[13px] text-branco/85 transition hover:border-roxo-luminoso hover:text-branco disabled:opacity-50"
      >
        <UploadIcon className="size-4" />
        {status.busy ? `Enviando${status.progress ? ` ${status.progress}` : ""}…` : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple={multiple}
        hidden
        onChange={(e) => handle(e.target.files)}
      />
      {status.error && (
        <p role="alert" className="mt-2 text-[13px] text-red-300">
          {status.error}
        </p>
      )}
    </div>
  );
}
