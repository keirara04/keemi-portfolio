import { readFile } from "fs/promises";
import path from "path";
import { matchProfile } from "@/lib/invoice";
import type { EzzyInvoiceData, HakeemiInvoiceData, LineItem, WebInvoiceData } from "@/lib/invoice";
import { renderHakeemiInvoiceHtml } from "@/lib/invoice-templates/hakeemi";
import { renderEzzyInvoiceHtml } from "@/lib/invoice-templates/ezzy";
import type { EzzyInvoiceFonts } from "@/lib/invoice-templates/ezzy";
import { renderWebInvoiceHtml } from "@/lib/invoice-templates/web-invoice";

export const runtime = "nodejs";

const EZZY_LOGO_CANDIDATES = [
  { file: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "invoice-assets", "ezzy-logo.svg"), mime: "image/svg+xml" },
  { file: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "invoice-assets", "ezzy-logo.png"), mime: "image/png" },
];

const WEB_INVOICE_LOGO_CANDIDATES = [
  { file: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "invoice-assets", "web-invoice-logo.svg"), mime: "image/svg+xml" },
  { file: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "invoice-assets", "web-invoice-logo.png"), mime: "image/png" },
  { file: path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "invoice-assets", "web-invoice-logo.jpg"), mime: "image/jpeg" },
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseLineItems(value: unknown): LineItem[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const items: LineItem[] = [];
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return null;
    const item = raw as Record<string, unknown>;
    if (!isNonEmptyString(item.description)) return null;
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return null;
    items.push({
      id: isNonEmptyString(item.id) ? item.id : crypto.randomUUID(),
      description: item.description,
      subDescription: isNonEmptyString(item.subDescription) ? item.subDescription : undefined,
      quantity,
      unitPrice,
    });
  }
  return items;
}

function parseHakeemiInvoice(body: Record<string, unknown>): HakeemiInvoiceData | null {
  const lineItems = parseLineItems(body.lineItems);
  if (!lineItems) return null;
  const requiredStrings = ["businessName", "quoteRef", "date", "validity", "contractCurrency", "clientOrg", "clientAttn", "projectName"];
  for (const field of requiredStrings) {
    if (!isNonEmptyString(body[field])) return null;
  }
  const taxRatePercent = Number(body.taxRatePercent ?? 0);
  if (!Number.isFinite(taxRatePercent)) return null;

  return {
    businessName: body.businessName as string,
    businessTitle: (body.businessTitle as string) ?? "",
    businessEmail: (body.businessEmail as string) ?? "",
    businessPhone: (body.businessPhone as string) ?? "",
    quoteRef: body.quoteRef as string,
    date: body.date as string,
    validity: body.validity as string,
    contractCurrency: body.contractCurrency as string,
    exchangeReference: (body.exchangeReference as string) ?? "",
    clientOrg: body.clientOrg as string,
    clientAttn: body.clientAttn as string,
    projectName: body.projectName as string,
    location: (body.location as string) ?? "",
    programmeDates: (body.programmeDates as string) ?? "",
    lineItems,
    foreignCurrencyNote: (body.foreignCurrencyNote as string) ?? "",
    taxRatePercent,
    krwEquivalent: (body.krwEquivalent as string) ?? "",
    bankName: (body.bankName as string) ?? "",
    bankAccount: (body.bankAccount as string) ?? "",
    bankHolder: (body.bankHolder as string) ?? "",
    remittanceInstructions: (body.remittanceInstructions as string) ?? "",
    scopeAndTerms: (body.scopeAndTerms as string) ?? "",
  };
}

function parseEzzyInvoice(body: Record<string, unknown>): EzzyInvoiceData | null {
  const lineItems = parseLineItems(body.lineItems);
  if (!lineItems) return null;
  if (!isNonEmptyString(body.date) || !isNonEmptyString(body.clientCompanyName)) return null;
  const taxRatePercent = Number(body.taxRatePercent ?? 0);
  if (!Number.isFinite(taxRatePercent)) return null;

  return {
    date: body.date as string,
    clientCompanyName: body.clientCompanyName as string,
    clientAddressLines: (body.clientAddressLines as string) ?? "",
    lineItems,
    notes: (body.notes as string) ?? "",
    taxRatePercent,
    contactEmail: (body.contactEmail as string) ?? "",
    contactTel: (body.contactTel as string) ?? "",
    paymentInfo: (body.paymentInfo as string) ?? "",
  };
}

const WEB_INVOICE_REQUIRED_STRINGS = [
  "businessName",
  "invoiceNumber",
  "date",
  "paymentDue",
  "clientCompanyName",
  "clientAddressLines",
  "contactEmail",
  "contactTel",
  "includedItems",
  "monthlyUpdatesIncluded",
  "afterFirstMonthNotes",
  "bankName",
  "bankAccountName",
  "bankAccountNumber",
] as const;

function parseWebInvoice(body: Record<string, unknown>): WebInvoiceData | null {
  const lineItems = parseLineItems(body.lineItems);
  if (!lineItems) return null;
  for (const field of WEB_INVOICE_REQUIRED_STRINGS) {
    if (!isNonEmptyString(body[field])) return null;
  }
  const taxRatePercent = Number(body.taxRatePercent ?? 0);
  if (!Number.isFinite(taxRatePercent)) return null;
  const monthlyFee = Number(body.monthlyFee);
  const depositAmount = Number(body.depositAmount);
  const remainingAmount = Number(body.remainingAmount);
  if (![monthlyFee, depositAmount, remainingAmount].every(Number.isFinite)) return null;

  return {
    businessName: body.businessName as string,
    invoiceNumber: body.invoiceNumber as string,
    date: body.date as string,
    paymentDue: body.paymentDue as string,
    clientCompanyName: body.clientCompanyName as string,
    clientAddressLines: body.clientAddressLines as string,
    lineItems,
    notes: (body.notes as string) ?? "",
    taxRatePercent,
    contactEmail: body.contactEmail as string,
    contactTel: body.contactTel as string,
    includedItems: body.includedItems as string,
    monthlyFee,
    monthlyUpdatesIncluded: body.monthlyUpdatesIncluded as string,
    afterFirstMonthNotes: body.afterFirstMonthNotes as string,
    depositAmount,
    remainingAmount,
    bankName: body.bankName as string,
    bankAccountName: body.bankAccountName as string,
    bankAccountNumber: body.bankAccountNumber as string,
  };
}

async function readLogoBase64(candidates: typeof EZZY_LOGO_CANDIDATES): Promise<string | undefined> {
  for (const candidate of candidates) {
    try {
      const buffer = await readFile(candidate.file);
      return `data:${candidate.mime};base64,${buffer.toString("base64")}`;
    } catch {
      continue;
    }
  }
  return undefined;
}

const EZZY_FONTS_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "invoice-assets", "fonts");

async function readEzzyFonts(): Promise<EzzyInvoiceFonts | undefined> {
  try {
    const [bebasNeue, montserrat] = await Promise.all([
      readFile(path.join(EZZY_FONTS_DIR, "bebas-neue.woff2")),
      readFile(path.join(EZZY_FONTS_DIR, "montserrat.woff2")),
    ]);
    return {
      bebasNeueBase64: `data:font/woff2;base64,${bebasNeue.toString("base64")}`,
      montserratBase64: `data:font/woff2;base64,${montserrat.toString("base64")}`,
    };
  } catch {
    return undefined;
  }
}

async function renderPdf(html: string): Promise<Uint8Array> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    // "load" is sufficient (and the only option setContent supports) since the
    // template is fully self-contained with no external network requests.
    await page.setContent(html, { waitUntil: "load" });
    return await page.pdf({ format: "a4", printBackground: true });
  } finally {
    await browser.close();
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = body.password;
  if (typeof password !== "string" || !password) {
    return Response.json({ error: "Missing password" }, { status: 401 });
  }

  let profile: ReturnType<typeof matchProfile>;
  try {
    profile = matchProfile(password);
  } catch (error) {
    console.error("Invoice password check failed:", error);
    return Response.json({ error: "Invoice tool is not configured" }, { status: 500 });
  }

  if (!profile || profile !== body.profile) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const invoice = body.invoice;
  if (typeof invoice !== "object" || invoice === null) {
    return Response.json({ error: "Missing invoice data" }, { status: 400 });
  }

  try {
    let html: string;
    let filename: string;

    if (profile === "hakeemi" && body.invoiceType === "web") {
      const data = parseWebInvoice(invoice as Record<string, unknown>);
      if (!data) return Response.json({ error: "Invalid invoice data" }, { status: 400 });
      const logo = await readLogoBase64(WEB_INVOICE_LOGO_CANDIDATES);
      html = renderWebInvoiceHtml(data, logo);
      filename = `web-invoice-${data.date}.pdf`;
    } else if (profile === "hakeemi") {
      const data = parseHakeemiInvoice(invoice as Record<string, unknown>);
      if (!data) return Response.json({ error: "Invalid invoice data" }, { status: 400 });
      html = renderHakeemiInvoiceHtml(data);
      filename = `hakeemi-invoice-${data.quoteRef || data.date}.pdf`;
    } else {
      const data = parseEzzyInvoice(invoice as Record<string, unknown>);
      if (!data) return Response.json({ error: "Invalid invoice data" }, { status: 400 });
      const [logo, fonts] = await Promise.all([readLogoBase64(EZZY_LOGO_CANDIDATES), readEzzyFonts()]);
      html = renderEzzyInvoiceHtml(data, logo, fonts);
      filename = `ezzy-invoice-${data.date}.pdf`;
    }

    const pdfBytes = await renderPdf(html);
    const disposition = body.mode === "preview" ? "inline" : "attachment";
    return new Response(new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation failed:", error);
    return Response.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
