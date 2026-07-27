import type { Metadata } from "next";
import FunnelAnalytics from "./components/FunnelAnalytics";
import MetaPixel from "./components/MetaPixel";
import MemberPlayerBoundary from "./components/MemberPlayerBoundary";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://musicacom.ia.br"),
  title: {
    default: "Academia Música IA",
    template: "%s | Academia Música IA",
  },
  description:
    "Plataforma brasileira para criar música com inteligência artificial, organizar seu repertório e desenvolver a identidade do lançamento.",
  applicationName: "Academia Música IA",
  category: "Música e criatividade",
  creator: "Academia Música IA",
  publisher: "Academia Música IA",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}<MemberPlayerBoundary /><FunnelAnalytics /><MetaPixel /></body>
    </html>
  );
}
