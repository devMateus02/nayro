import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter-var",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "NAYRO | Desenvolvimento de sites, sistemas e automações", template: "%s | NAYRO" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  openGraph: { type: "website", locale: "pt_BR", siteName: SITE_NAME, images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] },
  // Códigos de verificação do Google Search Console e do Bing (opcionais, no .env)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = { themeColor: "#08070D", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable} antialiased`}>
      <body className="min-h-full">
        {/* Sem JavaScript as animações de entrada não rodam: mostra tudo direto */}
        <noscript>
          <style>{"[data-intro]{visibility:visible!important}[data-loader]{display:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
