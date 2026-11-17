import Image from "next/image";
import { defaultScreen, type Project } from "@/lib/projects";

// Cores dos blocos das cenas de pôsteres e galeria
const POSTERS = [
  "linear-gradient(160deg,#7a1f2b,#1b0a10)",
  "linear-gradient(160deg,#2b4a7a,#0a1220)",
  "linear-gradient(160deg,#a8743a,#2a1608)",
  "linear-gradient(160deg,#3d6b4a,#0c1a10)",
  "linear-gradient(160deg,#5b2a7a,#140a20)",
  "linear-gradient(160deg,#8a3b2a,#200c08)",
];
const TILES = [
  "linear-gradient(180deg,#f2a65a,#7a2e3a)",
  "linear-gradient(180deg,#9ac7e8,#3a6f9a 60%,#1c3550)",
  "linear-gradient(180deg,#d68fb8,#5a2a6e)",
  "linear-gradient(180deg,#f7c873,#c2563a)",
  "linear-gradient(180deg,#7fb8a8,#2c5a5a)",
  "linear-gradient(180deg,#a7a2e6,#3d3480)",
];

/** Barra de navegação genérica do site ilustrado */
function SiteNav({ name, accent, light }: { name: string; accent: string; light?: boolean }) {
  return (
    <div className="absolute inset-x-[4cqw] top-[3cqw] flex items-center justify-between">
      <div className="flex items-center gap-[1cqw]">
        <span className="size-[2.6cqw] rounded-[0.6cqw]" style={{ background: accent }} />
        <span className={`text-[1.6cqw] font-semibold ${light ? "text-[#1d0d06]" : ""}`}>{name}</span>
      </div>
      <div className="flex items-center gap-[2cqw]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-[0.5cqw] w-[4.5cqw] rounded-full ${light ? "bg-black/25" : "bg-white/35"}`} />
        ))}
        <span className="h-[2.6cqw] w-[9cqw] rounded-full" style={{ background: accent, opacity: 0.9 }} />
      </div>
    </div>
  );
}

/** Linhas de texto fictício */
function TextLines({ widths, light }: { widths: number[]; light?: boolean }) {
  return (
    <div className="mt-[1.6cqw] space-y-[0.9cqw]">
      {widths.map((w, i) => (
        <span key={i} className={`block h-[0.7cqw] rounded-full ${light ? "bg-black/25" : "bg-white/30"}`} style={{ width: `${w}cqw` }} />
      ))}
    </div>
  );
}

/** Montanhas em camadas, com neve no topo */
function Mountains() {
  return (
    <>
      <div
        className="absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(180deg,#e9f1fb,#7d93b3_25%,#2b3a55)]"
        style={{ clipPath: "polygon(0 70%, 14% 40%, 26% 58%, 42% 8%, 55% 45%, 66% 30%, 80% 55%, 92% 25%, 100% 45%, 100% 100%, 0 100%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[40%] bg-[linear-gradient(180deg,#3b4d6b,#141c2c)]"
        style={{ clipPath: "polygon(0 45%, 18% 20%, 34% 55%, 50% 30%, 68% 60%, 84% 28%, 100% 50%, 100% 100%, 0 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.5))]" />
    </>
  );
}

/**
 * Tela ilustrativa de um projeto (ou a captura real, quando houver).
 * Desenhada em unidades do contêiner (cqw), então se ajusta a qualquer tamanho.
 */
/**
 * Tela do projeto: a capa enviada no painel ou, sem capa, uma ilustração.
 * fit="contain" mostra a capa inteira (sem cortar as laterais) quando ela tem outro formato que a tela,
 * e preenche a sobra com a própria capa desfocada ao fundo.
 */
export default function ProjectScreen({
  project,
  sizes,
  fit = "cover",
}: {
  project: Pick<Project, "name" | "cover" | "screen">;
  sizes: string;
  fit?: "cover" | "contain";
}) {
  if (project.cover) {
    const alt = `Tela do projeto ${project.name}`;
    if (fit === "cover") return <Image src={project.cover} alt={alt} fill sizes={sizes} className="object-cover object-top" />;
    return (
      <div className="relative size-full overflow-hidden bg-[#0b0a10]">
        {/* Fundo: a capa em tamanho pequeno, ampliada e desfocada (leve de carregar) */}
        <Image src={project.cover} alt="" aria-hidden fill sizes="96px" className="scale-125 object-cover opacity-70 blur-xl saturate-150" />
        <div aria-hidden className="absolute inset-0 bg-[#08070d]/35" />
        <Image src={project.cover} alt={alt} fill sizes={sizes} className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]" />
      </div>
    );
  }

  const { scene, brand, headline, background, accent } = project.screen ?? defaultScreen(project.name);

  return (
    <div aria-hidden className="@container relative size-full overflow-hidden font-poppins text-white" style={{ background }}>
      {scene === "portrait" && (
        <>
          <div className="absolute right-[10cqw] top-[12cqw] size-[30cqw] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(240,122,58,0.55),rgba(164,91,255,0.25)_45%,transparent_70%)] blur-[1cqw]" />
          <div className="absolute right-[15cqw] top-[16cqw] size-[20cqw] rounded-full border border-white/15 bg-[radial-gradient(circle_at_35%_30%,#f3c6a5,#9b5a49_45%,#2a1220_80%)] shadow-[0_0_6cqw_rgba(240,122,58,0.35)]" />
          <SiteNav name={brand} accent={accent} />
          <div className="absolute left-[5cqw] top-[18cqw] w-[44cqw]">
            <p className="text-[5.2cqw] font-bold leading-[1.05] tracking-[-0.03em]">{headline[0]}</p>
            <TextLines widths={[34, 28]} />
            <div className="mt-[2.4cqw] flex gap-[1.2cqw]">
              <span className="h-[3.2cqw] w-[12cqw] rounded-[0.6cqw]" style={{ background: accent }} />
              <span className="h-[3.2cqw] w-[10cqw] rounded-[0.6cqw] border border-white/30" />
            </div>
          </div>
        </>
      )}

      {scene === "mountains" && (
        <>
          <Mountains />
          <SiteNav name={brand} accent="rgba(255,255,255,0.85)" />
          <div className="absolute inset-x-0 top-[17cqw] text-center">
            {headline.map((line) => (
              <p key={line} className="text-[5cqw] font-bold leading-[1.1] tracking-[-0.02em] [text-shadow:0_0.4cqw_2cqw_rgba(0,0,0,0.35)]">
                {line}
              </p>
            ))}
            <span className="mx-auto mt-[1.6cqw] block h-[0.7cqw] w-[30cqw] rounded-full bg-white/50" />
            <span className="mx-auto mt-[2.2cqw] block h-[3cqw] w-[14cqw] rounded-full bg-white/90" />
          </div>
        </>
      )}

      {scene === "pin" && (
        <>
          {/* Silhueta da cidade */}
          <div className="absolute inset-x-0 bottom-0 flex h-[30%] items-end gap-[0.8cqw] px-[2cqw] opacity-50">
            {[50, 80, 40, 95, 60, 70, 35, 85, 55, 75, 45, 90, 60, 40].map((h, i) => (
              <span key={i} className="flex-1 rounded-t-[0.4cqw] bg-[#5a1a08]" style={{ height: `${h}%` }} />
            ))}
          </div>
          <SiteNav name={brand} accent="#1d0d06" light />
          <div className="absolute left-[5cqw] top-[16cqw] w-[46cqw]">
            {headline.map((line) => (
              <p key={line} className="text-[6cqw] font-bold leading-[1] tracking-[-0.03em]">
                {line}
              </p>
            ))}
            <TextLines widths={[32, 24]} light />
          </div>
          {/* Pin de mapa com brilho */}
          <div className="absolute right-[14cqw] top-[14cqw] size-[22cqw] rounded-full bg-[radial-gradient(closest-side,rgba(255,220,180,0.6),transparent)]" />
          <div className="absolute right-[19cqw] top-[17cqw] flex size-[12cqw] rotate-45 items-center justify-center rounded-[50%_50%_0_50%] bg-[#2a0f08] shadow-[0_1cqw_3cqw_rgba(0,0,0,0.4)]">
            <span className="size-[4.5cqw] rounded-full bg-[#ff8a2b]" />
          </div>
        </>
      )}

      {scene === "posters" && (
        <>
          <div className="absolute inset-x-[4cqw] top-[3cqw] flex items-center gap-[3cqw]">
            <span className="h-[2.4cqw] w-[8cqw] rounded-[0.3cqw]" style={{ background: accent }} />
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-[0.5cqw] w-[4cqw] rounded-full bg-white/30" />
            ))}
          </div>
          <div className="absolute inset-x-[4cqw] top-[10cqw]">
            <p className="text-[2cqw] font-semibold">{headline[0]}</p>
            {[0, 1].map((row) => (
              <div key={row} className="mt-[1.6cqw] grid grid-cols-6 gap-[1.2cqw]">
                {POSTERS.map((_, i) => (
                  <span
                    key={i}
                    className="aspect-[2/3] rounded-[0.6cqw] shadow-[0_0.6cqw_1.6cqw_rgba(0,0,0,0.5)]"
                    style={{ background: POSTERS[(i + row * 3) % POSTERS.length] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {scene === "gallery" && (
        <>
          <SiteNav name={brand} accent={accent} />
          <div className="absolute inset-x-[6cqw] top-[11cqw]">
            <p className="text-[2.4cqw] font-semibold">Suas imagens na nuvem</p>
            <div className="mt-[2cqw] grid grid-cols-3 gap-[1.6cqw]">
              {TILES.map((bg, i) => (
                <span key={i} className="aspect-[16/10] rounded-[0.8cqw] shadow-[0_0.6cqw_1.6cqw_rgba(0,0,0,0.5)]" style={{ background: bg }} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
