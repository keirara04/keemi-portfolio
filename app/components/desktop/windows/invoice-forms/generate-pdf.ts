import type { HakeemiInvoiceType, InvoiceProfile } from "@/lib/invoice";

async function fetchInvoicePdf(
  mode: "download" | "preview",
  profile: InvoiceProfile,
  password: string,
  invoice: Record<string, unknown>,
  invoiceType?: HakeemiInvoiceType
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch("/invoice-tool/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, profile, invoice, mode, invoiceType }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to generate PDF");
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  return { blob: await response.blob(), filename: match?.[1] ?? "invoice.pdf" };
}

export async function generateInvoicePdf(
  profile: InvoiceProfile,
  password: string,
  invoice: Record<string, unknown>,
  invoiceType?: HakeemiInvoiceType
): Promise<void> {
  const { blob, filename } = await fetchInvoicePdf("download", profile, password, invoice, invoiceType);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function previewInvoicePdf(
  profile: InvoiceProfile,
  password: string,
  invoice: Record<string, unknown>,
  invoiceType?: HakeemiInvoiceType
): Promise<void> {
  // Open the tab synchronously on the click itself so popup blockers don't
  // treat the post-fetch window.open as an unsolicited popup.
  const previewTab = window.open("", "_blank");
  try {
    const { blob } = await fetchInvoicePdf("preview", profile, password, invoice, invoiceType);
    const url = URL.createObjectURL(blob);
    if (previewTab) {
      previewTab.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  } catch (error) {
    previewTab?.close();
    throw error;
  }
}
