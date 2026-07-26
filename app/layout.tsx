import type { Metadata } from "next";
import FunnelAnalytics from "./components/FunnelAnalytics";
import MetaPixel from "./components/MetaPixel";
import AcademyPlayer from "./components/AcademyPlayer";
import "./globals.css";
import "./experience-v2.css";
import "./spotify-experience.css";
import "./home-brasil.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://musicacom.ia.br"),
  title: "A plataforma de geração de música 100% brasileirada",
  description:
    "Crie uma música grátis por dia, explore ritmos brasileiros e organize seu repertório em uma plataforma feita para o Brasil.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "A plataforma de geração de música 100% brasileirada",
    description:
      "Uma música grátis por dia, sem cartão: criação, repertório, capa e tutorial em uma experiência feita para o Brasil.",
    url: "https://musicacom.ia.br",
    siteName: "Academia Música IA",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "https://musicacom.ia.br/og.png", width: 1730, height: 909 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "A plataforma de geração de música 100% brasileirada",
    description:
      "Crie uma música grátis por dia, organize seu repertório e dê identidade ao seu lançamento.",
    images: ["https://musicacom.ia.br/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}<AcademyPlayer /><FunnelAnalytics /><MetaPixel /></body>
    </html>
  );
}
