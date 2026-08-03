"use client";

import { useState } from "react";
import { calculateTotals } from "@/lib/invoice";
import type { LineItem } from "@/lib/invoice";
import type { HakeemiDefaults } from "@/lib/invoice-defaults";
import { LineItemsEditor, newLineItem } from "./line-items-editor";
import { generateInvoicePdf, previewInvoicePdf } from "./generate-pdf";
import { GenerateActions } from "./generate-button";

const inputClass =
  "w-full rounded-md border border-black/10 bg-transparent px-2.5 py-1.5 text-xs text-zinc-900 dark:border-white/10 dark:text-zinc-100";
const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function defaultPaymentInfo(defaults: HakeemiDefaults) {
  return [defaults.bankName, defaults.bankAccount, defaults.bankHolder].filter(Boolean).join("\n");
}

export function WebInvoiceForm({ password, defaults }: { password: string; defaults: HakeemiDefaults }) {
  const [businessName, setBusinessName] = useState(defaults.businessName);
  const [date, setDate] = useState(todayIso());
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientAddressLines, setClientAddressLines] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>(() => [newLineItem()]);
  const [notes, setNotes] = useState("");
  const [taxRatePercent, setTaxRatePercent] = useState(0);
  const [contactEmail, setContactEmail] = useState(defaults.email);
  const [contactTel, setContactTel] = useState(defaults.phone);
  const [paymentInfo, setPaymentInfo] = useState(() => defaultPaymentInfo(defaults));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = calculateTotals(lineItems, taxRatePercent);

  const buildInvoicePayload = () => ({
    businessName,
    date,
    clientCompanyName,
    clientAddressLines,
    lineItems,
    notes,
    taxRatePercent,
    contactEmail,
    contactTel,
    paymentInfo,
  });

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      await generateInvoicePdf("hakeemi", password, buildInvoicePayload(), "web");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    setError(null);
    setIsPreviewing(true);
    try {
      await previewInvoicePdf("hakeemi", password, buildInvoicePayload(), "web");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview PDF");
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 text-sm">
      <div>
        <p className="text-base font-semibold text-zinc-900 dark:text-white">Web Invoice Generator</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{defaults.businessName || "Hakeemi"}</p>
      </div>

      <label>
        <span className={labelClass}>Business Name (shown on logo)</span>
        <input className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Date</span>
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Tax %</span>
          <input
            type="number"
            className={inputClass}
            value={taxRatePercent === 0 ? "" : taxRatePercent}
            onChange={(e) => setTaxRatePercent(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <div>
        <p className={labelClass}>Bill To</p>
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            placeholder="Company / client name"
            value={clientCompanyName}
            onChange={(e) => setClientCompanyName(e.target.value)}
          />
          <textarea
            className={`${inputClass} min-h-16`}
            placeholder="Address lines"
            value={clientAddressLines}
            onChange={(e) => setClientAddressLines(e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Items</p>
        <LineItemsEditor items={lineItems} onChange={setLineItems} />
      </div>

      <label>
        <span className={labelClass}>Notes (one per line)</span>
        <textarea className={`${inputClass} min-h-20`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div className="rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{totals.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{totals.total.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <p className={labelClass}>Contact & Payment</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Tel"
            value={contactTel}
            onChange={(e) => setContactTel(e.target.value)}
          />
          <textarea
            className={`${inputClass} col-span-2 min-h-16`}
            placeholder="Payment info"
            value={paymentInfo}
            onChange={(e) => setPaymentInfo(e.target.value)}
          />
        </div>
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      <GenerateActions
        isPreviewing={isPreviewing}
        isGenerating={isGenerating}
        onPreview={handlePreview}
        onGenerate={handleGenerate}
        solidColorClass="bg-sky-600 hover:bg-sky-500"
        outlineColorClass="border border-sky-600/40 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
      />
    </div>
  );
}
