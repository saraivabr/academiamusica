import type { Metadata } from "next";
import FunnelAnalytics from "./components/FunnelAnalytics";
import MetaPixel from "./components/MetaPixel";
import "./globals.css";
import "./experience-v2.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://musicacom.ia.br"),
  title: "Conte sua história. Crie com o Produtor IA | Academia Música IA",
  description:
    "Converse por texto ou voz com o Produtor IA e tenha 25 músicas incluídas para criar, ouvir e baixar.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Academia Música IA — Produtor IA + 25 músicas",
    description:
      "Conte sua história por texto ou voz, confirme a direção e receba duas músicas por rodada.",
    url: "https://musicacom.ia.br",
    siteName: "Academia Música IA",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/hero-premium.webp", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia Música IA — Produtor IA + 25 músicas",
    description:
      "Converse, confirme e crie com 25 músicas incluídas dentro da plataforma.",
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
