const SESSION_STORAGE_KEY = "keemi-analytics-session";

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  return id;
}
