import { calculateLineTotal, calculateTotals, escapeHtml, formatMoney } from "../invoice";
import type { WebInvoiceData } from "../invoice";

function formatMYR(value: number): string {
  return `RM${formatMoney(value)}`;
}

const ACCENT = "#0284c7";
const MUTED = "#64748b";
const CARD_BG = "#f8fafc";
const CARD_BORDER = "#e2e8f0";

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
    align-items: flex-start;
    gap: 24px;
    padding-bottom: 18px;
    border-bottom: 3px solid ${ACCENT};
  }
  .logo-mark { display: flex; flex-direction: column; gap: 10px; }
  .logo-mark img { height: 132px; }
  .logo-fallback {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .logo-fallback .bar { width: 40px; height: 8px; background: ${ACCENT}; transform: skewX(-20deg); }
  .logo-fallback .bar.light { background: #7dc4ea; }
  .wordmark { font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #1a1a1a; }
  .from-block { font-size: 11px; line-height: 1.6; color: #334155; }
  .from-block .name { font-weight: bold; color: #1a1a1a; font-size: 12.5px; }
  .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
  .invoice-title { font-size: 34px; font-weight: bold; letter-spacing: 2px; color: ${ACCENT}; }
  .info-card {
    border: 1px solid ${CARD_BORDER};
    background: ${CARD_BG};
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 11.5px;
    line-height: 1.7;
    min-width: 220px;
  }
  .info-card .row { display: flex; justify-content: space-between; gap: 16px; }
  .info-card .row span:first-child { color: ${MUTED}; }
  .info-card .row span:last-child { font-weight: bold; }
  .bill-to { margin-top: 26px; }
  .bill-to .title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: .5px; color: ${MUTED}; margin-bottom: 6px; }
  .bill-to .company { font-weight: bold; font-size: 13px; }
  .bill-to .address { margin-top: 2px; line-height: 1.6; color: #334155; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 24px; border-radius: 6px; overflow: hidden; }
  table.items th {
    background: ${ACCENT};
    color: #fff;
    text-align: left;
    padding: 10px 12px;
    font-weight: normal;
    font-size: 12px;
  }
  table.items th:first-child { border-top-left-radius: 6px; }
  table.items th:last-child { border-top-right-radius: 6px; }
  table.items th.num, table.items td.num { text-align: right; }
  table.items td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid ${CARD_BORDER}; }
  table.items tbody tr:nth-child(even) { background: ${CARD_BG}; }
  .notes { margin-top: 28px; }
  .notes .title { color: ${ACCENT}; font-weight: bold; margin-bottom: 6px; }
  .notes ul { margin: 0; padding-left: 18px; font-size: 11px; line-height: 1.6; }
  .page-break { page-break-before: always; break-before: page; }
  .card-section { margin-top: 20px; border: 1px solid ${CARD_BORDER}; background: ${CARD_BG}; border-radius: 6px; padding: 14px 18px; }
  .card-section .title { color: ${ACCENT}; font-weight: bold; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
  .card-section ul { margin: 0; padding-left: 18px; font-size: 11.5px; line-height: 1.8; }
  .card-section p { margin: 3px 0; font-size: 11.5px; }
  .schedule-grid { display: flex; gap: 40px; margin-top: 2px; }
  .schedule-grid .amount { font-weight: bold; color: #1a1a1a; }
  .totals { margin-top: 24px; display: flex; justify-content: flex-end; }
  .totals-card { min-width: 240px; }
  .totals-card .row { display: flex; justify-content: space-between; padding: 6px 4px; font-size: 12px; }
  .totals-card .row.subtotal, .totals-card .row.tax { color: #334155; }
  .totals-card .total-bar {
    background: ${ACCENT};
    color: #fff;
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 6px;
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
  }
  .footer {
    margin-top: 32px;
    display: flex;
    gap: 24px;
    border: 1px solid ${CARD_BORDER};
    background: ${CARD_BG};
    border-radius: 6px;
    padding: 16px 20px;
    font-size: 11px;
  }
  .footer > div { flex: 1; }
  .footer .title { color: ${ACCENT}; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .5px; font-size: 10.5px; }
  .footer div div { line-height: 1.7; }
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
          <td class="num">${formatMYR(calculateLineTotal(item))}</td>
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

function renderBulletSection(title: string, text: string): string {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return "";
  return `
    <div class="card-section">
      <div class="title">${escapeHtml(title)}</div>
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
    <div class="logo-mark">
      ${renderLogo(data.businessName, logoBase64)}
      <div class="from-block">
        <div class="name">${escapeHtml(data.businessName)}</div>
        <div>${escapeHtml(data.contactEmail)}</div>
        <div>${escapeHtml(data.contactTel)}</div>
      </div>
    </div>
    <div class="header-right">
      <div class="invoice-title">INVOICE</div>
      <div class="info-card">
        <div class="row"><span>Invoice number</span><span>${escapeHtml(data.invoiceNumber)}</span></div>
        <div class="row"><span>Invoice date</span><span>${escapeHtml(data.date)}</span></div>
        <div class="row"><span>Payment due</span><span>${escapeHtml(data.paymentDue)}</span></div>
      </div>
    </div>
  </div>

  <div class="bill-to">
    <div class="title">Bill To</div>
    <div class="company">${escapeHtml(data.clientCompanyName)}</div>
    <div class="address">${data.clientAddressLines
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
    <div class="totals-card">
      <div class="row subtotal"><span>Subtotal</span><span>${formatMYR(totals.subtotal)}</span></div>
      <div class="row tax"><span>Tax</span><span>${formatMYR(totals.tax)}</span></div>
      <div class="total-bar"><span>Total</span><span>${formatMYR(totals.total)}</span></div>
    </div>
  </div>

  <div class="page-break"></div>

  ${renderBulletSection("Included", data.includedItems)}

  <div class="card-section">
    <div class="title">After the First Month</div>
    <ul>
      <li>Hosting, storage and website management: ${formatMYR(data.monthlyFee)}/month</li>
      <li>${escapeHtml(data.monthlyUpdatesIncluded)}</li>
      ${data.afterFirstMonthNotes
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("")}
    </ul>
  </div>

  <div class="card-section">
    <div class="title">Payment Schedule</div>
    <div class="schedule-grid">
      <p>Deposit: <span class="amount">${formatMYR(data.depositAmount)}</span></p>
      <p>Remaining payment before launch: <span class="amount">${formatMYR(data.remainingAmount)}</span></p>
    </div>
  </div>

  <div class="footer">
    <div>
      <div class="title">Question?</div>
      <div>Email: ${escapeHtml(data.contactEmail)}</div>
      <div>Tel: ${escapeHtml(data.contactTel)}</div>
    </div>
    <div>
      <div class="title">Payment info</div>
      <div>Bank: ${escapeHtml(data.bankName)}</div>
      <div>Account name: ${escapeHtml(data.bankAccountName)}</div>
      <div>Account number: ${escapeHtml(data.bankAccountNumber)}</div>
      <div>Reference: ${escapeHtml(data.invoiceNumber)}</div>
    </div>
  </div>
</body>
</html>`;
}
