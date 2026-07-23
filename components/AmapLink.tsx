"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type AmapLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export default function AmapLink({ href, children, onClick, ...props }: AmapLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
