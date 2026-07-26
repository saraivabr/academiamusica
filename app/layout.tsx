import type { Metadata } from "next";
import FunnelAnalytics from "./components/FunnelAnalytics";
import MetaPixel from "./components/MetaPixel";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://musicacom.ia.br"),
  title: "Da ideia ao Spotify | Academia Música IA",
  description:
    "Crie sua música com IA, desenvolva sua identidade visual e publique nas principais plataformas de streaming.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Academia Música IA — Da ideia ao Spotify",
    description:
      "O caminho guiado para criar sua música com IA, construir a identidade visual e preparar o lançamento.",
    url: "https://musicacom.ia.br",
    siteName: "Academia Música IA",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/hero-premium.webp", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia Música IA — Da ideia ao Spotify",
    description:
      "Crie sua música, identidade visual e lançamento com um processo guiado.",
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
