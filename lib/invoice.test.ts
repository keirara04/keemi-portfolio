import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { calculateLineTotal, calculateTotals, isInvoicePasswordValid, matchProfile } from "./invoice";
import type { LineItem } from "./invoice";

const items: LineItem[] = [
  { id: "1", description: "Item A", quantity: 2, unitPrice: 50 },
  { id: "2", description: "Item B", quantity: 1, unitPrice: 30 },
];

describe("calculateLineTotal", () => {
  it("multiplies quantity by unit price", () => {
    expect(calculateLineTotal({ quantity: 3, unitPrice: 10 })).toBe(30);
  });
});

describe("calculateTotals", () => {
  it("returns zeroes for no line items", () => {
    expect(calculateTotals([], 0)).toEqual({ subtotal: 0, tax: 0, total: 0 });
  });

  it("sums line items with no tax", () => {
    expect(calculateTotals(items, 0)).toEqual({ subtotal: 130, tax: 0, total: 130 });
  });

  it("applies a tax rate percentage on top of the subtotal", () => {
    expect(calculateTotals(items, 10)).toEqual({ subtotal: 130, tax: 13, total: 143 });
  });
});

describe("isInvoicePasswordValid / matchProfile", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env.INVOICE_PASSWORD_HAKEEMI = "hakeemi-secret";
    process.env.INVOICE_PASSWORD_EZZY = "ezzy-secret";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("accepts the correct password", () => {
    expect(isInvoicePasswordValid("hakeemi-secret", "INVOICE_PASSWORD_HAKEEMI")).toBe(true);
  });

  it("rejects an incorrect password", () => {
    expect(isInvoicePasswordValid("wrong", "INVOICE_PASSWORD_HAKEEMI")).toBe(false);
  });

  it("throws when the env var is missing", () => {
    delete process.env.INVOICE_PASSWORD_HAKEEMI;
    expect(() => isInvoicePasswordValid("anything", "INVOICE_PASSWORD_HAKEEMI")).toThrow();
  });

  it("matches the hakeemi profile", () => {
    expect(matchProfile("hakeemi-secret")).toBe("hakeemi");
  });

  it("matches the ezzy profile", () => {
    expect(matchProfile("ezzy-secret")).toBe("ezzy");
  });

  it("returns null when no password matches", () => {
    expect(matchProfile("nope")).toBeNull();
  });
});
