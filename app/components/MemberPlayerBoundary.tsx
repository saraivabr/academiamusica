"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AcademyPlayer = dynamic(() => import("./AcademyPlayer"), {
  ssr: false,
});

export default function MemberPlayerBoundary() {
  const pathname = usePathname();
  const isMemberRoute =
    pathname.startsWith("/academia") || pathname.startsWith("/biblioteca");

  if (!isMemberRoute) return null;

  return <AcademyPlayer />;
}
