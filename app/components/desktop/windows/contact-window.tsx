"use client";

import { useState } from "react";
import { profile } from "@/lib/content";
import { GitHubIcon, LinkedInIcon } from "../icons";

const SUBJECT_PRESETS = ["Freelance project", "Collaboration", "Just saying hi"];
const MAX_BODY_LENGTH = 1500; // stay well under mailto URL limits

export function ContactWindowContent() {
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = () => {
    const fullBody = from ? `${body}\n\n— ${from}` : body;
    const url = `mailto:${profile.email}?subject=${encodeURIComponent(
      subject || "Hello from your portfolio"
    )}&body=${encodeURIComponent(fullBody)}`;
    window.location.href = url;
  };

  return (
    <div className="flex h-full flex-col gap-3 text-sm">
      <div className="flex flex-col gap-2 border-b border-black/5 pb-2 text-xs dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-zinc-500 dark:text-zinc-400">To:</span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
            {profile.name} &lt;{profile.email}&gt;
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-zinc-500 dark:text-zinc-400">From:</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Your name"
            className="min-w-0 flex-1 bg-transparent text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            aria-label="Your name"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-zinc-500 dark:text-zinc-400">Subject:</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this about?"
            className="min-w-0 flex-1 bg-transparent font-medium text-zinc-800 outline-none placeholder:font-normal placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            aria-label="Subject"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 pl-16">
          {SUBJECT_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setSubject(preset)}
              className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                subject === preset
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-black/10 text-zinc-600 hover:border-sky-400 hover:text-sky-600 dark:border-white/15 dark:text-zinc-400 dark:hover:text-sky-400"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY_LENGTH))}
        placeholder={`Hi ${profile.shortName},\n\nI'd like to talk about…`}
        className="min-h-24 flex-1 resize-none bg-transparent leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        aria-label="Message"
      />

      <div className="flex items-center justify-between border-t border-black/5 pt-2.5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <GitHubIcon className="h-4 w-4" />
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <LinkedInIcon className="h-4 w-4" />
          </a>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Usually replies within a day
          </span>
        </div>
        <button
          onClick={send}
          disabled={!body.trim()}
          className="rounded-md bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
