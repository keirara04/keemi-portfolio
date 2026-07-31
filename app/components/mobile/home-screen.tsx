"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useContent } from "@/lib/content-repo";
import type { WindowConfig } from "../desktop/window-manager-context";
import {
  aboutWindowConfig,
  contactWindowConfig,
  homeworkWindowConfig,
  minesweeperWindowConfig,
  notesWindowConfig,
  projectsWindowConfig,
  quoteWindowConfig,
  terminalWindowConfig,
} from "../desktop/window-registry";
import {
  FinderFaceIcon,
  GitHubIcon,
  HomeworkAppIcon,
  LinkedInIcon,
  MailAppIcon,
  MinesweeperAppIcon,
  NotesAppIcon,
  ProfileTileIcon,
  QuoteAppIcon,
  ResumeAppIcon,
  TerminalAppIcon,
} from "../desktop/icons";
import { StatusBar } from "./status-bar";

export type LaunchOrigin = { x: number; y: number };

function AppIcon({
  label,
  hideLabel,
  onOpen,
  children,
}: {
  label: string;
  hideLabel?: boolean;
  onOpen: (origin: LaunchOrigin) => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onOpen({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
      }}
      className="flex w-16 flex-col items-center gap-1.5"
      aria-label={`Open ${label}`}
    >
      <span className="h-14 w-14 overflow-hidden rounded-[22%] shadow-md">{children}</span>
      {hideLabel ? null : (
        <span className="text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
          {label}
        </span>
      )}
    </motion.button>
  );
}

export function HomeScreen({
  onLaunch,
}: {
  onLaunch: (config: WindowConfig, origin: LaunchOrigin) => void;
}) {
  const { profile } = useContent();
  const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="relative flex h-full flex-col">
      <StatusBar light />

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onLaunch(quoteWindowConfig, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
        }}
        className="mx-5 mt-3 flex items-center gap-3 rounded-2xl bg-white/75 p-3.5 text-left shadow-lg backdrop-blur-xl dark:bg-zinc-800/75"
        aria-label="Open quote"
      >
        <Image
          src="/portfolio-profile.jpg"
          alt=""
          width={52}
          height={52}
          className="h-13 w-13 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">{profile.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Open for freelance work
          </p>
        </div>
        <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
          Reach Out
        </span>
      </motion.button>

      <div className="mt-8 grid grid-cols-4 justify-items-center gap-y-6 px-5">
        <AppIcon label="Terminal" onOpen={(o) => onLaunch(terminalWindowConfig, o)}>
          <TerminalAppIcon className="h-full w-full" />
        </AppIcon>
        <AppIcon label="Resume" onOpen={() => openExternal("/resume.pdf")}>
          <ResumeAppIcon className="h-full w-full" />
        </AppIcon>
        <AppIcon label="GitHub" onOpen={() => openExternal(profile.links.github)}>
          <span className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-700 to-zinc-950">
            <GitHubIcon className="h-3/5 w-3/5 text-white" />
          </span>
        </AppIcon>
        <AppIcon label="LinkedIn" onOpen={() => openExternal(profile.links.linkedin)}>
          <span className="flex h-full w-full items-center justify-center bg-linear-to-br from-sky-600 to-blue-800">
            <LinkedInIcon className="h-3/5 w-3/5 text-white" />
          </span>
        </AppIcon>
        <AppIcon label="Minesweeper" onOpen={(o) => onLaunch(minesweeperWindowConfig, o)}>
          <MinesweeperAppIcon className="h-full w-full" />
        </AppIcon>
        <AppIcon label="Get a Quote" onOpen={(o) => onLaunch(quoteWindowConfig, o)}>
          <QuoteAppIcon className="h-full w-full" />
        </AppIcon>
        <AppIcon label="Homework" onOpen={(o) => onLaunch(homeworkWindowConfig, o)}>
          <HomeworkAppIcon className="h-full w-full" />
        </AppIcon>
      </div>

      <div className="mt-auto px-4 pb-7">
        <div className="flex items-center justify-around rounded-3xl bg-white/30 px-3 py-2.5 backdrop-blur-2xl dark:bg-zinc-900/30">
          <AppIcon label="About Me" hideLabel onOpen={(o) => onLaunch(aboutWindowConfig, o)}>
            <ProfileTileIcon className="h-full w-full" />
          </AppIcon>
          <AppIcon label="Projects" hideLabel onOpen={(o) => onLaunch(projectsWindowConfig, o)}>
            <FinderFaceIcon className="h-full w-full" />
          </AppIcon>
          <AppIcon label="Mail" hideLabel onOpen={(o) => onLaunch(contactWindowConfig, o)}>
            <MailAppIcon className="h-full w-full" />
          </AppIcon>
          <AppIcon label="Notes" hideLabel onOpen={(o) => onLaunch(notesWindowConfig, o)}>
            <NotesAppIcon className="h-full w-full" />
          </AppIcon>
        </div>
      </div>
    </div>
  );
}
