"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/academia", label: "Início", marker: "⌂", exact: true },
  { href: "/academia/comecar", label: "Comece aqui", marker: "01" },
  { href: "/academia/musica", label: "Aprenda a criar", marker: "02" },
  { href: "/academia/identidade", label: "Crie o visual", marker: "03" },
  { href: "/academia/publicacao", label: "Prepare o lançamento", marker: "04" },
  { href: "/biblioteca/gerador", label: "Criar música", marker: "●", featured: true },
  { href: "/biblioteca", label: "Biblioteca", marker: "✦" },
  { href: "/comunidade", label: "Comunidade", marker: "↗" },
];

export default function MemberNav() {
  const pathname = usePathname();

  return (
    <nav className="member-nav" aria-label="Navegação da Academia">
      {navigation.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${active ? "active" : ""} ${item.featured ? "featured" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true">{item.marker}</span>
            <b>{item.label}</b>
          </Link>
        );
      })}
    </nav>
  );
}
