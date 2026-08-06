import type { Metadata } from "next";
import "../cover-studio.css";
import "../spotify-experience.css";

export const metadata: Metadata = {
  title: "Estúdio",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AcademyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
