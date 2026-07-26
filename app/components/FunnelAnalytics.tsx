"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "../lib/analytics";

function pageEvent(pathname: string) {
  if (pathname === "/" || pathname === "") return "landing_view";
  if (pathname.startsWith("/checkout")) return "checkout_view";
  if (pathname.startsWith("/login")) return "login_view";
  return null;
}

export default function FunnelAnalytics() {
  const trackedPath = useRef("");

  useEffect(() => {
    const pathname = window.location.pathname;
    if (trackedPath.current !== pathname) {
      const eventName = pageEvent(pathname);
      if (eventName) trackEvent(eventName, pathname);
      trackedPath.current = pathname;
    }

    const handleTrackedClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      const eventName = element?.dataset.track;
      if (eventName) trackEvent(eventName, pathname);
    };

    document.addEventListener("click", handleTrackedClick, { capture: true });
    return () => document.removeEventListener("click", handleTrackedClick, { capture: true });
  }, []);

  return null;
}
