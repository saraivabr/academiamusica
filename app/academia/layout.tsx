import type { Metadata } from "next";
import "../experience-v2.css";
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
