/**
 * Safe HTML rendering component with XSS prevention
 */

"use client";

import React from "react";
import { sanitizeHtml, sanitizeHtmlStrict, type SanitizeOptions } from "@/lib/sanitizeUtils";

interface SafeHtmlProps {
  html: string;
  options?: SanitizeOptions;
  strict?: boolean;
  className?: string;
  tagName?: string;
}

/**
 * SafeHtml component for rendering sanitized HTML
 */
export function SafeHtml({
  html,
  options,
  strict = false,
  className,
  tagName = "div",
}: SafeHtmlProps) {
  const sanitizedHtml = strict
    ? sanitizeHtmlStrict(html)
    : sanitizeHtml(html, options);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

/**
 * SafeHtmlText component for rendering text only (no HTML)
 */
interface SafeHtmlTextProps {
  text: string;
  className?: string;
}

export function SafeHtmlText({
  text,
  className,
}: SafeHtmlTextProps) {
  const sanitizedText = text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return <span className={className}>{sanitizedText}</span>;
}

/**
 * SafeHtmlLink component for rendering safe links
 */
interface SafeHtmlLinkProps {
  url: string;
  text: string;
  className?: string;
  external?: boolean;
}

export function SafeHtmlLink({
  url,
  text,
  className,
  external = false,
}: SafeHtmlLinkProps) {
  const sanitizedUrl = url
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "");

  const sanitizedText = text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return (
    <a
      href={sanitizedUrl}
      className={className}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {sanitizedText}
    </a>
  );
}

/**
 * SafeHtmlImage component for rendering safe images
 */
interface SafeHtmlImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SafeHtmlImage({ src, alt, className }: SafeHtmlImageProps) {
  const sanitizedSrc = src
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");

  const sanitizedAlt = alt
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return <img src={sanitizedSrc} alt={sanitizedAlt} className={className} />;
}
