"use client";

import { useEffect, useRef, useState } from "react";
import { interests, profile, projects, skillGroups } from "@/lib/content";
import { useWindowManager } from "../window-manager-context";
import {
  contactWindowConfig,
  projectWindowConfig,
  projectWindowId,
} from "../window-registry";

type TerminalLine = { kind: "input" | "output"; text: string };

const WELCOME: TerminalLine[] = [
  { kind: "output", text: `Welcome to Keemi OS. Type "help" to get started.` },
];

const HELP_TEXT = [
  "Available commands:",
  "  help              show this list",
  "  whoami            who is Hakeemi?",
  "  skills            list technical skills",
  "  projects          list projects",
  "  open <project>    open a project window (e.g. open shelterlab)",
  "  contact           open the contact window",
  "  github            open GitHub profile",
  "  linkedin          open LinkedIn profile",
  "  build             build a project",
  "  clear             clear the terminal",
];

export function TerminalWindowContent() {
  const { openWindow, focusWindow, windows } = useWindowManager();
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const openOrFocus = (id: string, config: Parameters<typeof openWindow>[0]) => {
    const win = windows[id];
    if (win?.isOpen && !win.isMinimized) {
      focusWindow(id);
    } else {
      openWindow(config);
    }
  };

  const run = (raw: string): string[] => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    switch (cmd.toLowerCase()) {
      case "help":
        return HELP_TEXT;
      case "whoami":
        return [profile.name, profile.school, profile.freelanceNote];
      case "skills":
        return skillGroups
          .map((g) => `${g.category}: ${g.items.join(", ")}`)
          .concat([`Interests: ${interests.join(", ")}`]);
      case "projects":
        return projects
          .map((p) => `  ${p.id}  —  ${p.name}`)
          .concat(["", `Run "open <project>" to view one.`]);
      case "open": {
        const query = args.join(" ").toLowerCase();
        const index = projects.findIndex(
          (p) => p.id === query || p.name.toLowerCase().includes(query)
        );
        if (index === -1) {
          return [`open: project not found: ${args.join(" ") || "(none)"}`, `Try "projects" to list them.`];
        }
        const project = projects[index];
        openOrFocus(projectWindowId(project.id), projectWindowConfig(project.id, index));
        return [`Opening ${project.name}…`];
      }
      case "contact":
      case "build":
        openOrFocus(contactWindowConfig.id, contactWindowConfig);
        return cmd.toLowerCase() === "build"
          ? ["Excellent choice. Opening Mail…"]
          : ["Opening Mail…"];
      case "github":
        window.open(profile.links.github, "_blank", "noopener,noreferrer");
        return [`Opening ${profile.links.github}…`];
      case "linkedin":
        window.open(profile.links.linkedin, "_blank", "noopener,noreferrer");
        return [`Opening ${profile.links.linkedin}…`];
      case "":
        return [];
      default:
        return [`zsh: command not found: ${cmd}`, `Type "help" for available commands.`];
    }
  };

  const handleSubmit = () => {
    const raw = input;
    setInput("");
    if (raw.trim().toLowerCase() === "clear") {
      setLines([]);
      return;
    }
    const output = run(raw).map<TerminalLine>((text) => ({ kind: "output", text }));
    setLines((prev) => [...prev, { kind: "input", text: raw }, ...output]);
  };

  return (
    <div
      ref={scrollRef}
      className="-m-4 h-[calc(100%+2rem)] cursor-text overflow-y-auto bg-zinc-950/95 p-3 font-mono text-[12.5px] leading-relaxed text-zinc-100"
      onClick={() => inputRef.current?.focus()}
      role="log"
      aria-label="Terminal"
    >
      {lines.map((line, i) =>
        line.kind === "input" ? (
          <p key={i}>
            <span className="text-emerald-400">keemi@portfolio</span>
            <span className="text-zinc-500"> % </span>
            {line.text}
          </p>
        ) : (
          <p key={i} className="whitespace-pre-wrap text-zinc-300">
            {line.text}
          </p>
        )
      )}
      <div className="flex items-center">
        <span className="text-emerald-400">keemi@portfolio</span>
        <span className="text-zinc-500">&nbsp;%&nbsp;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="min-w-0 flex-1 bg-transparent caret-emerald-400 outline-none"
          aria-label="Terminal input"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
