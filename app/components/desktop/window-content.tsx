"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import { AboutWindowContent } from "./windows/about-window";
import { ProjectDetailWindowContent, ProjectsWindowContent } from "./windows/projects-window";
import { ContactWindowContent } from "./windows/contact-window";
import { NotesWindowContent } from "./windows/notes-window";

// Split the rarely-opened terminal out of the initial bundle.
const TerminalWindowContent = dynamic(
  () => import("./windows/terminal-window").then((m) => m.TerminalWindowContent),
  {
    ssr: false,
    loading: () => (
      <div className="-m-4 h-[calc(100%+2rem)] bg-zinc-950/95 p-3 font-mono text-[12.5px] text-zinc-500">
        Starting shell…
      </div>
    ),
  }
);

// memo: window drags update context every pointer-move, re-rendering each
// Window's chrome; this keeps the (heavier) content subtree out of that churn
export const WindowContentFor = memo(function WindowContentFor({ id }: { id: string }) {
  if (id === "about") return <AboutWindowContent />;
  if (id === "projects") return <ProjectsWindowContent />;
  if (id === "contact") return <ContactWindowContent />;
  if (id === "terminal") return <TerminalWindowContent />;
  if (id === "notes") return <NotesWindowContent />;
  if (id.startsWith("project-")) {
    return <ProjectDetailWindowContent projectId={id.replace("project-", "")} />;
  }
  return null;
});
