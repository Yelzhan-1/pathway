import { strings } from "@/lib/strings";

const MAX_CV_URL_LENGTH = 200;

export function cvLinkError(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_CV_URL_LENGTH) return strings.cv.errors.urlTooLong;
  if (!isSafeHttpUrl(trimmed)) return strings.cv.errors.invalidUrl;
  return null;
}

export function isSafeHttpUrl(url: string): boolean {
  if (url.length === 0 || url.length > MAX_CV_URL_LENGTH) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
