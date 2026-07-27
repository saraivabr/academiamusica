import type { Metadata } from "next";
import HomePage from "./components/HomePage";

const title = "Gerador de Música com IA Grátis | Academia Música IA";
const description =
  "Crie música com IA em português, explore sertanejo, trap, forró, funk e outros ritmos brasileiros. Faça uma criação grátis por dia, sem cartão.";

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Academia Música IA",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-academia-musica-ia.jpg",
        width: 1200,
        height: 630,
        alt: "Academia Música IA — da ideia ao play",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-academia-musica-ia.jpg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://musicacom.ia.br/#organization",
      name: "Academia Música IA",
      url: "https://musicacom.ia.br/",
      logo: {
        "@type": "ImageObject",
        url: "https://musicacom.ia.br/icon-512.png",
        width: 512,
        height: 512,
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://musicacom.ia.br/#website",
      url: "https://musicacom.ia.br/",
      name: "Academia Música IA",
      alternateName: "Música com IA",
      inLanguage: "pt-BR",
      publisher: {
        "@id": "https://musicacom.ia.br/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://musicacom.ia.br/#software",
      name: "Academia Música IA",
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "Gerador de música com inteligência artificial",
      operatingSystem: "Web",
      url: "https://musicacom.ia.br/",
      inLanguage: "pt-BR",
      description,
      image: "https://musicacom.ia.br/og-academia-musica-ia.jpg",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
        description: "Uma criação de música grátis por dia, sem cartão.",
        url: "https://musicacom.ia.br/login/?mode=register",
        availability: "https://schema.org/InStock",
      },
      publisher: {
        "@id": "https://musicacom.ia.br/#organization",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HomePage />
    </>
  );
}
