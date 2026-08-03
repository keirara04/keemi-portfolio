"use client";

import { useState } from "react";
import { whatsappUrl } from "@/lib/content";
import { useContent } from "@/lib/content-repo";
import { trackEvent } from "@/lib/analytics-client";
import {
  CURRENCY_LABEL,
  bundles,
  calculateEstimate,
  features,
  projectTypes,
  timelineOptions,
} from "@/lib/quote";

const formatMYR = (value: number) => `${CURRENCY_LABEL} ${value.toLocaleString("en-US")}`;
const formatRange = (min: number, max: number) => `${formatMYR(min)} – ${formatMYR(max)}`;

export function QuoteWindowContent() {
  const { profile } = useContent();
  const [projectTypeId, setProjectTypeId] = useState(projectTypes[0]?.id ?? "");
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [timelineId, setTimelineId] = useState(timelineOptions[0]?.id ?? "standard");

  const projectType = projectTypes.find((t) => t.id === projectTypeId);
  const selectedFeatures = features.filter((f) => featureIds.includes(f.id));
  const timeline = timelineOptions.find((t) => t.id === timelineId);
  const estimate = calculateEstimate(projectTypeId, featureIds, timelineId);

  const toggleFeature = (id: string) => {
    setFeatureIds((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const applyBundle = (bundleProjectTypeId: string, bundleFeatureIds: string[]) => {
    setProjectTypeId(bundleProjectTypeId);
    setFeatureIds(bundleFeatureIds);
  };

  const isActiveBundle = (bundleProjectTypeId: string, bundleFeatureIds: string[]) =>
    bundleProjectTypeId === projectTypeId &&
    bundleFeatureIds.length === featureIds.length &&
    bundleFeatureIds.every((id) => featureIds.includes(id));

  const summaryLines = [
    `Hi ${profile.shortName}! I'd like a quote for a project:`,
    "",
    `Project type: ${projectType?.label ?? "—"}`,
    `Add-ons: ${selectedFeatures.length > 0 ? selectedFeatures.map((f) => f.label).join(", ") : "None"}`,
    `Timeline: ${timeline?.label ?? "—"}`,
    `Estimated range: ${estimate ? formatRange(estimate.min, estimate.max) : "—"}`,
    "",
    "Can we discuss the details?",
  ];
  const summaryMessage = summaryLines.join("\n");
  const mailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent(
    "Quote request from your portfolio"
  )}&body=${encodeURIComponent(summaryMessage)}`;

  return (
    <div className="flex h-full flex-col gap-4 text-sm">
      <div>
        <p className="text-base font-semibold text-zinc-900 dark:text-white">Get a Ballpark Quote</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Pick what your website/system needs. This gives a rough estimate, not a final price.
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Quick start
        </p>
        <div className="flex flex-col gap-1.5">
          {bundles.map((bundle) => {
            const active = isActiveBundle(bundle.projectTypeId, bundle.featureIds);
            return (
              <button
                key={bundle.id}
                type="button"
                onClick={() => applyBundle(bundle.projectTypeId, bundle.featureIds)}
                className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition ${
                  active
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10"
                    : "border-black/10 hover:border-emerald-400/60 dark:border-white/10"
                }`}
              >
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  {bundle.label}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {bundle.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Project type
        </p>
        <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Project type">
          {projectTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={type.id === projectTypeId}
              onClick={() => setProjectTypeId(type.id)}
              className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                type.id === projectTypeId
                  ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                  : "border-black/10 hover:border-sky-400/60 dark:border-white/10"
              }`}
            >
              <span className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                  {type.label}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {type.description}
                </span>
              </span>
              <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {formatRange(type.minPrice, type.maxPrice)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Add-ons
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {features.map((feature) => {
            const checked = featureIds.includes(feature.id);
            return (
              <label
                key={feature.id}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 transition ${
                  checked
                    ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                    : "border-black/10 hover:border-sky-400/60 dark:border-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFeature(feature.id)}
                  className="mt-0.5 accent-sky-600"
                />
                <span className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-100">
                    {feature.label}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {feature.description}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    +{formatRange(feature.minPrice, feature.maxPrice)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Timeline
        </p>
        <div className="flex flex-col gap-1.5 sm:flex-row" role="radiogroup" aria-label="Timeline">
          {timelineOptions.map((timeline) => (
            <button
              key={timeline.id}
              type="button"
              role="radio"
              aria-checked={timeline.id === timelineId}
              onClick={() => setTimelineId(timeline.id)}
              className={`flex-1 rounded-lg border px-3 py-2 text-left transition ${
                timeline.id === timelineId
                  ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-500/10"
                  : "border-black/10 hover:border-sky-400/60 dark:border-white/10"
              }`}
            >
              <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                {timeline.label}
              </span>
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                {timeline.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-black/5 pt-4 dark:border-white/10">
        <div className="rounded-lg bg-zinc-900 px-4 py-4 text-center dark:bg-white">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Estimated range
          </p>
          <p className="text-2xl font-bold text-white dark:text-zinc-900">
            {estimate ? `${formatRange(estimate.min, estimate.max)}` : "Pick a project type"}
          </p>
        </div>
        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
          This is an estimation only, the real quotation will depend on the details. Reach out for the final quote after a quick chat.
        </p>
        <div className="flex gap-2">
          <a
            href={whatsappUrl(profile.whatsapp, summaryMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("quote_cta_click", {
                channel: "whatsapp",
                projectTypeId,
                estimateMin: estimate?.min,
                estimateMax: estimate?.max,
              })
            }
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            WhatsApp
          </a>
          <a
            href={mailtoHref}
            onClick={() =>
              trackEvent("quote_cta_click", {
                channel: "email",
                projectTypeId,
                estimateMin: estimate?.min,
                estimateMax: estimate?.max,
              })
            }
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
