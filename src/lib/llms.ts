import "server-only";
import { INSTAGRAM_URL, PHONE_LABEL, WHATSAPP_URL } from "./contact";
import { ABOUT_SUMMARY, DIFFERENTIALS, FAQ, PILLARS, PROCESS } from "./content";
import { categoryLabel, projectHref } from "./projects";
import { getProjects } from "./projects-data";
import { getServices } from "./services-data";
import { SITE_DESCRIPTION, SITE_URL } from "./site";

/**
 * Resumo do site em Markdown para IAs (padrão llms.txt): quem é a NAYRO, o que faz, projetos e contato.
 * `full` inclui o texto completo de cada projeto e as respostas do FAQ (llms-full.txt).
 */
export async function buildLlmsTxt(full: boolean) {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  const url = (path: string) => `${SITE_URL}${path}`;
  const lines: string[] = [
    "# NAYRO",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${ABOUT_SUMMARY} Cuidamos do projeto do planejamento à publicação, com suporte depois da entrega.`,
    "",
    "## Páginas",
    "",
    `- [Início](${url("/")}): apresentação da NAYRO, serviços em destaque e projetos.`,
    `- [Serviços](${url("/servicos")}): o que desenvolvemos, como trabalhamos e perguntas frequentes.`,
    `- [Projetos](${url("/projetos")}): portfólio com sites, sistemas e aplicativos entregues.`,
    `- [Sobre](${url("/sobre")}): história, missão, visão, valores e diferenciais.`,
    `- [Contato](${url("/contato")}): formulário que abre o WhatsApp, WhatsApp direto e Instagram para pedir um orçamento.`,
    "",
    "## Serviços",
    "",
    ...services.map((s) => `- **${s.name}**: ${full ? s.description || s.summary : s.summary}`),
    "",
    "## Como trabalhamos",
    "",
    ...PROCESS.map((p, i) => `${i + 1}. **${p.title}**: ${p.text}`),
    "",
    "## Projetos",
    "",
    ...(projects.length
      ? projects.map((p) => `- [${p.name}](${url(projectHref(p.slug))}) (${p.categories.map(categoryLabel).join(", ")}): ${p.description}`)
      : [`Os projetos do portfólio estão em ${url("/projetos")}.`]),
    "",
  ];

  if (full && projects.length) {
    lines.push("## Projetos em detalhe", "");
    for (const p of projects) {
      lines.push(`### ${p.name}`, "");
      const facts = [
        `Categorias: ${p.categories.map(categoryLabel).join(", ")}`,
        p.tags.length ? `Tecnologias e entregas: ${p.tags.join(", ")}` : null,
        p.client ? `Cliente: ${p.client}` : null,
        p.year ? `Ano: ${p.year}` : null,
        p.url ? `No ar: ${p.url}` : null,
        `Página: ${url(projectHref(p.slug))}`,
      ].filter(Boolean);
      lines.push(...facts.map((f) => `- ${f}`), "", p.content || p.description, "");
    }
  }
  if (full) {
    lines.push("## Sobre a NAYRO", "", ...PILLARS.map((p) => `- **${p.title}**: ${p.text}`), "", "### Diferenciais", "");
    lines.push(...DIFFERENTIALS.map((d) => `- **${d.title}**: ${d.text}`), "");
  }

  lines.push("## Perguntas frequentes", "");
  for (const { q, a } of FAQ) lines.push(full ? `### ${q}\n\n${a}\n` : `- **${q}** ${a}`);
  if (!full) lines.push("");

  lines.push(
    "## Contato",
    "",
    `- WhatsApp: ${PHONE_LABEL} (${WHATSAPP_URL})`,
    `- Instagram: ${INSTAGRAM_URL}`,
    `- Formulário: ${url("/contato")}`,
    "",
    "## Opcional",
    "",
    full
      ? `- [Resumo deste arquivo](${url("/llms.txt")})`
      : `- [Versão completa, com o texto de cada projeto](${url("/llms-full.txt")})`,
    `- [Política de Privacidade](${url("/privacidade")})`,
    `- [Termos de Uso](${url("/termos")})`,
    "",
  );
  return lines.join("\n");
}

export const llmsResponse = (body: string) =>
  new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "X-Robots-Tag": "noindex" } });
