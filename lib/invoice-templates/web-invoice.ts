import { calculateLineTotal, calculateTotals, escapeHtml, formatMoney } from "../invoice";
import type { WebInvoiceData } from "../invoice";

const ACCENT = "#0284c7";

const PAGE_STYLE = `
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1a1a1a;
    font-size: 12px;
    margin: 0;
    padding: 40px 48px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 18px;
    border-bottom: 3px solid ${ACCENT};
  }
  .logo-mark { display: flex; align-items: center; gap: 10px; }
  .logo-mark img { height: 44px; }
  .logo-fallback {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .logo-fallback .bar { width: 40px; height: 8px; background: ${ACCENT}; transform: skewX(-20deg); }
  .logo-fallback .bar.light { background: #7dc4ea; }
  .wordmark { font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #1a1a1a; }
  .invoice-title { font-size: 40px; font-weight: bold; letter-spacing: 2px; color: ${ACCENT}; }
  .meta {
    margin-top: 24px;
    font-size: 12px;
    line-height: 1.6;
  }
  .meta .company { font-weight: bold; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 24px; }
  table.items th {
    background: ${ACCENT};
    color: #fff;
    text-align: left;
    padding: 10px 12px;
    font-weight: normal;
    font-size: 13px;
  }
  table.items th.num, table.items td.num { text-align: right; }
  table.items td { padding: 12px; border-bottom: 1px solid #eee; font-size: 12px; }
  .notes { margin-top: 28px; }
  .notes .title { color: ${ACCENT}; font-weight: bold; margin-bottom: 6px; }
  .notes ul { margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.6; }
  .totals { margin-top: 24px; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
  .totals .tax-row { font-size: 12px; }
  .totals .total-bar {
    background: ${ACCENT};
    color: #fff;
    padding: 10px 16px;
    font-size: 14px;
    min-width: 220px;
    display: flex;
    justify-content: space-between;
  }
  .footer {
    margin-top: 48px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #ddd;
    padding-top: 14px;
    font-size: 10.5px;
  }
  .footer .title { color: ${ACCENT}; font-weight: bold; margin-bottom: 4px; }
`;

function renderLogo(businessName: string, logoBase64?: string): string {
  if (logoBase64) {
    return `<img src="${logoBase64}" alt="${escapeHtml(businessName)} logo" />`;
  }
  return `
    <div class="logo-fallback">
      <div class="bar"></div>
      <div class="bar light"></div>
    </div>
    <div class="wordmark">${escapeHtml(businessName.toUpperCase())}</div>
  `;
}

function renderLineItemsRows(data: WebInvoiceData): string {
  return data.lineItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td class="num">${escapeHtml(String(item.quantity))}</td>
          <td class="num">${formatMoney(calculateLineTotal(item))}</td>
        </tr>`
    )
    .join("\n");
}

function renderNotes(notes: string): string {
  const lines = notes.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return "";
  return `
    <div class="notes">
      <div class="title">Notes:</div>
      <ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
    </div>
  `;
}

export function renderWebInvoiceHtml(data: WebInvoiceData, logoBase64?: string): string {
  const totals = calculateTotals(data.lineItems, data.taxRatePercent);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>${PAGE_STYLE}</style>
</head>
<body>
  <div class="header">
    <div class="logo-mark">${renderLogo(data.businessName, logoBase64)}</div>
    <div class="invoice-title">INVOICE</div>
  </div>

  <div class="meta">
    <div>${escapeHtml(data.date)}</div>
    <div class="company">${escapeHtml(data.clientCompanyName)},</div>
    <div>${data.clientAddressLines
      .split("\n")
      .map((line) => escapeHtml(line))
      .join("<br/>")}</div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Description</th>
        <th class="num">Qty</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>
      ${renderLineItemsRows(data)}
    </tbody>
  </table>

  ${renderNotes(data.notes)}

  <div class="totals">
    <div class="tax-row">Tax: ${formatMoney(totals.tax)}</div>
    <div class="total-bar"><span>Total:</span><span>${formatMoney(totals.total)}</span></div>
  </div>

  <div class="footer">
    <div>
      <div class="title">Question?</div>
      <div>Email: ${escapeHtml(data.contactEmail)}</div>
      <div>Tel: ${escapeHtml(data.contactTel)}</div>
    </div>
    <div>
      <div class="title">Payment info:</div>
      <div>${data.paymentInfo
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br/>")}</div>
    </div>
  </div>
</body>
</html>`;
}
