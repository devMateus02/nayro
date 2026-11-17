import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { PHONE_LABEL, WHATSAPP_URL } from "@/lib/contact";

export const metadata: Metadata = pageMetadata({
  title: "Política de Privacidade",
  description: "Como a NAYRO trata os dados pessoais enviados pelo site, de acordo com a LGPD: o que coletamos, para que usamos e os seus direitos.",
  path: "/privacidade",
});

const whatsapp = (
  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
    WhatsApp ({PHONE_LABEL})
  </a>
);

export default function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      updated="16 de novembro de 2026"
      sections={[
        {
          title: "Quem somos",
          body: (
            <p>
              Esta política explica como a NAYRO trata os dados pessoais de quem visita o site e entra em contato com a gente, de acordo com a
              Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD). Para qualquer assunto sobre os seus dados, fale com a gente pelo {whatsapp}.
            </p>
          ),
        },
        {
          title: "Quais dados coletamos",
          body: (
            <>
              <p>
                O formulário de contato não guarda nada no site: ele monta uma mensagem que abre no seu WhatsApp. Ao enviar, recebemos por lá
                apenas o que você escolheu escrever:
              </p>
              <ul>
                <li>o seu nome e o número do seu WhatsApp;</li>
                <li>a empresa, se você preencher;</li>
                <li>o tipo de projeto e a mensagem.</li>
              </ul>
              <p>
                Também medimos as visitas ao site de forma agregada e anônima (quantas pessoas acessaram cada página e de onde vieram, por
                exemplo), sem cookies e sem identificar quem é você.
              </p>
            </>
          ),
        },
        {
          title: "Para que usamos",
          body: (
            <p>
              Usamos os dados do formulário só para responder ao seu contato, entender o seu projeto e, se você quiser, enviar uma proposta.
              Não vendemos nem alugamos dados pessoais e não enviamos propagandas sem a sua autorização. O tratamento tem como base o seu
              pedido de contato e os procedimentos preliminares a um possível contrato (art. 7º, V, da LGPD).
            </p>
          ),
        },
        {
          title: "Com quem compartilhamos",
          body: (
            <>
              <p>Os dados passam apenas pelos serviços necessários para o site funcionar:</p>
              <ul>
                <li>a empresa de hospedagem do site (Vercel), que também faz a contagem anônima de visitas;</li>
                <li>o WhatsApp, quando você escolhe falar com a gente por lá.</li>
              </ul>
              <p>Esses serviços só usam os dados para prestar o serviço contratado. Também podemos compartilhar dados se a lei exigir.</p>
            </>
          ),
        },
        {
          title: "Por quanto tempo guardamos",
          body: (
            <p>
              Guardamos as mensagens pelo tempo necessário para o atendimento e, se fecharmos um projeto, pelo prazo que a lei exigir. Depois
              disso, os dados são excluídos. Você pode pedir a exclusão a qualquer momento.
            </p>
          ),
        },
        {
          title: "Os seus direitos",
          body: (
            <>
              <p>Pela LGPD, você pode, a qualquer momento:</p>
              <ul>
                <li>confirmar se tratamos dados seus e ter acesso a eles;</li>
                <li>corrigir dados incompletos ou desatualizados;</li>
                <li>pedir a exclusão dos seus dados;</li>
                <li>saber com quem os seus dados foram compartilhados;</li>
                <li>retirar o seu consentimento.</li>
              </ul>
              <p>Basta falar com a gente pelo {whatsapp}. Respondemos o quanto antes, dentro dos prazos da lei.</p>
            </>
          ),
        },
        {
          title: "Cookies",
          body: (
            <>
              <p>
                O site não usa cookies para quem o visita: nem de publicidade, nem de rastreamento. A contagem de visitas é feita sem cookies e
                sem identificar ninguém, só com números agregados.
              </p>
              <p>A única exceção é a área restrita da equipe, que usa um cookie de sessão para manter o login.</p>
            </>
          ),
        },
        {
          title: "Segurança e mudanças nesta política",
          body: (
            <p>
              Adotamos medidas técnicas para proteger os dados, como conexão criptografada (HTTPS) e acesso restrito à equipe. Se esta
              política mudar, a nova versão será publicada nesta página, com a data de atualização.
            </p>
          ),
        },
      ]}
    />
  );
}
