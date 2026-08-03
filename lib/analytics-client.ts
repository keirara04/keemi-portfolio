import { API_BASE_URL } from "./api-base-url";
import { getAnalyticsSessionId } from "./analytics-session";

export function trackEvent(eventType: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  fetch(`${API_BASE_URL}/analytics/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      payload,
      session_id: getAnalyticsSessionId(),
      path: window.location.pathname,
    }),
  }).catch(() => {
    // Analytics is best-effort — a failed request must never affect the UI.
  });
}
