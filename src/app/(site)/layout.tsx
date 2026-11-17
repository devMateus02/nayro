import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";
import Loader from "@/components/Loader";
import { organizationLd, websiteLd } from "@/lib/seo";
import { getServices } from "@/lib/services-data";

/** Páginas do site: tela de entrada (toca só ao entrar no site, não a cada troca de página) */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const services = await getServices();
  return (
    <>
      {/* Quem é a NAYRO e qual é o site: base dos dados estruturados de todas as páginas */}
      <JsonLd data={[organizationLd(services), websiteLd()]} />
      {/* Tela de entrada: a palavra NAYRO é escrita e a tela se abre ao meio */}
      <Loader />
      {children}
      {/* Contagem de visitas da Vercel: sem cookies e sem identificar quem visita (o painel /admin fica de fora) */}
      <Analytics />
    </>
  );
}
