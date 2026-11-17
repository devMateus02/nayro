// Serviços: tipos e ícones disponíveis (usados no site e no painel). Os serviços em si ficam no banco (/admin/servicos).

export const SERVICE_ICONS = [
  { id: "code", label: "Código" },
  { id: "phone", label: "Celular" },
  { id: "bag", label: "Sacola" },
  { id: "layers", label: "Camadas" },
  { id: "wordpress", label: "WordPress" },
  { id: "headset", label: "Suporte" },
  { id: "bolt", label: "Raio" },
  { id: "target", label: "Alvo" },
  { id: "rocket", label: "Foguete" },
  { id: "chat", label: "Conversa" },
  { id: "monitor", label: "Monitor" },
  { id: "shield", label: "Escudo" },
  { id: "users", label: "Pessoas" },
  { id: "gem", label: "Joia" },
] as const;

export type ServiceIcon = (typeof SERVICE_ICONS)[number]["id"];

export type Service = {
  name: string;
  /** Texto curto do cartão em /servicos */
  summary: string;
  /** Texto da seção de destaque da home */
  description: string;
  icon: ServiceIcon;
  featured: boolean;
};

/** Nome em duas linhas para a home: tudo menos a última palavra / a última palavra (em roxo) */
export function serviceTitleLines(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return [name, ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}
