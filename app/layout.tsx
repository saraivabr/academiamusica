import type { Metadata } from "next";
import FunnelAnalytics from "./components/FunnelAnalytics";
import MetaPixel from "./components/MetaPixel";
import AcademyPlayer from "./components/AcademyPlayer";
import "./globals.css";
import "./experience-v2.css";
import "./spotify-experience.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://musicacom.ia.br"),
  title: "Conte sua história. Crie com o Produtor IA | Academia Música IA",
  description:
    "Converse por texto ou voz com o Produtor IA e tenha 25 músicas incluídas para criar, ouvir e baixar.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Academia Música IA — Da ideia ao play",
    description:
      "Conte sua história, receba duas versões, crie a capa e prepare seu lançamento em uma única plataforma.",
    url: "https://musicacom.ia.br",
    siteName: "Academia Música IA",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "https://musicacom.ia.br/og.png", width: 1730, height: 909 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia Música IA — Da ideia ao play",
    description:
      "Crie música, capa e lançamento em uma jornada guiada.",
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
