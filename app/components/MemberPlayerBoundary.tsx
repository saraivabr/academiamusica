"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AcademyPlayer = dynamic(() => import("./AcademyPlayer"), {
  ssr: false,
});

export default function MemberPlayerBoundary() {
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const isListeningRoute = normalizedPathname === "/academia"
    || normalizedPathname === "/biblioteca";

  if (!isListeningRoute) return null;

  return <AcademyPlayer />;
}
