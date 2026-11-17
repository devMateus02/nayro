// Projetos do portfólio: tipos e categorias (usados no site e no painel).
// Os projetos em si ficam no banco (Supabase, via Prisma) e são cadastrados em /admin.

export const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "sites", label: "Sites e Landings" },
  { id: "sistemas", label: "Sistemas Web" },
  { id: "apps", label: "Aplicativos" },
  { id: "ecommerce", label: "E-commerce" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type ProjectCategory = Exclude<CategoryId, "todos">;

export const PROJECT_CATEGORIES = CATEGORIES.filter((c): c is (typeof CATEGORIES)[number] & { id: ProjectCategory } => c.id !== "todos");

export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** Desenho da tela ilustrativa (enquanto não há captura real) */
export type ScreenScene = "portrait" | "mountains" | "pin" | "posters" | "gallery";

export type ProjectScreenSpec = {
  scene: ScreenScene;
  /** Nome no topo do site ilustrado */
  brand: string;
  headline: string[];
  background: string;
  accent: string;
};

export type Project = {
  slug: string;
  name: string;
  /** Resumo curto (cartões e topo da página do projeto) */
  description: string;
  /** Texto da página do projeto: parágrafos separados por linha em branco */
  content: string;
  categories: ProjectCategory[];
  tags: string[];
  client: string | null;
  year: number | null;
  url: string | null;
  /** Captura real da tela (no lugar da ilustração) */
  cover: string | null;
  /** Vídeo que toca no quadro de navegador da página do projeto */
  video: string | null;
  screen: ProjectScreenSpec | null;
  featured: boolean;
  /** Última alteração (ISO), para o sitemap e os dados estruturados */
  updatedAt?: string;
};

/** Endereço da página de um projeto */
export const projectHref = (slug: string) => `/projetos/${slug}`;

/** Tela ilustrativa padrão para projetos novos sem capa */
export const defaultScreen = (name: string): ProjectScreenSpec => ({
  scene: "portrait",
  brand: name,
  headline: [name],
  background: "radial-gradient(90% 120% at 80% 30%, #3a1670, #0d0712 70%)",
  accent: "#a45bff",
});
