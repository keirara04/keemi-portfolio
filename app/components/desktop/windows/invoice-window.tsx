"use client";

import { useState } from "react";
import type { EzzyDefaults, HakeemiDefaults } from "@/lib/invoice-defaults";
import type { HakeemiInvoiceType, InvoiceProfile } from "@/lib/invoice";
import { HakeemiForm } from "./invoice-forms/hakeemi-form";
import { EzzyForm } from "./invoice-forms/ezzy-form";
import { WebInvoiceForm } from "./invoice-forms/web-invoice-form";

type Unlocked =
  | { profile: "hakeemi"; password: string; defaults: HakeemiDefaults }
  | { profile: "ezzy"; password: string; defaults: EzzyDefaults };

export function InvoiceWindowContent() {
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [unlocked, setUnlocked] = useState<Unlocked | null>(null);
  const [hakeemiInvoiceType, setHakeemiInvoiceType] = useState<HakeemiInvoiceType | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsChecking(true);
    try {
      const response = await fetch("/invoice-tool/defaults", {
        headers: { "x-invoice-password": passwordInput },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Incorrect password");
        return;
      }
      const body = (await response.json()) as {
        profile: InvoiceProfile;
        defaults: HakeemiDefaults | EzzyDefaults;
      };
      if (body.profile === "hakeemi") {
        setUnlocked({ profile: "hakeemi", password: passwordInput, defaults: body.defaults as HakeemiDefaults });
      } else {
        setUnlocked({ profile: "ezzy", password: passwordInput, defaults: body.defaults as EzzyDefaults });
      }
    } catch {
      setError("Could not reach the server");
    } finally {
      setIsChecking(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Invoice Generator</p>
        <p className="max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
          This tool is password-protected. Enter your password to continue.
        </p>
        <form onSubmit={handleUnlock} className="flex w-full max-w-[220px] flex-col gap-2">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-center text-sm text-zinc-900 dark:border-white/10 dark:text-zinc-100"
          />
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isChecking || !passwordInput}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:opacity-60"
          >
            {isChecking ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  if (unlocked.profile === "hakeemi") {
    if (!hakeemiInvoiceType) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">What are you invoicing for?</p>
          <div className="flex w-full max-w-[260px] flex-col gap-2">
            <button
              type="button"
              onClick={() => setHakeemiInvoiceType("tour")}
              className="rounded-md border border-sky-600/40 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
            >
              Tour Invoice
              <span className="mt-0.5 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                Quotation-style, for tour/coordination work
              </span>
            </button>
            <button
              type="button"
              onClick={() => setHakeemiInvoiceType("web")}
              className="rounded-md border border-sky-600/40 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
            >
              Web Invoice
              <span className="mt-0.5 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                Simple item/total invoice, for web dev work
              </span>
            </button>
          </div>
        </div>
      );
    }
    if (hakeemiInvoiceType === "web") {
      return <WebInvoiceForm password={unlocked.password} defaults={unlocked.defaults} />;
    }
    return <HakeemiForm password={unlocked.password} defaults={unlocked.defaults} />;
  }
  return <EzzyForm password={unlocked.password} defaults={unlocked.defaults} />;
}
