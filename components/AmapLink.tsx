"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { amapDeepLink, mobileAmapPlatform } from "@/lib/data";

type AmapLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export default function AmapLink({ href, children, onClick, ...props }: AmapLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    onClick?.(event);
    if (event.defaultPrevented) return;

    const platform = mobileAmapPlatform(window.navigator.userAgent);
    if (!platform) return;

    const deepLink = amapDeepLink(href, platform);
    if (!deepLink) return;

    event.preventDefault();
    let finished = false;
    const cleanup = () => {
      finished = true;
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("blur", cleanup);
      window.removeEventListener("pagehide", cleanup);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    const handleVisibility = () => {
      if (document.hidden) cleanup();
    };
    const fallbackTimer = window.setTimeout(() => {
      if (finished) return;
      cleanup();
      window.location.assign(href);
    }, 1600);

    window.addEventListener("blur", cleanup, { once: true });
    window.addEventListener("pagehide", cleanup, { once: true });
    document.addEventListener("visibilitychange", handleVisibility);
    window.location.href = deepLink;
  };

  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
