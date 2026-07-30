import type { Metadata } from "next";
import HomePage from "./components/HomePage";

const title = "Transforme sua história em música | musicacom.ia";
const description =
  "Crie gratuitamente a direção da sua música e libere as versões completas no Projeto Música Presente por R$ 49,97 via Pix.";

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
    siteName: "musicacom.ia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-musicacom-ia.jpg",
        width: 1200,
        height: 630,
        alt: "musicacom.ia — da ideia ao play",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-musicacom-ia.jpg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://musicacom.ia.br/#organization",
      name: "musicacom.ia",
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
      name: "musicacom.ia",
      alternateName: "Música com IA",
      inLanguage: "pt-BR",
      publisher: {
        "@id": "https://musicacom.ia.br/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://musicacom.ia.br/#software",
      name: "musicacom.ia",
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "Gerador de música com inteligência artificial",
      operatingSystem: "Web",
      url: "https://musicacom.ia.br/",
      inLanguage: "pt-BR",
      description,
      image: "https://musicacom.ia.br/og-musicacom-ia.jpg",
      offers: {
        "@type": "Offer",
        price: "49.97",
        priceCurrency: "BRL",
        description: "Projeto Música Presente com 20 créditos musicais, 10 rodadas pagas e até 2 versões por rodada.",
        url: "https://musicacom.ia.br/checkout/",
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
