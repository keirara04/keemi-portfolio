"use client";

import { useContent } from "@/lib/content-repo";

export function HomeworkWindowContent() {
  const { schoolReports } = useContent();
  return (
    <div className="flex h-full flex-col gap-3 text-sm">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        School research reports and write-ups.
      </p>

      <div className="flex flex-col gap-2">
        {schoolReports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col gap-1.5 rounded-lg border border-black/10 p-3 dark:border-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  {report.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {report.course} · {report.date}
                </p>
              </div>
              {report.fileUrl ? (
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-sky-500"
                >
                  Open PDF
                </a>
              ) : (
                <span className="shrink-0 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                  PDF coming soon
                </span>
              )}
            </div>
            <p className="text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-300">
              {report.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
