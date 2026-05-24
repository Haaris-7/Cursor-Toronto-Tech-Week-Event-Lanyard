import { type LanyardFields, serializeParams } from "./lanyard-params";

export function getCanonicalUrl(fields: LanyardFields): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/${serializeParams(fields)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function linkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function xShareUrl(url: string, text: string): string {
  return `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}
