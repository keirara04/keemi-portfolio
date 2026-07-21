"use client";

import { projects } from "@/lib/content";
import { useWindowManager } from "../window-manager-context";
import { projectWindowConfig, projectWindowId } from "../window-registry";
import { FolderIcon } from "../icons";

export function ProjectsWindowContent() {
  const { openWindow, focusWindow, windows } = useWindowManager();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {projects.map((project, index) => {
        const winId = projectWindowId(project.id);
        return (
          <button
            key={project.id}
            onClick={(e) => {
              const win = windows[winId];
              if (win?.isOpen && !win.isMinimized) {
                focusWindow(winId);
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              openWindow(projectWindowConfig(project.id, index), {
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
              });
            }}
            className="flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <FolderIcon className="h-12 w-14 drop-shadow-sm" />
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{project.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProjectDetailWindowContent({ projectId }: { projectId: string }) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <p className="text-base font-semibold text-zinc-900 dark:text-white">{project.name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{project.tagline}</p>
      </div>

      {project.placeholder ? (
        <p className="rounded-md border border-dashed border-amber-400/60 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          Placeholder content — swap in the real description, screenshots, and links for this project.
        </p>
      ) : null}

      <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{project.description}</p>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Stack
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 border-t border-black/5 pt-3 text-xs dark:border-white/10">
        {project.liveUrl ? (
          <a href={project.liveUrl} className="font-medium text-sky-600 hover:underline dark:text-sky-400">
            Live →
          </a>
        ) : (
          <span className="text-zinc-400">Live link — TBD</span>
        )}
        {project.repoUrl ? (
          <a href={project.repoUrl} className="font-medium text-sky-600 hover:underline dark:text-sky-400">
            Code →
          </a>
        ) : (
          <span className="text-zinc-400">Repo link — TBD</span>
        )}
      </div>
    </div>
  );
}
