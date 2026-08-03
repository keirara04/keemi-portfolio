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

function plusDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function HakeemiForm({ password, defaults }: { password: string; defaults: HakeemiDefaults }) {
  const [businessName, setBusinessName] = useState(defaults.businessName);
  const [businessTitle, setBusinessTitle] = useState("Independent Student Coordinator & Local Liaison");
  const [businessEmail, setBusinessEmail] = useState(defaults.email);
  const [businessPhone, setBusinessPhone] = useState(defaults.phone);
  const [quoteRef, setQuoteRef] = useState(() => `QT-${Date.now()}`);
  const [date, setDate] = useState(todayIso());
  const [validity, setValidity] = useState(plusDaysIso(30));
  const [contractCurrency, setContractCurrency] = useState("MYR");
  const [exchangeReference, setExchangeReference] = useState("");
  const [clientOrg, setClientOrg] = useState("");
  const [clientAttn, setClientAttn] = useState("");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [programmeDates, setProgrammeDates] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>(() => [newLineItem()]);
  const [foreignCurrencyNote, setForeignCurrencyNote] = useState("");
  const [taxRatePercent, setTaxRatePercent] = useState(0);
  const [krwEquivalent, setKrwEquivalent] = useState("");
  const [bankName, setBankName] = useState(defaults.bankName);
  const [bankAccount, setBankAccount] = useState(defaults.bankAccount);
  const [bankHolder, setBankHolder] = useState(defaults.bankHolder);
  const [remittanceInstructions, setRemittanceInstructions] = useState("");
  const [scopeAndTerms, setScopeAndTerms] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = calculateTotals(lineItems, taxRatePercent);

  const buildInvoicePayload = () => ({
    businessName,
    businessTitle,
    businessEmail,
    businessPhone,
    quoteRef,
    date,
    validity,
    contractCurrency,
    exchangeReference,
    clientOrg,
    clientAttn,
    projectName,
    location,
    programmeDates,
    lineItems,
    foreignCurrencyNote,
    taxRatePercent,
    krwEquivalent,
    bankName,
    bankAccount,
    bankHolder,
    remittanceInstructions,
    scopeAndTerms,
  });

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      await generateInvoicePdf("hakeemi", password, buildInvoicePayload());
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
      await previewInvoicePdf("hakeemi", password, buildInvoicePayload());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview PDF");
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 text-sm">
      <div>
        <p className="text-base font-semibold text-zinc-900 dark:text-white">Quotation Generator</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{defaults.businessName || "Hakeemi"}</p>
      </div>

      <div>
        <p className={labelClass}>Your Details (shown in header)</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={`${inputClass} col-span-2`}
            placeholder="Business / your name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <input
            className={`${inputClass} col-span-2`}
            placeholder="Title / role"
            value={businessTitle}
            onChange={(e) => setBusinessTitle(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Email"
            value={businessEmail}
            onChange={(e) => setBusinessEmail(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Phone (optional)"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Quote Ref</span>
          <input className={inputClass} value={quoteRef} onChange={(e) => setQuoteRef(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Date</span>
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Validity</span>
          <input
            type="date"
            className={inputClass}
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
          />
        </label>
        <label>
          <span className={labelClass}>Contract Currency</span>
          <input
            className={inputClass}
            value={contractCurrency}
            onChange={(e) => setContractCurrency(e.target.value)}
          />
        </label>
        <label className="col-span-2">
          <span className={labelClass}>Exchange Reference</span>
          <input
            className={inputClass}
            value={exchangeReference}
            onChange={(e) => setExchangeReference(e.target.value)}
            placeholder="e.g. KRW 375 = MYR 1.00"
          />
        </label>
      </div>

      <div>
        <p className={labelClass}>Client & Programme</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Client organisation"
            value={clientOrg}
            onChange={(e) => setClientOrg(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Attn"
            value={clientAttn}
            onChange={(e) => setClientAttn(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            className={`${inputClass} col-span-2`}
            placeholder="Programme dates"
            value={programmeDates}
            onChange={(e) => setProgrammeDates(e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className={labelClass}>Itemized Fee Structure</p>
        <LineItemsEditor items={lineItems} onChange={setLineItems} showSubDescription />
      </div>

      <label>
        <span className={labelClass}>Foreign Currency Note (optional)</span>
        <textarea
          className={`${inputClass} min-h-16`}
          value={foreignCurrencyNote}
          onChange={(e) => setForeignCurrencyNote(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Tax / SST %</span>
          <input
            type="number"
            className={inputClass}
            value={taxRatePercent === 0 ? "" : taxRatePercent}
            onChange={(e) => setTaxRatePercent(Number(e.target.value) || 0)}
          />
        </label>
        <label>
          <span className={labelClass}>KRW Equivalent (optional)</span>
          <input
            className={inputClass}
            value={krwEquivalent}
            onChange={(e) => setKrwEquivalent(e.target.value)}
          />
        </label>
      </div>

      <div className="rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{totals.subtotal.toFixed(2)}</span>
        </div>
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
        <p className={labelClass}>Payment & Administration</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Bank name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Account number"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          />
          <input
            className={`${inputClass} col-span-2`}
            placeholder="Account holder"
            value={bankHolder}
            onChange={(e) => setBankHolder(e.target.value)}
          />
          <textarea
            className={`${inputClass} col-span-2 min-h-16`}
            placeholder="Remittance instructions"
            value={remittanceInstructions}
            onChange={(e) => setRemittanceInstructions(e.target.value)}
          />
        </div>
      </div>

      <label>
        <span className={labelClass}>Scope of Work & Terms (page 2)</span>
        <textarea
          className={`${inputClass} min-h-28`}
          value={scopeAndTerms}
          onChange={(e) => setScopeAndTerms(e.target.value)}
        />
      </label>

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
