import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { PHONE_LABEL, WHATSAPP_URL } from "@/lib/contact";

export const metadata: Metadata = pageMetadata({
  title: "Termos de Uso",
  description: "Condições de uso do site da NAYRO: conteúdo, propriedade intelectual, orçamentos, links externos e privacidade.",
  path: "/termos",
});

export default function TermosPage() {
  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos de Uso"
      updated="13 de novembro de 2026"
      sections={[
        {
          title: "Sobre este site",
          body: (
            <p>
              Este site apresenta a NAYRO, os nossos serviços e projetos. Ao navegar por ele, você concorda com estes termos. Se não
              concordar, pedimos que não use o site.
            </p>
          ),
        },
        {
          title: "Conteúdo e propriedade intelectual",
          body: (
            <p>
              Textos, marca, logotipo, imagens e o código deste site pertencem à NAYRO ou são usados com autorização. Não é permitido copiar,
              reproduzir ou usar esse conteúdo para fins comerciais sem autorização por escrito. Os projetos do portfólio pertencem aos
              respectivos clientes e aparecem aqui com permissão.
            </p>
          ),
        },
        {
          title: "Orçamentos e propostas",
          body: (
            <p>
              As informações do site são uma apresentação geral dos serviços. Prazos, valores e escopo de cada projeto só valem depois de
              combinados em uma proposta ou contrato específico.
            </p>
          ),
        },
        {
          title: "Links para outros sites",
          body: (
            <p>
              O site pode ter links para projetos de clientes, redes sociais e outros serviços. Não somos responsáveis pelo conteúdo nem pelas
              práticas de privacidade desses sites.
            </p>
          ),
        },
        {
          title: "Privacidade",
          body: (
            <p>
              O tratamento dos dados enviados pelo site está descrito na nossa <Link href="/privacidade">Política de Privacidade</Link>.
            </p>
          ),
        },
        {
          title: "Mudanças e contato",
          body: (
            <p>
              Estes termos podem ser atualizados a qualquer momento, e a versão vigente fica sempre nesta página. Eles seguem as leis do
              Brasil. Dúvidas? Fale com a gente pelo{" "}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                WhatsApp ({PHONE_LABEL})
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
