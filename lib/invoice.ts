import { timingSafeEqual } from "crypto";

export type LineItem = {
  id: string;
  description: string;
  subDescription?: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

export type HakeemiInvoiceData = {
  businessName: string;
  businessTitle: string;
  businessEmail: string;
  businessPhone: string;
  quoteRef: string;
  date: string;
  validity: string;
  contractCurrency: string;
  exchangeReference: string;
  clientOrg: string;
  clientAttn: string;
  projectName: string;
  location: string;
  programmeDates: string;
  lineItems: LineItem[];
  foreignCurrencyNote: string;
  taxRatePercent: number;
  krwEquivalent: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  remittanceInstructions: string;
  scopeAndTerms: string;
};

export type EzzyInvoiceData = {
  date: string;
  clientCompanyName: string;
  clientAddressLines: string;
  lineItems: LineItem[];
  notes: string;
  taxRatePercent: number;
  contactEmail: string;
  contactTel: string;
  paymentInfo: string;
};

export type WebInvoiceData = {
  businessName: string;
  invoiceNumber: string;
  date: string;
  paymentDue: string;
  clientCompanyName: string;
  clientAddressLines: string;
  lineItems: LineItem[];
  notes: string;
  taxRatePercent: number;
  contactEmail: string;
  contactTel: string;
  includedItems: string;
  monthlyFee: number;
  monthlyUpdatesIncluded: string;
  afterFirstMonthNotes: string;
  depositAmount: number;
  remainingAmount: number;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
};

export type HakeemiInvoiceType = "tour" | "web";

export type InvoiceProfile = "hakeemi" | "ezzy";

const PROFILE_PASSWORD_ENV: Record<InvoiceProfile, string> = {
  hakeemi: "INVOICE_PASSWORD_HAKEEMI",
  ezzy: "INVOICE_PASSWORD_EZZY",
};

export function calculateLineTotal(item: Pick<LineItem, "quantity" | "unitPrice">): number {
  return item.quantity * item.unitPrice;
}

export function calculateTotals(lineItems: LineItem[], taxRatePercent: number): InvoiceTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const tax = subtotal * (taxRatePercent / 100);
  return { subtotal, tax, total: subtotal + tax };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against a same-length buffer so the operation still runs,
    // avoiding a length-based timing short-circuit.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function isInvoicePasswordValid(submitted: string, envVarName: string): boolean {
  const expected = process.env[envVarName];
  if (!expected) {
    throw new Error(`${envVarName} is not configured`);
  }
  return safeEqual(submitted, expected);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function nl2p(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

export function matchProfile(submitted: string): InvoiceProfile | null {
  for (const profile of Object.keys(PROFILE_PASSWORD_ENV) as InvoiceProfile[]) {
    if (isInvoicePasswordValid(submitted, PROFILE_PASSWORD_ENV[profile])) {
      return profile;
    }
  }
  return null;
}
