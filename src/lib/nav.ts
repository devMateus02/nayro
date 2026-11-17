// Seções da home usadas na navbar e no rodapé
export const SECTIONS = [
  { hash: "#inicio", label: "Início" },
  { hash: "#servicos", label: "Serviços" },
  { hash: "#projetos", label: "Projetos" },
  { hash: "#sobre", label: "Sobre" },
  { hash: "#contato", label: "Contato" },
];

export const SERVICES_PAGE = "/servicos";
export const PROJECTS_PAGE = "/projetos";
const ABOUT_PAGE = "/sobre";
export const CONTACT_PAGE = "/contato";

// Seções que têm página própria: o link leva sempre à página (inclusive na home)
const PAGES: Record<string, string> = {
  "#servicos": SERVICES_PAGE,
  "#projetos": PROJECTS_PAGE,
  "#sobre": ABOUT_PAGE,
  "#contato": CONTACT_PAGE,
};

/** Endereço de um link: a página própria, quando existe; senão a seção (na home rola até ela, fora dela leva à home) */
export function navHref(hash: string, home: boolean) {
  return PAGES[hash] ?? (home ? hash : `/${hash}`);
}

/**
 * Elemento visível com o seletor dado. O Next mantém as páginas já visitadas escondidas no documento,
 * então um id (ex.: #contato) pode existir mais de uma vez; só vale o da página na tela.
 */
export function findVisible(selector: string) {
  return [...document.querySelectorAll<HTMLElement>(selector)].find((el) => el.getClientRects().length > 0) ?? null;
}
