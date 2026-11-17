import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import ContactSection from "@/components/contato/ContactSection";
import { breadcrumbLd, faqLd, pageMetadata, webPageLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/servicos/Faq";

const CONTACT_DESCRIPTION =
  "Fale com a NAYRO pelo formulário ou pelo WhatsApp. Conte a sua ideia e receba os próximos passos e uma proposta sem compromisso.";

export const metadata: Metadata = pageMetadata({
  title: "Contato e orçamento",
  description: CONTACT_DESCRIPTION,
  path: "/contato",
});

export default function ContatoPage() {
  return (
    <main>
      <JsonLd data={[webPageLd({ type: "ContactPage", name: "Contato NAYRO", description: CONTACT_DESCRIPTION, path: "/contato" }), faqLd(), breadcrumbLd([{ name: "Contato", path: "/contato" }])]} />
      {/* Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger */}
      <SmoothScroll />
      <Navbar />
      <ContactSection />
      <Faq />
      <Footer home={false} />
    </main>
  );
}
