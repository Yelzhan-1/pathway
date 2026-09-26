export function localDayString(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function feedbackStorageKey(page: string, day: string): string {
  return `pathway:feedback:${page}:${day}`;
}

export function universityFeedbackPage(slug: string): string {
  return `universities/${slug}`.slice(0, 100);
}
