"use client";

import { useState } from "react";
import Image from "next/image";
import { useContent } from "@/lib/content-repo";
import { useWindowManager } from "../window-manager-context";
import { projectWindowConfig } from "../window-registry";
import { FolderIcon } from "../icons";

export function ProjectsWindowContent() {
  const { projects } = useContent();
  const { openWindow } = useWindowManager();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {projects.map((project, index) => (
        <button
          key={project.id}
          onClick={(e) => {
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
      ))}
    </div>
  );
}

export function ProjectDetailWindowContent({ projectId }: { projectId: string }) {
  const { projects } = useContent();
  const project = projects.find((p) => p.id === projectId);
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!project) return null;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold text-zinc-900 dark:text-white">{project.name}</p>
          {project.internal ? (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Internal company project
            </span>
          ) : null}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{project.tagline}</p>
      </div>

      {project.placeholder ? (
        <p className="rounded-md border border-dashed border-amber-400/60 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          Placeholder content — swap in the real description, screenshots, and links for this project.
        </p>
      ) : null}

      <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{project.description}</p>

      {project.screenshots && project.screenshots.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {project.screenshots.map((shot) => (
            <button
              key={shot.src}
              type="button"
              onClick={() => setLightbox(shot.src)}
              className="shrink-0 overflow-hidden rounded-md border border-black/10 shadow-sm transition hover:opacity-90 dark:border-white/10"
            >
              <Image
                src={shot.src}
                alt={shot.alt}
                width={220}
                height={128}
                unoptimized
                className="h-32 w-auto object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <Image
            src={lightbox}
            alt=""
            width={1200}
            height={800}
            unoptimized
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      ) : null}

      {project.highlights && project.highlights.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Highlights
          </p>
          <ul className="flex flex-col gap-1.5">
            {project.highlights.map((point) => (
              <li
                key={point}
                className="flex gap-2 leading-relaxed text-zinc-700 dark:text-zinc-300"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
        {project.internal ? (
          <span className="text-zinc-400">Internal tool — not publicly available</span>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
