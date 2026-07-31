"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useContent } from "@/lib/content-repo";
import { useWindowManager } from "./window-manager-context";
import { projectWindowConfig, windowConfigById } from "./window-registry";
import { MagnifierIcon } from "./icons";

type SpotlightItem = {
  id: string;
  title: string;
  subtitle: string;
  keywords: string;
  action: () => void;
};

export function Spotlight({ onClose }: { onClose: () => void }) {
  const { profile, projects, skillGroups } = useContent();
  const { openWindow } = useWindowManager();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const items = useMemo<SpotlightItem[]>(() => {
    const openOrFocus = (config: Parameters<typeof openWindow>[0]) => {
      openWindow(config);
      onClose();
    };

    // "quote" and "contact" get their own richer entries below (better
    // keywords, action-style titles), so skip the generic auto-generated ones.
    const windowItems: SpotlightItem[] = Object.values(windowConfigById)
      .filter((config) => config.id !== "quote" && config.id !== "contact")
      .map((config) => ({
        id: `window-${config.id}`,
        title: config.title,
        subtitle: "Application",
        keywords: `${config.id} ${config.title} window app`,
        action: () => openOrFocus(config),
      }));

    const projectItems: SpotlightItem[] = projects.map((project, index) => ({
      id: `project-${project.id}`,
      title: project.name,
      subtitle: `Project — ${project.stack.join(", ")}`,
      keywords: `${project.name} ${project.id} ${project.stack.join(" ")} project`,
      action: () => openOrFocus(projectWindowConfig(project.id, index)),
    }));

    const skillItems: SpotlightItem[] = skillGroups.map((group) => ({
      id: `skills-${group.category}`,
      title: group.category,
      subtitle: `Skills — ${group.items.join(", ")}`,
      keywords: `${group.category} ${group.items.join(" ")} skills`,
      action: () => openOrFocus(windowConfigById.about),
    }));

    const linkItems: SpotlightItem[] = [
      {
        id: "link-github",
        title: "GitHub",
        subtitle: profile.links.github,
        keywords: "github git code repos",
        action: () => {
          window.open(profile.links.github, "_blank", "noopener,noreferrer");
          onClose();
        },
      },
      {
        id: "link-linkedin",
        title: "LinkedIn",
        subtitle: profile.links.linkedin,
        keywords: "linkedin social profile",
        action: () => {
          window.open(profile.links.linkedin, "_blank", "noopener,noreferrer");
          onClose();
        },
      },
      {
        id: "action-contact",
        title: "Contact",
        subtitle: `Email ${profile.email}`,
        keywords: "contact email mail message reach",
        action: () => openOrFocus(windowConfigById.contact),
      },
      {
        id: "action-reach-out",
        title: "Reach Out",
        subtitle: "Get a ballpark quote for your project",
        keywords: "hire contact quote quotation reach out estimate price",
        action: () => openOrFocus(windowConfigById.quote),
      },
    ];

    return [...windowItems, ...projectItems, ...skillItems, ...linkItems];
  }, [openWindow, onClose, profile, projects, skillGroups]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items.filter((item) => item.keywords.toLowerCase().includes(q)).slice(0, 8);
  }, [items, query]);

  return (
    <div
      className="fixed inset-0 z-90 flex items-start justify-center bg-black/20 pt-32"
      onClick={onClose}
      role="dialog"
      aria-label="Spotlight search"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        className="w-[560px] max-w-[90vw] overflow-hidden rounded-2xl border border-white/30 bg-zinc-100/90 shadow-2xl shadow-black/40 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-800/90"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <MagnifierIcon className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, 0));
              }
              if (e.key === "Enter" && results[selected]) {
                results[selected].action();
              }
            }}
            placeholder="Spotlight Search"
            className="w-full bg-transparent text-lg text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
            aria-label="Search"
          />
        </div>

        {results.length > 0 ? (
          <ul className="border-t border-black/10 py-1.5 dark:border-white/10">
            {results.map((item, i) => (
              <li key={item.id}>
                <button
                  onClick={item.action}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full flex-col px-4 py-1.5 text-left ${
                    i === selected
                      ? "bg-sky-600 text-white"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  <span
                    className={`truncate text-xs ${
                      i === selected ? "text-sky-100" : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-black/10 px-4 py-3 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            No results for “{query}”
          </p>
        )}
      </motion.div>
    </div>
  );
}
