import { calculateLineTotal, calculateTotals, escapeHtml, formatMoney, nl2p } from "../invoice";
import type { HakeemiInvoiceData } from "../invoice";

const PAGE_STYLE = `
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Georgia, serif;
    color: #111;
    font-size: 11px;
    margin: 0;
    padding: 40px 48px;
  }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #111;
    padding-bottom: 10px;
  }
  .header h1 { font-size: 26px; margin: 0; letter-spacing: 1px; }
  .header .tagline { font-style: italic; font-size: 11px; margin-top: 2px; }
  .header .identity { text-align: right; font-size: 10.5px; line-height: 1.5; }
  .header .identity .name { font-weight: bold; font-size: 12px; }
  .meta-row {
    display: flex;
    justify-content: space-between;
    margin-top: 14px;
    font-size: 10.5px;
  }
  .meta-row .field { margin-bottom: 2px; }
  .meta-row .label { font-weight: bold; display: inline-block; min-width: 90px; }
  .section-title {
    font-weight: bold;
    font-size: 11.5px;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #111;
    padding-bottom: 3px;
    margin-top: 20px;
    margin-bottom: 8px;
  }
  .two-col { display: flex; justify-content: space-between; gap: 24px; }
  .two-col > div { flex: 1; }
  .two-col .label { font-weight: bold; display: block; margin-bottom: 2px; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 4px; }
  table.items th {
    text-align: left;
    border-top: 1px solid #111;
    border-bottom: 1px solid #111;
    padding: 6px 4px;
    font-size: 10.5px;
  }
  table.items th.num, table.items td.num { text-align: right; }
  table.items td { padding: 8px 4px; vertical-align: top; border-bottom: 1px solid #ddd; font-size: 10.5px; }
  table.items .item-desc { font-weight: bold; }
  table.items .item-sub { font-size: 9.5px; color: #444; margin-top: 2px; }
  .totals-block { display: flex; justify-content: space-between; margin-top: 10px; }
  .totals-block .note { max-width: 55%; font-size: 9.5px; color: #333; }
  .totals-block .totals { text-align: right; font-size: 10.5px; }
  .totals-block .totals .row { display: flex; justify-content: space-between; gap: 24px; padding: 2px 0; }
  .totals-block .totals .grand {
    font-weight: bold;
    border-top: 1px solid #111;
    border-bottom: 3px double #111;
    padding: 4px 0;
    margin-top: 4px;
  }
  .footer-note { text-align: center; font-size: 9px; color: #555; border-top: 1px solid #ccc; margin-top: 24px; padding-top: 8px; }
  .terms-title { font-size: 20px; font-weight: bold; margin-bottom: 16px; }
  .terms-body { font-size: 10.5px; line-height: 1.6; }
  .terms-body p { margin: 0 0 10px 0; }
`;

function renderLineItemsRows(data: HakeemiInvoiceData): string {
  return data.lineItems
    .map(
      (item, index) => `
        <tr>
          <td class="num">${index + 1}</td>
          <td>
            <div class="item-desc">${escapeHtml(item.description)}</div>
            ${item.subDescription ? `<div class="item-sub">${escapeHtml(item.subDescription)}</div>` : ""}
          </td>
          <td class="num">${escapeHtml(String(item.quantity))}</td>
          <td class="num">${formatMoney(item.unitPrice)}</td>
          <td class="num">${formatMoney(calculateLineTotal(item))}</td>
        </tr>`
    )
    .join("\n");
}

export function renderHakeemiInvoiceHtml(data: HakeemiInvoiceData): string {
  const totals = calculateTotals(data.lineItems, data.taxRatePercent);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>${PAGE_STYLE}</style>
</head>
<body>
  <section class="page">
    <div class="header">
      <div>
        <h1>QUOTATION</h1>
        <div class="tagline">${escapeHtml(data.projectName)}</div>
      </div>
      <div class="identity">
        <div class="name">${escapeHtml(data.businessName)}</div>
        ${data.businessTitle ? `<div>${escapeHtml(data.businessTitle)}</div>` : ""}
        ${data.businessEmail ? `<div>${escapeHtml(data.businessEmail)}</div>` : ""}
        ${data.businessPhone ? `<div>${escapeHtml(data.businessPhone)}</div>` : ""}
      </div>
    </div>

    <div class="meta-row">
      <div>
        <div class="field"><span class="label">Quote Ref:</span> ${escapeHtml(data.quoteRef)}</div>
        <div class="field"><span class="label">Date:</span> ${escapeHtml(data.date)}</div>
        <div class="field"><span class="label">Validity:</span> ${escapeHtml(data.validity)}</div>
      </div>
      <div>
        <div class="field"><span class="label">Contract Currency:</span> ${escapeHtml(data.contractCurrency)}</div>
        <div class="field"><span class="label">Exchange Reference:</span> ${escapeHtml(data.exchangeReference)}</div>
      </div>
    </div>

    <div class="section-title">CLIENT &amp; PROGRAMME INFORMATION</div>
    <div class="two-col">
      <div>
        <span class="label">PREPARED FOR:</span>
        ${escapeHtml(data.clientOrg)}<br/>
        ${escapeHtml(data.clientAttn)}
      </div>
      <div>
        <span class="label">PROGRAMME DETAILS:</span>
        Project: ${escapeHtml(data.projectName)}<br/>
        Location: ${escapeHtml(data.location)}<br/>
        Dates: ${escapeHtml(data.programmeDates)}
      </div>
    </div>

    <div class="section-title">ITEMIZED FEE STRUCTURE</div>
    <table class="items">
      <thead>
        <tr>
          <th class="num">Item</th>
          <th>Description</th>
          <th class="num">Qty</th>
          <th class="num">Rate</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${renderLineItemsRows(data)}
      </tbody>
    </table>

    <div class="totals-block">
      <div class="note">${data.foreignCurrencyNote ? escapeHtml(data.foreignCurrencyNote) : ""}</div>
      <div class="totals">
        <div class="row"><span>Subtotal:</span><span>${formatMoney(totals.subtotal)}</span></div>
        <div class="row"><span>Tax / SST:</span><span>${formatMoney(totals.tax)}</span></div>
        <div class="row grand"><span>TOTAL DUE:</span><span>${formatMoney(totals.total)}</span></div>
        ${data.krwEquivalent ? `<div class="row"><span>KRW Equivalent:</span><span>${escapeHtml(data.krwEquivalent)}</span></div>` : ""}
      </div>
    </div>

    <div class="section-title">PAYMENT &amp; ADMINISTRATION</div>
    <div class="two-col">
      <div>
        <span class="label">BANK ACCOUNT DETAILS</span>
        Bank Name: ${escapeHtml(data.bankName)}<br/>
        Account Number: ${escapeHtml(data.bankAccount)}<br/>
        Account Holder: ${escapeHtml(data.bankHolder)}
      </div>
      <div>
        <span class="label">REMITTANCE INSTRUCTIONS</span>
        ${escapeHtml(data.remittanceInstructions)}
      </div>
    </div>

    <div class="footer-note">Page 1 of 2 — Quotation Ref: ${escapeHtml(data.quoteRef)} (See Page 2 for Scope &amp; Terms)</div>
  </section>

  <section class="page">
    <div class="terms-title">Scope of Work &amp; Terms and Conditions</div>
    <div class="terms-body">
      ${nl2p(data.scopeAndTerms)}
    </div>
    <div class="footer-note">Page 2 of 2 — Quotation Ref: ${escapeHtml(data.quoteRef)}</div>
  </section>
</body>
</html>`;
}
