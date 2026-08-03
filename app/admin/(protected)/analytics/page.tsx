import { Activity, Users } from "lucide-react";
import { fetchAdminApi } from "@/lib/admin-api";

type AnalyticsSummary = {
  total_events: number;
  unique_sessions: number;
  counts_by_event_type: Record<string, number>;
};

const EMPTY_SUMMARY: AnalyticsSummary = {
  total_events: 0,
  unique_sessions: 0,
  counts_by_event_type: {},
};

async function getJson<T>(path: string, fallback: T): Promise<T> {
  const response = await fetchAdminApi(path);
  if (!response.ok) return fallback;
  return response.json();
}

export default async function AdminAnalyticsPage() {
  const summary = await getJson<AnalyticsSummary>("/admin/analytics", EMPTY_SUMMARY);

  const stats = [
    { label: "Total Events", value: summary.total_events, icon: Activity },
    { label: "Unique Sessions", value: summary.unique_sessions, icon: Users },
  ];

  const breakdown = Object.entries(summary.counts_by_event_type);
  const maxCount = Math.max(1, ...breakdown.map(([, count]) => count));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Analytics</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Visitor activity tracked across the portfolio.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Events by Type</h2>
        {breakdown.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">No events recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {breakdown.map(([eventType, count]) => (
              <li key={eventType} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-zinc-700 dark:text-zinc-300">{eventType}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <span
                    className="block h-full rounded-full bg-sky-600"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right font-medium text-zinc-900 dark:text-zinc-100">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
