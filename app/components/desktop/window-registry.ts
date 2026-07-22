import type { WindowConfig } from "./window-manager-context";
import { projects } from "@/lib/content";

export const ABOUT_WINDOW_ID = "about";
export const PROJECTS_WINDOW_ID = "projects";
export const CONTACT_WINDOW_ID = "contact";
export const TERMINAL_WINDOW_ID = "terminal";
export const NOTES_WINDOW_ID = "notes";
export const MINESWEEPER_WINDOW_ID = "minesweeper";
export const QUOTE_WINDOW_ID = "quote";
export const HOMEWORK_WINDOW_ID = "homework";
export const projectWindowId = (projectId: string) => `project-${projectId}`;

export const aboutWindowConfig: WindowConfig = {
  id: ABOUT_WINDOW_ID,
  title: "About Me",
  defaultPosition: { x: 80, y: 72 },
  defaultSize: { width: 420, height: 460 },
  minSize: { width: 320, height: 360 },
  centered: true,
};

export const projectsWindowConfig: WindowConfig = {
  id: PROJECTS_WINDOW_ID,
  title: "Projects",
  defaultPosition: { x: 540, y: 140 },
  defaultSize: { width: 460, height: 360 },
  minSize: { width: 340, height: 280 },
};

export const contactWindowConfig: WindowConfig = {
  id: CONTACT_WINDOW_ID,
  title: "Mail — New Message",
  defaultPosition: { x: 160, y: 380 },
  defaultSize: { width: 480, height: 430 },
  minSize: { width: 360, height: 340 },
};

export const terminalWindowConfig: WindowConfig = {
  id: TERMINAL_WINDOW_ID,
  title: "keemi@portfolio — zsh",
  defaultPosition: { x: 380, y: 220 },
  defaultSize: { width: 560, height: 380 },
  minSize: { width: 380, height: 260 },
};

export const notesWindowConfig: WindowConfig = {
  id: NOTES_WINDOW_ID,
  title: "Notes",
  defaultPosition: { x: 300, y: 130 },
  defaultSize: { width: 560, height: 400 },
  minSize: { width: 420, height: 300 },
};

export const minesweeperWindowConfig: WindowConfig = {
  id: MINESWEEPER_WINDOW_ID,
  title: "Minesweeper",
  defaultPosition: { x: 460, y: 110 },
  defaultSize: { width: 360, height: 470 },
  minSize: { width: 330, height: 420 },
};

export const quoteWindowConfig: WindowConfig = {
  id: QUOTE_WINDOW_ID,
  title: "Get a Quote",
  defaultPosition: { x: 160, y: 60 },
  defaultSize: { width: 560, height: 720 },
  minSize: { width: 400, height: 540 },
};

export const homeworkWindowConfig: WindowConfig = {
  id: HOMEWORK_WINDOW_ID,
  title: "Homework",
  defaultPosition: { x: 260, y: 150 },
  defaultSize: { width: 460, height: 400 },
  minSize: { width: 340, height: 300 },
};

export function projectWindowConfig(projectId: string, index: number): WindowConfig {
  const project = projects.find((p) => p.id === projectId);
  return {
    id: projectWindowId(projectId),
    title: project?.name ?? "Project",
    defaultPosition: { x: 200 + index * 32, y: 160 + index * 32 },
    defaultSize: { width: 460, height: 420 },
    minSize: { width: 320, height: 320 },
  };
}

export const windowConfigById: Record<string, WindowConfig> = {
  [ABOUT_WINDOW_ID]: aboutWindowConfig,
  [PROJECTS_WINDOW_ID]: projectsWindowConfig,
  [CONTACT_WINDOW_ID]: contactWindowConfig,
  [TERMINAL_WINDOW_ID]: terminalWindowConfig,
  [NOTES_WINDOW_ID]: notesWindowConfig,
  [MINESWEEPER_WINDOW_ID]: minesweeperWindowConfig,
  [QUOTE_WINDOW_ID]: quoteWindowConfig,
  [HOMEWORK_WINDOW_ID]: homeworkWindowConfig,
};

export const dockApps = [
  { windowId: ABOUT_WINDOW_ID, label: "About Me" },
  { windowId: PROJECTS_WINDOW_ID, label: "Projects" },
  { windowId: NOTES_WINDOW_ID, label: "Notes" },
  { windowId: QUOTE_WINDOW_ID, label: "Get a Quote" },
  { windowId: TERMINAL_WINDOW_ID, label: "Terminal" },
  { windowId: MINESWEEPER_WINDOW_ID, label: "Minesweeper" },
  { windowId: CONTACT_WINDOW_ID, label: "Contact" },
];
