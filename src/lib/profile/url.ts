const MAX_CV_URL_LENGTH = 200;

export function isSafeHttpUrl(url: string): boolean {
  if (url.length === 0 || url.length > MAX_CV_URL_LENGTH) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
