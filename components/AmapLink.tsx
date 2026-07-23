"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { amapAppMarker, type AmapAppPlatform } from "@/lib/data";

type AmapLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

function mobilePlatform(): AmapAppPlatform | null {
  const userAgent = navigator.userAgent;
  if (/Android/i.test(userAgent)) return "android";
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)) return "ios";
  return null;
}

export function AmapNavigationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4.1 10.7 19.6 4.2l-6.3 15.6-2.5-6.5-6.7-2.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m10.8 13.3 4.1-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AmapLink({ href, children, onClick, ...props }: AmapLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    onClick?.(event);
    if (event.defaultPrevented) return;
    const platform = mobilePlatform();
    if (!platform) return;
    const appHref = amapAppMarker(href, platform);
    if (!appHref) return;
    event.preventDefault();
    window.location.assign(appHref);
  };
  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
