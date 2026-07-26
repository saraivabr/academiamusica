import type { Metadata } from "next";
import FunnelAnalytics from "./components/FunnelAnalytics";
import MetaPixel from "./components/MetaPixel";
import "./globals.css";
import "./experience-v2.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://musicacom.ia.br"),
  title: "Aprenda criando 25 músicas | Academia Música IA",
  description:
    "Aprenda a criar músicas com IA e tenha 25 criações incluídas para ouvir e baixar dentro da plataforma.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Academia Música IA — Aprenda criando 25 músicas",
    description:
      "Formação prática com 25 músicas incluídas para criar, ouvir e baixar.",
    url: "https://musicacom.ia.br",
    siteName: "Academia Música IA",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/hero-premium.webp", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia Música IA — Aprenda criando 25 músicas",
    description:
      "Aprenda a criar e tenha 25 músicas incluídas para praticar dentro da plataforma.",
    images: ["/hero-premium.webp"],
  },
  other: {
    "codex-preview": "development",
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
      <body>{children}<FunnelAnalytics /><MetaPixel /></body>
    </html>
  );
}
